import { TextDocumentPositionParams } from 'vscode-base-languageclient/lib/services';
import { TextEditorSelection } from 'theia-core/lib/editor/browser';
import {
    TheiaDiagramConnector
} from 'theia-dsl-extension/lib/browser/theia-diagram-server-connector';
import { injectable, inject } from "inversify"
import { OpenerOptions, OpenHandler, FrontendApplication, FrontendApplicationContribution } from "theia-core/lib/application/browser"
import URI from "theia-core/lib/application/common/uri"
import { DiagramWidget } from "./diagram-widget"
import { DiagramWidgetRegistry } from "./diagram-widget-registry"
import { SelectionService } from "theia-core/lib/application/common"

export interface DiagramManager extends OpenHandler, FrontendApplicationContribution {
    readonly diagramType: string
}

@injectable() 
export abstract class DiagramManagerImpl implements DiagramManager {

    @inject(TheiaDiagramConnector) readonly diagramConnector: TheiaDiagramConnector
    @inject(DiagramWidgetRegistry) protected readonly widgetRegistry: DiagramWidgetRegistry
    @inject(SelectionService) protected readonly selectionService: SelectionService
    
    abstract get diagramType(): string

    get id() {
        return this.diagramType + "-diagram-opener"
    }

    get label() {
        return this.diagramType + "Diagram"
    }

    private _resolveApp: (app: FrontendApplication) => void

    protected readonly resolveApp = new Promise<FrontendApplication>(resolve =>
        this._resolveApp = resolve
    )

    onStart(app: FrontendApplication): void {
        this._resolveApp(app)
        this.selectionService.onSelectionChanged((e: any) => this.onSelectionChanged(e))
    }

    onSelectionChanged(e: any) {
        if(TextEditorSelection.is(e) && e.cursor !== undefined) {
            const params: TextDocumentPositionParams = {
                textDocument: {
                    uri: e.uri.toString()
                },
                position: e.cursor
            }
            this.diagramConnector.sendTextPosition(params)
        }
    }

    canHandle(uri: URI, options?: OpenerOptions | undefined): number {
        return 10
    }

    open(uri: URI, input?: OpenerOptions): Promise<DiagramWidget> {
        const promiseDiagramWidget = this.getOrCreateDiagramWidget(uri)
        promiseDiagramWidget.then((diagramWidget) => {
            this.resolveApp.then(app =>
                app.shell.activateMain(diagramWidget.id)
            )
        })
        return promiseDiagramWidget
    }

    protected getOrCreateDiagramWidget(uri: URI): Promise<DiagramWidget> {
        return this.resolveApp.then(app => {
            const widget = this.widgetRegistry.getWidget(uri, this.diagramType)
            if (widget !== undefined) {
                return widget
            }
            const newWidget = new DiagramWidget(uri, this.diagramType, this.diagramConnector)
            newWidget.title.closable = true
            newWidget.title.label = uri.lastSegment
            this.widgetRegistry.addWidget(uri, this.diagramType, newWidget)
            newWidget.disposed.connect(() =>
                this.widgetRegistry.removeWidget(uri, this.diagramType)
            )
            app.shell.addToMainArea(newWidget)
            return newWidget
        })
    }
}

@injectable() 
export class FlowDiagramManager extends DiagramManagerImpl {
    readonly diagramType = 'flow'
}

@injectable() 
export class ProcessorDiagramManager extends DiagramManagerImpl {
    readonly diagramType = 'processor'
}