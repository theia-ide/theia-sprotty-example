/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { rgb, RGBColor, toSVG } from 'sprotty/lib'

export class KernelColor {
    static colorMap: RGBColor[] = [
        rgb(141, 211, 199), rgb(255, 255, 179), rgb(190, 186, 218), rgb(251, 128, 114),
        rgb(128, 177, 211), rgb(253, 180, 98), rgb(179, 222, 105), rgb(252, 205, 229),
        rgb(217, 217, 217), rgb(188, 128, 189), rgb(204, 235, 197), rgb(255, 237, 111)
    ]

    static getSVG(index: number): string {
        if (index === undefined || index < 0)
            return toSVG({red: 150, green: 150, blue: 150})
        else
            return toSVG(KernelColor.colorMap[index % KernelColor.colorMap.length])
    }
}