/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License") you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify"
import { LanguageClientContribution } from "theia-core/lib/languages/browser"
import { MultiCoreLanguageClientContribution } from "./language-client-contribution"
import { FlowDiagramManager } from "../flow/flow-diagram-manager"
import { ProcessorDiagramManager } from "../processor/processor-diagram-manager"
import { DiagramConfiguration } from "../diagram/diagram-configuration"
import { FrontendApplicationContribution, OpenHandler } from 'theia-core/lib/application/browser'
import { ProcessorDiagramConfiguration } from '../processor/di.config'
import { FlowDiagramConfiguration } from '../flow/di.config'
import { DiagramManager, DiagramManagerProvider } from '../diagram/diagram-manager'

export default new ContainerModule(bind => {
    monaco.languages.register({
        id: 'multicore',
        aliases: ['Multicore', 'multicore'],
        extensions: ['.multicore'],
        mimetypes: ['text/multicore']
    })
    monaco.languages.setLanguageConfiguration('multicore', {
        comments: {
            lineComment: "//",
            blockComment: ['/*', '*/']
        },
        brackets: [['{', '}'], ['(', ')']],
        autoClosingPairs: [
            {
                open: '{',
                close: '}'
            },
            {
                open: '(',
                close: ')'
            }]
    })
    monaco.languages.setMonarchTokensProvider('multicore', <any>{
        // Set defaultToken to invalid to see what you do not tokenize yet
        // defaultToken: 'invalid',

        keywords: [
            'program', 'for', 'cores', 'kernel', 'duration', 'stackSize', 'stackStartAddr', 'task', 'execute', 'barrier', 'join',
            'then', 'step', 'core', 'runs', '$pc', '$sp', 'srcfile', 'stackTrace', 'core', 'finished'
        ],

        typeKeywords: [],

        operators: [],

        // we include these common regular expressions
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

        // The main tokenizer for our languages
        tokenizer: {
            root: [
                // identifiers and keywords
                [/[a-z_$][\w$]*/, {
                    cases: {
                        '@typeKeywords': 'keyword',
                        '@keywords': 'keyword',
                        '@default': 'identifier'
                    }
                }],
                [/[A-Z][\w\$]*/, 'type.identifier'],  // to show class names nicely

                // whitespace
                { include: '@whitespace' },

                // delimiters and operators
                [/[{}()\[\]]/, '@brackets'],
                [/[<>](?!@symbols)/, '@brackets'],
                [/@symbols/, {
                    cases: {
                        '@operators': 'operator',
                        '@default': ''
                    }
                }]
            ],

            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/\/\*/, 'comment', '@comment'],
                [/\/\/.*$/, 'comment'],
            ],

            comment: [
                [/[^\/*]+/, 'comment'],
                [/\/\*/, 'comment.invalid'],
                ["\\*/", 'comment', '@pop'],
                [/[\/*]/, 'comment']
            ],

            string: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, 'string', '@pop']
            ],
        },
    })
    bind(LanguageClientContribution).to(MultiCoreLanguageClientContribution).inSingletonScope()
    bind(DiagramConfiguration).to(FlowDiagramConfiguration).inSingletonScope()
    bind(DiagramConfiguration).to(ProcessorDiagramConfiguration).inSingletonScope()
    bind(FlowDiagramManager).toSelf().inSingletonScope()
    bind(DiagramManagerProvider).toProvider<DiagramManager>(context => {
        return () => {
            return new Promise<DiagramManager>((resolve) =>
                resolve(context.container.get(FlowDiagramManager))
            )
        }
    }).whenTargetNamed('flow')
    bind(DiagramManagerProvider).toProvider<DiagramManager>(context => {
        return () => {
            return new Promise<DiagramManager>((resolve) =>
                resolve(context.container.get(ProcessorDiagramManager))
            )
        }
    }).whenTargetNamed('processor')
    bind(ProcessorDiagramManager).toSelf().inSingletonScope()
    bind(FrontendApplicationContribution).toDynamicValue(context => context.container.get(FlowDiagramManager))
    bind(OpenHandler).toDynamicValue(context => context.container.get(FlowDiagramManager))
    bind(FrontendApplicationContribution).toDynamicValue(context => context.container.get(ProcessorDiagramManager))
    bind(OpenHandler).toDynamicValue(context => context.container.get(ProcessorDiagramManager))
})