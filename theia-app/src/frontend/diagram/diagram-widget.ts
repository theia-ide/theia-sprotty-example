import {
    TheiaDiagramConnector
} from 'theia-dsl-extension/lib/browser/flow/theia-diagram-server-connector';
import { RequestModelAction } from 'sprotty/lib/base';
import { Widget } from "@phosphor/widgets"
import { Message } from "@phosphor/messaging/lib"
import URI from "theia-core/lib/application/common/uri";

export class DiagramWidget extends Widget {

    constructor(protected readonly uri: URI,
                protected readonly diagramConnector: TheiaDiagramConnector) {
        super()
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg)
        const svgContainer = document.createElement("div")
        svgContainer.id = this.id + "sprotty"
        this.node.appendChild(svgContainer)
        const diagramServer = this.diagramConnector.createDiagramServer(this.id)
        diagramServer.handle(new RequestModelAction('flow', undefined, {
            resourceID: this.uri.toString()
        })) 
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg)
    }

    protected onAfterShow(msg: Message): void {
        super.onAfterShow(msg)
    }

    protected onCloseRequest(msg: Message): void {
        super.onCloseRequest(msg)
        this.dispose()
    }
}