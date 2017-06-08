/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License") you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { TheiaDiagramServerConnector } from './theia-diagram-server-connector'
import { RequestModelAction, IActionDispatcher } from 'sprotty/lib/base'
import { Widget } from "@phosphor/widgets"
import { Message } from "@phosphor/messaging/lib"
import URI from "theia-core/lib/application/common/uri"
import { InitializeCanvasBoundsAction } from "sprotty/lib/base/features/initialize-canvas"
import { CenterAction } from 'sprotty/lib/features'

export class DiagramWidget extends Widget {

    private actionDispatcher: IActionDispatcher // TODO where do I get the actionDispatcher from

    constructor(protected readonly uri: URI,
                protected readonly diagramType: string,
                protected readonly diagramConnector: TheiaDiagramServerConnector) {
        super()
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg)
        const svgContainer = document.createElement("div")
        svgContainer.id = this.id + "sprotty"
        this.node.appendChild(svgContainer)
        const diagramServer = this.diagramConnector.createDiagramServer(svgContainer.id, this.diagramType)
        this.actionDispatcher = diagramServer.actionDispatcher
        diagramServer.handle(new RequestModelAction({
            resourceId: this.uri.toString(),
            diagramType: this.diagramType
        }))
    }

    protected onAfterShow(msg: Message): void {
        super.onAfterShow(msg)
    }

    protected getBoundsInPage(element: Element) {
        const bounds = element.getBoundingClientRect()
        return {
            x: bounds.left,
            y: bounds.top,
            width: bounds.width,
            height: bounds.height
        }
    }

    protected onResize(msg: Widget.ResizeMessage): void {
        super.onResize(msg)
        if (this.actionDispatcher !== undefined) {
            const newBounds = this.getBoundsInPage(this.node as Element)
            this.actionDispatcher.dispatch(new InitializeCanvasBoundsAction(newBounds))
            this.actionDispatcher.dispatch(new CenterAction([], false))
        }
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg)
        // TODO: this must be changed with a more dynamically fetched element id.
        const svgElement = document.getElementById('flow')
        if (svgElement !== null)
            svgElement.focus()
    }

    protected onCloseRequest(msg: Message): void {
        super.onCloseRequest(msg)
        this.dispose()
    }


    protected onAfterHide(msg: Message): void {
        super.onAfterHide(msg)
    }

    protected onAfterDetach(msg: Message): void {
        super.onAfterDetach(msg)
    }


    protected onUpdateRequest(msg: Message): void {
        super.onUpdateRequest(msg)
    }
}