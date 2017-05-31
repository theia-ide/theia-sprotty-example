/*
 * Copyright (C) 2017 TypeFox and others.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.ide.diagram

import com.google.inject.Inject
import io.typefox.sprotty.api.ActionMessage
import io.typefox.sprotty.server.json.ActionTypeAdapter
import java.util.List
import org.eclipse.lsp4j.TextDocumentPositionParams
import org.eclipse.lsp4j.jsonrpc.Endpoint
import org.eclipse.lsp4j.jsonrpc.services.JsonNotification
import org.eclipse.lsp4j.jsonrpc.services.ServiceEndpoints
import org.eclipse.xtext.ide.server.ILanguageServerAccess
import org.eclipse.xtext.ide.server.ILanguageServerAccess.IBuildListener
import org.eclipse.xtext.ide.server.ILanguageServerExtension
import org.eclipse.xtext.ide.server.UriExtensions
import org.eclipse.xtext.resource.IResourceDescription.Delta
import org.eclipse.xtext.resource.XtextResource

class DiagramLanguageServerImpl implements ILanguageServerExtension, IBuildListener, DiagramLanguageServer {

	@Inject extension UriExtensions
	@Inject extension DiagramService diagramService
	@Inject MulticoreAllocationDiagramServer.Factory diagramServerFactory

	DiagramLanguageClient _client

	val gson = ActionTypeAdapter.createDefaultGson
	val servers = <String, MulticoreAllocationDiagramServer>newHashMap

	extension ILanguageServerAccess access

	override initialize(ILanguageServerAccess access) {
		this.access = access;
		access.addBuildListener(this)
	}

	protected def DiagramLanguageClient getClient() {
		if (_client === null) {
			val client = access.languageClient
			if (client instanceof Endpoint) {
				_client = ServiceEndpoints.toServiceObject(client, DiagramLanguageClient)
			}
		}
		return _client;
	}

	@JsonNotification
	override void onAction(String jsonMessage) {
		try {
			val message = gson.fromJson(jsonMessage, ActionMessage)
			val server = servers.computeIfAbsent(message.clientId) [
				createDiagramServer
			]
			server.accept(message)
		} catch(Exception exc) {
			exc.printStackTrace
		}
	}
	
	protected def MulticoreAllocationDiagramServer createDiagramServer() {
		val diagramServer = diagramServerFactory.create(access, getClient)
		diagramService.addServer(diagramServer)
		diagramServer.remoteEndpoint = [ message |
			val client = client
			if (client !== null) {
				val jsonMessage = gson.toJson(message, ActionMessage)
				client.onAction(jsonMessage)
			}
		]
		return diagramServer
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
					resource.compute(context.cancelChecker)
				}
				return null;
			]
		}
	}

}
