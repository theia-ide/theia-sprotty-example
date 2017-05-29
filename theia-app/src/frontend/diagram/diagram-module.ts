import {
    TheiaDiagramConnector
} from 'theia-dsl-extension/lib/browser/flow/theia-diagram-server-connector';
import { ContainerModule } from 'inversify'
import { OpenHandler, FrontendApplicationContribution } from 'theia-core/lib/application/browser'
import { DiagramManager, DiagramManagerImpl } from "./diagram-manager"
import { WidgetRegistry } from "./diagram-registry"

export const diagramModule = new ContainerModule(bind => {
    bind(TheiaDiagramConnector).to(TheiaDiagramConnector).inSingletonScope
    bind(WidgetRegistry).to(WidgetRegistry).inSingletonScope()
    bind(DiagramManager).to(DiagramManagerImpl).inSingletonScope()
    bind(FrontendApplicationContribution).toDynamicValue(context => context.container.get(DiagramManager))
    bind(OpenHandler).toDynamicValue(context => context.container.get(DiagramManager))
})
