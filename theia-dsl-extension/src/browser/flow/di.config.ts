/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License") you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule } from "inversify"
import { defaultModule, TYPES, ViewRegistry, overrideViewerOptions } from "sprotty/lib/base"
import { ConsoleLogger, LogLevel } from "sprotty/lib/utils"
import { boundsModule, moveModule, fadeModule, hoverModule } from "sprotty/lib/features"
import { FlowModelFactory } from "./flowmodel-factory"
import viewportModule from "sprotty/lib/features/viewport/di.config"
import selectModule from "sprotty/lib/features/select/di.config"
import { SGraphView } from "sprotty/lib/graph"
import { TaskNodeView, BarrierNodeView, FlowEdgeView } from "./views"
import { HtmlRootView, PreRenderedView } from "sprotty/lib/lib"
import { TheiaDiagramServer } from '../diagram/theia-diagram-server'
import { DiagramConfiguration } from '../diagram/diagram-configuration'

const flowModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(FlowModelFactory).inSingletonScope()
})

export default {
    diagramType: 'flow',
    factory: (widgetId: string) => {
        const container = new Container()
        container.load(defaultModule, selectModule, moveModule, boundsModule, fadeModule, viewportModule, flowModule, hoverModule)
        container.bind(TYPES.ModelSource).to(TheiaDiagramServer).inSingletonScope()

        overrideViewerOptions(container, {
            baseDiv: widgetId,
            hiddenDiv: 'sprotty-hidden-flow',
            popupDiv: 'sprotty-popup-flow',
            boundsComputation: 'dynamic'
        })

        // Register views
        const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
        viewRegistry.register('flow', SGraphView)
        viewRegistry.register('task', TaskNodeView)
        viewRegistry.register('barrier', BarrierNodeView)
        viewRegistry.register('edge', FlowEdgeView)
        viewRegistry.register('html', HtmlRootView)
        viewRegistry.register('pre-rendered', PreRenderedView)

        return container
    }
} as DiagramConfiguration
