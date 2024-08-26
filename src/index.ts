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

import $ from 'jquery';
import * as Types from './types';
import { createIcon } from '@gibme/fontawesome';
import { nanoid } from 'nanoid';

export * from './types';

export default abstract class Overlay {
    private static instances = new Map<string, { overlayId: string, options: Partial<Types.OverlayOptions> }>();

    /**
     * Returns if the overlay is currently open for the specified element
     *
     * @param parent
     */
    public static isOpen (parent: JQuery | string): boolean {
        if (typeof parent === 'string') {
            return $(`#${parent}`).length !== 0;
        } else {
            const parentId = this.get_or_set_element_id(parent);

            return this.instances.has(parentId);
        }
    }

    /**
     * Handles our actions against the parent
     *
     * @param parent
     * @param action
     * @param options
     */
    public static handle (
        parent: JQuery,
        action: Types.Action,
        options: Types.Options = {}
    ): JQuery {
        const parentId = this.get_or_set_element_id(parent);

        const { overlayId } = this.instances.get(parentId) || { overlayId: nanoid() };

        if (action === 'text' && typeof options === 'string') {
            options = this.merge_options(parentId, overlayId,
                { text: { message: options } });

            return this.text(parent, overlayId, options);
        } else if (action === 'progress' && typeof options === 'number') {
            options = this.merge_options(parentId, overlayId,
                { progress: { value: options } });

            return this.progress(parent, overlayId, options);
        } else if (action === 'text' && typeof options === 'object' && (options as JQuery).jquery) {
            options = this.merge_options(parentId, overlayId,
                { text: { message: options as JQuery } });

            return this.text(parent, overlayId, options);
        } else if (action === 'icon' && typeof options === 'object') {
            options = this.merge_options(parentId, overlayId,
                { icon: options as Partial<Types.FontAwesomeOptions> });

            return this.icon(parent, overlayId, options);
        } else if (action === 'image' && typeof options === 'object') {
            options = this.merge_options(parentId, overlayId,
                { image: options as Partial<Types.ImageOptions> });

            return this.image(parent, overlayId, options);
        } else {
            options = Types.mergeOptions(options as Partial<Types.OverlayOptions>);
            options = this.merge_options(parentId, overlayId, options as Partial<Types.OverlayOptions>);

            const handle_resize = () => {
                this.auto_resize(parent, overlayId, this.instances.get(parentId)?.options);
            };

            if (action === 'show') {
                $(window).on('resize', handle_resize);
            } else if (action === 'hide') {
                $(window).off('resize', handle_resize);
            }

            switch (action) {
                case 'show':
                    return this.show(parent, overlayId, options);
                case 'hide':
                    return this.hide(parent, overlayId, options);
                case 'text':
                    return this.text(parent, overlayId, options);
                case 'resize':
                    return this.resize(parent, overlayId, options);
                case 'progress':
                    return this.progress(parent, overlayId, options);
                case 'icon':
                    return this.icon(parent, overlayId, options);
                case 'image':
                    return this.image(parent, overlayId, options);
                default:
                    throw new Error('invalid action specified');
            }
        }
    }

    /**
     * Font size helper for a few sizes
     *
     * @param overlay
     * @param resizeFactor
     * @protected
     */
    private static calculate_size (overlay: JQuery, resizeFactor: number = 1) {
        const height = overlay.height() || overlay.parent().height();
        if (!height) return '1em';
        const size = 2 * Math.round((height * resizeFactor) / 2);
        return `${size}px`;
    }

