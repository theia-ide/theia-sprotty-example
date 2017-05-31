/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License") you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { InstanceRegistry } from 'sprotty/lib/utils/registry'
import { injectable, Container } from "inversify"
import flowDiagramContainer from "./flow/di.config"
import processorDiagramContainer from "./processor/di.config"

@injectable()
export class DiagramContainerRegistry extends InstanceRegistry<(type: string) => Container> {
    constructor() {
        super()
        this.register('flow', flowDiagramContainer)
        this.register('processor', processorDiagramContainer)
    }
}