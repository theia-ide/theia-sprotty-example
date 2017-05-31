/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License") you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { TheiaDiagramConnector } from 'theia-dsl-extension/lib/browser/theia-diagram-server-connector'
import { ContainerModule } from 'inversify'
import { OpenHandler, FrontendApplicationContribution } from 'theia-core/lib/application/browser'
import { FlowDiagramManager, ProcessorDiagramManager } from './diagram-manager'
import { DiagramWidgetRegistry } from "./diagram-widget-registry"

export const diagramModule = new ContainerModule(bind => {
    bind(TheiaDiagramConnector).toSelf().inSingletonScope()
    bind(DiagramWidgetRegistry).toSelf().inSingletonScope()
    bind(FlowDiagramManager).toSelf().inSingletonScope()
    bind(ProcessorDiagramManager).toSelf().inSingletonScope()
    bind(FrontendApplicationContribution).toDynamicValue(context => context.container.get(FlowDiagramManager))
    bind(OpenHandler).toDynamicValue(context => context.container.get(FlowDiagramManager))
    bind(FrontendApplicationContribution).toDynamicValue(context => context.container.get(ProcessorDiagramManager))
    bind(OpenHandler).toDynamicValue(context => context.container.get(ProcessorDiagramManager))
})