    /**
     * Shows the overlay
     *
     * @param parent
     * @param overlayId
     * @param options
     * @protected
     */
    private static show (
        parent: JQuery,
        overlayId: string,
        options: Partial<Types.OverlayOptions> = {}
    ): JQuery {
        if (this.isOpen(overlayId)) return parent;

        const overlay = $(`<div id="${overlayId}">`)
            .addClass('d-flex w-100 h-100 position-sticky top-0 bottom-0 start-0 end-0')
            .css('z-index', options.zIndex || Number.MAX_SAFE_INTEGER)
            .empty()
            .hide()
            .appendTo(parent);

        if (options.background?.color) overlay.css('background-color', options.background.color);
        if (options.background?.className) overlay.addClass(options.background.className);

        $('<div>')
            .addClass('d-flex flex-grow-1')
            .attr('id', `${overlayId}-flex`)
            .append($('<div>')
                .attr('id', `${overlayId}-container`)
                .addClass('d-flex flex-column w-100 justify-content-center align-items-center'))
            .appendTo(overlay);

        const container = $(`#${overlayId}-container`);

        const fields = ['text', 'icon', 'image', 'progress'];

        for (const field of fields) {
            const element = $('<div>')
                .attr('id', `${overlayId}-container-${field}`)
                .addClass('m-4 text-center')
                .hide()
                .appendTo(container);

            switch (field) {
                case 'text':
                    if (options.text) this.text(parent, overlayId, options);
                    break;
                case 'icon':
                    if (options.icon) this.icon(parent, overlayId, options);
                    break;
                case 'image':
                    if (options.image) this.image(parent, overlayId, options);
                    break;
                case 'progress':
                    $('<div>')
                        .attr('id', `${overlayId}-container-${field}-bar`)
                        .addClass('progress-bar')
                        .appendTo(element);
                    if (options.progress) this.progress(parent, overlayId, options);
                    break;
            }
        }

        // force a resize before the auto-resize
        this.resize(parent, overlayId, options);

        const fade = typeof options.fade === 'object' && options.fade.out ? options.fade.out : false;

        parent.addClass('overflow-hidden')
            .trigger('overlay.show');

        if (typeof fade === 'number') {
            overlay.fadeIn(fade, () => {
                parent.trigger('overlay.shown');
                if (options.timeout) setTimeout(() => this.hide(parent, overlayId), options.timeout);
            });
        } else if (fade) {
            overlay.fadeIn(400, () => {
                parent.trigger('overlay.shown');
                if (options.timeout) setTimeout(() => this.hide(parent, overlayId), options.timeout);
            });
        } else {
            overlay.show(() => {
                parent.trigger('overlay.shown');
                if (options.timeout) setTimeout(() => this.hide(parent, overlayId), options.timeout);
            });
        }

        return parent;
    }

    /**
     * Hides the overlay
     *
     * @param parent
     * @param overlayId
     * @param options
     * @protected
     */
    private static hide (
        parent: JQuery,
        overlayId: string,
        options: Partial<Types.OverlayOptions> = {}
    ): JQuery {
        if (!this.isOpen(overlayId)) return parent;
        const parentId = this.get_or_set_element_id(parent);

        const overlay = $(`#${overlayId}`, parent);

        const fade = typeof options.fade === 'object' && options.fade.out ? options.fade.out : false;

        parent.trigger('hide');

        const cleanup = () => {
            overlay.hide()
                .addClass('d-none')
                .remove();

            this.instances.delete(parentId);

            parent.removeClass('overflow-hidden')
                .trigger('overlay.hidden');
        };

        if (typeof fade === 'number') {
            overlay.fadeOut(fade, cleanup);
        } else if (fade) {
            overlay.fadeOut(400, cleanup);
        } else {
            overlay.hide(cleanup);
        }

        return parent;
    }

    /**
     * Updates the progress bar in the overlay
     *
     * @param parent
     * @param overlayId
     * @param options
     * @protected
     */
    private static progress (
        parent: JQuery,
        overlayId: string,
        options: Partial<Types.OverlayOptions> = {}
    ): JQuery {
        if (!this.isOpen(overlayId)) return parent;

        const overlay = $(`#${overlayId}`, parent);

        if (!options.progress) return parent;

        const order = this.adjust_order(4, options.progress.order);

        $(`#${overlayId}-container-progress`, overlay)
            .removeClass('order-0 order-1 order-2 order-3 order-4 order-5')
            .addClass(`order-${order} progress w-75`)
            .attr('role', 'progressbar');

        const progress_bar = $(`#${overlayId}-container-progress-bar`, overlay);

        if (options.progress.color) progress_bar.css('background-color', options.progress.color);
        if (options.progress.className) progress_bar.addClass(options.progress.className);
        if (options.progress.animated) {
            progress_bar.addClass('progress-bar-animated progress-bar-striped');
        } else {
            progress_bar.removeClass('progress-bar-animated progress-bar-striped');
        }

        progress_bar.attr('aria-valuemin', options.progress.min || 0)
            .attr('aria-valuemax', options.progress.max || 100);

        if (typeof options.progress.value === 'undefined') {
            progress_bar.attr('aria-valuenow', 0)
                .parent().hide();
        } else {
            let value = Math.round(options.progress.value / (options.progress.max || 100) * 100);
            if (value > 100) value = 100;

            progress_bar
                .css('width', `${value}%`)
                .attr('aria-valuenow', value)
                .parent()
                .show();

            parent.trigger('overlay.progress', value);
        }

        return parent;
    }

