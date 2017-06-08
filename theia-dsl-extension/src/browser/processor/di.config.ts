/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License") you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, Container, ContainerModule } from "inversify"
import {
    SCompartmentView, SLabelView, defaultModule, TYPES, ViewRegistry, overrideViewerOptions, ConsoleLogger, LogLevel,
    boundsModule, selectModule, viewportModule, moveModule, fadeModule, hoverModule, HtmlRootView, PreRenderedView
} from 'sprotty/lib'
import { ChipModelFactory } from "./chipmodel-factory"
import { ProcessorView, CoreView, CrossbarView, ChannelView, SimpleCoreView } from "./views"
import { TheiaDiagramServer } from '../diagram/theia-diagram-server'
import { DiagramConfiguration } from '../diagram/diagram-configuration'

const multicoreModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(ChipModelFactory).inSingletonScope()
})

@injectable()
export class ProcessorDiagramConfiguration implements DiagramConfiguration {

    get diagramType() {
        return 'processor'
    }

    createContainer(widgetId: string) {
        const container = new Container()
        container.load(defaultModule, boundsModule, selectModule, moveModule, viewportModule, fadeModule, multicoreModule, hoverModule)
        container.bind(TYPES.ModelSource).to(TheiaDiagramServer).inSingletonScope()

        overrideViewerOptions(container, {
            baseDiv: widgetId,
            hiddenDiv: 'sprotty-hidden-cores',
            popupDiv: 'sprotty-popup-cores',
            needsClientLayout: true,
            needsServerLayout: false
        })

        // Register views
        const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
        viewRegistry.register('processor', ProcessorView)
        viewRegistry.register('core', CoreView)
        viewRegistry.register('simplecore', SimpleCoreView)
        viewRegistry.register('crossbar', CrossbarView)
        viewRegistry.register('channel', ChannelView)
        viewRegistry.register('label:heading', SLabelView)
        viewRegistry.register('label:info', SLabelView)
        viewRegistry.register('comp', SCompartmentView)
        viewRegistry.register('html', HtmlRootView)
        viewRegistry.register('pre-rendered', PreRenderedView)

        return container
    }
}