/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.ide.diagram

import com.google.common.collect.BiMap
import com.google.inject.Inject
import io.typefox.sprotty.api.DefaultDiagramServer
import io.typefox.sprotty.api.RequestModelAction
import io.typefox.sprotty.api.SModelElement
import io.typefox.sprotty.api.SModelRoot
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtext.ide.server.ILanguageServerAccess
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.xtext.util.CancelIndicator

class MulticoreAllocationDiagramServer extends DefaultDiagramServer {
	
	@Inject MulticoreAllocationDiagramGenerator diagramGenerator
	
	@Accessors
	extension ILanguageServerAccess languageServerAccess
	
	@Accessors
	DiagramLanguageClient diagramLanguageClient
	
	@Accessors
	EObject selection
	
	@Accessors
	BiMap<EObject, SModelElement> modelMapping
	
	@Accessors(PUBLIC_GETTER)
	String resourceId
	
	@Accessors(PUBLIC_GETTER)
	String diagramType
	
	def generateDiagram(XtextResource resource, CancelIndicator cancelIndicator) {
		val program = resource.contents.head
		if (program instanceof Program) {
			modelMapping = switch diagramType {
				case 'processor':
					diagramGenerator.generateProcessorView(program, selection, cancelIndicator)
				case 'flow':
					diagramGenerator.generateFlowView(program, selection, cancelIndicator)
			}
			return modelMapping.get(program) as SModelRoot
		}
	}
	
	override protected needsClientLayout(SModelRoot root) {
		switch root.type {
			case 'processor': true
			default: false
		}
	}
	
	override protected needsServerLayout(SModelRoot root) {
		switch root.type {
			case 'flow': true
			default: false
		}
	}
	
	override protected handle(RequestModelAction request) {
		resourceId = request.options?.get('resourceId')
		diagramType = request.options?.get('diagramType')
		if (model === null || model.type == 'NONE') {
			resourceId.doRead [ context |
				val resource = context.resource
				if (resource instanceof XtextResource) {
					val newRoot = generateDiagram(resource, context.cancelChecker)
					if (newRoot !== null)
						setModel(newRoot)
				}
				return null
			]
		} else {
			super.handle(request)
		}
	}
	
}