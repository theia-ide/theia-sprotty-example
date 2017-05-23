/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule } from "inversify"
import { defaultModule, TYPES, ViewRegistry, overrideViewerOptions } from "sprotty/lib/base"
import { SGraphView, SLabelView, SCompartmentView, PolylineEdgeView } from "sprotty/lib/graph"
import { WebSocketDiagramServer } from "sprotty/lib/remote"
import { boundsModule, moveModule, selectModule, undoRedoModule, viewportModule, hoverModule } from "sprotty/lib/features"
import { LocalModelSource } from "sprotty/lib/local/local-model-source"
import { HtmlRootView, PreRenderedView } from "sprotty/lib/lib"
import { ClassDiagramFactory } from "./model-factory"
import { ClassNodeView } from "./views"

const classDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.IModelFactory).to(ClassDiagramFactory).inSingletonScope()
})

export default (useWebsocket: boolean) => {
    const container = new Container()
    container.load(defaultModule, selectModule, moveModule, boundsModule, undoRedoModule, viewportModule, hoverModule, classDiagramModule)
    if (useWebsocket) {
        container.bind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope()
    } else {
        container.bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope()
    }
    overrideViewerOptions(container, {
        boundsComputation: 'dynamic'
    })

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:class', ClassNodeView)
    viewRegistry.register('label:heading', SLabelView)
    viewRegistry.register('label:text', SLabelView)
    viewRegistry.register('comp:comp', SCompartmentView)
    viewRegistry.register('edge:straight', PolylineEdgeView)
    viewRegistry.register('html', HtmlRootView)
    viewRegistry.register('pre-rendered', PreRenderedView)

    return container
}
