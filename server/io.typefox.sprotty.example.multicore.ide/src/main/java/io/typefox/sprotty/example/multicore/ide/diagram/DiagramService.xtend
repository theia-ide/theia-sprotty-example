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
import io.typefox.sprotty.example.multicore.ide.NodeModelExtensions
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import io.typefox.sprotty.example.multicore.multicoreAllocation.Step
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskAllocation
import io.typefox.sprotty.layout.LayoutUtil
import java.util.List
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.resource.EObjectAtOffsetHelper
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.xtext.service.OperationCanceledManager
import org.eclipse.xtext.util.CancelIndicator

import static extension org.eclipse.xtext.EcoreUtil2.*
import org.eclipse.xtext.validation.IResourceValidator
import org.eclipse.xtext.validation.CheckMode
import org.eclipse.xtext.diagnostics.Severity

@Singleton
class DiagramService {
	
	@Inject ModelProvider modelProvider
	
	@Inject SelectionProvider selectionProvider
	
	@Inject MulticoreAllocationDiagramGenerator diagramGenerator
	
	@Inject extension OperationCanceledManager

	@Inject extension EObjectAtOffsetHelper

	@Inject extension NodeModelExtensions
	
	@Inject extension IResourceValidator
	
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
	
	def void compute(XtextResource resource, CancelIndicator cancelIndicator) {
		if(resource.hasErrors(cancelIndicator))
			return
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
	
	def void setSelection(XtextResource resource, int offset, CancelIndicator cancelIndicator) {
		val uri = resource.URI.toString
		val previousElement = selectionProvider.getSelection(uri)
		val previousStep = previousElement.getContainerOfType(Step)
		val previousTaskAllocation = previousElement.getContainerOfType(TaskAllocation)
		val selectedElement = getCurrentSelection(resource, offset)
		val selectedStep = selectedElement.getContainerOfType(Step)
		val selectedTaskAllocation = selectedElement.getContainerOfType(TaskAllocation)
		if (previousStep != selectedStep || previousTaskAllocation != selectedTaskAllocation) {
			if (selectedTaskAllocation !== null && previousStep != selectedStep) {
				selectionProvider.setSelection(uri, previousElement.getContainerOfType(Step) ?: selectedStep)
				compute(resource, cancelIndicator)
			}
			selectionProvider.setSelection(uri, selectedElement)
			compute(resource, cancelIndicator)
		}
	}
	
	protected def EObject getCurrentSelection(XtextResource resource, int caretOffset) {
		var element = resource.resolveContainedElementAt(caretOffset)
		var node = element.node
		while (node !== null) {
			if (node.contains(caretOffset))
				return element
			if (element.eContainingFeature.isMany) {
				val container = element.eContainer
				val list = container.eGet(element.eContainingFeature) as List<? extends EObject>
				val index = list.indexOf(element)
				val previousElement = if (index > 0) list.get(index - 1)
				if (previousElement.node.contains(caretOffset))
					return previousElement
				val nextElement = if (index < list.size - 1) list.get(index + 1)
				if (nextElement.node.contains(caretOffset))
					return nextElement
			}
			element = element.eContainer
			node = element.node
		}
	}
	
	def boolean hasErrors(XtextResource resource, CancelIndicator cancelIndicator) {
		resource.validate(CheckMode.NORMAL_AND_FAST, cancelIndicator).exists [
			severity === Severity.ERROR
		]
	} 
	
}
