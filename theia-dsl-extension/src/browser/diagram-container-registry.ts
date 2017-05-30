import { InstanceRegistry } from 'sprotty/lib/utils/registry';
import { injectable, Container } from "inversify"
import flowDiagramContainer from "./flow/di.config"
import processorDiagramContainer from "./processor/di.config"

@injectable()
export class DiagramContainerRegistry extends InstanceRegistry<(type: string)=>Container> {
    constructor() {
        super()
        this.register('flow', flowDiagramContainer)
        this.register('processor', processorDiagramContainer)
    }
}