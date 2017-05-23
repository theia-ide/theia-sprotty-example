import { Widget } from "@phosphor/widgets"

export class DiagramWidget extends Widget {

    constructor() {
        let element = document.createElement('div')
        element.style.color = "white"
        element.id = "sprotty"
        element.innerText = "HELLO WIDGET"
        super({
            node: element
        })

    }

}