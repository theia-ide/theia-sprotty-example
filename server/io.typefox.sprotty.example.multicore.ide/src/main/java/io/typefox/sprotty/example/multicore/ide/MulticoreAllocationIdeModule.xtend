/*
 * Copyright (C) 2017 TypeFox and others.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.ide

import io.typefox.sprotty.api.IDiagramSelectionListener
import io.typefox.sprotty.api.IDiagramServer
import io.typefox.sprotty.api.ILayoutEngine
import io.typefox.sprotty.api.IModelUpdateListener
import io.typefox.sprotty.api.IPopupModelFactory
import io.typefox.sprotty.example.multicore.ide.diagram.DiagramLanguageServerImpl
import io.typefox.sprotty.example.multicore.ide.diagram.MulticoreAllocationDiagramServer
import io.typefox.sprotty.example.multicore.ide.diagram.MulticoreAllocationLayoutEngine
import io.typefox.sprotty.example.multicore.ide.diagram.MulticoreAllocationPopupModelFactory
import io.typefox.sprotty.example.multicore.ide.diagram.MulticoreAllocationSelectionListener
import io.typefox.sprotty.example.multicore.ide.diagram.MulticoreAllocationUpdateListener
import org.eclipse.xtext.ide.server.ILanguageServerExtension
import org.eclipse.xtext.ide.server.occurrences.IDocumentHighlightService

/**
 * Use this class to register ide components.
 */
class MulticoreAllocationIdeModule extends AbstractMulticoreAllocationIdeModule {

	def Class<? extends ILanguageServerExtension> bindILanguageServerExtension() {
		DiagramLanguageServerImpl
	}

	def Class<? extends IDocumentHighlightService> bindIDocumentHighlightService() {
		MulticoreDocumentHighlightService
	}
	
	def Class<? extends IDiagramServer> bindIDiagramServer() {
		MulticoreAllocationDiagramServer
	}
	
	def Class<? extends IModelUpdateListener> bindIModelUpdateListener() {
		MulticoreAllocationUpdateListener
	}
	
	def Class<? extends ILayoutEngine> bindILayoutEngine() {
		MulticoreAllocationLayoutEngine
	}
	
	def Class<? extends IPopupModelFactory> bindIPopupModelFactory() {
		MulticoreAllocationPopupModelFactory
	}
	
	def Class<? extends IDiagramSelectionListener> bindIDiagramSelectionListener() {
		MulticoreAllocationSelectionListener
	}
	
}
