import { TextDocumentPositionParams } from 'vscode-base-languageclient/lib/services';
import { DiagramContainerRegistry } from './diagram-container-registry';
import { MultiCoreLanguageClientContribution } from './language-client-contribution';
import { TYPES } from 'sprotty/lib/base';
import { TheiaDiagramServer } from './theia-diagram-server';
import { NotificationType } from 'vscode-jsonrpc/lib/messages';
import { LanguageClientContribution } from 'theia-core/lib/languages/browser';
import { injectable, inject } from "inversify"

const actionMessageType = new NotificationType<string, void>('diagram/onAction')
const textPositionMessageType = new NotificationType<TextDocumentPositionParams, void>('diagram/update')

@injectable()
export class TheiaDiagramConnector {

    private servers: TheiaDiagramServer[] = []
    
    constructor(@inject(LanguageClientContribution) private languageClientContribution: MultiCoreLanguageClientContribution,
                @inject(DiagramContainerRegistry) private diagramContainerRegistry: DiagramContainerRegistry) {
        this.languageClientContribution.languageClient.then(
            lc => lc.onNotification(actionMessageType, this.messageReceived.bind(this)))
        .catch(
            err => console.error(err)
        )
    }
    
    createDiagramServer(widgetId: string, diagramType: string): TheiaDiagramServer {
        const containerFactory = this.diagramContainerRegistry.get(diagramType)
        const newServer = containerFactory(widgetId).get<TheiaDiagramServer>(TYPES.ModelSource)
        newServer.connect(this)
        this.servers.push(newServer)
        return newServer
    }

    sendMessage(message: string) {
        this.languageClientContribution.languageClient.then(lc => lc.sendNotification(actionMessageType, message))
    }

    sendTextPosition(params: TextDocumentPositionParams) {
        this.languageClientContribution.languageClient.then(lc => lc.sendNotification(textPositionMessageType, params))
    }

    messageReceived(message: string) {
        this.servers.forEach(element => {
            element.messageReceived(message)
        });
    }
}

