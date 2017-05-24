import { Widget } from "@phosphor/widgets"
import { Message } from "@phosphor/messaging/lib"
import runClassDiagram from "../classdiagram/src/standalone"

export class DiagramWidget extends Widget {

    constructor(protected readonly svgContainer: HTMLElement) {
        super({node: document.createElement('div')})
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg)
        this.svgContainer.id = this.id + "sprotty"
        this.node.appendChild(this.svgContainer)
        runClassDiagram(this.svgContainer.id)
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