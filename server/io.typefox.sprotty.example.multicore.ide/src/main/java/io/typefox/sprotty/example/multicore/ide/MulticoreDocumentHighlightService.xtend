/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License") you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.ide

import com.google.inject.Inject
import io.typefox.sprotty.example.multicore.ide.diagram.DiagramLanguageServerImpl
import org.eclipse.xtext.ide.server.occurrences.DefaultDocumentHighlightService
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.xtext.util.CancelIndicator

class MulticoreDocumentHighlightService extends DefaultDocumentHighlightService {
	
	@Inject extension DiagramLanguageServerImpl languageServer
	 
	override getDocumentHighlights(XtextResource resource, int offset) {
		val highlights = super.getDocumentHighlights(resource, offset)
		resource.setSelection(offset, CancelIndicator.NullImpl)
		return highlights
	}
	
}