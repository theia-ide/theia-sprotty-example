import { injectable } from "inversify"
import URI from "theia-core/lib/application/common/uri"
import { DiagramWidget } from "./diagram-widget"

@injectable()
export class SvgViewer {

    constructor() {

    }

    loadView(uri: URI): Promise<DiagramWidget> {
        return new Promise<DiagramWidget>(resolve => {
            const theDiagram = new DiagramWidget()
            resolve(theDiagram)
        })
    }


}