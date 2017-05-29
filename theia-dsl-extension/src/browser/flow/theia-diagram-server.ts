import { ILogger } from 'sprotty/lib/utils';
import { TheiaDiagramConnector } from './theia-diagram-server-connector';
import {
    ActionHandlerRegistry,
    IActionDispatcher,
    SModelStorage,
    TYPES,
    ViewerOptions
} from 'sprotty/lib/base';
import { DiagramServer } from 'sprotty/lib/remote';
import { injectable, inject } from "inversify"

@injectable()
export class TheiaDiagramServer extends DiagramServer {

    protected connector: TheiaDiagramConnector

    constructor(@inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher,
                @inject(TYPES.ActionHandlerRegistry) actionHandlerRegistry: ActionHandlerRegistry,
                @inject(TYPES.ViewerOptions) viewerOptions: ViewerOptions,
                @inject(TYPES.SModelStorage) storage: SModelStorage,
                @inject(TYPES.ILogger) logger: ILogger) {
        super(actionDispatcher, actionHandlerRegistry, viewerOptions, storage, logger)
        //actionDispatcher.dispatch(new SetModelAction(storage.load()))
    }

    connect(connector: TheiaDiagramConnector)  {
        this.connector = connector
    }

    sendMessage(message: string) {
        this.connector.sendMessage(JSON.stringify(message))
    }

    messageReceived(message: string) {
        super.messageReceived(message)
    }
}
   

