/*
 * Copyright (C) 2017 TypeFox and others.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.ide.diagram

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.inject.Inject
import com.google.inject.Provider
import com.google.inject.Singleton
import io.typefox.sprotty.api.ActionMessage
import io.typefox.sprotty.api.IDiagramServer
import io.typefox.sprotty.api.LayoutUtil
import io.typefox.sprotty.example.multicore.ide.NodeModelExtensions
import io.typefox.sprotty.example.multicore.multicoreAllocation.Step
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskAllocation
import io.typefox.sprotty.server.json.ActionTypeAdapter
import java.util.List
import java.util.Map
import org.eclipse.emf.ecore.EObject
import org.eclipse.lsp4j.TextDocumentPositionParams
import org.eclipse.lsp4j.jsonrpc.Endpoint
import org.eclipse.lsp4j.jsonrpc.services.JsonNotification
import org.eclipse.lsp4j.jsonrpc.services.ServiceEndpoints
import org.eclipse.xtext.diagnostics.Severity
import org.eclipse.xtext.ide.server.ILanguageServerAccess
import org.eclipse.xtext.ide.server.ILanguageServerAccess.IBuildListener
import org.eclipse.xtext.ide.server.ILanguageServerExtension
import org.eclipse.xtext.ide.server.UriExtensions
import org.eclipse.xtext.resource.EObjectAtOffsetHelper
import org.eclipse.xtext.resource.IResourceDescription.Delta
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.xtext.service.OperationCanceledManager
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.validation.CheckMode
import org.eclipse.xtext.validation.IResourceValidator

import static extension org.eclipse.xtext.EcoreUtil2.*

@Singleton
class DiagramLanguageServerImpl implements DiagramLanguageServer, ILanguageServerExtension, IDiagramServer.Provider, IBuildListener {
	
	@Inject extension OperationCanceledManager

	@Inject extension EObjectAtOffsetHelper

	@Inject extension NodeModelExtensions
	
	@Inject extension IResourceValidator

	@Inject extension UriExtensions
	
	@Inject Provider<MulticoreAllocationDiagramServer> diagramServerProvider
	
	val Map<String, MulticoreAllocationDiagramServer> diagramServers = newLinkedHashMap

	val Gson gson

	DiagramLanguageClient _client

	extension ILanguageServerAccess languageServerAccess
	
	new() {
		val gsonBuilder = new GsonBuilder
		ActionTypeAdapter.configureGson(gsonBuilder)
		gson = gsonBuilder.create()
	}

	override initialize(ILanguageServerAccess access) {
		this.languageServerAccess = access;
		access.addBuildListener(this)
	}

	protected def DiagramLanguageClient getClient() {
		if (_client === null) {
			val client = languageServerAccess.languageClient
			if (client instanceof Endpoint) {
				_client = ServiceEndpoints.toServiceObject(client, DiagramLanguageClient)
			}
		}
		return _client;
	}
	
	override MulticoreAllocationDiagramServer getDiagramServer(String clientId) {
		synchronized (diagramServers) {
			var server = diagramServers.get(clientId)
			if (server === null) {
				server = diagramServerProvider.get
				server.diagramLanguageClient = client
				server.languageServerAccess = languageServerAccess
				server.clientId = clientId
				server.remoteEndpoint = [ message |
					val client = client
					if (client !== null) {
						val jsonMessage = gson.toJson(message, ActionMessage)
						client.onAction(jsonMessage)
					}
				]
				diagramServers.put(clientId, server)
			}
			return server
		}
	}
	
	protected def getDiagramServers(String resourceId, String diagramType) {
		synchronized (diagramServers) {
			diagramServers.values.filter[ server |
				server.resourceId == resourceId && server.diagramType == diagramType
			].toList
		}
	}

	@JsonNotification
	override void onAction(String jsonMessage) {
		val message = gson.fromJson(jsonMessage, ActionMessage)
		val server = getDiagramServer(message.clientId)
		server.accept(message)
	}

	@JsonNotification
	override void update(TextDocumentPositionParams params) {
		params.textDocument.uri.doRead [ context |
			val resource = context.resource
			if (resource instanceof XtextResource) {
				val offset = context.document.getOffSet(params.position)
				resource.setSelection(offset, context.cancelChecker)
			}
			return null;
		]
	}

	override afterBuild(List<Delta> deltas) {
		for (uri : deltas.map[uri.toPath]) {
			uri.doRead [ context |
				val resource = context.resource
				if (resource instanceof XtextResource) {
					resource.updateDiagrams(context.cancelChecker)
				}
				return null;
			]
		}
	}
	
	protected def void updateDiagrams(XtextResource resource, CancelIndicator cancelIndicator) {
		if (resource.hasErrors(cancelIndicator)) {
			return
		}
		val uri = resource.URI.toString
		
		getDiagramServers(uri, 'processor').forEach[ server |
			val processorView = server.generateDiagram(resource, cancelIndicator)
			server.updateModel(processorView)
		]
		cancelIndicator.checkCanceled
		
		getDiagramServers(uri, 'flow').forEach[ server |
			val flowView = server.generateDiagram(resource, cancelIndicator)
			if (server.model !== null)
				LayoutUtil.copyLayoutData(server.model, flowView)
			server.updateModel(flowView)
		]
	}
	
	def void setSelection(XtextResource resource, int offset, CancelIndicator cancelIndicator) {
		val uri = resource.URI.toString
		val processorServers = getDiagramServers(uri, 'processor')
		val flowServers = getDiagramServers(uri, 'flow')
		val selectedElement = getCurrentSelection(resource, offset)
		val previousElement = processorServers.head?.selection ?: flowServers.head?.selection
		val previousStep = previousElement.getContainerOfType(Step)
		val previousTaskAllocation = previousElement.getContainerOfType(TaskAllocation)
		val selectedStep = selectedElement.getContainerOfType(Step)
		val selectedTaskAllocation = selectedElement.getContainerOfType(TaskAllocation)
		if (previousStep != selectedStep || previousTaskAllocation != selectedTaskAllocation) {
			if (selectedTaskAllocation !== null && previousStep != selectedStep) {
				val intermediateElement = previousElement.getContainerOfType(Step) ?: selectedStep
				processorServers.forEach[selection = intermediateElement]
				flowServers.forEach[selection = intermediateElement]
				updateDiagrams(resource, cancelIndicator)
			}
			processorServers.forEach[selection = selectedElement]
			flowServers.forEach[selection = selectedElement]
			updateDiagrams(resource, cancelIndicator)
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
	
	protected def boolean hasErrors(XtextResource resource, CancelIndicator cancelIndicator) {
		resource.validate(CheckMode.NORMAL_AND_FAST, cancelIndicator).exists [
			severity === Severity.ERROR
		]
	} 

}
