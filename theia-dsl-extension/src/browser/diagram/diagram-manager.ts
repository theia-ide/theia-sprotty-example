/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License") you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { TextDocumentPositionParams } from 'vscode-base-languageclient/lib/services'
import { TextEditorSelection } from 'theia-core/lib/editor/browser'
import { TheiaDiagramServerConnector } from './theia-diagram-server-connector'
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

    @inject(TheiaDiagramServerConnector) readonly diagramConnector: TheiaDiagramServerConnector
    @inject(DiagramWidgetRegistry) protected readonly widgetRegistry: DiagramWidgetRegistry
    @inject(SelectionService) protected readonly selectionService: SelectionService

    abstract get diagramType(): string
    abstract iconClass: string

    get id() {
        return this.diagramType + "-diagram-opener"
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
        if (TextEditorSelection.is(e) && e.cursor !== undefined) {
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
            newWidget.title.icon = this.iconClass
            this.widgetRegistry.addWidget(uri, this.diagramType, newWidget)
            newWidget.disposed.connect(() =>
                this.widgetRegistry.removeWidget(uri, this.diagramType)
            )
            app.shell.addToMainArea(newWidget)
            return newWidget
        })
    }
}

