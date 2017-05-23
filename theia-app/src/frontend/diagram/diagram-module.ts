import { ContainerModule } from 'inversify'
import {  OpenHandler, FrontendApplicationContribution } from 'theia-core/lib/application/browser'
import { DiagramManager, DiagramManagerImpl } from "./diagram-manager"
import { WidgetRegistry } from "./diagram-registry"
import { SvgViewer } from "./diagram";

export const diagramModule = new ContainerModule(bind => {
    bind(SvgViewer).to(SvgViewer).inSingletonScope()
    bind(WidgetRegistry).to(WidgetRegistry).inSingletonScope()
    bind(DiagramManager).to(DiagramManagerImpl).inSingletonScope()
    bind(FrontendApplicationContribution).toDynamicValue(context => context.container.get(DiagramManager))
    bind(OpenHandler).toDynamicValue(context => context.container.get(DiagramManager))
})
