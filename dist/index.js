(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.Carousel = factory());
}(this, (function () { 'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var siema_min = createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t();}("undefined"!=typeof self?self:commonjsGlobal,function(){return function(e){function t(r){if(i[r])return i[r].exports;var n=i[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,t),n.l=!0,n.exports}var i={};return t.m=e,t.c=i,t.d=function(e,i,r){t.o(e,i)||Object.defineProperty(e,i,{configurable:!1,enumerable:!0,get:r});},t.n=function(e){var i=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(i,"a",i),i},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,i){function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},s=function(){function e(e,t){for(var i=0;i<t.length;i++){var r=t[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}return function(t,i,r){return i&&e(t.prototype,i),r&&e(t,r),t}}(),l=function(){function e(t){var i=this;if(r(this,e),this.config=e.mergeSettings(t),this.selector="string"==typeof this.config.selector?document.querySelector(this.config.selector):this.config.selector,null===this.selector)throw new Error("Something wrong with your selector 😭");this.resolveSlidesNumber(),this.selectorWidth=this.selector.offsetWidth,this.innerElements=[].slice.call(this.selector.children),this.currentSlide=this.config.loop?this.config.startIndex%this.innerElements.length:Math.max(0,Math.min(this.config.startIndex,this.innerElements.length-this.perPage)),this.transformProperty=e.webkitOrNot(),["resizeHandler","touchstartHandler","touchendHandler","touchmoveHandler","mousedownHandler","mouseupHandler","mouseleaveHandler","mousemoveHandler","clickHandler"].forEach(function(e){i[e]=i[e].bind(i);}),this.init();}return s(e,[{key:"attachEvents",value:function(){window.addEventListener("resize",this.resizeHandler),this.config.draggable&&(this.pointerDown=!1,this.drag={startX:0,endX:0,startY:0,letItGo:null,preventClick:!1},this.selector.addEventListener("touchstart",this.touchstartHandler),this.selector.addEventListener("touchend",this.touchendHandler),this.selector.addEventListener("touchmove",this.touchmoveHandler),this.selector.addEventListener("mousedown",this.mousedownHandler),this.selector.addEventListener("mouseup",this.mouseupHandler),this.selector.addEventListener("mouseleave",this.mouseleaveHandler),this.selector.addEventListener("mousemove",this.mousemoveHandler),this.selector.addEventListener("click",this.clickHandler));}},{key:"detachEvents",value:function(){window.removeEventListener("resize",this.resizeHandler),this.selector.removeEventListener("touchstart",this.touchstartHandler),this.selector.removeEventListener("touchend",this.touchendHandler),this.selector.removeEventListener("touchmove",this.touchmoveHandler),this.selector.removeEventListener("mousedown",this.mousedownHandler),this.selector.removeEventListener("mouseup",this.mouseupHandler),this.selector.removeEventListener("mouseleave",this.mouseleaveHandler),this.selector.removeEventListener("mousemove",this.mousemoveHandler),this.selector.removeEventListener("click",this.clickHandler);}},{key:"init",value:function(){this.attachEvents(),this.selector.style.overflow="hidden",this.selector.style.direction=this.config.rtl?"rtl":"ltr",this.buildSliderFrame(),this.config.onInit.call(this);}},{key:"buildSliderFrame",value:function(){var e=this.selectorWidth/this.perPage,t=this.config.loop?this.innerElements.length+2*this.perPage:this.innerElements.length;this.sliderFrame=document.createElement("div"),this.sliderFrame.style.width=e*t+"px",this.enableTransition(),this.config.draggable&&(this.selector.style.cursor="-webkit-grab");var i=document.createDocumentFragment();if(this.config.loop)for(var r=this.innerElements.length-this.perPage;r<this.innerElements.length;r++){var n=this.buildSliderFrameItem(this.innerElements[r].cloneNode(!0));i.appendChild(n);}for(var s=0;s<this.innerElements.length;s++){var l=this.buildSliderFrameItem(this.innerElements[s]);i.appendChild(l);}if(this.config.loop)for(var o=0;o<this.perPage;o++){var a=this.buildSliderFrameItem(this.innerElements[o].cloneNode(!0));i.appendChild(a);}this.sliderFrame.appendChild(i),this.selector.innerHTML="",this.selector.appendChild(this.sliderFrame),this.slideToCurrent();}},{key:"buildSliderFrameItem",value:function(e){var t=document.createElement("div");return t.style.cssFloat=this.config.rtl?"right":"left",t.style.float=this.config.rtl?"right":"left",t.style.width=(this.config.loop?100/(this.innerElements.length+2*this.perPage):100/this.innerElements.length)+"%",t.appendChild(e),t}},{key:"resolveSlidesNumber",value:function(){if("number"==typeof this.config.perPage)this.perPage=this.config.perPage;else if("object"===n(this.config.perPage)){this.perPage=1;for(var e in this.config.perPage)window.innerWidth>=e&&(this.perPage=this.config.perPage[e]);}}},{key:"prev",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,t=arguments[1];if(!(this.innerElements.length<=this.perPage)){var i=this.currentSlide;if(this.config.loop){if(this.currentSlide-e<0){this.disableTransition();var r=this.currentSlide+this.innerElements.length,n=this.perPage,s=r+n,l=(this.config.rtl?1:-1)*s*(this.selectorWidth/this.perPage),o=this.config.draggable?this.drag.endX-this.drag.startX:0;this.sliderFrame.style[this.transformProperty]="translate3d("+(l+o)+"px, 0, 0)",this.currentSlide=r-e;}else this.currentSlide=this.currentSlide-e;}else this.currentSlide=Math.max(this.currentSlide-e,0);i!==this.currentSlide&&(this.slideToCurrent(this.config.loop),this.config.onChange.call(this),t&&t.call(this));}}},{key:"next",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,t=arguments[1];if(!(this.innerElements.length<=this.perPage)){var i=this.currentSlide;if(this.config.loop){if(this.currentSlide+e>this.innerElements.length-this.perPage){this.disableTransition();var r=this.currentSlide-this.innerElements.length,n=this.perPage,s=r+n,l=(this.config.rtl?1:-1)*s*(this.selectorWidth/this.perPage),o=this.config.draggable?this.drag.endX-this.drag.startX:0;this.sliderFrame.style[this.transformProperty]="translate3d("+(l+o)+"px, 0, 0)",this.currentSlide=r+e;}else this.currentSlide=this.currentSlide+e;}else this.currentSlide=Math.min(this.currentSlide+e,this.innerElements.length-this.perPage);i!==this.currentSlide&&(this.slideToCurrent(this.config.loop),this.config.onChange.call(this),t&&t.call(this));}}},{key:"disableTransition",value:function(){this.sliderFrame.style.webkitTransition="all 0ms "+this.config.easing,this.sliderFrame.style.transition="all 0ms "+this.config.easing;}},{key:"enableTransition",value:function(){this.sliderFrame.style.webkitTransition="all "+this.config.duration+"ms "+this.config.easing,this.sliderFrame.style.transition="all "+this.config.duration+"ms "+this.config.easing;}},{key:"goTo",value:function(e,t){if(!(this.innerElements.length<=this.perPage)){var i=this.currentSlide;this.currentSlide=this.config.loop?e%this.innerElements.length:Math.min(Math.max(e,0),this.innerElements.length-this.perPage),i!==this.currentSlide&&(this.slideToCurrent(),this.config.onChange.call(this),t&&t.call(this));}}},{key:"slideToCurrent",value:function(e){var t=this,i=this.config.loop?this.currentSlide+this.perPage:this.currentSlide,r=(this.config.rtl?1:-1)*i*(this.selectorWidth/this.perPage);e?requestAnimationFrame(function(){requestAnimationFrame(function(){t.enableTransition(),t.sliderFrame.style[t.transformProperty]="translate3d("+r+"px, 0, 0)";});}):this.sliderFrame.style[this.transformProperty]="translate3d("+r+"px, 0, 0)";}},{key:"updateAfterDrag",value:function(){var e=(this.config.rtl?-1:1)*(this.drag.endX-this.drag.startX),t=Math.abs(e),i=this.config.multipleDrag?Math.ceil(t/(this.selectorWidth/this.perPage)):1,r=e>0&&this.currentSlide-i<0,n=e<0&&this.currentSlide+i>this.innerElements.length-this.perPage;e>0&&t>this.config.threshold&&this.innerElements.length>this.perPage?this.prev(i):e<0&&t>this.config.threshold&&this.innerElements.length>this.perPage&&this.next(i),this.slideToCurrent(r||n);}},{key:"resizeHandler",value:function(){this.resolveSlidesNumber(),this.currentSlide+this.perPage>this.innerElements.length&&(this.currentSlide=this.innerElements.length<=this.perPage?0:this.innerElements.length-this.perPage),this.selectorWidth=this.selector.offsetWidth,this.buildSliderFrame();}},{key:"clearDrag",value:function(){this.drag={startX:0,endX:0,startY:0,letItGo:null,preventClick:this.drag.preventClick};}},{key:"touchstartHandler",value:function(e){-1!==["TEXTAREA","OPTION","INPUT","SELECT"].indexOf(e.target.nodeName)||(e.stopPropagation(),this.pointerDown=!0,this.drag.startX=e.touches[0].pageX,this.drag.startY=e.touches[0].pageY);}},{key:"touchendHandler",value:function(e){e.stopPropagation(),this.pointerDown=!1,this.enableTransition(),this.drag.endX&&this.updateAfterDrag(),this.clearDrag();}},{key:"touchmoveHandler",value:function(e){if(e.stopPropagation(),null===this.drag.letItGo&&(this.drag.letItGo=Math.abs(this.drag.startY-e.touches[0].pageY)<Math.abs(this.drag.startX-e.touches[0].pageX)),this.pointerDown&&this.drag.letItGo){e.preventDefault(),this.drag.endX=e.touches[0].pageX,this.sliderFrame.style.webkitTransition="all 0ms "+this.config.easing,this.sliderFrame.style.transition="all 0ms "+this.config.easing;var t=this.config.loop?this.currentSlide+this.perPage:this.currentSlide,i=t*(this.selectorWidth/this.perPage),r=this.drag.endX-this.drag.startX,n=this.config.rtl?i+r:i-r;this.sliderFrame.style[this.transformProperty]="translate3d("+(this.config.rtl?1:-1)*n+"px, 0, 0)";}}},{key:"mousedownHandler",value:function(e){-1!==["TEXTAREA","OPTION","INPUT","SELECT"].indexOf(e.target.nodeName)||(e.preventDefault(),e.stopPropagation(),this.pointerDown=!0,this.drag.startX=e.pageX);}},{key:"mouseupHandler",value:function(e){e.stopPropagation(),this.pointerDown=!1,this.selector.style.cursor="-webkit-grab",this.enableTransition(),this.drag.endX&&this.updateAfterDrag(),this.clearDrag();}},{key:"mousemoveHandler",value:function(e){if(e.preventDefault(),this.pointerDown){"A"===e.target.nodeName&&(this.drag.preventClick=!0),this.drag.endX=e.pageX,this.selector.style.cursor="-webkit-grabbing",this.sliderFrame.style.webkitTransition="all 0ms "+this.config.easing,this.sliderFrame.style.transition="all 0ms "+this.config.easing;var t=this.config.loop?this.currentSlide+this.perPage:this.currentSlide,i=t*(this.selectorWidth/this.perPage),r=this.drag.endX-this.drag.startX,n=this.config.rtl?i+r:i-r;this.sliderFrame.style[this.transformProperty]="translate3d("+(this.config.rtl?1:-1)*n+"px, 0, 0)";}}},{key:"mouseleaveHandler",value:function(e){this.pointerDown&&(this.pointerDown=!1,this.selector.style.cursor="-webkit-grab",this.drag.endX=e.pageX,this.drag.preventClick=!1,this.enableTransition(),this.updateAfterDrag(),this.clearDrag());}},{key:"clickHandler",value:function(e){this.drag.preventClick&&e.preventDefault(),this.drag.preventClick=!1;}},{key:"remove",value:function(e,t){if(e<0||e>=this.innerElements.length)throw new Error("Item to remove doesn't exist 😭");var i=e<this.currentSlide,r=this.currentSlide+this.perPage-1===e;(i||r)&&this.currentSlide--,this.innerElements.splice(e,1),this.buildSliderFrame(),t&&t.call(this);}},{key:"insert",value:function(e,t,i){if(t<0||t>this.innerElements.length+1)throw new Error("Unable to inset it at this index 😭");if(-1!==this.innerElements.indexOf(e))throw new Error("The same item in a carousel? Really? Nope 😭");var r=t<=this.currentSlide>0&&this.innerElements.length;this.currentSlide=r?this.currentSlide+1:this.currentSlide,this.innerElements.splice(t,0,e),this.buildSliderFrame(),i&&i.call(this);}},{key:"prepend",value:function(e,t){this.insert(e,0),t&&t.call(this);}},{key:"append",value:function(e,t){this.insert(e,this.innerElements.length+1),t&&t.call(this);}},{key:"destroy",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=arguments[1];if(this.detachEvents(),this.selector.style.cursor="auto",e){for(var i=document.createDocumentFragment(),r=0;r<this.innerElements.length;r++)i.appendChild(this.innerElements[r]);this.selector.innerHTML="",this.selector.appendChild(i),this.selector.removeAttribute("style");}t&&t.call(this);}}],[{key:"mergeSettings",value:function(e){var t={selector:".siema",duration:200,easing:"ease-out",perPage:1,startIndex:0,draggable:!0,multipleDrag:!0,threshold:20,loop:!1,rtl:!1,onInit:function(){},onChange:function(){}},i=e;for(var r in i)t[r]=i[r];return t}},{key:"webkitOrNot",value:function(){return "string"==typeof document.documentElement.style.transform?"transform":"WebkitTransform"}}]),e}();t.default=l,e.exports=t.default;}])});
    });

    var Siema = unwrapExports(siema_min);
    var siema_min_1 = siema_min.Siema;

    /* src/Carousel.svelte generated by Svelte v3.18.2 */

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-1ppqxio-style";
    	style.textContent = ".carousel.svelte-1ppqxio.svelte-1ppqxio{position:relative;width:100%;justify-content:center;align-items:center}button.svelte-1ppqxio.svelte-1ppqxio{position:absolute;width:40px;height:40px;top:50%;z-index:50;margin-top:-20px;border:none;background-color:transparent}button.svelte-1ppqxio.svelte-1ppqxio:focus{outline:none}.left.svelte-1ppqxio.svelte-1ppqxio{left:2vw}.right.svelte-1ppqxio.svelte-1ppqxio{right:2vw}ul.svelte-1ppqxio.svelte-1ppqxio{list-style-type:none;position:absolute;display:flex;justify-content:center;width:100%;margin-top:-30px;padding:0}ul.svelte-1ppqxio li.svelte-1ppqxio{margin:6px;border-radius:100%;background-color:rgba(255,255,255,0.5);height:8px;width:8px}ul.svelte-1ppqxio li.svelte-1ppqxio:hover{background-color:rgba(255,255,255,0.85)}ul.svelte-1ppqxio li.active.svelte-1ppqxio{background-color:rgba(255,255,255,1)}";
    	append(document.head, style);
    }

    const get_right_control_slot_changes = dirty => ({});
    const get_right_control_slot_context = ctx => ({});

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[26] = i;
    	return child_ctx;
    }

    const get_left_control_slot_changes = dirty => ({});
    const get_left_control_slot_context = ctx => ({});

    // (10:2) {#each pips as pip, i}
    function create_each_block(ctx) {
    	let li;
    	let li_class_value;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[23](/*i*/ ctx[26], ...args);
    	}

    	return {
    		c() {
    			li = element("li");

    			attr(li, "class", li_class_value = "" + (null_to_empty(/*currentIndex*/ ctx[0] === /*i*/ ctx[26]
    			? "active"
    			: "") + " svelte-1ppqxio"));
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			dispose = listen(li, "click", click_handler);
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*currentIndex*/ 1 && li_class_value !== (li_class_value = "" + (null_to_empty(/*currentIndex*/ ctx[0] === /*i*/ ctx[26]
    			? "active"
    			: "") + " svelte-1ppqxio"))) {
    				attr(li, "class", li_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	let div1;
    	let button0;
    	let t0;
    	let div0;
    	let t1;
    	let ul;
    	let t2;
    	let button1;
    	let current;
    	let dispose;
    	const left_control_slot_template = /*$$slots*/ ctx[21]["left-control"];
    	const left_control_slot = create_slot(left_control_slot_template, ctx, /*$$scope*/ ctx[20], get_left_control_slot_context);
    	const default_slot_template = /*$$slots*/ ctx[21].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[20], null);
    	let each_value = /*pips*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const right_control_slot_template = /*$$slots*/ ctx[21]["right-control"];
    	const right_control_slot = create_slot(right_control_slot_template, ctx, /*$$scope*/ ctx[20], get_right_control_slot_context);

    	return {
    		c() {
    			div1 = element("div");
    			button0 = element("button");
    			if (left_control_slot) left_control_slot.c();
    			t0 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			button1 = element("button");
    			if (right_control_slot) right_control_slot.c();
    			attr(button0, "class", "left svelte-1ppqxio");
    			attr(div0, "class", "slides");
    			attr(ul, "class", "svelte-1ppqxio");
    			attr(button1, "class", "right svelte-1ppqxio");
    			attr(div1, "class", "carousel svelte-1ppqxio");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, button0);

    			if (left_control_slot) {
    				left_control_slot.m(button0, null);
    			}

    			append(div1, t0);
    			append(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[22](div0);
    			append(div1, t1);
    			append(div1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append(div1, t2);
    			append(div1, button1);

    			if (right_control_slot) {
    				right_control_slot.m(button1, null);
    			}

    			current = true;

    			dispose = [
    				listen(button0, "click", /*left*/ ctx[3]),
    				listen(button1, "click", /*right*/ ctx[4])
    			];
    		},
    		p(ctx, [dirty]) {
    			if (left_control_slot && left_control_slot.p && dirty & /*$$scope*/ 1048576) {
    				left_control_slot.p(get_slot_context(left_control_slot_template, ctx, /*$$scope*/ ctx[20], get_left_control_slot_context), get_slot_changes(left_control_slot_template, /*$$scope*/ ctx[20], dirty, get_left_control_slot_changes));
    			}

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 1048576) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[20], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[20], dirty, null));
    			}

    			if (dirty & /*currentIndex, go, pips*/ 37) {
    				each_value = /*pips*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (right_control_slot && right_control_slot.p && dirty & /*$$scope*/ 1048576) {
    				right_control_slot.p(get_slot_context(right_control_slot_template, ctx, /*$$scope*/ ctx[20], get_right_control_slot_context), get_slot_changes(right_control_slot_template, /*$$scope*/ ctx[20], dirty, get_right_control_slot_changes));
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(left_control_slot, local);
    			transition_in(default_slot, local);
    			transition_in(right_control_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(left_control_slot, local);
    			transition_out(default_slot, local);
    			transition_out(right_control_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (left_control_slot) left_control_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[22](null);
    			destroy_each(each_blocks, detaching);
    			if (right_control_slot) right_control_slot.d(detaching);
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { perPage = 3 } = $$props;
    	let { loop = true } = $$props;
    	let { autoplay = 0 } = $$props;
    	let { duration = 200 } = $$props;
    	let { easing = "ease-out" } = $$props;
    	let { startIndex = 0 } = $$props;
    	let { draggable = true } = $$props;
    	let { multipleDrag = true } = $$props;
    	let { threshold = 20 } = $$props;
    	let { rtl = false } = $$props;
    	let currentIndex = startIndex;
    	let siema;
    	let controller;
    	let timer;
    	const dispatch = createEventDispatcher();

    	onMount(() => {
    		$$invalidate(16, controller = new Siema({
    				selector: siema,
    				perPage,
    				loop,
    				duration,
    				easing,
    				startIndex,
    				draggable,
    				multipleDrag,
    				threshold,
    				rtl,
    				onChange: handleChange
    			}));

    		autoplay && setInterval(right, autoplay);

    		return () => {
    			autoplay && clearTimeout(timer);
    			controller.destroy();
    		};
    	});

    	function left() {
    		controller.prev();
    	}

    	function right() {
    		controller.next();
    	}

    	function go(index) {
    		controller.goTo(index);
    	}

    	function handleChange(event) {
    		$$invalidate(0, currentIndex = controller.currentSlide);

    		dispatch("change", {
    			currentSlide: controller.currentSlide,
    			slideCount: controller.innerElements.length
    		});
    	}

    	let { $$slots = {}, $$scope } = $$props;

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, siema = $$value);
    		});
    	}

    	const click_handler = i => go(i);

    	$$self.$set = $$props => {
    		if ("perPage" in $$props) $$invalidate(6, perPage = $$props.perPage);
    		if ("loop" in $$props) $$invalidate(7, loop = $$props.loop);
    		if ("autoplay" in $$props) $$invalidate(8, autoplay = $$props.autoplay);
    		if ("duration" in $$props) $$invalidate(9, duration = $$props.duration);
    		if ("easing" in $$props) $$invalidate(10, easing = $$props.easing);
    		if ("startIndex" in $$props) $$invalidate(11, startIndex = $$props.startIndex);
    		if ("draggable" in $$props) $$invalidate(12, draggable = $$props.draggable);
    		if ("multipleDrag" in $$props) $$invalidate(13, multipleDrag = $$props.multipleDrag);
    		if ("threshold" in $$props) $$invalidate(14, threshold = $$props.threshold);
    		if ("rtl" in $$props) $$invalidate(15, rtl = $$props.rtl);
    		if ("$$scope" in $$props) $$invalidate(20, $$scope = $$props.$$scope);
    	};

    	let pips;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*controller*/ 65536) {
    			 $$invalidate(2, pips = controller ? controller.innerElements : []);
    		}
    	};

    	return [
    		currentIndex,
    		siema,
    		pips,
    		left,
    		right,
    		go,
    		perPage,
    		loop,
    		autoplay,
    		duration,
    		easing,
    		startIndex,
    		draggable,
    		multipleDrag,
    		threshold,
    		rtl,
    		controller,
    		timer,
    		dispatch,
    		handleChange,
    		$$scope,
    		$$slots,
    		div0_binding,
    		click_handler
    	];
    }

    class Carousel extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-1ppqxio-style")) add_css();

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			perPage: 6,
    			loop: 7,
    			autoplay: 8,
    			duration: 9,
    			easing: 10,
    			startIndex: 11,
    			draggable: 12,
    			multipleDrag: 13,
    			threshold: 14,
    			rtl: 15
    		});
    	}
    }

    return Carousel;

})));
