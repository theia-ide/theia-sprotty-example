import { TYPES } from 'sprotty/lib/base';
import { TheiaDiagramServer } from './theia-diagram-server';
import { NotificationType } from 'vscode-jsonrpc/lib/messages';
import { ILanguageClient } from 'theia-core/lib/languages/browser';
import { injectable } from "inversify"
import diagramContainer from "./di.config"

@injectable()
export class TheiaDiagramConnector {

    private languageClient: ILanguageClient
    private servers: TheiaDiagramServer[] = []

    connect(languageClient: ILanguageClient) {
        this.languageClient = languageClient
        languageClient.onNotification(actionMessageType, this.messageReceived.bind(this))
    }

    createDiagramServer(widgetId:string): TheiaDiagramServer {
        const newServer = diagramContainer(widgetId).get<TheiaDiagramServer>(TYPES.ModelSource)
        newServer.connect(this)
        this.servers.push(newServer)
        return newServer
    }

    sendMessage(message: string) {
        this.languageClient.sendNotification(actionMessageType, message) 
    }

    messageReceived(message: string) {
        this.servers.forEach(element => {
            element.messageReceived(message)
        });
    }
}

const actionMessageType = new NotificationType<string, void>('diagram/onAction')