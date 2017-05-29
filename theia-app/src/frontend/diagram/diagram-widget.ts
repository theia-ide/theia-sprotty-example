import { Widget } from "@phosphor/widgets"
import { Message } from "@phosphor/messaging/lib"
import runClassDiagram from "../classdiagram/src/standalone"
import { Container } from "inversify"
import { TYPES, ActionDispatcher } from "sprotty/lib/base"
import { InitializeCanvasBoundsAction } from "sprotty/lib/base/features/initialize-canvas"

export class DiagramWidget extends Widget {

    private diagramModuleContainer: Container

    constructor(protected readonly svgContainer: HTMLElement) {
        super({node: document.createElement('div')})
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg)
        this.svgContainer.id = this.id + "sprotty"
        this.node.appendChild(this.svgContainer)
        this.diagramModuleContainer = runClassDiagram(this.svgContainer.id)
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
        if(this.diagramModuleContainer !== undefined) {
            const actiondispatcher = this.diagramModuleContainer.get<ActionDispatcher>(TYPES.IActionDispatcher)
            const newBounds = this.getBoundsInPage(this.node as Element)
            actiondispatcher.dispatch(new InitializeCanvasBoundsAction(newBounds))
        }
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg)
        // TODO: this must be changed with a more dynamically fetched element id.
        const svgElement = document.getElementById('graph' + this.svgContainer.id)
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