    /**
     * Resizes the text element
     *
     * @param parent
     * @param overlayId
     * @param options
     * @private
     */
    private static resize_text (
        parent: JQuery,
        overlayId: string,
        options: Partial<Types.OverlayOptions> = {}
    ) {
        const overlay = $(`#${overlayId}`, parent);

        $(`#${overlayId}-container-text`, overlay)
            .css('font-size', this.calculate_size(overlay, options.text?.resizeFactor));
    }

    /**
     * Resizes the icon element
     *
     * @param parent
     * @param overlayId
     * @param options
     * @private
     */
    private static resize_icon (
        parent: JQuery,
        overlayId: string,
        options: Partial<Types.OverlayOptions> = {}
    ) {
        const overlay = $(`#${overlayId}`, parent);

        $(`#${overlayId}-container-icon-element`, overlay)
            .css('font-size', this.calculate_size(overlay, options.icon?.resizeFactor));
    }

    /**
     * Resizes the image element
     *
     * @param parent
     * @param overlayId
     * @param options
     * @private
     */
    private static resize_image (
        parent: JQuery,
        overlayId: string,
        options: Partial<Types.OverlayOptions> = {}
    ) {
        const overlay = $(`#${overlayId}`, parent);

        const size = this.calculate_size(overlay, options.image?.resizeFactor);

        $(`#${overlayId}-container-image-element`, overlay)
            .css('width', size)
            .css('height', size);
    }

    /**
     * Resizes the progress element
     *
     * @param parent
     * @param overlayId
     * @param options
     * @private
     */
    private static resize_progress (
        parent: JQuery,
        overlayId: string,
        options: Partial<Types.OverlayOptions> = {}
    ) {
        const overlay = $(`#${overlayId}`, parent);

        $(`#${overlayId}-container-progress`, overlay)
            .css('height', this.calculate_size(overlay, options.progress?.resizeFactor));
    }

    /**
     * Performs a resize of elements in the overlay
     *
     * @param parent
     * @param overlayId
     * @param options
     * @protected
     */
    private static resize (
        parent: JQuery,
        overlayId: string,
        options: Partial<Types.OverlayOptions> = {}
    ): JQuery {
        if (!this.isOpen(overlayId)) return parent;

        this.resize_text(parent, overlayId, options);

        this.resize_icon(parent, overlayId, options);

        this.resize_image(parent, overlayId, options);

        this.resize_progress(parent, overlayId, options);

        parent.trigger('overlay.resize');

        return parent;
    }

    /**
     * Performs a resize if the property is set to autoreset for that object
     *
     * @param parent
     * @param overlayId
     * @param options
     * @protected
     */
    private static auto_resize (
        parent: JQuery,
        overlayId: string,
        options: Partial<Types.OverlayOptions> = {}
    ): JQuery {
        if (!this.isOpen(overlayId)) return parent;

        if (options.text?.autoResize) {
            this.resize_text(parent, overlayId, options);
        }

        if (options.icon?.autoResize) {
            this.resize_icon(parent, overlayId, options);
        }

        if (options.image?.autoResize) {
            this.resize_image(parent, overlayId, options);
        }

        if (options.progress?.autoResize) {
            this.resize_progress(parent, overlayId, options);
        }

        parent.trigger('overlay.resize');

        return parent;
    }

    /**
     * Updates the text in the overlay
     *
     * @param parent
     * @param overlayId
     * @param options
     * @protected
     */
    private static text (
        parent: JQuery,
        overlayId: string,
        options: Partial<Types.OverlayOptions> = {}
    ): JQuery {
        if (!this.isOpen(overlayId)) return parent;

        const overlay = $(`#${overlayId}`, parent);

        const text = $(`#${overlayId}-container-text`, overlay);

        if (!options.text) return parent;

        const order = this.adjust_order(1, options.text.order);

        text.removeClass('order-0 order-1 order-2 order-3 order-4 order-5')
            .addClass(`order-${order}`);

        if (options.text.color) text.css('color', options.text.color);
        if (options.text.className) text.addClass(options.text.className);

        if (typeof options.text.message === 'undefined' || options.text.message.length === 0) {
            text.hide().empty();
        } else {
            if (typeof options.text.message === 'string') {
                text.text(options.text.message).show();
            } else {
                text.empty().append(options.text.message).show();
            }

            parent.trigger('overlay.text', options.text.message);
        }

        return parent;
    }

