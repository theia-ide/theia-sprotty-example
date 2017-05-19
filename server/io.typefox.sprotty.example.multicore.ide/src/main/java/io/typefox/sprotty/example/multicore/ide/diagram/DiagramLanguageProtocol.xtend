/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.ide.diagram

import org.eclipse.lsp4j.TextDocumentPositionParams
import org.eclipse.lsp4j.jsonrpc.services.JsonNotification
import org.eclipse.lsp4j.jsonrpc.services.JsonSegment

@JsonSegment('diagram')
interface DiagramLanguageEndpoint {

	@JsonNotification
	def void onAction(String jsonMessage);

}

@JsonSegment('diagram')
interface DiagramLanguageClient extends DiagramLanguageEndpoint {
}

@JsonSegment('diagram')
interface DiagramLanguageServer extends DiagramLanguageEndpoint {
	
	@JsonNotification
	def void update(TextDocumentPositionParams params);
	
}
