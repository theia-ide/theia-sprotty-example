import {
    TheiaDiagramConnector
} from 'theia-dsl-extension/lib/browser/theia-diagram-server-connector'
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
