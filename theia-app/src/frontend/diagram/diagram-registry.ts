/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify";
import URI from "theia-core/lib/application/common/uri";
import { Emitter, Event, MaybePromise } from "theia-core/lib/application/common";
import { Widget } from "@phosphor/widgets";

@injectable()
export class WidgetRegistry {
    protected idSequence = 0;
    protected readonly widgets = new Map<string, MaybePromise<Widget>>();
    protected readonly onWidgetsChangedEmitter = new Emitter<void>();

    onWidgetsChanged(): Event<void> {
        return this.onWidgetsChangedEmitter.event;
    }

    getWidgetCount(): number {
        return this.widgets.size;
    }

    getOpenedWidgets(): Widget[] {
        return Array.from(this.widgets.values()).filter(widget => widget instanceof Widget) as Widget[];
    }

    getWidget(uri: URI): Promise<Widget> | undefined {
        const widget = this.widgets.get(uri.toString());
        if (widget) {
            return Promise.resolve(widget);
        }
        return undefined;
    }

    addWidget(uri: URI, widget: Widget): void {
        widget.id = this.nextId();
        this.widgets.set(uri.toString(), widget);
        this.onWidgetsChangedEmitter.fire(undefined);
    }

    removeWidget(uri: URI): void {
        if (this.widgets.delete(uri.toString())) {
            this.onWidgetsChangedEmitter.fire(undefined);
        }
    }

    protected nextId(): string {
        return `widget-${this.idSequence++}`;
    }
}
