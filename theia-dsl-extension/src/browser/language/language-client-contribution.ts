/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject, named } from "inversify"
import URI from 'theia-core/lib/application/common/uri'
import { FrontendApplication } from 'theia-core/lib/application/browser'
import { BaseLanguageClientContribution, Workspace, Languages, LanguageClientFactory } from "theia-core/lib/languages/browser"
import { DiagramManager, DiagramManagerProvider } from '../diagram/diagram-manager'

@injectable()
export class MultiCoreLanguageClientContribution extends BaseLanguageClientContribution {

    readonly id = 'multicore'
    readonly name = 'Multicore'

    constructor(
        @inject(Workspace) workspace: Workspace,
        @inject(Languages) languages: Languages,
        @inject(LanguageClientFactory) languageClientFactory: LanguageClientFactory,
        @inject(DiagramManagerProvider)@named('flow') protected flowDiagramManagerProvider: DiagramManagerProvider,
        @inject(DiagramManagerProvider)@named('processor') protected processorDiagramManagerProvider: DiagramManagerProvider
    ) {
        super(workspace, languages, languageClientFactory)
    }

    protected get globPatterns() {
        return [
            '**/*.multicore'
        ]
    }

    waitForActivation(app: FrontendApplication): Promise<any> {
        return Promise.race([
            super.waitForActivation(app),
            this.waitForOpenDiagrams(this.flowDiagramManagerProvider()),
            this.waitForOpenDiagrams(this.processorDiagramManagerProvider())
        ])
    }

    protected waitForOpenDiagrams(diagramManagerProvider: Promise<DiagramManager>): Promise<any> {
        return diagramManagerProvider.then(diagramManager => {
            return new Promise<URI>((resolve) => {
                const disposable = diagramManager.onDiagramOpened(uri => {
                    disposable.dispose()
                    resolve(uri)
                })
            })
        })
    }
}
