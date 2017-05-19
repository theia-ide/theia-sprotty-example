/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.ide.diagram

import com.google.inject.Inject
import com.google.inject.Singleton
import io.typefox.sprotty.api.SGraph
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import io.typefox.sprotty.example.multicore.multicoreAllocation.Step
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskAllocation
import io.typefox.sprotty.layout.LayoutUtil
import java.util.List
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.xtext.service.OperationCanceledManager
import org.eclipse.xtext.util.CancelIndicator

import static extension org.eclipse.xtext.EcoreUtil2.*

@Singleton
class DiagramService {
	
	@Inject ModelProvider modelProvider
	
	@Inject SelectionProvider selectionProvider
	
	@Inject MulticoreAllocationDiagramGenerator diagramGenerator
	
	@Inject extension OperationCanceledManager
	
	val List<MulticoreAllocationDiagramServer> diagramServers = newArrayList
	
	def void addServer(MulticoreAllocationDiagramServer server) {
		synchronized (diagramServers) {
			diagramServers.add(server)
		}
	}
	
	def void removeServer(MulticoreAllocationDiagramServer server) {
		synchronized (diagramServers) {
			diagramServers.remove(server)
		}
	}
	
	def void compute(XtextResource resource) {
		compute(resource, CancelIndicator.NullImpl)
	}
	
	def void compute(XtextResource resource, CancelIndicator cancelIndicator) {
		val program = resource.contents.head as Program
		val uri = resource.URI.toString
		val selection = selectionProvider.getSelection(uri)
		val processorMapping = diagramGenerator.generateProcessorView(program, selection, cancelIndicator)
		val processorView = processorMapping.get(program) as Processor
		val oldProcessorView = modelProvider.getModel(uri, processorView.type)
		modelProvider.putModel(uri, processorView, processorMapping)
		modelProvider.setLayoutDone(uri, processorView.type)
		cancelIndicator.checkCanceled
		val flowMapping = diagramGenerator.generateFlowView(program, selection, cancelIndicator)
		val flowView = flowMapping.get(program) as Flow
		val oldFlowView = modelProvider.getModel(uri, flowView.type) 
		if (oldFlowView instanceof SGraph)
			LayoutUtil.copyLayoutData(oldFlowView, flowView)
		modelProvider.putModel(uri, flowView, flowMapping)
		cancelIndicator.checkCanceled
		val filteredServers = synchronized (diagramServers) {
			diagramServers.filter[resourceId == uri].toList
		}
		for (diagramServer : filteredServers) {
			diagramServer.notifyClients(processorView, oldProcessorView)
			diagramServer.notifyClients(flowView, oldFlowView)
		}
	}
	
	def void setSelection(XtextResource resource, String resourceId, EObject selectedElement) {
		val previousElement = selectionProvider.getSelection(resourceId)
		val previousStep = previousElement.getContainerOfType(Step)
		val previousTaskAllocation = previousElement.getContainerOfType(TaskAllocation)
		val selectedStep = selectedElement.getContainerOfType(Step)
		val selectedTaskAllocation = selectedElement.getContainerOfType(TaskAllocation)
		if (previousStep != selectedStep || previousTaskAllocation != selectedTaskAllocation) {
			if (selectedTaskAllocation !== null && previousStep != selectedStep) {
				selectionProvider.setSelection(resourceId, previousElement.getContainerOfType(Step) ?: selectedStep)
				compute(resource)
			}
			selectionProvider.setSelection(resourceId, selectedElement)
			compute(resource)
		}
	}
	
}
