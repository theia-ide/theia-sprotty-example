import { injectable } from "inversify"
import { DiagramWidget } from "./diagram-widget"
import URI from "theia-core/lib/application/common/uri"

@injectable()
export class DiagramModelSource {
    loadView(uri: URI): Promise<DiagramWidget> {
        return new Promise<DiagramWidget>(resolve => {
            const svgHtml = document.createElement("div")
            const theDiagram = new DiagramWidget(svgHtml)
            resolve(theDiagram)
        })
    }
}