import {
    TheiaDiagramConnector
} from 'theia-dsl-extension/lib/browser/flow/theia-diagram-server-connector';
import { injectable, inject } from "inversify"
import { OpenerOptions, OpenHandler, FrontendApplication, FrontendApplicationContribution } from "theia-core/lib/application/browser"
import URI from "theia-core/lib/application/common/uri"
import { DiagramWidget } from "./diagram-widget"
import { WidgetRegistry } from "./diagram-registry"
import { SelectionService } from "theia-core/lib/application/common"

export const DiagramManager = Symbol("DiagramManager")

export interface DiagramManager extends OpenHandler, FrontendApplicationContribution {

}

@injectable()
export class DiagramManagerImpl implements DiagramManager {
    id = "diagram-opener"
    label = "Diagram"

    private _resolveApp: (app: FrontendApplication) => void

    protected readonly resolveApp = new Promise<FrontendApplication>(resolve =>
        this._resolveApp = resolve
    )

    constructor(@inject(TheiaDiagramConnector) protected readonly diagramConnector: TheiaDiagramConnector,
                @inject(WidgetRegistry) protected readonly widgetRegistry: WidgetRegistry,
                @inject(SelectionService) protected readonly selectionService: SelectionService) {
    }

    onStart(app: FrontendApplication): void {
        this._resolveApp(app)
    }

    canHandle(uri: URI, options?: OpenerOptions | undefined): number {
        return 10
    }

    open(uri: URI, input?: OpenerOptions): Promise<DiagramWidget> {
        const promiseDiagramWidget = this.getOrCreateEditor(uri)
        promiseDiagramWidget.then((diagramWidget) => {
            this.resolveApp.then(app =>
                app.shell.activateMain(diagramWidget.id)
            )
        })


        return promiseDiagramWidget
    }

    protected getOrCreateEditor(uri: URI): Promise<DiagramWidget> {
        return this.resolveApp.then(app => {
            const widget = this.widgetRegistry.getWidget(uri)
            if (widget !== undefined) {
                return widget
            }
            const newWidget = new DiagramWidget(uri, this.diagramConnector)
            newWidget.title.closable = true
            newWidget.title.label = uri.lastSegment
            this.widgetRegistry.addWidget(uri, newWidget)
            newWidget.disposed.connect(() =>
                this.widgetRegistry.removeWidget(uri)
            )
            app.shell.addToMainArea(newWidget)
            return newWidget
        })
    }
}