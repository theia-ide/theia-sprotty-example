/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License") you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, ContainerModule } from "inversify"
import { BaseLanguageServerContribution, IConnection, LanguageServerContribution } from "theia-core/lib/languages/node"

const EXECUTABLE = './node_modules/theia-dsl-extension/build/example-server/bin/example-server'

@injectable()
class MultiCoreLanguageServerContribution extends BaseLanguageServerContribution {

    readonly id = 'multicore'
    readonly name = 'Multicore'

    readonly description = {
        id: 'multicore',
        name: 'Multicore',
        documentSelector: ['multicore'],
        fileEvents: [
            '**/*.multicore'
        ]
    }

    start(clientConnection: IConnection): void {
        const args: string[] = []
        const serverConnection = this.createProcessStreamConnection(EXECUTABLE, args)
        this.forward(clientConnection, serverConnection)
    }

}

export default new ContainerModule(bind => {
    bind(LanguageServerContribution).to(MultiCoreLanguageServerContribution).inSingletonScope()
})