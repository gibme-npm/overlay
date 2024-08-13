// Copyright (c) 2024, Brandon Lehmann <brandonlehmann@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import type { Animation, Rotation, Icon, Color } from '@gibme/fontawesome';
export * from '@gibme/fontawesome';

export type Action = 'show' | 'hide' | 'progress' | 'resize' | 'text' | 'icon' | 'image';

export interface AutoResize {
    autoResize: boolean;
    resizeFactor: number;
}

export interface HasOrder {
    order: number;
}

export interface BaseOptions {
    className: string;
    color: Color;
}

export interface BackgroundOptions {
    className: string;
    color: Color;
}

export interface CanHide {
    hide: boolean;
}

export interface ImageOptions extends Partial<BaseOptions>, Partial<AutoResize>,
    Partial<CanHide>, Partial<HasOrder> {
    source: string;
    animation?: Animation;
    rotation?: Rotation;
    width?: number;
    height?: number;
}

export interface FontAwesomeOptions extends Partial<Icon.Options>,
    Partial<AutoResize>, Partial<CanHide>, HasOrder {
    name: string | string[];
}

export interface TextOptions extends Partial<BaseOptions>, Partial<AutoResize>, Partial<HasOrder> {
    message: string | JQuery<HTMLElement>;
}

export interface ProgressOptions extends Partial<BaseOptions>, Partial<AutoResize>, Partial<HasOrder> {
    value: number;
    min: number;
    max: number;
    animated: boolean;
}

export interface OverlayOptions {
    background: Partial<BackgroundOptions>;
    icon: Partial<FontAwesomeOptions>;
    image: Partial<ImageOptions>;
    text: Partial<TextOptions>;
    progress: Partial<ProgressOptions>;
    resizeInterval: number;
    fade: { in?: number | boolean, out?: number | boolean };
    zIndex: number;
    timeout?: number;
}

export const DefaultOptions: Readonly<OverlayOptions> = {
    background: {
        color: 'rgba(255, 255, 255, 0.8)'
    },
    icon: {
        name: 'spinner',
        style: 'solid',
        animation: 'spin-pulse',
        color: '#202020',
        resizeFactor: 0.15,
        autoResize: true,
        order: 2
    },
    image: {
        source: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                    <circle r="80" cx="500" cy="90"/>
                    <circle r="80" cx="500" cy="910"/>
                    <circle r="80" cx="90" cy="500"/>
                    <circle r="80" cx="910" cy="500"/>
                    <circle r="80" cx="212" cy="212"/>
                    <circle r="80" cx="788" cy="212"/>
                    <circle r="80" cx="212" cy="788"/>
                    <circle r="80" cx="788" cy="788"/></svg>`,
        animation: 'spin',
        autoResize: true,
        resizeFactor: 0.15,
        width: 200,
        height: 200,
        color: '#202020',
        hide: true,
        order: 3
    },
    text: {
        autoResize: true,
        resizeFactor: 0.075,
        color: '#202020',
        order: 1
    },
    progress: {
        autoResize: true,
        resizeFactor: 0.025,
        color: '#a0a0a0',
        min: 0,
        max: 100,
        animated: true,
        order: 4
    },
    fade: { in: 400, out: 200 },
    resizeInterval: 50,
    zIndex: 2147483647
};

export type Options = Partial<OverlayOptions> | Partial<FontAwesomeOptions> | JQuery<HTMLElement>
    | string | number;

export const mergeOptions = (
    target: Partial<OverlayOptions> = {},
    source: Partial<OverlayOptions> = DefaultOptions
): Partial<OverlayOptions> => {
    const deep_merge = <Type = any, SourceType = any>(obj1: SourceType, obj2: SourceType): Type => {
        const result = { ...obj1 };

        for (const key in obj2) {
            if (Object.prototype.hasOwnProperty.call(obj2, key)) {
                if (obj2[key] instanceof Object && obj1[key] instanceof Object) {
                    result[key] = deep_merge(obj1[key], obj2[key]);
                } else {
                    result[key] = obj2[key];
                }
            }
        }

        return result as any;
    };

    return deep_merge<OverlayOptions>(source, target);
};