    /**
     * Updates the image in the overlay
     *
     * @param parent
     * @param overlayId
     * @param options
     * @private
     */
    private static image (
        parent: JQuery,
        overlayId: string,
        options: Partial<Types.OverlayOptions> = {}
    ): JQuery {
        if (!this.isOpen(overlayId)) return parent;

        const overlay = $(`#${overlayId}`, parent);

        const image = $(`#${overlayId}-container-image`, overlay);

        if (!options.image) return parent;

        const order = this.adjust_order(3, options.image.order);

        image.removeClass('order-0 order-1 order-2 order-3 order-4 order-5')
            .addClass(`order-${order}`);

        if (options.image.hide) {
            image.hide();

            parent.trigger('overlay.image', options.image);
        } else {
            if (options.image.source) {
                const img = options.image.source.startsWith('<svg')
                    ? $(options.image.source)
                    : $(`<img src="${options.image.source}" alt="Overlay Icon Image">`);

                img.attr('id', `${overlayId}-container-image-element`);

                if (options.image.width) img.css('width', options.image.width);
                if (options.image.height) img.css('height', options.image.height);
                if (options.image.rotation && options.image.rotation !== 'none') {
                    img.addClass(`fa-${options.image.rotation}`);
                }
                if (options.image.animation && options.image.animation !== 'none') {
                    if (options.image.animation === 'spin-reverse') {
                        img.addClass('fa-spin fa-spin-reverse');
                    } else {
                        img.addClass(`fa-${options.image.animation}`);
                    }
                }

                image.empty().append(img).show();

                parent.trigger('overlay.image', options.icon);
            }
        }

        return parent;
    }

    /**
     * Updates the icon in the overlay
     *
     * @param parent
     * @param overlayId
     * @param options
     * @protected
     */
    private static icon (
        parent: JQuery,
        overlayId: string,
        options: Partial<Types.OverlayOptions> = {}
    ): JQuery {
        if (!this.isOpen(overlayId)) return parent;

        const overlay = $(`#${overlayId}`, parent);

        const icon = $(`#${overlayId}-container-icon`, overlay);

        if (!options.icon) return parent;

        const order = this.adjust_order(2, options.icon.order);

        icon.removeClass('order-0 order-1 order-2 order-3 order-4 order-5')
            .addClass(`order-${order}`);

        if (options.icon.hide) {
            icon.hide();

            parent.trigger('overlay.icon', options.icon);
        } else {
            if (options.icon.name) {
                icon.empty()
                    .append($(createIcon(options.icon.name,
                        {
                            ...options.icon,
                            attributes: { ...options.icon.attributes || {}, id: `${overlayId}-container-icon-element` }
                        }))
                    )
                    .show();

                parent.trigger('overlay.icon', options.icon);
            }
        }

        return parent;
    }

    /**
     * Adjusts the order to fit within the bootstrap range of pre-defined orders
     *
     * @param default_value
     * @param order
     * @private
     */
    private static adjust_order (default_value: number, order?: number): number {
        if (!order) return default_value;
        if (order < 0) return 0;
        if (order > 5) return 5;
        return order;
    }

    /**
     * Merges "new" options with cached options and updates the cache
     *
     * @param parent_path
     * @param overlayId
     * @param new_options
     * @private
     */
    private static merge_options (
        parent_path: string,
        overlayId: string,
        new_options: Partial<Types.OverlayOptions>
    ): Partial<Types.OverlayOptions> {
        const { options: _options } = this.instances.get(parent_path) || { options: new_options };

        const options = Types.mergeOptions(new_options, _options);

        this.instances.set(parent_path, { overlayId, options });

        return options;
    }

    /**
     * Gets, or sets if undefined, the element's Id attribute
     *
     * @param element
     * @private
     */
    private static get_or_set_element_id<T extends HTMLElement = HTMLElement> (
        element: JQuery<T>
    ): string {
        const id = element.attr('id') || nanoid();

        element.attr('id', id);

        return id;
    }
}

export { Overlay };
