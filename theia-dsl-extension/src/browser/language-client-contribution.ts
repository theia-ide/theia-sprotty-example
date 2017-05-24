/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from "inversify"
import { BaseLanguageClientContribution, Workspace, Languages, LanguageClientFactory, ILanguageClient } from "theia-core/lib/languages/browser"
import { NotificationType0 } from "theia-core/lib/messaging/common"
import { ActionMessage } from "sprotty/lib/remote"

@injectable()
export class MultiCoreLanguageClientContribution extends BaseLanguageClientContribution {

    readonly id = 'multicore'
    readonly name = 'Multicore'

    constructor(
        @inject(Workspace) workspace: Workspace,
        @inject(Languages) languages: Languages,
        @inject(LanguageClientFactory) languageClientFactory: LanguageClientFactory
    ) {
        super(workspace, languages, languageClientFactory)
    }

    protected get globPatterns() {
        return [
            '**/*.multicore'
        ]
    }

    protected onReady(languageClient: ILanguageClient): void {
        // handle custom notifications here
        super.onReady(languageClient)
        // languageClient.onNotification()
    }

}

export class ActionMessageNotificationType extends NotificationType0<ActionMessage> {

}