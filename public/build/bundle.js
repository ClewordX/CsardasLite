
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function _mergeNamespaces(n, m) {
        m.forEach(function (e) {
            e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
                if (k !== 'default' && !(k in n)) {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        });
        return Object.freeze(n);
    }

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
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
    function empty() {
        return text('');
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
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
    function tick() {
        schedule_update();
        return resolved_promise;
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
            set_current_component(null);
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse$1(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.44.1 */

    const { Error: Error_1, Object: Object_1, console: console_1$4 } = globals;

    // (251:0) {:else}
    function create_else_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block$b(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$b, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse$1(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse: parse$1,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function accessible(initValue) {
        let ref = initValue;
        const { subscribe, set, update } = writable(ref);
        return {
            subscribe,
            set: (newValue) => {
                ref = newValue;
                set(newValue);
            },
            update: (updater) => {
                ref = updater(ref);
                update(updater);
            },
            getValue: () => {
                return ref;
            }
        };
    }

    var SystemCurrentStatus;
    (function (SystemCurrentStatus) {
        SystemCurrentStatus[SystemCurrentStatus["NONE"] = 0] = "NONE";
        SystemCurrentStatus[SystemCurrentStatus["WAITING"] = 1] = "WAITING";
        SystemCurrentStatus[SystemCurrentStatus["ERROR"] = 2] = "ERROR";
    })(SystemCurrentStatus || (SystemCurrentStatus = {}));
    function _SystemStateStore() {
        let store = {
            currentStatus: accessible(SystemCurrentStatus.NONE),
            currentDocumentTitle: accessible(''),
            currentDocumentDescription: accessible(''),
            reset: () => {
                store.currentStatus.set(SystemCurrentStatus.NONE);
                store.currentDocumentTitle.set('');
                store.currentDocumentDescription.set('');
            },
            ready: () => {
                store.currentStatus.set(SystemCurrentStatus.NONE);
            },
            notReady: () => {
                store.currentStatus.set(SystemCurrentStatus.WAITING);
            },
        };
        return store;
    }
    var SystemStateStore = _SystemStateStore();

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var Seven = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Prelude = exports.SevenMachineInstrType = exports.SevenMachine = exports.SevenExpr = exports.SevenReactiveVariable = void 0;
    var SevenReactiveVariable = /** @class */ (function () {
        function SevenReactiveVariable(initValue) {
            this._currentValue = initValue;
            this._subscribers = [];
        }
        Object.defineProperty(SevenReactiveVariable.prototype, "value", {
            get: function () { return this._currentValue; },
            set: function (newValue) { this._currentValue = newValue; },
            enumerable: false,
            configurable: true
        });
        SevenReactiveVariable.prototype.subscribe = function (subscriber) {
            var _this = this;
            return {
                unsubscribe: function () {
                    var index = _this._subscribers.indexOf(subscriber);
                    if (index !== -1) {
                        _this._subscribers.splice(index, 1);
                    }
                }
            };
        };
        return SevenReactiveVariable;
    }());
    exports.SevenReactiveVariable = SevenReactiveVariable;
    var SevenExpr = /** @class */ (function () {
        function SevenExpr(_, args) {
            this._ = _;
            this.args = args;
        }
        return SevenExpr;
    }());
    exports.SevenExpr = SevenExpr;
    var SevenMachine = /** @class */ (function () {
        function SevenMachine(initProgram, options) {
            var _this = this;
            this._componentDict = {};
            this._componentListCache = [];
            this._componentListDirtyFlag = false;
            this._externFunctionMap = {};
            this._variableMap = {};
            this._position = 0;
            this._machineContinuationStack = [];
            // NOTE: store the position one plus *after* the CALL instr.
            this._callStack = [];
            this._trace = [];
            this._lockVar = new SevenReactiveVariable(false);
            this._stepRequested = false;
            this._program = initProgram || [];
            this._options = options;
            [Prelude.BasicMath, Prelude.BasicBitwise, Prelude.BasicConditon, Prelude.BasicPrimitive].forEach(function (v) {
                v.forEach(function (v) { return _this.registerExternFunction(v); });
            });
        }
        SevenMachine.prototype.getComponentByName = function (name) {
            return this._componentDict[name];
        };
        Object.defineProperty(SevenMachine.prototype, "currentComponent", {
            get: function () {
                if (!this._componentListDirtyFlag) {
                    return this._componentListCache;
                }
                else {
                    var res = [];
                    for (var key in this._componentDict) {
                        if (Object.prototype.hasOwnProperty.call(this._componentDict, key)) {
                            var element = this._componentDict[key];
                            res.push(element);
                        }
                    }
                    this._componentListCache = res;
                    this._componentListDirtyFlag = false;
                    return res;
                }
            },
            enumerable: false,
            configurable: true
        });
        SevenMachine.prototype.registerComponent = function (component) {
            this._componentDict[component.name] = component;
            this._componentListDirtyFlag = true;
            return this;
        };
        SevenMachine.prototype.registerExternFunction = function (externFunction) {
            this._externFunctionMap[externFunction.name] = externFunction;
            return this;
        };
        SevenMachine.prototype.getVariableByName = function (name) {
            return this._variableMap[name];
        };
        Object.defineProperty(SevenMachine.prototype, "variableMap", {
            get: function () {
                return this._variableMap;
            },
            enumerable: false,
            configurable: true
        });
        SevenMachine.prototype.setVariableByName = function (name, value) {
            if (!this._variableMap[name]) {
                this._variableMap[name] = new SevenReactiveVariable(undefined);
            }
            this._variableMap[name].value = value;
        };
        Object.defineProperty(SevenMachine.prototype, "currentProgram", {
            get: function () {
                return this._program;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SevenMachine.prototype, "currentPosition", {
            get: function () {
                return this._position;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SevenMachine.prototype, "currentInstr", {
            get: function () {
                return this._program[this._position];
            },
            enumerable: false,
            configurable: true
        });
        SevenMachine.prototype.loadProgram = function (program) {
            this._program = program;
            this._position = 0;
        };
        SevenMachine.prototype.jsEval = function (source) {
            return eval("(function(Seven){return (" + source + ")})(\n            {   $:this.variableMap,\n            })");
        };
        SevenMachine.prototype.eval = function (source) {
            if (source instanceof SevenExpr) {
                return this._externFunctionMap[source._].call(this, source.args);
            }
            else {
                return source;
            }
        };
        Object.defineProperty(SevenMachine.prototype, "halted", {
            get: function () {
                return !!this._program[this._position];
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SevenMachine.prototype, "_lock", {
            get: function () { return !!this._lockVar.value; },
            enumerable: false,
            configurable: true
        });
        SevenMachine.prototype.lock = function () { this._lockVar.value = true; };
        SevenMachine.prototype.unlock = function () {
            this._lockVar.value = false;
            if (this._stepRequested) {
                this._stepRequested = false;
                this.step();
            }
        };
        Object.defineProperty(SevenMachine.prototype, "locked", {
            get: function () { return this._lock; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SevenMachine.prototype, "lockVar", {
            get: function () { return this._lockVar; },
            enumerable: false,
            configurable: true
        });
        SevenMachine.prototype.step = function (singleStep) {
            var _a;
            if (singleStep === void 0) { singleStep = false; }
            // NOTE: `+1` means the current program.
            fullStepProcess: while (this._machineContinuationStack.length + 1 > 0) {
                var instr = this.currentInstr;
                if (!instr) {
                    // NOTE: if no more continuation we should leave.
                    if (this._machineContinuationStack.length <= 0) {
                        break;
                    }
                    var continuation = this._machineContinuationStack.pop();
                    this._program = continuation.program;
                    this._position = continuation.position;
                    continue;
                }
                var keepStepping = true;
                do {
                    if (this._lock) {
                        this._stepRequested = true;
                        return;
                    }
                    switch (instr._) {
                        case SevenMachineInstrType.SET_VAR: {
                            this._variableMap[instr.name].value = (instr.eval ? this.jsEval : this.eval).bind(this)(instr.value);
                            this._position++;
                            break;
                        }
                        case SevenMachineInstrType.GOTO: {
                            this._position = instr.target;
                            break;
                        }
                        case SevenMachineInstrType.COND_GOTO: {
                            if ((instr.eval ? this.jsEval : this.eval).bind(this)(instr.condition)) {
                                this._position = instr.target;
                            }
                            else {
                                this._position++;
                            }
                            break;
                        }
                        case SevenMachineInstrType.CALL: {
                            this._callStack.push(this._position = instr.target);
                            break;
                        }
                        case SevenMachineInstrType.CALL_COMPONENT: {
                            var component = this.getComponentByName(instr.name);
                            if (!component) {
                                throw new Error("SevenMachine: no component named " + instr.name + " registered for this machine.");
                            }
                            keepStepping = !!component.call(instr.args, this);
                            this._position++;
                            break;
                        }
                        case SevenMachineInstrType.RETURN: {
                            if (this._callStack.length <= 0) {
                                throw new Error("SevenMachine: cannot return because there's no call.");
                            }
                            this._position = this._callStack.pop();
                            break;
                        }
                    }
                    if ((_a = this._options) === null || _a === void 0 ? void 0 : _a.traceEnabled) {
                        this._trace.push(instr);
                    }
                    if (!(instr = this.currentInstr)) {
                        break;
                    }
                    if (singleStep) {
                        break fullStepProcess;
                    }
                    if (!keepStepping) {
                        break fullStepProcess;
                    }
                } while (keepStepping);
            }
        };
        SevenMachine.prototype.run = function () {
            while (!this.halted) {
                this.step();
            }
        };
        SevenMachine.prototype.goto = function (n) {
            this._position = n;
            this.step();
        };
        // NOTE: we have to do some kind of "continuation stack" if we want to support
        // running sub-program (e.g. switching between different scenes.)
        SevenMachine.prototype._pushCurrentContinuation = function () {
            this._machineContinuationStack.push({ program: this._program, position: this._position });
        };
        SevenMachine.prototype.loadSubProgram = function (subProgram) {
            this._pushCurrentContinuation();
            this.loadProgram(subProgram);
        };
        SevenMachine.prototype.serialize = function () {
            var reactiveVariableMap = {};
            for (var k in this.variableMap) {
                if (Object.prototype.hasOwnProperty.call(this.variableMap, k)) {
                    var reactiveVariable = this.variableMap[k];
                    reactiveVariableMap[k] = reactiveVariable.value;
                }
            }
            return {
                variableMap: reactiveVariableMap,
                currentProgram: this._program,
                currentPosition: this._position,
                _machineContinuationStack: this._machineContinuationStack,
                _callStack: this._callStack,
                _trace: this._trace,
                _lock: this._lock,
                _stepRequested: this._stepRequested,
            };
        };
        /** NOTE: this will generate a brand new SevenMachine with no registered
         *  components; you have to manually add component after deserialization.
         */
        SevenMachine.deserialize = function (st) {
            var x = new SevenMachine();
            var reactiveVarMap = {};
            for (var k in st.variableMap) {
                if (Object.prototype.hasOwnProperty.call(st.variableMap, k)) {
                    var element = st.variableMap[k];
                    reactiveVarMap[k] = new SevenReactiveVariable(element);
                }
            }
            x._variableMap = st.variableMap;
            x._program = st.currentProgram;
            x._position = st.currentPosition;
            x._machineContinuationStack = st._machineContinuationStack;
            x._callStack = st._callStack;
            x._trace = st._trace;
            if (st._lock) {
                x.lock();
            }
            else {
                x.unlock();
            }
            x._stepRequested = st._stepRequested;
            return x;
        };
        return SevenMachine;
    }());
    exports.SevenMachine = SevenMachine;
    var SevenMachineInstrType;
    (function (SevenMachineInstrType) {
        SevenMachineInstrType[SevenMachineInstrType["SET_VAR"] = 2] = "SET_VAR";
        SevenMachineInstrType[SevenMachineInstrType["GOTO"] = 3] = "GOTO";
        SevenMachineInstrType[SevenMachineInstrType["COND_GOTO"] = 4] = "COND_GOTO";
        SevenMachineInstrType[SevenMachineInstrType["CALL"] = 5] = "CALL";
        SevenMachineInstrType[SevenMachineInstrType["RETURN"] = 6] = "RETURN";
        SevenMachineInstrType[SevenMachineInstrType["CALL_COMPONENT"] = 7] = "CALL_COMPONENT";
    })(SevenMachineInstrType = exports.SevenMachineInstrType || (exports.SevenMachineInstrType = {}));
    var Prelude;
    (function (Prelude) {
        Prelude.BasicMath = [
            { name: '+', call: function (m, args) { return args.map(function (v) { return m.eval(v); }).reduce(function (a, b) { return a + b; }); } },
            { name: '-', call: function (m, args) { return args.map(function (v) { return m.eval(v); }).reduce(function (a, b) { return a - b; }); } },
            { name: '*', call: function (m, args) { return args.map(function (v) { return m.eval(v); }).reduce(function (a, b) { return a * b; }); } },
            { name: '/', call: function (m, args) { return args.map(function (v) { return m.eval(v); }).reduce(function (a, b) { return a / b; }); } },
            { name: '%', call: function (m, args) { return args.map(function (v) { return m.eval(v); }).reduce(function (a, b) { return a % b; }); } },
            { name: 'ABS', call: function (m, args) { return Math.abs(args[0]); } },
        ];
        Prelude.BasicBitwise = [
            { name: '&', call: function (m, args) { return args.map(function (v) { return m.eval(v); }).reduce(function (a, b) { return a & b; }); } },
            { name: '|', call: function (m, args) { return args.map(function (v) { return m.eval(v); }).reduce(function (a, b) { return a | b; }); } },
            { name: '^', call: function (m, args) { return args.map(function (v) { return m.eval(v); }).reduce(function (a, b) { return a ^ b; }); } },
        ];
        Prelude.BasicConditon = [
            { name: '<', call: function (m, args) { return m.eval(args[0]) < m.eval(args[1]); } },
            { name: '>', call: function (m, args) { return m.eval(args[0]) > m.eval(args[1]); } },
            { name: '<=', call: function (m, args) { return m.eval(args[0]) <= m.eval(args[1]); } },
            { name: '>=', call: function (m, args) { return m.eval(args[0]) >= m.eval(args[1]); } },
            { name: '==', call: function (m, args) { return m.eval(args[0]) == m.eval(args[1]); } },
            { name: '!=', call: function (m, args) { return m.eval(args[0]) != m.eval(args[1]); } },
            { name: 'AND', call: function (m, args) { return args.map(function (v) { return m.eval(v); }).reduce(function (a, b) { return a && b; }); } },
            { name: 'OR', call: function (m, args) { return args.map(function (v) { return m.eval(v); }).reduce(function (a, b) { return a || b; }); } },
            { name: 'NOT', call: function (m, args) { return !m.eval(args[0]); } },
        ];
        Prelude.BasicPrimitive = [
            { name: 'VAR', call: function (m, args) { var _a; return (_a = m.getVariableByName(args[0])) === null || _a === void 0 ? void 0 : _a.value; } },
            { name: '.', call: function (m, args) {
                    var x = m.eval(args[0]);
                    for (var i = 1; i < args.length; i++) {
                        x = x[m.eval(args[i])];
                    }
                    return x;
                } }
        ];
    })(Prelude = exports.Prelude || (exports.Prelude = {}));
    });

    var CommonSevenComponentIndex;
    (function (CommonSevenComponentIndex) {
        CommonSevenComponentIndex["Wait"] = "WAIT";
        CommonSevenComponentIndex["Error"] = "ERROR";
        CommonSevenComponentIndex["SetTitle"] = "TITLE";
        CommonSevenComponentIndex["SetDescription"] = "DESCRIPTION";
        CommonSevenComponentIndex["SetMode"] = "MODE";
        CommonSevenComponentIndex["Reset"] = "RESET";
        CommonSevenComponentIndex["Listen"] = "LISTEN";
        CommonSevenComponentIndex["Pause"] = "PAUSE";
        CommonSevenComponentIndex["Load"] = "LOAD";
        CommonSevenComponentIndex["LoadFile"] = "LOAD_FILE";
    })(CommonSevenComponentIndex || (CommonSevenComponentIndex = {}));
    var SegueSevenComponentIndex;
    (function (SegueSevenComponentIndex) {
        SegueSevenComponentIndex["Set"] = "SEGUE_SET";
    })(SegueSevenComponentIndex || (SegueSevenComponentIndex = {}));
    var ConversationSevenComponentIndex;
    (function (ConversationSevenComponentIndex) {
        ConversationSevenComponentIndex["Header"] = "CONV_HEADER";
        ConversationSevenComponentIndex["Narrator"] = "CONV_NARRATOR";
        ConversationSevenComponentIndex["Branch"] = "CONV_BRANCH";
        ConversationSevenComponentIndex["Text"] = "CONV_TEXT";
        ConversationSevenComponentIndex["SetMode"] = "CONV_SET_MODE";
        ConversationSevenComponentIndex["SetAnchor"] = "CONV_SET_ANCHOR";
        ConversationSevenComponentIndex["SetBackground"] = "CONV_SET_BG";
        ConversationSevenComponentIndex["SetCharacter"] = "CONV_SET_CHAR";
        ConversationSevenComponentIndex["Clear"] = "CONV_CLEAR";
        ConversationSevenComponentIndex["SetHalfview"] = "CONV_SET_HALFVIEW";
        ConversationSevenComponentIndex["SendMessage"] = "CONV_SEND_MSG";
    })(ConversationSevenComponentIndex || (ConversationSevenComponentIndex = {}));
    var InfoSevenComponentIndex;
    (function (InfoSevenComponentIndex) {
        InfoSevenComponentIndex["LoadInfoPage"] = "INFO_LOAD";
        InfoSevenComponentIndex["SetCurrentPageIndex"] = "INFO_GOTO";
        InfoSevenComponentIndex["AppendInfoPage"] = "INFO_ADD";
        // ChangeInfoPage = 'INFO_CHANGE',
        InfoSevenComponentIndex["DeleteInfoPage"] = "INFO_DELETE";
        InfoSevenComponentIndex["PrevPage"] = "INFO_PREV";
        InfoSevenComponentIndex["NextPage"] = "INFO_NEXT";
    })(InfoSevenComponentIndex || (InfoSevenComponentIndex = {}));

    const SetTitleComponent = {
        name: CommonSevenComponentIndex.SetTitle,
        call: (args, m) => {
            SystemStateStore.currentDocumentTitle.set(args.title);
            return true;
        }
    };
    const SetDescriptionComponent = {
        name: CommonSevenComponentIndex.SetDescription,
        call: (args, m) => {
            SystemStateStore.currentDocumentTitle.set(args.description);
            return true;
        }
    };

    function _SystemErrorStore() {
        let store = accessible({});
        return {
            subscribe: store.subscribe.bind(store),
            getValue: store.getValue.bind(store),
            set: store.set.bind(store),
            reset: () => {
                store.set({});
            },
            error: (headerMessage, message) => {
                store.set({ headerMessage, message });
            }
        };
    }
    var SystemErrorStore = _SystemErrorStore();

    const ErrorComponent = {
        name: CommonSevenComponentIndex.Error,
        call: (args) => {
            SystemErrorStore.error(args.header, args.message);
            SystemStateStore.currentStatus.set(SystemCurrentStatus.ERROR);
        }
    };

    /*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT */
    function isNothing(subject) {
      return (typeof subject === 'undefined') || (subject === null);
    }


    function isObject(subject) {
      return (typeof subject === 'object') && (subject !== null);
    }


    function toArray(sequence) {
      if (Array.isArray(sequence)) return sequence;
      else if (isNothing(sequence)) return [];

      return [ sequence ];
    }


    function extend(target, source) {
      var index, length, key, sourceKeys;

      if (source) {
        sourceKeys = Object.keys(source);

        for (index = 0, length = sourceKeys.length; index < length; index += 1) {
          key = sourceKeys[index];
          target[key] = source[key];
        }
      }

      return target;
    }


    function repeat(string, count) {
      var result = '', cycle;

      for (cycle = 0; cycle < count; cycle += 1) {
        result += string;
      }

      return result;
    }


    function isNegativeZero(number) {
      return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
    }


    var isNothing_1      = isNothing;
    var isObject_1       = isObject;
    var toArray_1        = toArray;
    var repeat_1         = repeat;
    var isNegativeZero_1 = isNegativeZero;
    var extend_1         = extend;

    var common = {
    	isNothing: isNothing_1,
    	isObject: isObject_1,
    	toArray: toArray_1,
    	repeat: repeat_1,
    	isNegativeZero: isNegativeZero_1,
    	extend: extend_1
    };

    // YAML error class. http://stackoverflow.com/questions/8458984


    function formatError(exception, compact) {
      var where = '', message = exception.reason || '(unknown reason)';

      if (!exception.mark) return message;

      if (exception.mark.name) {
        where += 'in "' + exception.mark.name + '" ';
      }

      where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

      if (!compact && exception.mark.snippet) {
        where += '\n\n' + exception.mark.snippet;
      }

      return message + ' ' + where;
    }


    function YAMLException$1(reason, mark) {
      // Super constructor
      Error.call(this);

      this.name = 'YAMLException';
      this.reason = reason;
      this.mark = mark;
      this.message = formatError(this, false);

      // Include stack trace in error object
      if (Error.captureStackTrace) {
        // Chrome and NodeJS
        Error.captureStackTrace(this, this.constructor);
      } else {
        // FF, IE 10+ and Safari 6+. Fallback for others
        this.stack = (new Error()).stack || '';
      }
    }


    // Inherit from Error
    YAMLException$1.prototype = Object.create(Error.prototype);
    YAMLException$1.prototype.constructor = YAMLException$1;


    YAMLException$1.prototype.toString = function toString(compact) {
      return this.name + ': ' + formatError(this, compact);
    };


    var exception = YAMLException$1;

    // get snippet for a single line, respecting maxLength
    function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
      var head = '';
      var tail = '';
      var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

      if (position - lineStart > maxHalfLength) {
        head = ' ... ';
        lineStart = position - maxHalfLength + head.length;
      }

      if (lineEnd - position > maxHalfLength) {
        tail = ' ...';
        lineEnd = position + maxHalfLength - tail.length;
      }

      return {
        str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
        pos: position - lineStart + head.length // relative position
      };
    }


    function padStart(string, max) {
      return common.repeat(' ', max - string.length) + string;
    }


    function makeSnippet(mark, options) {
      options = Object.create(options || null);

      if (!mark.buffer) return null;

      if (!options.maxLength) options.maxLength = 79;
      if (typeof options.indent      !== 'number') options.indent      = 1;
      if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
      if (typeof options.linesAfter  !== 'number') options.linesAfter  = 2;

      var re = /\r?\n|\r|\0/g;
      var lineStarts = [ 0 ];
      var lineEnds = [];
      var match;
      var foundLineNo = -1;

      while ((match = re.exec(mark.buffer))) {
        lineEnds.push(match.index);
        lineStarts.push(match.index + match[0].length);

        if (mark.position <= match.index && foundLineNo < 0) {
          foundLineNo = lineStarts.length - 2;
        }
      }

      if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;

      var result = '', i, line;
      var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
      var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

      for (i = 1; i <= options.linesBefore; i++) {
        if (foundLineNo - i < 0) break;
        line = getLine(
          mark.buffer,
          lineStarts[foundLineNo - i],
          lineEnds[foundLineNo - i],
          mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
          maxLineLength
        );
        result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) +
          ' | ' + line.str + '\n' + result;
      }

      line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
      result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) +
        ' | ' + line.str + '\n';
      result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

      for (i = 1; i <= options.linesAfter; i++) {
        if (foundLineNo + i >= lineEnds.length) break;
        line = getLine(
          mark.buffer,
          lineStarts[foundLineNo + i],
          lineEnds[foundLineNo + i],
          mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
          maxLineLength
        );
        result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) +
          ' | ' + line.str + '\n';
      }

      return result.replace(/\n$/, '');
    }


    var snippet = makeSnippet;

    var TYPE_CONSTRUCTOR_OPTIONS = [
      'kind',
      'multi',
      'resolve',
      'construct',
      'instanceOf',
      'predicate',
      'represent',
      'representName',
      'defaultStyle',
      'styleAliases'
    ];

    var YAML_NODE_KINDS = [
      'scalar',
      'sequence',
      'mapping'
    ];

    function compileStyleAliases(map) {
      var result = {};

      if (map !== null) {
        Object.keys(map).forEach(function (style) {
          map[style].forEach(function (alias) {
            result[String(alias)] = style;
          });
        });
      }

      return result;
    }

    function Type$1(tag, options) {
      options = options || {};

      Object.keys(options).forEach(function (name) {
        if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
          throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
        }
      });

      // TODO: Add tag format check.
      this.options       = options; // keep original options in case user wants to extend this type later
      this.tag           = tag;
      this.kind          = options['kind']          || null;
      this.resolve       = options['resolve']       || function () { return true; };
      this.construct     = options['construct']     || function (data) { return data; };
      this.instanceOf    = options['instanceOf']    || null;
      this.predicate     = options['predicate']     || null;
      this.represent     = options['represent']     || null;
      this.representName = options['representName'] || null;
      this.defaultStyle  = options['defaultStyle']  || null;
      this.multi         = options['multi']         || false;
      this.styleAliases  = compileStyleAliases(options['styleAliases'] || null);

      if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
        throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
      }
    }

    var type = Type$1;

    /*eslint-disable max-len*/





    function compileList(schema, name) {
      var result = [];

      schema[name].forEach(function (currentType) {
        var newIndex = result.length;

        result.forEach(function (previousType, previousIndex) {
          if (previousType.tag === currentType.tag &&
              previousType.kind === currentType.kind &&
              previousType.multi === currentType.multi) {

            newIndex = previousIndex;
          }
        });

        result[newIndex] = currentType;
      });

      return result;
    }


    function compileMap(/* lists... */) {
      var result = {
            scalar: {},
            sequence: {},
            mapping: {},
            fallback: {},
            multi: {
              scalar: [],
              sequence: [],
              mapping: [],
              fallback: []
            }
          }, index, length;

      function collectType(type) {
        if (type.multi) {
          result.multi[type.kind].push(type);
          result.multi['fallback'].push(type);
        } else {
          result[type.kind][type.tag] = result['fallback'][type.tag] = type;
        }
      }

      for (index = 0, length = arguments.length; index < length; index += 1) {
        arguments[index].forEach(collectType);
      }
      return result;
    }


    function Schema$1(definition) {
      return this.extend(definition);
    }


    Schema$1.prototype.extend = function extend(definition) {
      var implicit = [];
      var explicit = [];

      if (definition instanceof type) {
        // Schema.extend(type)
        explicit.push(definition);

      } else if (Array.isArray(definition)) {
        // Schema.extend([ type1, type2, ... ])
        explicit = explicit.concat(definition);

      } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
        // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
        if (definition.implicit) implicit = implicit.concat(definition.implicit);
        if (definition.explicit) explicit = explicit.concat(definition.explicit);

      } else {
        throw new exception('Schema.extend argument should be a Type, [ Type ], ' +
          'or a schema definition ({ implicit: [...], explicit: [...] })');
      }

      implicit.forEach(function (type$1) {
        if (!(type$1 instanceof type)) {
          throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
        }

        if (type$1.loadKind && type$1.loadKind !== 'scalar') {
          throw new exception('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
        }

        if (type$1.multi) {
          throw new exception('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
        }
      });

      explicit.forEach(function (type$1) {
        if (!(type$1 instanceof type)) {
          throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
        }
      });

      var result = Object.create(Schema$1.prototype);

      result.implicit = (this.implicit || []).concat(implicit);
      result.explicit = (this.explicit || []).concat(explicit);

      result.compiledImplicit = compileList(result, 'implicit');
      result.compiledExplicit = compileList(result, 'explicit');
      result.compiledTypeMap  = compileMap(result.compiledImplicit, result.compiledExplicit);

      return result;
    };


    var schema = Schema$1;

    var str = new type('tag:yaml.org,2002:str', {
      kind: 'scalar',
      construct: function (data) { return data !== null ? data : ''; }
    });

    var seq = new type('tag:yaml.org,2002:seq', {
      kind: 'sequence',
      construct: function (data) { return data !== null ? data : []; }
    });

    var map = new type('tag:yaml.org,2002:map', {
      kind: 'mapping',
      construct: function (data) { return data !== null ? data : {}; }
    });

    var failsafe = new schema({
      explicit: [
        str,
        seq,
        map
      ]
    });

    function resolveYamlNull(data) {
      if (data === null) return true;

      var max = data.length;

      return (max === 1 && data === '~') ||
             (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
    }

    function constructYamlNull() {
      return null;
    }

    function isNull(object) {
      return object === null;
    }

    var _null = new type('tag:yaml.org,2002:null', {
      kind: 'scalar',
      resolve: resolveYamlNull,
      construct: constructYamlNull,
      predicate: isNull,
      represent: {
        canonical: function () { return '~';    },
        lowercase: function () { return 'null'; },
        uppercase: function () { return 'NULL'; },
        camelcase: function () { return 'Null'; },
        empty:     function () { return '';     }
      },
      defaultStyle: 'lowercase'
    });

    function resolveYamlBoolean(data) {
      if (data === null) return false;

      var max = data.length;

      return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
             (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
    }

    function constructYamlBoolean(data) {
      return data === 'true' ||
             data === 'True' ||
             data === 'TRUE';
    }

    function isBoolean(object) {
      return Object.prototype.toString.call(object) === '[object Boolean]';
    }

    var bool = new type('tag:yaml.org,2002:bool', {
      kind: 'scalar',
      resolve: resolveYamlBoolean,
      construct: constructYamlBoolean,
      predicate: isBoolean,
      represent: {
        lowercase: function (object) { return object ? 'true' : 'false'; },
        uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
        camelcase: function (object) { return object ? 'True' : 'False'; }
      },
      defaultStyle: 'lowercase'
    });

    function isHexCode(c) {
      return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
             ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
             ((0x61/* a */ <= c) && (c <= 0x66/* f */));
    }

    function isOctCode(c) {
      return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
    }

    function isDecCode(c) {
      return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
    }

    function resolveYamlInteger(data) {
      if (data === null) return false;

      var max = data.length,
          index = 0,
          hasDigits = false,
          ch;

      if (!max) return false;

      ch = data[index];

      // sign
      if (ch === '-' || ch === '+') {
        ch = data[++index];
      }

      if (ch === '0') {
        // 0
        if (index + 1 === max) return true;
        ch = data[++index];

        // base 2, base 8, base 16

        if (ch === 'b') {
          // base 2
          index++;

          for (; index < max; index++) {
            ch = data[index];
            if (ch === '_') continue;
            if (ch !== '0' && ch !== '1') return false;
            hasDigits = true;
          }
          return hasDigits && ch !== '_';
        }


        if (ch === 'x') {
          // base 16
          index++;

          for (; index < max; index++) {
            ch = data[index];
            if (ch === '_') continue;
            if (!isHexCode(data.charCodeAt(index))) return false;
            hasDigits = true;
          }
          return hasDigits && ch !== '_';
        }


        if (ch === 'o') {
          // base 8
          index++;

          for (; index < max; index++) {
            ch = data[index];
            if (ch === '_') continue;
            if (!isOctCode(data.charCodeAt(index))) return false;
            hasDigits = true;
          }
          return hasDigits && ch !== '_';
        }
      }

      // base 10 (except 0)

      // value should not start with `_`;
      if (ch === '_') return false;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isDecCode(data.charCodeAt(index))) {
          return false;
        }
        hasDigits = true;
      }

      // Should have digits and should not end with `_`
      if (!hasDigits || ch === '_') return false;

      return true;
    }

    function constructYamlInteger(data) {
      var value = data, sign = 1, ch;

      if (value.indexOf('_') !== -1) {
        value = value.replace(/_/g, '');
      }

      ch = value[0];

      if (ch === '-' || ch === '+') {
        if (ch === '-') sign = -1;
        value = value.slice(1);
        ch = value[0];
      }

      if (value === '0') return 0;

      if (ch === '0') {
        if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
        if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
        if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
      }

      return sign * parseInt(value, 10);
    }

    function isInteger(object) {
      return (Object.prototype.toString.call(object)) === '[object Number]' &&
             (object % 1 === 0 && !common.isNegativeZero(object));
    }

    var int = new type('tag:yaml.org,2002:int', {
      kind: 'scalar',
      resolve: resolveYamlInteger,
      construct: constructYamlInteger,
      predicate: isInteger,
      represent: {
        binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
        octal:       function (obj) { return obj >= 0 ? '0o'  + obj.toString(8) : '-0o'  + obj.toString(8).slice(1); },
        decimal:     function (obj) { return obj.toString(10); },
        /* eslint-disable max-len */
        hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
      },
      defaultStyle: 'decimal',
      styleAliases: {
        binary:      [ 2,  'bin' ],
        octal:       [ 8,  'oct' ],
        decimal:     [ 10, 'dec' ],
        hexadecimal: [ 16, 'hex' ]
      }
    });

    var YAML_FLOAT_PATTERN = new RegExp(
      // 2.5e4, 2.5 and integers
      '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
      // .2e4, .2
      // special case, seems not from spec
      '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
      // .inf
      '|[-+]?\\.(?:inf|Inf|INF)' +
      // .nan
      '|\\.(?:nan|NaN|NAN))$');

    function resolveYamlFloat(data) {
      if (data === null) return false;

      if (!YAML_FLOAT_PATTERN.test(data) ||
          // Quick hack to not allow integers end with `_`
          // Probably should update regexp & check speed
          data[data.length - 1] === '_') {
        return false;
      }

      return true;
    }

    function constructYamlFloat(data) {
      var value, sign;

      value  = data.replace(/_/g, '').toLowerCase();
      sign   = value[0] === '-' ? -1 : 1;

      if ('+-'.indexOf(value[0]) >= 0) {
        value = value.slice(1);
      }

      if (value === '.inf') {
        return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

      } else if (value === '.nan') {
        return NaN;
      }
      return sign * parseFloat(value, 10);
    }


    var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

    function representYamlFloat(object, style) {
      var res;

      if (isNaN(object)) {
        switch (style) {
          case 'lowercase': return '.nan';
          case 'uppercase': return '.NAN';
          case 'camelcase': return '.NaN';
        }
      } else if (Number.POSITIVE_INFINITY === object) {
        switch (style) {
          case 'lowercase': return '.inf';
          case 'uppercase': return '.INF';
          case 'camelcase': return '.Inf';
        }
      } else if (Number.NEGATIVE_INFINITY === object) {
        switch (style) {
          case 'lowercase': return '-.inf';
          case 'uppercase': return '-.INF';
          case 'camelcase': return '-.Inf';
        }
      } else if (common.isNegativeZero(object)) {
        return '-0.0';
      }

      res = object.toString(10);

      // JS stringifier can build scientific format without dots: 5e-100,
      // while YAML requres dot: 5.e-100. Fix it with simple hack

      return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
    }

    function isFloat(object) {
      return (Object.prototype.toString.call(object) === '[object Number]') &&
             (object % 1 !== 0 || common.isNegativeZero(object));
    }

    var float = new type('tag:yaml.org,2002:float', {
      kind: 'scalar',
      resolve: resolveYamlFloat,
      construct: constructYamlFloat,
      predicate: isFloat,
      represent: representYamlFloat,
      defaultStyle: 'lowercase'
    });

    var json = failsafe.extend({
      implicit: [
        _null,
        bool,
        int,
        float
      ]
    });

    var core = json;

    var YAML_DATE_REGEXP = new RegExp(
      '^([0-9][0-9][0-9][0-9])'          + // [1] year
      '-([0-9][0-9])'                    + // [2] month
      '-([0-9][0-9])$');                   // [3] day

    var YAML_TIMESTAMP_REGEXP = new RegExp(
      '^([0-9][0-9][0-9][0-9])'          + // [1] year
      '-([0-9][0-9]?)'                   + // [2] month
      '-([0-9][0-9]?)'                   + // [3] day
      '(?:[Tt]|[ \\t]+)'                 + // ...
      '([0-9][0-9]?)'                    + // [4] hour
      ':([0-9][0-9])'                    + // [5] minute
      ':([0-9][0-9])'                    + // [6] second
      '(?:\\.([0-9]*))?'                 + // [7] fraction
      '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
      '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

    function resolveYamlTimestamp(data) {
      if (data === null) return false;
      if (YAML_DATE_REGEXP.exec(data) !== null) return true;
      if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
      return false;
    }

    function constructYamlTimestamp(data) {
      var match, year, month, day, hour, minute, second, fraction = 0,
          delta = null, tz_hour, tz_minute, date;

      match = YAML_DATE_REGEXP.exec(data);
      if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

      if (match === null) throw new Error('Date resolve error');

      // match: [1] year [2] month [3] day

      year = +(match[1]);
      month = +(match[2]) - 1; // JS month starts with 0
      day = +(match[3]);

      if (!match[4]) { // no hour
        return new Date(Date.UTC(year, month, day));
      }

      // match: [4] hour [5] minute [6] second [7] fraction

      hour = +(match[4]);
      minute = +(match[5]);
      second = +(match[6]);

      if (match[7]) {
        fraction = match[7].slice(0, 3);
        while (fraction.length < 3) { // milli-seconds
          fraction += '0';
        }
        fraction = +fraction;
      }

      // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

      if (match[9]) {
        tz_hour = +(match[10]);
        tz_minute = +(match[11] || 0);
        delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
        if (match[9] === '-') delta = -delta;
      }

      date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

      if (delta) date.setTime(date.getTime() - delta);

      return date;
    }

    function representYamlTimestamp(object /*, style*/) {
      return object.toISOString();
    }

    var timestamp = new type('tag:yaml.org,2002:timestamp', {
      kind: 'scalar',
      resolve: resolveYamlTimestamp,
      construct: constructYamlTimestamp,
      instanceOf: Date,
      represent: representYamlTimestamp
    });

    function resolveYamlMerge(data) {
      return data === '<<' || data === null;
    }

    var merge$1 = new type('tag:yaml.org,2002:merge', {
      kind: 'scalar',
      resolve: resolveYamlMerge
    });

    /*eslint-disable no-bitwise*/





    // [ 64, 65, 66 ] -> [ padding, CR, LF ]
    var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


    function resolveYamlBinary(data) {
      if (data === null) return false;

      var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

      // Convert one by one.
      for (idx = 0; idx < max; idx++) {
        code = map.indexOf(data.charAt(idx));

        // Skip CR/LF
        if (code > 64) continue;

        // Fail on illegal characters
        if (code < 0) return false;

        bitlen += 6;
      }

      // If there are any bits left, source was corrupted
      return (bitlen % 8) === 0;
    }

    function constructYamlBinary(data) {
      var idx, tailbits,
          input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
          max = input.length,
          map = BASE64_MAP,
          bits = 0,
          result = [];

      // Collect by 6*4 bits (3 bytes)

      for (idx = 0; idx < max; idx++) {
        if ((idx % 4 === 0) && idx) {
          result.push((bits >> 16) & 0xFF);
          result.push((bits >> 8) & 0xFF);
          result.push(bits & 0xFF);
        }

        bits = (bits << 6) | map.indexOf(input.charAt(idx));
      }

      // Dump tail

      tailbits = (max % 4) * 6;

      if (tailbits === 0) {
        result.push((bits >> 16) & 0xFF);
        result.push((bits >> 8) & 0xFF);
        result.push(bits & 0xFF);
      } else if (tailbits === 18) {
        result.push((bits >> 10) & 0xFF);
        result.push((bits >> 2) & 0xFF);
      } else if (tailbits === 12) {
        result.push((bits >> 4) & 0xFF);
      }

      return new Uint8Array(result);
    }

    function representYamlBinary(object /*, style*/) {
      var result = '', bits = 0, idx, tail,
          max = object.length,
          map = BASE64_MAP;

      // Convert every three bytes to 4 ASCII characters.

      for (idx = 0; idx < max; idx++) {
        if ((idx % 3 === 0) && idx) {
          result += map[(bits >> 18) & 0x3F];
          result += map[(bits >> 12) & 0x3F];
          result += map[(bits >> 6) & 0x3F];
          result += map[bits & 0x3F];
        }

        bits = (bits << 8) + object[idx];
      }

      // Dump tail

      tail = max % 3;

      if (tail === 0) {
        result += map[(bits >> 18) & 0x3F];
        result += map[(bits >> 12) & 0x3F];
        result += map[(bits >> 6) & 0x3F];
        result += map[bits & 0x3F];
      } else if (tail === 2) {
        result += map[(bits >> 10) & 0x3F];
        result += map[(bits >> 4) & 0x3F];
        result += map[(bits << 2) & 0x3F];
        result += map[64];
      } else if (tail === 1) {
        result += map[(bits >> 2) & 0x3F];
        result += map[(bits << 4) & 0x3F];
        result += map[64];
        result += map[64];
      }

      return result;
    }

    function isBinary(obj) {
      return Object.prototype.toString.call(obj) ===  '[object Uint8Array]';
    }

    var binary = new type('tag:yaml.org,2002:binary', {
      kind: 'scalar',
      resolve: resolveYamlBinary,
      construct: constructYamlBinary,
      predicate: isBinary,
      represent: representYamlBinary
    });

    var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
    var _toString$2       = Object.prototype.toString;

    function resolveYamlOmap(data) {
      if (data === null) return true;

      var objectKeys = [], index, length, pair, pairKey, pairHasKey,
          object = data;

      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];
        pairHasKey = false;

        if (_toString$2.call(pair) !== '[object Object]') return false;

        for (pairKey in pair) {
          if (_hasOwnProperty$3.call(pair, pairKey)) {
            if (!pairHasKey) pairHasKey = true;
            else return false;
          }
        }

        if (!pairHasKey) return false;

        if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
        else return false;
      }

      return true;
    }

    function constructYamlOmap(data) {
      return data !== null ? data : [];
    }

    var omap = new type('tag:yaml.org,2002:omap', {
      kind: 'sequence',
      resolve: resolveYamlOmap,
      construct: constructYamlOmap
    });

    var _toString$1 = Object.prototype.toString;

    function resolveYamlPairs(data) {
      if (data === null) return true;

      var index, length, pair, keys, result,
          object = data;

      result = new Array(object.length);

      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];

        if (_toString$1.call(pair) !== '[object Object]') return false;

        keys = Object.keys(pair);

        if (keys.length !== 1) return false;

        result[index] = [ keys[0], pair[keys[0]] ];
      }

      return true;
    }

    function constructYamlPairs(data) {
      if (data === null) return [];

      var index, length, pair, keys, result,
          object = data;

      result = new Array(object.length);

      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];

        keys = Object.keys(pair);

        result[index] = [ keys[0], pair[keys[0]] ];
      }

      return result;
    }

    var pairs = new type('tag:yaml.org,2002:pairs', {
      kind: 'sequence',
      resolve: resolveYamlPairs,
      construct: constructYamlPairs
    });

    var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;

    function resolveYamlSet(data) {
      if (data === null) return true;

      var key, object = data;

      for (key in object) {
        if (_hasOwnProperty$2.call(object, key)) {
          if (object[key] !== null) return false;
        }
      }

      return true;
    }

    function constructYamlSet(data) {
      return data !== null ? data : {};
    }

    var set = new type('tag:yaml.org,2002:set', {
      kind: 'mapping',
      resolve: resolveYamlSet,
      construct: constructYamlSet
    });

    var _default = core.extend({
      implicit: [
        timestamp,
        merge$1
      ],
      explicit: [
        binary,
        omap,
        pairs,
        set
      ]
    });

    /*eslint-disable max-len,no-use-before-define*/







    var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;


    var CONTEXT_FLOW_IN   = 1;
    var CONTEXT_FLOW_OUT  = 2;
    var CONTEXT_BLOCK_IN  = 3;
    var CONTEXT_BLOCK_OUT = 4;


    var CHOMPING_CLIP  = 1;
    var CHOMPING_STRIP = 2;
    var CHOMPING_KEEP  = 3;


    var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
    var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
    var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
    var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
    var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


    function _class(obj) { return Object.prototype.toString.call(obj); }

    function is_EOL(c) {
      return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
    }

    function is_WHITE_SPACE(c) {
      return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
    }

    function is_WS_OR_EOL(c) {
      return (c === 0x09/* Tab */) ||
             (c === 0x20/* Space */) ||
             (c === 0x0A/* LF */) ||
             (c === 0x0D/* CR */);
    }

    function is_FLOW_INDICATOR(c) {
      return c === 0x2C/* , */ ||
             c === 0x5B/* [ */ ||
             c === 0x5D/* ] */ ||
             c === 0x7B/* { */ ||
             c === 0x7D/* } */;
    }

    function fromHexCode(c) {
      var lc;

      if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
        return c - 0x30;
      }

      /*eslint-disable no-bitwise*/
      lc = c | 0x20;

      if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
        return lc - 0x61 + 10;
      }

      return -1;
    }

    function escapedHexLen(c) {
      if (c === 0x78/* x */) { return 2; }
      if (c === 0x75/* u */) { return 4; }
      if (c === 0x55/* U */) { return 8; }
      return 0;
    }

    function fromDecimalCode(c) {
      if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
        return c - 0x30;
      }

      return -1;
    }

    function simpleEscapeSequence(c) {
      /* eslint-disable indent */
      return (c === 0x30/* 0 */) ? '\x00' :
            (c === 0x61/* a */) ? '\x07' :
            (c === 0x62/* b */) ? '\x08' :
            (c === 0x74/* t */) ? '\x09' :
            (c === 0x09/* Tab */) ? '\x09' :
            (c === 0x6E/* n */) ? '\x0A' :
            (c === 0x76/* v */) ? '\x0B' :
            (c === 0x66/* f */) ? '\x0C' :
            (c === 0x72/* r */) ? '\x0D' :
            (c === 0x65/* e */) ? '\x1B' :
            (c === 0x20/* Space */) ? ' ' :
            (c === 0x22/* " */) ? '\x22' :
            (c === 0x2F/* / */) ? '/' :
            (c === 0x5C/* \ */) ? '\x5C' :
            (c === 0x4E/* N */) ? '\x85' :
            (c === 0x5F/* _ */) ? '\xA0' :
            (c === 0x4C/* L */) ? '\u2028' :
            (c === 0x50/* P */) ? '\u2029' : '';
    }

    function charFromCodepoint(c) {
      if (c <= 0xFFFF) {
        return String.fromCharCode(c);
      }
      // Encode UTF-16 surrogate pair
      // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
      return String.fromCharCode(
        ((c - 0x010000) >> 10) + 0xD800,
        ((c - 0x010000) & 0x03FF) + 0xDC00
      );
    }

    var simpleEscapeCheck = new Array(256); // integer, for fast access
    var simpleEscapeMap = new Array(256);
    for (var i = 0; i < 256; i++) {
      simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
      simpleEscapeMap[i] = simpleEscapeSequence(i);
    }


    function State$1(input, options) {
      this.input = input;

      this.filename  = options['filename']  || null;
      this.schema    = options['schema']    || _default;
      this.onWarning = options['onWarning'] || null;
      // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
      // if such documents have no explicit %YAML directive
      this.legacy    = options['legacy']    || false;

      this.json      = options['json']      || false;
      this.listener  = options['listener']  || null;

      this.implicitTypes = this.schema.compiledImplicit;
      this.typeMap       = this.schema.compiledTypeMap;

      this.length     = input.length;
      this.position   = 0;
      this.line       = 0;
      this.lineStart  = 0;
      this.lineIndent = 0;

      // position of first leading tab in the current line,
      // used to make sure there are no tabs in the indentation
      this.firstTabInLine = -1;

      this.documents = [];

      /*
      this.version;
      this.checkLineBreaks;
      this.tagMap;
      this.anchorMap;
      this.tag;
      this.anchor;
      this.kind;
      this.result;*/

    }


    function generateError(state, message) {
      var mark = {
        name:     state.filename,
        buffer:   state.input.slice(0, -1), // omit trailing \0
        position: state.position,
        line:     state.line,
        column:   state.position - state.lineStart
      };

      mark.snippet = snippet(mark);

      return new exception(message, mark);
    }

    function throwError(state, message) {
      throw generateError(state, message);
    }

    function throwWarning(state, message) {
      if (state.onWarning) {
        state.onWarning.call(null, generateError(state, message));
      }
    }


    var directiveHandlers = {

      YAML: function handleYamlDirective(state, name, args) {

        var match, major, minor;

        if (state.version !== null) {
          throwError(state, 'duplication of %YAML directive');
        }

        if (args.length !== 1) {
          throwError(state, 'YAML directive accepts exactly one argument');
        }

        match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

        if (match === null) {
          throwError(state, 'ill-formed argument of the YAML directive');
        }

        major = parseInt(match[1], 10);
        minor = parseInt(match[2], 10);

        if (major !== 1) {
          throwError(state, 'unacceptable YAML version of the document');
        }

        state.version = args[0];
        state.checkLineBreaks = (minor < 2);

        if (minor !== 1 && minor !== 2) {
          throwWarning(state, 'unsupported YAML version of the document');
        }
      },

      TAG: function handleTagDirective(state, name, args) {

        var handle, prefix;

        if (args.length !== 2) {
          throwError(state, 'TAG directive accepts exactly two arguments');
        }

        handle = args[0];
        prefix = args[1];

        if (!PATTERN_TAG_HANDLE.test(handle)) {
          throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
        }

        if (_hasOwnProperty$1.call(state.tagMap, handle)) {
          throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
        }

        if (!PATTERN_TAG_URI.test(prefix)) {
          throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
        }

        try {
          prefix = decodeURIComponent(prefix);
        } catch (err) {
          throwError(state, 'tag prefix is malformed: ' + prefix);
        }

        state.tagMap[handle] = prefix;
      }
    };


    function captureSegment(state, start, end, checkJson) {
      var _position, _length, _character, _result;

      if (start < end) {
        _result = state.input.slice(start, end);

        if (checkJson) {
          for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
            _character = _result.charCodeAt(_position);
            if (!(_character === 0x09 ||
                  (0x20 <= _character && _character <= 0x10FFFF))) {
              throwError(state, 'expected valid JSON character');
            }
          }
        } else if (PATTERN_NON_PRINTABLE.test(_result)) {
          throwError(state, 'the stream contains non-printable characters');
        }

        state.result += _result;
      }
    }

    function mergeMappings(state, destination, source, overridableKeys) {
      var sourceKeys, key, index, quantity;

      if (!common.isObject(source)) {
        throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
      }

      sourceKeys = Object.keys(source);

      for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
        key = sourceKeys[index];

        if (!_hasOwnProperty$1.call(destination, key)) {
          destination[key] = source[key];
          overridableKeys[key] = true;
        }
      }
    }

    function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode,
      startLine, startLineStart, startPos) {

      var index, quantity;

      // The output is a plain object here, so keys can only be strings.
      // We need to convert keyNode to a string, but doing so can hang the process
      // (deeply nested arrays that explode exponentially using aliases).
      if (Array.isArray(keyNode)) {
        keyNode = Array.prototype.slice.call(keyNode);

        for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
          if (Array.isArray(keyNode[index])) {
            throwError(state, 'nested arrays are not supported inside keys');
          }

          if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
            keyNode[index] = '[object Object]';
          }
        }
      }

      // Avoid code execution in load() via toString property
      // (still use its own toString for arrays, timestamps,
      // and whatever user schema extensions happen to have @@toStringTag)
      if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
        keyNode = '[object Object]';
      }


      keyNode = String(keyNode);

      if (_result === null) {
        _result = {};
      }

      if (keyTag === 'tag:yaml.org,2002:merge') {
        if (Array.isArray(valueNode)) {
          for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
            mergeMappings(state, _result, valueNode[index], overridableKeys);
          }
        } else {
          mergeMappings(state, _result, valueNode, overridableKeys);
        }
      } else {
        if (!state.json &&
            !_hasOwnProperty$1.call(overridableKeys, keyNode) &&
            _hasOwnProperty$1.call(_result, keyNode)) {
          state.line = startLine || state.line;
          state.lineStart = startLineStart || state.lineStart;
          state.position = startPos || state.position;
          throwError(state, 'duplicated mapping key');
        }

        // used for this specific key only because Object.defineProperty is slow
        if (keyNode === '__proto__') {
          Object.defineProperty(_result, keyNode, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: valueNode
          });
        } else {
          _result[keyNode] = valueNode;
        }
        delete overridableKeys[keyNode];
      }

      return _result;
    }

    function readLineBreak(state) {
      var ch;

      ch = state.input.charCodeAt(state.position);

      if (ch === 0x0A/* LF */) {
        state.position++;
      } else if (ch === 0x0D/* CR */) {
        state.position++;
        if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
          state.position++;
        }
      } else {
        throwError(state, 'a line break is expected');
      }

      state.line += 1;
      state.lineStart = state.position;
      state.firstTabInLine = -1;
    }

    function skipSeparationSpace(state, allowComments, checkIndent) {
      var lineBreaks = 0,
          ch = state.input.charCodeAt(state.position);

      while (ch !== 0) {
        while (is_WHITE_SPACE(ch)) {
          if (ch === 0x09/* Tab */ && state.firstTabInLine === -1) {
            state.firstTabInLine = state.position;
          }
          ch = state.input.charCodeAt(++state.position);
        }

        if (allowComments && ch === 0x23/* # */) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
        }

        if (is_EOL(ch)) {
          readLineBreak(state);

          ch = state.input.charCodeAt(state.position);
          lineBreaks++;
          state.lineIndent = 0;

          while (ch === 0x20/* Space */) {
            state.lineIndent++;
            ch = state.input.charCodeAt(++state.position);
          }
        } else {
          break;
        }
      }

      if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
        throwWarning(state, 'deficient indentation');
      }

      return lineBreaks;
    }

    function testDocumentSeparator(state) {
      var _position = state.position,
          ch;

      ch = state.input.charCodeAt(_position);

      // Condition state.position === state.lineStart is tested
      // in parent on each call, for efficiency. No needs to test here again.
      if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
          ch === state.input.charCodeAt(_position + 1) &&
          ch === state.input.charCodeAt(_position + 2)) {

        _position += 3;

        ch = state.input.charCodeAt(_position);

        if (ch === 0 || is_WS_OR_EOL(ch)) {
          return true;
        }
      }

      return false;
    }

    function writeFoldedLines(state, count) {
      if (count === 1) {
        state.result += ' ';
      } else if (count > 1) {
        state.result += common.repeat('\n', count - 1);
      }
    }


    function readPlainScalar(state, nodeIndent, withinFlowCollection) {
      var preceding,
          following,
          captureStart,
          captureEnd,
          hasPendingContent,
          _line,
          _lineStart,
          _lineIndent,
          _kind = state.kind,
          _result = state.result,
          ch;

      ch = state.input.charCodeAt(state.position);

      if (is_WS_OR_EOL(ch)      ||
          is_FLOW_INDICATOR(ch) ||
          ch === 0x23/* # */    ||
          ch === 0x26/* & */    ||
          ch === 0x2A/* * */    ||
          ch === 0x21/* ! */    ||
          ch === 0x7C/* | */    ||
          ch === 0x3E/* > */    ||
          ch === 0x27/* ' */    ||
          ch === 0x22/* " */    ||
          ch === 0x25/* % */    ||
          ch === 0x40/* @ */    ||
          ch === 0x60/* ` */) {
        return false;
      }

      if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
        following = state.input.charCodeAt(state.position + 1);

        if (is_WS_OR_EOL(following) ||
            withinFlowCollection && is_FLOW_INDICATOR(following)) {
          return false;
        }
      }

      state.kind = 'scalar';
      state.result = '';
      captureStart = captureEnd = state.position;
      hasPendingContent = false;

      while (ch !== 0) {
        if (ch === 0x3A/* : */) {
          following = state.input.charCodeAt(state.position + 1);

          if (is_WS_OR_EOL(following) ||
              withinFlowCollection && is_FLOW_INDICATOR(following)) {
            break;
          }

        } else if (ch === 0x23/* # */) {
          preceding = state.input.charCodeAt(state.position - 1);

          if (is_WS_OR_EOL(preceding)) {
            break;
          }

        } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
                   withinFlowCollection && is_FLOW_INDICATOR(ch)) {
          break;

        } else if (is_EOL(ch)) {
          _line = state.line;
          _lineStart = state.lineStart;
          _lineIndent = state.lineIndent;
          skipSeparationSpace(state, false, -1);

          if (state.lineIndent >= nodeIndent) {
            hasPendingContent = true;
            ch = state.input.charCodeAt(state.position);
            continue;
          } else {
            state.position = captureEnd;
            state.line = _line;
            state.lineStart = _lineStart;
            state.lineIndent = _lineIndent;
            break;
          }
        }

        if (hasPendingContent) {
          captureSegment(state, captureStart, captureEnd, false);
          writeFoldedLines(state, state.line - _line);
          captureStart = captureEnd = state.position;
          hasPendingContent = false;
        }

        if (!is_WHITE_SPACE(ch)) {
          captureEnd = state.position + 1;
        }

        ch = state.input.charCodeAt(++state.position);
      }

      captureSegment(state, captureStart, captureEnd, false);

      if (state.result) {
        return true;
      }

      state.kind = _kind;
      state.result = _result;
      return false;
    }

    function readSingleQuotedScalar(state, nodeIndent) {
      var ch,
          captureStart, captureEnd;

      ch = state.input.charCodeAt(state.position);

      if (ch !== 0x27/* ' */) {
        return false;
      }

      state.kind = 'scalar';
      state.result = '';
      state.position++;
      captureStart = captureEnd = state.position;

      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        if (ch === 0x27/* ' */) {
          captureSegment(state, captureStart, state.position, true);
          ch = state.input.charCodeAt(++state.position);

          if (ch === 0x27/* ' */) {
            captureStart = state.position;
            state.position++;
            captureEnd = state.position;
          } else {
            return true;
          }

        } else if (is_EOL(ch)) {
          captureSegment(state, captureStart, captureEnd, true);
          writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
          captureStart = captureEnd = state.position;

        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
          throwError(state, 'unexpected end of the document within a single quoted scalar');

        } else {
          state.position++;
          captureEnd = state.position;
        }
      }

      throwError(state, 'unexpected end of the stream within a single quoted scalar');
    }

    function readDoubleQuotedScalar(state, nodeIndent) {
      var captureStart,
          captureEnd,
          hexLength,
          hexResult,
          tmp,
          ch;

      ch = state.input.charCodeAt(state.position);

      if (ch !== 0x22/* " */) {
        return false;
      }

      state.kind = 'scalar';
      state.result = '';
      state.position++;
      captureStart = captureEnd = state.position;

      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        if (ch === 0x22/* " */) {
          captureSegment(state, captureStart, state.position, true);
          state.position++;
          return true;

        } else if (ch === 0x5C/* \ */) {
          captureSegment(state, captureStart, state.position, true);
          ch = state.input.charCodeAt(++state.position);

          if (is_EOL(ch)) {
            skipSeparationSpace(state, false, nodeIndent);

            // TODO: rework to inline fn with no type cast?
          } else if (ch < 256 && simpleEscapeCheck[ch]) {
            state.result += simpleEscapeMap[ch];
            state.position++;

          } else if ((tmp = escapedHexLen(ch)) > 0) {
            hexLength = tmp;
            hexResult = 0;

            for (; hexLength > 0; hexLength--) {
              ch = state.input.charCodeAt(++state.position);

              if ((tmp = fromHexCode(ch)) >= 0) {
                hexResult = (hexResult << 4) + tmp;

              } else {
                throwError(state, 'expected hexadecimal character');
              }
            }

            state.result += charFromCodepoint(hexResult);

            state.position++;

          } else {
            throwError(state, 'unknown escape sequence');
          }

          captureStart = captureEnd = state.position;

        } else if (is_EOL(ch)) {
          captureSegment(state, captureStart, captureEnd, true);
          writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
          captureStart = captureEnd = state.position;

        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
          throwError(state, 'unexpected end of the document within a double quoted scalar');

        } else {
          state.position++;
          captureEnd = state.position;
        }
      }

      throwError(state, 'unexpected end of the stream within a double quoted scalar');
    }

    function readFlowCollection(state, nodeIndent) {
      var readNext = true,
          _line,
          _lineStart,
          _pos,
          _tag     = state.tag,
          _result,
          _anchor  = state.anchor,
          following,
          terminator,
          isPair,
          isExplicitPair,
          isMapping,
          overridableKeys = Object.create(null),
          keyNode,
          keyTag,
          valueNode,
          ch;

      ch = state.input.charCodeAt(state.position);

      if (ch === 0x5B/* [ */) {
        terminator = 0x5D;/* ] */
        isMapping = false;
        _result = [];
      } else if (ch === 0x7B/* { */) {
        terminator = 0x7D;/* } */
        isMapping = true;
        _result = {};
      } else {
        return false;
      }

      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }

      ch = state.input.charCodeAt(++state.position);

      while (ch !== 0) {
        skipSeparationSpace(state, true, nodeIndent);

        ch = state.input.charCodeAt(state.position);

        if (ch === terminator) {
          state.position++;
          state.tag = _tag;
          state.anchor = _anchor;
          state.kind = isMapping ? 'mapping' : 'sequence';
          state.result = _result;
          return true;
        } else if (!readNext) {
          throwError(state, 'missed comma between flow collection entries');
        } else if (ch === 0x2C/* , */) {
          // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
          throwError(state, "expected the node content, but found ','");
        }

        keyTag = keyNode = valueNode = null;
        isPair = isExplicitPair = false;

        if (ch === 0x3F/* ? */) {
          following = state.input.charCodeAt(state.position + 1);

          if (is_WS_OR_EOL(following)) {
            isPair = isExplicitPair = true;
            state.position++;
            skipSeparationSpace(state, true, nodeIndent);
          }
        }

        _line = state.line; // Save the current line.
        _lineStart = state.lineStart;
        _pos = state.position;
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        keyTag = state.tag;
        keyNode = state.result;
        skipSeparationSpace(state, true, nodeIndent);

        ch = state.input.charCodeAt(state.position);

        if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
          isPair = true;
          ch = state.input.charCodeAt(++state.position);
          skipSeparationSpace(state, true, nodeIndent);
          composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
          valueNode = state.result;
        }

        if (isMapping) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
        } else if (isPair) {
          _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
        } else {
          _result.push(keyNode);
        }

        skipSeparationSpace(state, true, nodeIndent);

        ch = state.input.charCodeAt(state.position);

        if (ch === 0x2C/* , */) {
          readNext = true;
          ch = state.input.charCodeAt(++state.position);
        } else {
          readNext = false;
        }
      }

      throwError(state, 'unexpected end of the stream within a flow collection');
    }

    function readBlockScalar(state, nodeIndent) {
      var captureStart,
          folding,
          chomping       = CHOMPING_CLIP,
          didReadContent = false,
          detectedIndent = false,
          textIndent     = nodeIndent,
          emptyLines     = 0,
          atMoreIndented = false,
          tmp,
          ch;

      ch = state.input.charCodeAt(state.position);

      if (ch === 0x7C/* | */) {
        folding = false;
      } else if (ch === 0x3E/* > */) {
        folding = true;
      } else {
        return false;
      }

      state.kind = 'scalar';
      state.result = '';

      while (ch !== 0) {
        ch = state.input.charCodeAt(++state.position);

        if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
          if (CHOMPING_CLIP === chomping) {
            chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
          } else {
            throwError(state, 'repeat of a chomping mode identifier');
          }

        } else if ((tmp = fromDecimalCode(ch)) >= 0) {
          if (tmp === 0) {
            throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
          } else if (!detectedIndent) {
            textIndent = nodeIndent + tmp - 1;
            detectedIndent = true;
          } else {
            throwError(state, 'repeat of an indentation width identifier');
          }

        } else {
          break;
        }
      }

      if (is_WHITE_SPACE(ch)) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (is_WHITE_SPACE(ch));

        if (ch === 0x23/* # */) {
          do { ch = state.input.charCodeAt(++state.position); }
          while (!is_EOL(ch) && (ch !== 0));
        }
      }

      while (ch !== 0) {
        readLineBreak(state);
        state.lineIndent = 0;

        ch = state.input.charCodeAt(state.position);

        while ((!detectedIndent || state.lineIndent < textIndent) &&
               (ch === 0x20/* Space */)) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }

        if (!detectedIndent && state.lineIndent > textIndent) {
          textIndent = state.lineIndent;
        }

        if (is_EOL(ch)) {
          emptyLines++;
          continue;
        }

        // End of the scalar.
        if (state.lineIndent < textIndent) {

          // Perform the chomping.
          if (chomping === CHOMPING_KEEP) {
            state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
          } else if (chomping === CHOMPING_CLIP) {
            if (didReadContent) { // i.e. only if the scalar is not empty.
              state.result += '\n';
            }
          }

          // Break this `while` cycle and go to the funciton's epilogue.
          break;
        }

        // Folded style: use fancy rules to handle line breaks.
        if (folding) {

          // Lines starting with white space characters (more-indented lines) are not folded.
          if (is_WHITE_SPACE(ch)) {
            atMoreIndented = true;
            // except for the first content line (cf. Example 8.1)
            state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

          // End of more-indented block.
          } else if (atMoreIndented) {
            atMoreIndented = false;
            state.result += common.repeat('\n', emptyLines + 1);

          // Just one line break - perceive as the same line.
          } else if (emptyLines === 0) {
            if (didReadContent) { // i.e. only if we have already read some scalar content.
              state.result += ' ';
            }

          // Several line breaks - perceive as different lines.
          } else {
            state.result += common.repeat('\n', emptyLines);
          }

        // Literal style: just add exact number of line breaks between content lines.
        } else {
          // Keep all line breaks except the header line break.
          state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
        }

        didReadContent = true;
        detectedIndent = true;
        emptyLines = 0;
        captureStart = state.position;

        while (!is_EOL(ch) && (ch !== 0)) {
          ch = state.input.charCodeAt(++state.position);
        }

        captureSegment(state, captureStart, state.position, false);
      }

      return true;
    }

    function readBlockSequence(state, nodeIndent) {
      var _line,
          _tag      = state.tag,
          _anchor   = state.anchor,
          _result   = [],
          following,
          detected  = false,
          ch;

      // there is a leading tab before this token, so it can't be a block sequence/mapping;
      // it can still be flow sequence/mapping or a scalar
      if (state.firstTabInLine !== -1) return false;

      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }

      ch = state.input.charCodeAt(state.position);

      while (ch !== 0) {
        if (state.firstTabInLine !== -1) {
          state.position = state.firstTabInLine;
          throwError(state, 'tab characters must not be used in indentation');
        }

        if (ch !== 0x2D/* - */) {
          break;
        }

        following = state.input.charCodeAt(state.position + 1);

        if (!is_WS_OR_EOL(following)) {
          break;
        }

        detected = true;
        state.position++;

        if (skipSeparationSpace(state, true, -1)) {
          if (state.lineIndent <= nodeIndent) {
            _result.push(null);
            ch = state.input.charCodeAt(state.position);
            continue;
          }
        }

        _line = state.line;
        composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
        _result.push(state.result);
        skipSeparationSpace(state, true, -1);

        ch = state.input.charCodeAt(state.position);

        if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
          throwError(state, 'bad indentation of a sequence entry');
        } else if (state.lineIndent < nodeIndent) {
          break;
        }
      }

      if (detected) {
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = 'sequence';
        state.result = _result;
        return true;
      }
      return false;
    }

    function readBlockMapping(state, nodeIndent, flowIndent) {
      var following,
          allowCompact,
          _line,
          _keyLine,
          _keyLineStart,
          _keyPos,
          _tag          = state.tag,
          _anchor       = state.anchor,
          _result       = {},
          overridableKeys = Object.create(null),
          keyTag        = null,
          keyNode       = null,
          valueNode     = null,
          atExplicitKey = false,
          detected      = false,
          ch;

      // there is a leading tab before this token, so it can't be a block sequence/mapping;
      // it can still be flow sequence/mapping or a scalar
      if (state.firstTabInLine !== -1) return false;

      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }

      ch = state.input.charCodeAt(state.position);

      while (ch !== 0) {
        if (!atExplicitKey && state.firstTabInLine !== -1) {
          state.position = state.firstTabInLine;
          throwError(state, 'tab characters must not be used in indentation');
        }

        following = state.input.charCodeAt(state.position + 1);
        _line = state.line; // Save the current line.

        //
        // Explicit notation case. There are two separate blocks:
        // first for the key (denoted by "?") and second for the value (denoted by ":")
        //
        if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

          if (ch === 0x3F/* ? */) {
            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
              keyTag = keyNode = valueNode = null;
            }

            detected = true;
            atExplicitKey = true;
            allowCompact = true;

          } else if (atExplicitKey) {
            // i.e. 0x3A/* : */ === character after the explicit key.
            atExplicitKey = false;
            allowCompact = true;

          } else {
            throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
          }

          state.position += 1;
          ch = following;

        //
        // Implicit notation case. Flow-style node as the key first, then ":", and the value.
        //
        } else {
          _keyLine = state.line;
          _keyLineStart = state.lineStart;
          _keyPos = state.position;

          if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
            // Neither implicit nor explicit notation.
            // Reading is done. Go to the epilogue.
            break;
          }

          if (state.line === _line) {
            ch = state.input.charCodeAt(state.position);

            while (is_WHITE_SPACE(ch)) {
              ch = state.input.charCodeAt(++state.position);
            }

            if (ch === 0x3A/* : */) {
              ch = state.input.charCodeAt(++state.position);

              if (!is_WS_OR_EOL(ch)) {
                throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
              }

              if (atExplicitKey) {
                storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
                keyTag = keyNode = valueNode = null;
              }

              detected = true;
              atExplicitKey = false;
              allowCompact = false;
              keyTag = state.tag;
              keyNode = state.result;

            } else if (detected) {
              throwError(state, 'can not read an implicit mapping pair; a colon is missed');

            } else {
              state.tag = _tag;
              state.anchor = _anchor;
              return true; // Keep the result of `composeNode`.
            }

          } else if (detected) {
            throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true; // Keep the result of `composeNode`.
          }
        }

        //
        // Common reading code for both explicit and implicit notations.
        //
        if (state.line === _line || state.lineIndent > nodeIndent) {
          if (atExplicitKey) {
            _keyLine = state.line;
            _keyLineStart = state.lineStart;
            _keyPos = state.position;
          }

          if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
            if (atExplicitKey) {
              keyNode = state.result;
            } else {
              valueNode = state.result;
            }
          }

          if (!atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          skipSeparationSpace(state, true, -1);
          ch = state.input.charCodeAt(state.position);
        }

        if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
          throwError(state, 'bad indentation of a mapping entry');
        } else if (state.lineIndent < nodeIndent) {
          break;
        }
      }

      //
      // Epilogue.
      //

      // Special case: last mapping's node contains only the key in explicit notation.
      if (atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
      }

      // Expose the resulting mapping.
      if (detected) {
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = 'mapping';
        state.result = _result;
      }

      return detected;
    }

    function readTagProperty(state) {
      var _position,
          isVerbatim = false,
          isNamed    = false,
          tagHandle,
          tagName,
          ch;

      ch = state.input.charCodeAt(state.position);

      if (ch !== 0x21/* ! */) return false;

      if (state.tag !== null) {
        throwError(state, 'duplication of a tag property');
      }

      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x3C/* < */) {
        isVerbatim = true;
        ch = state.input.charCodeAt(++state.position);

      } else if (ch === 0x21/* ! */) {
        isNamed = true;
        tagHandle = '!!';
        ch = state.input.charCodeAt(++state.position);

      } else {
        tagHandle = '!';
      }

      _position = state.position;

      if (isVerbatim) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (ch !== 0 && ch !== 0x3E/* > */);

        if (state.position < state.length) {
          tagName = state.input.slice(_position, state.position);
          ch = state.input.charCodeAt(++state.position);
        } else {
          throwError(state, 'unexpected end of the stream within a verbatim tag');
        }
      } else {
        while (ch !== 0 && !is_WS_OR_EOL(ch)) {

          if (ch === 0x21/* ! */) {
            if (!isNamed) {
              tagHandle = state.input.slice(_position - 1, state.position + 1);

              if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
                throwError(state, 'named tag handle cannot contain such characters');
              }

              isNamed = true;
              _position = state.position + 1;
            } else {
              throwError(state, 'tag suffix cannot contain exclamation marks');
            }
          }

          ch = state.input.charCodeAt(++state.position);
        }

        tagName = state.input.slice(_position, state.position);

        if (PATTERN_FLOW_INDICATORS.test(tagName)) {
          throwError(state, 'tag suffix cannot contain flow indicator characters');
        }
      }

      if (tagName && !PATTERN_TAG_URI.test(tagName)) {
        throwError(state, 'tag name cannot contain such characters: ' + tagName);
      }

      try {
        tagName = decodeURIComponent(tagName);
      } catch (err) {
        throwError(state, 'tag name is malformed: ' + tagName);
      }

      if (isVerbatim) {
        state.tag = tagName;

      } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
        state.tag = state.tagMap[tagHandle] + tagName;

      } else if (tagHandle === '!') {
        state.tag = '!' + tagName;

      } else if (tagHandle === '!!') {
        state.tag = 'tag:yaml.org,2002:' + tagName;

      } else {
        throwError(state, 'undeclared tag handle "' + tagHandle + '"');
      }

      return true;
    }

    function readAnchorProperty(state) {
      var _position,
          ch;

      ch = state.input.charCodeAt(state.position);

      if (ch !== 0x26/* & */) return false;

      if (state.anchor !== null) {
        throwError(state, 'duplication of an anchor property');
      }

      ch = state.input.charCodeAt(++state.position);
      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (state.position === _position) {
        throwError(state, 'name of an anchor node must contain at least one character');
      }

      state.anchor = state.input.slice(_position, state.position);
      return true;
    }

    function readAlias(state) {
      var _position, alias,
          ch;

      ch = state.input.charCodeAt(state.position);

      if (ch !== 0x2A/* * */) return false;

      ch = state.input.charCodeAt(++state.position);
      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (state.position === _position) {
        throwError(state, 'name of an alias node must contain at least one character');
      }

      alias = state.input.slice(_position, state.position);

      if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
        throwError(state, 'unidentified alias "' + alias + '"');
      }

      state.result = state.anchorMap[alias];
      skipSeparationSpace(state, true, -1);
      return true;
    }

    function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
      var allowBlockStyles,
          allowBlockScalars,
          allowBlockCollections,
          indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
          atNewLine  = false,
          hasContent = false,
          typeIndex,
          typeQuantity,
          typeList,
          type,
          flowIndent,
          blockIndent;

      if (state.listener !== null) {
        state.listener('open', state);
      }

      state.tag    = null;
      state.anchor = null;
      state.kind   = null;
      state.result = null;

      allowBlockStyles = allowBlockScalars = allowBlockCollections =
        CONTEXT_BLOCK_OUT === nodeContext ||
        CONTEXT_BLOCK_IN  === nodeContext;

      if (allowToSeek) {
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;

          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        }
      }

      if (indentStatus === 1) {
        while (readTagProperty(state) || readAnchorProperty(state)) {
          if (skipSeparationSpace(state, true, -1)) {
            atNewLine = true;
            allowBlockCollections = allowBlockStyles;

            if (state.lineIndent > parentIndent) {
              indentStatus = 1;
            } else if (state.lineIndent === parentIndent) {
              indentStatus = 0;
            } else if (state.lineIndent < parentIndent) {
              indentStatus = -1;
            }
          } else {
            allowBlockCollections = false;
          }
        }
      }

      if (allowBlockCollections) {
        allowBlockCollections = atNewLine || allowCompact;
      }

      if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
        if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
          flowIndent = parentIndent;
        } else {
          flowIndent = parentIndent + 1;
        }

        blockIndent = state.position - state.lineStart;

        if (indentStatus === 1) {
          if (allowBlockCollections &&
              (readBlockSequence(state, blockIndent) ||
               readBlockMapping(state, blockIndent, flowIndent)) ||
              readFlowCollection(state, flowIndent)) {
            hasContent = true;
          } else {
            if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
                readSingleQuotedScalar(state, flowIndent) ||
                readDoubleQuotedScalar(state, flowIndent)) {
              hasContent = true;

            } else if (readAlias(state)) {
              hasContent = true;

              if (state.tag !== null || state.anchor !== null) {
                throwError(state, 'alias node should not have any properties');
              }

            } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
              hasContent = true;

              if (state.tag === null) {
                state.tag = '?';
              }
            }

            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
          }
        } else if (indentStatus === 0) {
          // Special case: block sequences are allowed to have same indentation level as the parent.
          // http://www.yaml.org/spec/1.2/spec.html#id2799784
          hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
        }
      }

      if (state.tag === null) {
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }

      } else if (state.tag === '?') {
        // Implicit resolving is not allowed for non-scalar types, and '?'
        // non-specific tag is only automatically assigned to plain scalars.
        //
        // We only need to check kind conformity in case user explicitly assigns '?'
        // tag, for example like this: "!<?> [0]"
        //
        if (state.result !== null && state.kind !== 'scalar') {
          throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
        }

        for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
          type = state.implicitTypes[typeIndex];

          if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
            state.result = type.construct(state.result);
            state.tag = type.tag;
            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
            break;
          }
        }
      } else if (state.tag !== '!') {
        if (_hasOwnProperty$1.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
          type = state.typeMap[state.kind || 'fallback'][state.tag];
        } else {
          // looking for multi type
          type = null;
          typeList = state.typeMap.multi[state.kind || 'fallback'];

          for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
            if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
              type = typeList[typeIndex];
              break;
            }
          }
        }

        if (!type) {
          throwError(state, 'unknown tag !<' + state.tag + '>');
        }

        if (state.result !== null && type.kind !== state.kind) {
          throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
        }

        if (!type.resolve(state.result, state.tag)) { // `state.result` updated in resolver if matched
          throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
        } else {
          state.result = type.construct(state.result, state.tag);
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      }

      if (state.listener !== null) {
        state.listener('close', state);
      }
      return state.tag !== null ||  state.anchor !== null || hasContent;
    }

    function readDocument(state) {
      var documentStart = state.position,
          _position,
          directiveName,
          directiveArgs,
          hasDirectives = false,
          ch;

      state.version = null;
      state.checkLineBreaks = state.legacy;
      state.tagMap = Object.create(null);
      state.anchorMap = Object.create(null);

      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        skipSeparationSpace(state, true, -1);

        ch = state.input.charCodeAt(state.position);

        if (state.lineIndent > 0 || ch !== 0x25/* % */) {
          break;
        }

        hasDirectives = true;
        ch = state.input.charCodeAt(++state.position);
        _position = state.position;

        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        directiveName = state.input.slice(_position, state.position);
        directiveArgs = [];

        if (directiveName.length < 1) {
          throwError(state, 'directive name must not be less than one character in length');
        }

        while (ch !== 0) {
          while (is_WHITE_SPACE(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }

          if (ch === 0x23/* # */) {
            do { ch = state.input.charCodeAt(++state.position); }
            while (ch !== 0 && !is_EOL(ch));
            break;
          }

          if (is_EOL(ch)) break;

          _position = state.position;

          while (ch !== 0 && !is_WS_OR_EOL(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }

          directiveArgs.push(state.input.slice(_position, state.position));
        }

        if (ch !== 0) readLineBreak(state);

        if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
          directiveHandlers[directiveName](state, directiveName, directiveArgs);
        } else {
          throwWarning(state, 'unknown document directive "' + directiveName + '"');
        }
      }

      skipSeparationSpace(state, true, -1);

      if (state.lineIndent === 0 &&
          state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
          state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
          state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);

      } else if (hasDirectives) {
        throwError(state, 'directives end mark is expected');
      }

      composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
      skipSeparationSpace(state, true, -1);

      if (state.checkLineBreaks &&
          PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
        throwWarning(state, 'non-ASCII line breaks are interpreted as content');
      }

      state.documents.push(state.result);

      if (state.position === state.lineStart && testDocumentSeparator(state)) {

        if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
          state.position += 3;
          skipSeparationSpace(state, true, -1);
        }
        return;
      }

      if (state.position < (state.length - 1)) {
        throwError(state, 'end of the stream or a document separator is expected');
      } else {
        return;
      }
    }


    function loadDocuments(input, options) {
      input = String(input);
      options = options || {};

      if (input.length !== 0) {

        // Add tailing `\n` if not exists
        if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
            input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
          input += '\n';
        }

        // Strip BOM
        if (input.charCodeAt(0) === 0xFEFF) {
          input = input.slice(1);
        }
      }

      var state = new State$1(input, options);

      var nullpos = input.indexOf('\0');

      if (nullpos !== -1) {
        state.position = nullpos;
        throwError(state, 'null byte is not allowed in input');
      }

      // Use 0 as string terminator. That significantly simplifies bounds check.
      state.input += '\0';

      while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
        state.lineIndent += 1;
        state.position += 1;
      }

      while (state.position < (state.length - 1)) {
        readDocument(state);
      }

      return state.documents;
    }


    function loadAll$1(input, iterator, options) {
      if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
        options = iterator;
        iterator = null;
      }

      var documents = loadDocuments(input, options);

      if (typeof iterator !== 'function') {
        return documents;
      }

      for (var index = 0, length = documents.length; index < length; index += 1) {
        iterator(documents[index]);
      }
    }


    function load$1(input, options) {
      var documents = loadDocuments(input, options);

      if (documents.length === 0) {
        /*eslint-disable no-undefined*/
        return undefined;
      } else if (documents.length === 1) {
        return documents[0];
      }
      throw new exception('expected a single document in the stream, but found more');
    }


    var loadAll_1 = loadAll$1;
    var load_1    = load$1;

    var loader = {
    	loadAll: loadAll_1,
    	load: load_1
    };

    /*eslint-disable no-use-before-define*/





    var _toString       = Object.prototype.toString;
    var _hasOwnProperty = Object.prototype.hasOwnProperty;

    var CHAR_BOM                  = 0xFEFF;
    var CHAR_TAB                  = 0x09; /* Tab */
    var CHAR_LINE_FEED            = 0x0A; /* LF */
    var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
    var CHAR_SPACE                = 0x20; /* Space */
    var CHAR_EXCLAMATION          = 0x21; /* ! */
    var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
    var CHAR_SHARP                = 0x23; /* # */
    var CHAR_PERCENT              = 0x25; /* % */
    var CHAR_AMPERSAND            = 0x26; /* & */
    var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
    var CHAR_ASTERISK             = 0x2A; /* * */
    var CHAR_COMMA                = 0x2C; /* , */
    var CHAR_MINUS                = 0x2D; /* - */
    var CHAR_COLON                = 0x3A; /* : */
    var CHAR_EQUALS               = 0x3D; /* = */
    var CHAR_GREATER_THAN         = 0x3E; /* > */
    var CHAR_QUESTION             = 0x3F; /* ? */
    var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
    var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
    var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
    var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
    var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
    var CHAR_VERTICAL_LINE        = 0x7C; /* | */
    var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

    var ESCAPE_SEQUENCES = {};

    ESCAPE_SEQUENCES[0x00]   = '\\0';
    ESCAPE_SEQUENCES[0x07]   = '\\a';
    ESCAPE_SEQUENCES[0x08]   = '\\b';
    ESCAPE_SEQUENCES[0x09]   = '\\t';
    ESCAPE_SEQUENCES[0x0A]   = '\\n';
    ESCAPE_SEQUENCES[0x0B]   = '\\v';
    ESCAPE_SEQUENCES[0x0C]   = '\\f';
    ESCAPE_SEQUENCES[0x0D]   = '\\r';
    ESCAPE_SEQUENCES[0x1B]   = '\\e';
    ESCAPE_SEQUENCES[0x22]   = '\\"';
    ESCAPE_SEQUENCES[0x5C]   = '\\\\';
    ESCAPE_SEQUENCES[0x85]   = '\\N';
    ESCAPE_SEQUENCES[0xA0]   = '\\_';
    ESCAPE_SEQUENCES[0x2028] = '\\L';
    ESCAPE_SEQUENCES[0x2029] = '\\P';

    var DEPRECATED_BOOLEANS_SYNTAX = [
      'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
      'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
    ];

    var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

    function compileStyleMap(schema, map) {
      var result, keys, index, length, tag, style, type;

      if (map === null) return {};

      result = {};
      keys = Object.keys(map);

      for (index = 0, length = keys.length; index < length; index += 1) {
        tag = keys[index];
        style = String(map[tag]);

        if (tag.slice(0, 2) === '!!') {
          tag = 'tag:yaml.org,2002:' + tag.slice(2);
        }
        type = schema.compiledTypeMap['fallback'][tag];

        if (type && _hasOwnProperty.call(type.styleAliases, style)) {
          style = type.styleAliases[style];
        }

        result[tag] = style;
      }

      return result;
    }

    function encodeHex(character) {
      var string, handle, length;

      string = character.toString(16).toUpperCase();

      if (character <= 0xFF) {
        handle = 'x';
        length = 2;
      } else if (character <= 0xFFFF) {
        handle = 'u';
        length = 4;
      } else if (character <= 0xFFFFFFFF) {
        handle = 'U';
        length = 8;
      } else {
        throw new exception('code point within a string may not be greater than 0xFFFFFFFF');
      }

      return '\\' + handle + common.repeat('0', length - string.length) + string;
    }


    var QUOTING_TYPE_SINGLE = 1,
        QUOTING_TYPE_DOUBLE = 2;

    function State(options) {
      this.schema        = options['schema'] || _default;
      this.indent        = Math.max(1, (options['indent'] || 2));
      this.noArrayIndent = options['noArrayIndent'] || false;
      this.skipInvalid   = options['skipInvalid'] || false;
      this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
      this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
      this.sortKeys      = options['sortKeys'] || false;
      this.lineWidth     = options['lineWidth'] || 80;
      this.noRefs        = options['noRefs'] || false;
      this.noCompatMode  = options['noCompatMode'] || false;
      this.condenseFlow  = options['condenseFlow'] || false;
      this.quotingType   = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
      this.forceQuotes   = options['forceQuotes'] || false;
      this.replacer      = typeof options['replacer'] === 'function' ? options['replacer'] : null;

      this.implicitTypes = this.schema.compiledImplicit;
      this.explicitTypes = this.schema.compiledExplicit;

      this.tag = null;
      this.result = '';

      this.duplicates = [];
      this.usedDuplicates = null;
    }

    // Indents every line in a string. Empty lines (\n only) are not indented.
    function indentString(string, spaces) {
      var ind = common.repeat(' ', spaces),
          position = 0,
          next = -1,
          result = '',
          line,
          length = string.length;

      while (position < length) {
        next = string.indexOf('\n', position);
        if (next === -1) {
          line = string.slice(position);
          position = length;
        } else {
          line = string.slice(position, next + 1);
          position = next + 1;
        }

        if (line.length && line !== '\n') result += ind;

        result += line;
      }

      return result;
    }

    function generateNextLine(state, level) {
      return '\n' + common.repeat(' ', state.indent * level);
    }

    function testImplicitResolving(state, str) {
      var index, length, type;

      for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
        type = state.implicitTypes[index];

        if (type.resolve(str)) {
          return true;
        }
      }

      return false;
    }

    // [33] s-white ::= s-space | s-tab
    function isWhitespace(c) {
      return c === CHAR_SPACE || c === CHAR_TAB;
    }

    // Returns true if the character can be printed without escaping.
    // From YAML 1.2: "any allowed characters known to be non-printable
    // should also be escaped. [However,] This isn’t mandatory"
    // Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
    function isPrintable(c) {
      return  (0x00020 <= c && c <= 0x00007E)
          || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
          || ((0x0E000 <= c && c <= 0x00FFFD) && c !== CHAR_BOM)
          ||  (0x10000 <= c && c <= 0x10FFFF);
    }

    // [34] ns-char ::= nb-char - s-white
    // [27] nb-char ::= c-printable - b-char - c-byte-order-mark
    // [26] b-char  ::= b-line-feed | b-carriage-return
    // Including s-white (for some reason, examples doesn't match specs in this aspect)
    // ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark
    function isNsCharOrWhitespace(c) {
      return isPrintable(c)
        && c !== CHAR_BOM
        // - b-char
        && c !== CHAR_CARRIAGE_RETURN
        && c !== CHAR_LINE_FEED;
    }

    // [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
    //                             c = flow-in   ⇒ ns-plain-safe-in
    //                             c = block-key ⇒ ns-plain-safe-out
    //                             c = flow-key  ⇒ ns-plain-safe-in
    // [128] ns-plain-safe-out ::= ns-char
    // [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
    // [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
    //                            | ( /* An ns-char preceding */ “#” )
    //                            | ( “:” /* Followed by an ns-plain-safe(c) */ )
    function isPlainSafe(c, prev, inblock) {
      var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
      var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
      return (
        // ns-plain-safe
        inblock ? // c = flow-in
          cIsNsCharOrWhitespace
          : cIsNsCharOrWhitespace
            // - c-flow-indicator
            && c !== CHAR_COMMA
            && c !== CHAR_LEFT_SQUARE_BRACKET
            && c !== CHAR_RIGHT_SQUARE_BRACKET
            && c !== CHAR_LEFT_CURLY_BRACKET
            && c !== CHAR_RIGHT_CURLY_BRACKET
      )
        // ns-plain-char
        && c !== CHAR_SHARP // false on '#'
        && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
        || (isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP) // change to true on '[^ ]#'
        || (prev === CHAR_COLON && cIsNsChar); // change to true on ':[^ ]'
    }

    // Simplified test for values allowed as the first character in plain style.
    function isPlainSafeFirst(c) {
      // Uses a subset of ns-char - c-indicator
      // where ns-char = nb-char - s-white.
      // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
      return isPrintable(c) && c !== CHAR_BOM
        && !isWhitespace(c) // - s-white
        // - (c-indicator ::=
        // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
        && c !== CHAR_MINUS
        && c !== CHAR_QUESTION
        && c !== CHAR_COLON
        && c !== CHAR_COMMA
        && c !== CHAR_LEFT_SQUARE_BRACKET
        && c !== CHAR_RIGHT_SQUARE_BRACKET
        && c !== CHAR_LEFT_CURLY_BRACKET
        && c !== CHAR_RIGHT_CURLY_BRACKET
        // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
        && c !== CHAR_SHARP
        && c !== CHAR_AMPERSAND
        && c !== CHAR_ASTERISK
        && c !== CHAR_EXCLAMATION
        && c !== CHAR_VERTICAL_LINE
        && c !== CHAR_EQUALS
        && c !== CHAR_GREATER_THAN
        && c !== CHAR_SINGLE_QUOTE
        && c !== CHAR_DOUBLE_QUOTE
        // | “%” | “@” | “`”)
        && c !== CHAR_PERCENT
        && c !== CHAR_COMMERCIAL_AT
        && c !== CHAR_GRAVE_ACCENT;
    }

    // Simplified test for values allowed as the last character in plain style.
    function isPlainSafeLast(c) {
      // just not whitespace or colon, it will be checked to be plain character later
      return !isWhitespace(c) && c !== CHAR_COLON;
    }

    // Same as 'string'.codePointAt(pos), but works in older browsers.
    function codePointAt(string, pos) {
      var first = string.charCodeAt(pos), second;
      if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
        second = string.charCodeAt(pos + 1);
        if (second >= 0xDC00 && second <= 0xDFFF) {
          // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        }
      }
      return first;
    }

    // Determines whether block indentation indicator is required.
    function needIndentIndicator(string) {
      var leadingSpaceRe = /^\n* /;
      return leadingSpaceRe.test(string);
    }

    var STYLE_PLAIN   = 1,
        STYLE_SINGLE  = 2,
        STYLE_LITERAL = 3,
        STYLE_FOLDED  = 4,
        STYLE_DOUBLE  = 5;

    // Determines which scalar styles are possible and returns the preferred style.
    // lineWidth = -1 => no limit.
    // Pre-conditions: str.length > 0.
    // Post-conditions:
    //    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
    //    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
    //    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
    function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth,
      testAmbiguousType, quotingType, forceQuotes, inblock) {

      var i;
      var char = 0;
      var prevChar = null;
      var hasLineBreak = false;
      var hasFoldableLine = false; // only checked if shouldTrackWidth
      var shouldTrackWidth = lineWidth !== -1;
      var previousLineBreak = -1; // count the first line correctly
      var plain = isPlainSafeFirst(codePointAt(string, 0))
              && isPlainSafeLast(codePointAt(string, string.length - 1));

      if (singleLineOnly || forceQuotes) {
        // Case: no block styles.
        // Check for disallowed characters to rule out plain and single.
        for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
          char = codePointAt(string, i);
          if (!isPrintable(char)) {
            return STYLE_DOUBLE;
          }
          plain = plain && isPlainSafe(char, prevChar, inblock);
          prevChar = char;
        }
      } else {
        // Case: block styles permitted.
        for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
          char = codePointAt(string, i);
          if (char === CHAR_LINE_FEED) {
            hasLineBreak = true;
            // Check if any line can be folded.
            if (shouldTrackWidth) {
              hasFoldableLine = hasFoldableLine ||
                // Foldable line = too long, and not more-indented.
                (i - previousLineBreak - 1 > lineWidth &&
                 string[previousLineBreak + 1] !== ' ');
              previousLineBreak = i;
            }
          } else if (!isPrintable(char)) {
            return STYLE_DOUBLE;
          }
          plain = plain && isPlainSafe(char, prevChar, inblock);
          prevChar = char;
        }
        // in case the end is missing a \n
        hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
          (i - previousLineBreak - 1 > lineWidth &&
           string[previousLineBreak + 1] !== ' '));
      }
      // Although every style can represent \n without escaping, prefer block styles
      // for multiline, since they're more readable and they don't add empty lines.
      // Also prefer folding a super-long line.
      if (!hasLineBreak && !hasFoldableLine) {
        // Strings interpretable as another type have to be quoted;
        // e.g. the string 'true' vs. the boolean true.
        if (plain && !forceQuotes && !testAmbiguousType(string)) {
          return STYLE_PLAIN;
        }
        return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
      }
      // Edge case: block indentation indicator can only have one digit.
      if (indentPerLevel > 9 && needIndentIndicator(string)) {
        return STYLE_DOUBLE;
      }
      // At this point we know block styles are valid.
      // Prefer literal style unless we want to fold.
      if (!forceQuotes) {
        return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
      }
      return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
    }

    // Note: line breaking/folding is implemented for only the folded style.
    // NB. We drop the last trailing newline (if any) of a returned block scalar
    //  since the dumper adds its own newline. This always works:
    //    • No ending newline => unaffected; already using strip "-" chomping.
    //    • Ending newline    => removed then restored.
    //  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
    function writeScalar(state, string, level, iskey, inblock) {
      state.dump = (function () {
        if (string.length === 0) {
          return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
        }
        if (!state.noCompatMode) {
          if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
            return state.quotingType === QUOTING_TYPE_DOUBLE ? ('"' + string + '"') : ("'" + string + "'");
          }
        }

        var indent = state.indent * Math.max(1, level); // no 0-indent scalars
        // As indentation gets deeper, let the width decrease monotonically
        // to the lower bound min(state.lineWidth, 40).
        // Note that this implies
        //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
        //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
        // This behaves better than a constant minimum width which disallows narrower options,
        // or an indent threshold which causes the width to suddenly increase.
        var lineWidth = state.lineWidth === -1
          ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

        // Without knowing if keys are implicit/explicit, assume implicit for safety.
        var singleLineOnly = iskey
          // No block styles in flow mode.
          || (state.flowLevel > -1 && level >= state.flowLevel);
        function testAmbiguity(string) {
          return testImplicitResolving(state, string);
        }

        switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth,
          testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {

          case STYLE_PLAIN:
            return string;
          case STYLE_SINGLE:
            return "'" + string.replace(/'/g, "''") + "'";
          case STYLE_LITERAL:
            return '|' + blockHeader(string, state.indent)
              + dropEndingNewline(indentString(string, indent));
          case STYLE_FOLDED:
            return '>' + blockHeader(string, state.indent)
              + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
          case STYLE_DOUBLE:
            return '"' + escapeString(string) + '"';
          default:
            throw new exception('impossible error: invalid scalar style');
        }
      }());
    }

    // Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
    function blockHeader(string, indentPerLevel) {
      var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';

      // note the special case: the string '\n' counts as a "trailing" empty line.
      var clip =          string[string.length - 1] === '\n';
      var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
      var chomp = keep ? '+' : (clip ? '' : '-');

      return indentIndicator + chomp + '\n';
    }

    // (See the note for writeScalar.)
    function dropEndingNewline(string) {
      return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
    }

    // Note: a long line without a suitable break point will exceed the width limit.
    // Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
    function foldString(string, width) {
      // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
      // unless they're before or after a more-indented line, or at the very
      // beginning or end, in which case $k$ maps to $k$.
      // Therefore, parse each chunk as newline(s) followed by a content line.
      var lineRe = /(\n+)([^\n]*)/g;

      // first line (possibly an empty line)
      var result = (function () {
        var nextLF = string.indexOf('\n');
        nextLF = nextLF !== -1 ? nextLF : string.length;
        lineRe.lastIndex = nextLF;
        return foldLine(string.slice(0, nextLF), width);
      }());
      // If we haven't reached the first content line yet, don't add an extra \n.
      var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
      var moreIndented;

      // rest of the lines
      var match;
      while ((match = lineRe.exec(string))) {
        var prefix = match[1], line = match[2];
        moreIndented = (line[0] === ' ');
        result += prefix
          + (!prevMoreIndented && !moreIndented && line !== ''
            ? '\n' : '')
          + foldLine(line, width);
        prevMoreIndented = moreIndented;
      }

      return result;
    }

    // Greedy line breaking.
    // Picks the longest line under the limit each time,
    // otherwise settles for the shortest line over the limit.
    // NB. More-indented lines *cannot* be folded, as that would add an extra \n.
    function foldLine(line, width) {
      if (line === '' || line[0] === ' ') return line;

      // Since a more-indented line adds a \n, breaks can't be followed by a space.
      var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
      var match;
      // start is an inclusive index. end, curr, and next are exclusive.
      var start = 0, end, curr = 0, next = 0;
      var result = '';

      // Invariants: 0 <= start <= length-1.
      //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
      // Inside the loop:
      //   A match implies length >= 2, so curr and next are <= length-2.
      while ((match = breakRe.exec(line))) {
        next = match.index;
        // maintain invariant: curr - start <= width
        if (next - start > width) {
          end = (curr > start) ? curr : next; // derive end <= length-2
          result += '\n' + line.slice(start, end);
          // skip the space that was output as \n
          start = end + 1;                    // derive start <= length-1
        }
        curr = next;
      }

      // By the invariants, start <= length-1, so there is something left over.
      // It is either the whole string or a part starting from non-whitespace.
      result += '\n';
      // Insert a break if the remainder is too long and there is a break available.
      if (line.length - start > width && curr > start) {
        result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
      } else {
        result += line.slice(start);
      }

      return result.slice(1); // drop extra \n joiner
    }

    // Escapes a double-quoted string.
    function escapeString(string) {
      var result = '';
      var char = 0;
      var escapeSeq;

      for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
        char = codePointAt(string, i);
        escapeSeq = ESCAPE_SEQUENCES[char];

        if (!escapeSeq && isPrintable(char)) {
          result += string[i];
          if (char >= 0x10000) result += string[i + 1];
        } else {
          result += escapeSeq || encodeHex(char);
        }
      }

      return result;
    }

    function writeFlowSequence(state, level, object) {
      var _result = '',
          _tag    = state.tag,
          index,
          length,
          value;

      for (index = 0, length = object.length; index < length; index += 1) {
        value = object[index];

        if (state.replacer) {
          value = state.replacer.call(object, String(index), value);
        }

        // Write only valid elements, put null instead of invalid elements.
        if (writeNode(state, level, value, false, false) ||
            (typeof value === 'undefined' &&
             writeNode(state, level, null, false, false))) {

          if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
          _result += state.dump;
        }
      }

      state.tag = _tag;
      state.dump = '[' + _result + ']';
    }

    function writeBlockSequence(state, level, object, compact) {
      var _result = '',
          _tag    = state.tag,
          index,
          length,
          value;

      for (index = 0, length = object.length; index < length; index += 1) {
        value = object[index];

        if (state.replacer) {
          value = state.replacer.call(object, String(index), value);
        }

        // Write only valid elements, put null instead of invalid elements.
        if (writeNode(state, level + 1, value, true, true, false, true) ||
            (typeof value === 'undefined' &&
             writeNode(state, level + 1, null, true, true, false, true))) {

          if (!compact || _result !== '') {
            _result += generateNextLine(state, level);
          }

          if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
            _result += '-';
          } else {
            _result += '- ';
          }

          _result += state.dump;
        }
      }

      state.tag = _tag;
      state.dump = _result || '[]'; // Empty sequence if no valid values.
    }

    function writeFlowMapping(state, level, object) {
      var _result       = '',
          _tag          = state.tag,
          objectKeyList = Object.keys(object),
          index,
          length,
          objectKey,
          objectValue,
          pairBuffer;

      for (index = 0, length = objectKeyList.length; index < length; index += 1) {

        pairBuffer = '';
        if (_result !== '') pairBuffer += ', ';

        if (state.condenseFlow) pairBuffer += '"';

        objectKey = objectKeyList[index];
        objectValue = object[objectKey];

        if (state.replacer) {
          objectValue = state.replacer.call(object, objectKey, objectValue);
        }

        if (!writeNode(state, level, objectKey, false, false)) {
          continue; // Skip this pair because of invalid key;
        }

        if (state.dump.length > 1024) pairBuffer += '? ';

        pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

        if (!writeNode(state, level, objectValue, false, false)) {
          continue; // Skip this pair because of invalid value.
        }

        pairBuffer += state.dump;

        // Both key and value are valid.
        _result += pairBuffer;
      }

      state.tag = _tag;
      state.dump = '{' + _result + '}';
    }

    function writeBlockMapping(state, level, object, compact) {
      var _result       = '',
          _tag          = state.tag,
          objectKeyList = Object.keys(object),
          index,
          length,
          objectKey,
          objectValue,
          explicitPair,
          pairBuffer;

      // Allow sorting keys so that the output file is deterministic
      if (state.sortKeys === true) {
        // Default sorting
        objectKeyList.sort();
      } else if (typeof state.sortKeys === 'function') {
        // Custom sort function
        objectKeyList.sort(state.sortKeys);
      } else if (state.sortKeys) {
        // Something is wrong
        throw new exception('sortKeys must be a boolean or a function');
      }

      for (index = 0, length = objectKeyList.length; index < length; index += 1) {
        pairBuffer = '';

        if (!compact || _result !== '') {
          pairBuffer += generateNextLine(state, level);
        }

        objectKey = objectKeyList[index];
        objectValue = object[objectKey];

        if (state.replacer) {
          objectValue = state.replacer.call(object, objectKey, objectValue);
        }

        if (!writeNode(state, level + 1, objectKey, true, true, true)) {
          continue; // Skip this pair because of invalid key.
        }

        explicitPair = (state.tag !== null && state.tag !== '?') ||
                       (state.dump && state.dump.length > 1024);

        if (explicitPair) {
          if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
            pairBuffer += '?';
          } else {
            pairBuffer += '? ';
          }
        }

        pairBuffer += state.dump;

        if (explicitPair) {
          pairBuffer += generateNextLine(state, level);
        }

        if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
          continue; // Skip this pair because of invalid value.
        }

        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += ':';
        } else {
          pairBuffer += ': ';
        }

        pairBuffer += state.dump;

        // Both key and value are valid.
        _result += pairBuffer;
      }

      state.tag = _tag;
      state.dump = _result || '{}'; // Empty mapping if no valid pairs.
    }

    function detectType(state, object, explicit) {
      var _result, typeList, index, length, type, style;

      typeList = explicit ? state.explicitTypes : state.implicitTypes;

      for (index = 0, length = typeList.length; index < length; index += 1) {
        type = typeList[index];

        if ((type.instanceOf  || type.predicate) &&
            (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
            (!type.predicate  || type.predicate(object))) {

          if (explicit) {
            if (type.multi && type.representName) {
              state.tag = type.representName(object);
            } else {
              state.tag = type.tag;
            }
          } else {
            state.tag = '?';
          }

          if (type.represent) {
            style = state.styleMap[type.tag] || type.defaultStyle;

            if (_toString.call(type.represent) === '[object Function]') {
              _result = type.represent(object, style);
            } else if (_hasOwnProperty.call(type.represent, style)) {
              _result = type.represent[style](object, style);
            } else {
              throw new exception('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
            }

            state.dump = _result;
          }

          return true;
        }
      }

      return false;
    }

    // Serializes `object` and writes it to global `result`.
    // Returns true on success, or false on invalid object.
    //
    function writeNode(state, level, object, block, compact, iskey, isblockseq) {
      state.tag = null;
      state.dump = object;

      if (!detectType(state, object, false)) {
        detectType(state, object, true);
      }

      var type = _toString.call(state.dump);
      var inblock = block;
      var tagStr;

      if (block) {
        block = (state.flowLevel < 0 || state.flowLevel > level);
      }

      var objectOrArray = type === '[object Object]' || type === '[object Array]',
          duplicateIndex,
          duplicate;

      if (objectOrArray) {
        duplicateIndex = state.duplicates.indexOf(object);
        duplicate = duplicateIndex !== -1;
      }

      if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
        compact = false;
      }

      if (duplicate && state.usedDuplicates[duplicateIndex]) {
        state.dump = '*ref_' + duplicateIndex;
      } else {
        if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
          state.usedDuplicates[duplicateIndex] = true;
        }
        if (type === '[object Object]') {
          if (block && (Object.keys(state.dump).length !== 0)) {
            writeBlockMapping(state, level, state.dump, compact);
            if (duplicate) {
              state.dump = '&ref_' + duplicateIndex + state.dump;
            }
          } else {
            writeFlowMapping(state, level, state.dump);
            if (duplicate) {
              state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
            }
          }
        } else if (type === '[object Array]') {
          if (block && (state.dump.length !== 0)) {
            if (state.noArrayIndent && !isblockseq && level > 0) {
              writeBlockSequence(state, level - 1, state.dump, compact);
            } else {
              writeBlockSequence(state, level, state.dump, compact);
            }
            if (duplicate) {
              state.dump = '&ref_' + duplicateIndex + state.dump;
            }
          } else {
            writeFlowSequence(state, level, state.dump);
            if (duplicate) {
              state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
            }
          }
        } else if (type === '[object String]') {
          if (state.tag !== '?') {
            writeScalar(state, state.dump, level, iskey, inblock);
          }
        } else if (type === '[object Undefined]') {
          return false;
        } else {
          if (state.skipInvalid) return false;
          throw new exception('unacceptable kind of an object to dump ' + type);
        }

        if (state.tag !== null && state.tag !== '?') {
          // Need to encode all characters except those allowed by the spec:
          //
          // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
          // [36] ns-hex-digit    ::=  ns-dec-digit
          //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
          // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
          // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
          // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
          //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
          //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
          //
          // Also need to encode '!' because it has special meaning (end of tag prefix).
          //
          tagStr = encodeURI(
            state.tag[0] === '!' ? state.tag.slice(1) : state.tag
          ).replace(/!/g, '%21');

          if (state.tag[0] === '!') {
            tagStr = '!' + tagStr;
          } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
            tagStr = '!!' + tagStr.slice(18);
          } else {
            tagStr = '!<' + tagStr + '>';
          }

          state.dump = tagStr + ' ' + state.dump;
        }
      }

      return true;
    }

    function getDuplicateReferences(object, state) {
      var objects = [],
          duplicatesIndexes = [],
          index,
          length;

      inspectNode(object, objects, duplicatesIndexes);

      for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
        state.duplicates.push(objects[duplicatesIndexes[index]]);
      }
      state.usedDuplicates = new Array(length);
    }

    function inspectNode(object, objects, duplicatesIndexes) {
      var objectKeyList,
          index,
          length;

      if (object !== null && typeof object === 'object') {
        index = objects.indexOf(object);
        if (index !== -1) {
          if (duplicatesIndexes.indexOf(index) === -1) {
            duplicatesIndexes.push(index);
          }
        } else {
          objects.push(object);

          if (Array.isArray(object)) {
            for (index = 0, length = object.length; index < length; index += 1) {
              inspectNode(object[index], objects, duplicatesIndexes);
            }
          } else {
            objectKeyList = Object.keys(object);

            for (index = 0, length = objectKeyList.length; index < length; index += 1) {
              inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
            }
          }
        }
      }
    }

    function dump$1(input, options) {
      options = options || {};

      var state = new State(options);

      if (!state.noRefs) getDuplicateReferences(input, state);

      var value = input;

      if (state.replacer) {
        value = state.replacer.call({ '': value }, '', value);
      }

      if (writeNode(state, 0, value, true, true)) return state.dump + '\n';

      return '';
    }

    var dump_1 = dump$1;

    var dumper = {
    	dump: dump_1
    };

    function renamed(from, to) {
      return function () {
        throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' +
          'Use yaml.' + to + ' instead, which is now safe by default.');
      };
    }


    var Type                = type;
    var Schema              = schema;
    var FAILSAFE_SCHEMA     = failsafe;
    var JSON_SCHEMA         = json;
    var CORE_SCHEMA         = core;
    var DEFAULT_SCHEMA      = _default;
    var load                = loader.load;
    var loadAll             = loader.loadAll;
    var dump                = dumper.dump;
    var YAMLException       = exception;

    // Re-export all types in case user wants to create custom schema
    var types = {
      binary:    binary,
      float:     float,
      map:       map,
      null:      _null,
      pairs:     pairs,
      set:       set,
      timestamp: timestamp,
      bool:      bool,
      int:       int,
      merge:     merge$1,
      omap:      omap,
      seq:       seq,
      str:       str
    };

    // Removed functions from JS-YAML 3.0.x
    var safeLoad            = renamed('safeLoad', 'load');
    var safeLoadAll         = renamed('safeLoadAll', 'loadAll');
    var safeDump            = renamed('safeDump', 'dump');

    var jsYaml = {
    	Type: Type,
    	Schema: Schema,
    	FAILSAFE_SCHEMA: FAILSAFE_SCHEMA,
    	JSON_SCHEMA: JSON_SCHEMA,
    	CORE_SCHEMA: CORE_SCHEMA,
    	DEFAULT_SCHEMA: DEFAULT_SCHEMA,
    	load: load,
    	loadAll: loadAll,
    	dump: dump,
    	YAMLException: YAMLException,
    	types: types,
    	safeLoad: safeLoad,
    	safeLoadAll: safeLoadAll,
    	safeDump: safeDump
    };

    var yaml = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': jsYaml,
        CORE_SCHEMA: CORE_SCHEMA,
        DEFAULT_SCHEMA: DEFAULT_SCHEMA,
        FAILSAFE_SCHEMA: FAILSAFE_SCHEMA,
        JSON_SCHEMA: JSON_SCHEMA,
        Schema: Schema,
        Type: Type,
        YAMLException: YAMLException,
        dump: dump,
        load: load,
        loadAll: loadAll,
        safeDump: safeDump,
        safeLoad: safeLoad,
        safeLoadAll: safeLoadAll,
        types: types
    });

    // turns a dict with a single slot into a dict with a type tag.
    function AsTypeTaggedDict(x) {
        let res = { type: '', data: undefined };
        for (const k in x) {
            if (Object.prototype.hasOwnProperty.call(x, k)) {
                const data = x[k];
                res.type = k;
                res.data = data;
            }
        }
        return res;
    }

    function _pushComponentCall(x, name, args) {
        x.push({ _: Seven.SevenMachineInstrType.CALL_COMPONENT, name, args });
    }
    // returns ms.
    const REGEX_TIMESPAN = /(?:(\d+)m)?(?:(\d+)s)?/;
    function _timespanParser(x) {
        let matchres = REGEX_TIMESPAN.exec(x);
        if (!matchres) {
            return undefined;
        }
        return (parseInt(matchres[1] || '0', 10) * 60 + parseInt(matchres[2] || '0', 10)) * 1000;
    }

    var ConversationDisplayAnchor;
    (function (ConversationDisplayAnchor) {
        // these two are for halfview.
        ConversationDisplayAnchor["LEFT"] = "left";
        ConversationDisplayAnchor["RIGHT"] = "right";
        // these four are for chatbox.
        ConversationDisplayAnchor["TOP_LEFT"] = "top_left";
        ConversationDisplayAnchor["TOP_RIGHT"] = "top_right";
        ConversationDisplayAnchor["BOTTOM_LEFT"] = "bottom_left";
        ConversationDisplayAnchor["BOTTOM_RIGHT"] = "bottom_right";
    })(ConversationDisplayAnchor || (ConversationDisplayAnchor = {}));
    var ConversationPhraseType;
    (function (ConversationPhraseType) {
        ConversationPhraseType[ConversationPhraseType["NARRATOR"] = 1] = "NARRATOR";
        ConversationPhraseType[ConversationPhraseType["CHARACTER"] = 2] = "CHARACTER";
        ConversationPhraseType[ConversationPhraseType["HEADER"] = 3] = "HEADER";
        ConversationPhraseType[ConversationPhraseType["BRANCHING"] = 4] = "BRANCHING";
    })(ConversationPhraseType || (ConversationPhraseType = {}));
    var ConversationSizeMode;
    (function (ConversationSizeMode) {
        ConversationSizeMode["FULLVIEW"] = "fullview";
        ConversationSizeMode["CHATBOX"] = "chatbox";
        ConversationSizeMode["HALFVIEW"] = "halfview";
    })(ConversationSizeMode || (ConversationSizeMode = {}));
    var ConversationDisplayMode;
    (function (ConversationDisplayMode) {
        ConversationDisplayMode[ConversationDisplayMode["DEFAULT"] = 1] = "DEFAULT";
        ConversationDisplayMode[ConversationDisplayMode["RECALL"] = 2] = "RECALL";
    })(ConversationDisplayMode || (ConversationDisplayMode = {}));
    const DEFAULT_SIZE_MODE = ConversationSizeMode.FULLVIEW;
    const DEFAULT_DISPLAY_MODE = ConversationDisplayMode.DEFAULT;
    const DEFAULT_DISPLAY_ANCHOR = ConversationDisplayAnchor.BOTTOM_LEFT;
    function _ConversationStore() {
        let store = {
            currentPhraseListState: {
                currentSizeMode: accessible(DEFAULT_SIZE_MODE),
                currentDisplayMode: accessible(DEFAULT_DISPLAY_MODE),
                currentDisplayAnchor: accessible(DEFAULT_DISPLAY_ANCHOR),
            },
            characterDict: {},
            currentOutline: [],
            currentPhrases: accessible([]),
            currentBackground: accessible({
                type: 'color',
                color: 'white'
            }),
            currentHalfview: accessible({
                type: 'color',
                color: 'black'
            }),
            reset: () => {
                store.characterDict = {};
                store.currentOutline = [];
                store.currentPhrases.set([]);
                store.currentPhraseListState.currentSizeMode.set(DEFAULT_SIZE_MODE);
                store.currentPhraseListState.currentDisplayMode.set(DEFAULT_DISPLAY_MODE);
                store.currentPhraseListState.currentDisplayAnchor.set(DEFAULT_DISPLAY_ANCHOR);
            },
            setCharacterDict: (characterDict) => {
                store.characterDict = characterDict;
            },
            setCharacterIcon: (name, iconDict) => {
                store.characterDict[name].iconDict = iconDict;
            },
            nextPhraseWith: (x) => {
                let phraseList = store.currentPhrases;
                phraseList.getValue().push(x);
                phraseList.set(phraseList.getValue());
            },
            setBackground: (descriptor) => {
                store.currentBackground.set(descriptor);
            },
            setSizeMode(x) {
                store.currentPhraseListState.currentSizeMode.set(x);
            },
            setDisplayMode(x) {
                store.currentPhraseListState.currentDisplayMode.set(x);
            },
            setDisplayAnchor(x) {
                store.currentPhraseListState.currentDisplayAnchor.set(x);
            },
            setHalfview: (newHalfview) => {
                store.currentHalfview.set(newHalfview);
            },
        };
        return store;
    }
    var ConversationStore = _ConversationStore();

    // NOTE: requires x to be a type-tagged dict.
    function isMachineCommonInstr(x) {
        return [
            'pause',
            'wait',
        ].includes(x.type);
    }
    // NOTE: requires x to be a type-tagged dict.
    function compileMachineCommonInstr(res, x) {
        switch (x.type) {
            case 'wait': {
                _pushComponentCall(res, CommonSevenComponentIndex.Wait, { ms: _timespanParser(x.data) });
                break;
            }
            case 'pause': {
                _pushComponentCall(res, CommonSevenComponentIndex.Pause, {});
                break;
            }
        }
    }

    function CompileForConversation(res, x) {
        let characterDict = {};
        x.character && x.character.forEach((v) => {
            characterDict[v.name] = {
                name: v.name,
                iconUrl: v.icon,
                iconDict: {},
                position: v.position,
            };
        });
        let branchResolveRequest = [];
        _pushComponentCall(res, ConversationSevenComponentIndex.SetCharacter, { characterDict: characterDict });
        for (let i = 0; i < x.contents.length; i++) {
            let v = AsTypeTaggedDict(x.contents[i]);
            // if (isFlowControlStatement(v)) { continue; }
            if (isMachineCommonInstr(v)) {
                compileMachineCommonInstr(res, v);
                continue;
            }
            switch (v.type) {
                case 'h1': {
                    _pushComponentCall(res, ConversationSevenComponentIndex.Header, { level: 1, text: v.data });
                    break;
                }
                case 'h2': {
                    _pushComponentCall(res, ConversationSevenComponentIndex.Header, { level: 2, text: v.data });
                    break;
                }
                case 'h3': {
                    _pushComponentCall(res, ConversationSevenComponentIndex.Header, { level: 3, text: v.data });
                    break;
                }
                case '_': {
                    _pushComponentCall(res, ConversationSevenComponentIndex.Narrator, { text: v.data });
                    break;
                }
                case 'talk': {
                    let position = v.data.position || characterDict[v.data.name].position || 'left';
                    let defaultIconUrl = characterDict[v.data.name].iconUrl;
                    let iconUrl = (v.data.emotion &&
                        characterDict[v.data.name].iconDict[v.data.emotion] ?
                        characterDict[v.data.name].iconDict[v.data.emotion]
                        : defaultIconUrl);
                    v.data.text.forEach((t, i) => {
                        _pushComponentCall(res, ConversationSevenComponentIndex.Text, {
                            name: v.data.name,
                            position: position,
                            iconUrl: iconUrl,
                            text: t,
                            _order: i,
                        });
                    });
                    break;
                }
                case 'message': {
                    _pushComponentCall(res, ConversationSevenComponentIndex.SendMessage, {
                        data: load(v.data),
                        stopAfterSend: true,
                    });
                    break;
                }
                case 'mode': {
                    _pushComponentCall(res, ConversationSevenComponentIndex.SetMode, { mode: v.data });
                    break;
                }
                case 'bg': {
                    _pushComponentCall(res, ConversationSevenComponentIndex.SetBackground, { type: v.data.type, url: v.data.url, color: v.data.color });
                    break;
                }
                case 'halfview': {
                    _pushComponentCall(res, ConversationSevenComponentIndex.SetMode, { mode: 'halfview' });
                    _pushComponentCall(res, ConversationSevenComponentIndex.SetHalfview, v.data);
                    break;
                }
                case 'chatbox': {
                    _pushComponentCall(res, ConversationSevenComponentIndex.SetMode, { mode: 'chatbox' });
                    _pushComponentCall(res, ConversationSevenComponentIndex.SetAnchor, { anchor: v.data });
                    break;
                }
                case 'branch': {
                    let resolveRequest = {
                        branchList: v.data
                    };
                    branchResolveRequest.push(resolveRequest);
                    _pushComponentCall(res, ConversationSevenComponentIndex.Branch, resolveRequest);
                    break;
                }
                case 'select': {
                    break;
                }
                default: {
                    res.push({ _: undefined, _instr: v });
                    break;
                }
            }
        }
        // pass2: label resolve.
        return {
            pass: 2,
            branchResolveRequest: branchResolveRequest
        };
    }

    let resolveRequest = [];
    function _pass1_generation(x) {
        let res = [];
        _pushComponentCall(res, CommonSevenComponentIndex.Reset, {});
        if (x.title) {
            _pushComponentCall(res, CommonSevenComponentIndex.SetTitle, { title: x.title });
        }
        if (x.description) {
            _pushComponentCall(res, CommonSevenComponentIndex.SetDescription, { description: x.description });
        }
        if (!x.main) {
            x.main = load(x.raw_main);
        }
        let i = 0;
        while (x.main[i]) {
            let X = AsTypeTaggedDict(x.main[i]);
            if (isMachineCommonInstr(X)) {
                compileMachineCommonInstr(res, X);
                continue;
            }
            switch (X.type) {
                case '(load_file)': {
                    _pushComponentCall(res, CommonSevenComponentIndex.LoadFile, { fileName: X.data });
                    break;
                }
                case 'info': {
                    _pushComponentCall(res, CommonSevenComponentIndex.SetMode, { modeType: 'info' });
                    _pushComponentCall(res, InfoSevenComponentIndex.LoadInfoPage, {
                        pageList: X.data.contents.map((v) => {
                            let res = {};
                            res.format = v.type || 'markdown';
                            res.content = v.content;
                            if (v.bgurl) {
                                res.backgroundImageUrl = v.bgurl;
                            }
                            return res;
                        }),
                        _bgList: X.data.contents.filter((v) => v.bgurl && v.bgurl.trim()).map((v) => v.bgurl),
                    });
                    _pushComponentCall(res, CommonSevenComponentIndex.Pause, {});
                    break;
                }
                case 'segue': {
                    _pushComponentCall(res, CommonSevenComponentIndex.SetMode, { modeType: 'segue' });
                    _pushComponentCall(res, SegueSevenComponentIndex.Set, {
                        title: X.data.title || undefined,
                        topTitle: X.data.toptitle || undefined,
                        subTitle: X.data.subtitle || undefined,
                        bgUrl: X.data.bg || undefined,
                        position: X.data.position || undefined,
                    });
                    break;
                }
                case 'conversation': {
                    _pushComponentCall(res, CommonSevenComponentIndex.SetMode, {
                        modeType: 'conversation'
                    });
                    _pushComponentCall(res, ConversationSevenComponentIndex.Clear, {});
                    // NOTE: an empty `contents` block should be skipped.
                    if (!X.data.contents) {
                        return;
                    }
                    resolveRequest.push(CompileForConversation(res, X.data));
                    break;
                }
                default: {
                    res.push({ _: undefined, _instr: X });
                    break;
                }
            }
            i++;
        }
        return res;
    }
    // TODO: this won't resolve labels defined inside containers. fix this.
    function _pass2_labelResolve(x, base = 0) {
        let res = {};
        let resultCounter = base;
        let resolved = [];
        for (let i = 0; i < x.length; i++) {
            let v = x[i];
            if (v._ === undefined && v._instr.type === '(label)') {
                res[v._instr.data] = resultCounter;
            }
            else {
                resolved.push(v);
                resultCounter++;
            }
        }
        console.log(res);
        resolveRequest.filter((v) => v.pass === 2).forEach((v) => {
            console.log(v);
            if (v.branchResolveRequest) {
                v.branchResolveRequest.forEach((b) => {
                    b.branchList.forEach((v) => {
                        v.target = res[v.target];
                    });
                });
            }
        });
        return {
            labelDict: res,
            result: resolved,
        };
    }
    function _pass3_gotoResolve(x) {
        let res = [];
        for (let i = 0; i < x.result.length; i++) {
            let v = x.result[i];
            if (v._ === undefined && v._instr.type === '(goto)') {
                // TODO: ...
                res.push({ _: Seven.SevenMachineInstrType.GOTO, target: x.labelDict[v._instr.data] });
            }
            else {
                res.push(v);
            }
        }
        return res;
    }
    function _pass4_emptyInstrCheck(x) {
        for (let i = 0; i < x.length; i++) {
            const v = x[i];
            if (v._ === undefined) {
                ErrorComponent.call({
                    header: 'JIT produced unusable data.',
                    message: JSON.stringify(x, undefined, '    '),
                }, MACHINE);
                throw new Error();
            }
        }
    }
    function jit(x) {
        console.log(x);
        resolveRequest = [];
        let pass1Result = _pass1_generation(x);
        let pass2Result = _pass2_labelResolve(pass1Result);
        let pass3Result = _pass3_gotoResolve(pass2Result);
        console.log(pass3Result);
        _pass4_emptyInstrCheck(pass3Result);
        return pass3Result;
    }

    var SegueTitlePosition;
    (function (SegueTitlePosition) {
        SegueTitlePosition["BOTTOM_LEFT"] = "bottom_left";
        SegueTitlePosition["CENTER"] = "center";
    })(SegueTitlePosition || (SegueTitlePosition = {}));
    function _SegueStore() {
        const { subscribe, getValue, set, update } = accessible({
            currentTitle: '',
            currentTopTitle: '',
            currentSubTitle: '',
            currentBgUrl: '',
            currentPosition: SegueTitlePosition.CENTER,
        });
        return {
            subscribe,
            getValue,
            reset: () => {
                set({
                    currentTitle: '',
                    currentTopTitle: '',
                    currentSubTitle: '',
                    currentBgUrl: '',
                    currentPosition: SegueTitlePosition.CENTER,
                });
            },
            set,
        };
    }
    let _store = _SegueStore();

    // NOTE: 一般而言info的内容是整个变动，不大会出现单独更新一页的情况。
    function _InfoStore() {
        let store = {
            pages: accessible([]),
            currentPage: accessible(0),
            currentBgUrl: [],
            reset: () => {
                store.pages.set([]);
                store.currentPage.set(0);
            },
            loadInfoPage: (pageList, cacheBgList = []) => {
                store.currentBgUrl = cacheBgList;
                store.pages.set(pageList);
                store.currentPage.set(0);
            },
            setCurrentPageIndex: (pageIndex) => {
                store.currentPage.set(pageIndex);
            },
            appendInfoPage: (page, index) => {
                if (index === undefined) {
                    store.pages.getValue().push(page);
                }
                else {
                    store.pages.getValue().splice(index, 0, page);
                }
                store.pages.set(store.pages.getValue());
            },
            changeInfoPage: (newPage, pageIndex) => {
                store.pages.getValue()[pageIndex] = newPage;
                store.pages.set(store.pages.getValue());
            },
            deleteInfoPage: (pageIndex) => {
                if (store.currentPage.getValue() === pageIndex) {
                    store.currentPage.update((v) => v === 0 ? 0 : v - 1);
                }
                else {
                    store.pages.getValue().splice(pageIndex, 1);
                    store.pages.set(store.pages.getValue());
                }
            },
            hasPrevPage: () => {
                return store.currentPage.getValue() > 0;
            },
            hasNextPage: () => {
                return store.currentPage.getValue() + 1 < store.pages.getValue().length;
            },
            prevPage: () => {
                if (store.currentPage.getValue() > 0) {
                    store.currentPage.update((v) => v - 1);
                }
            },
            nextPage: () => {
                if (store.currentPage.getValue() + 1 < store.pages.getValue().length) {
                    store.currentPage.update((v) => v + 1);
                }
            },
        };
        return store;
    }
    var InfoStore = _InfoStore();

    var EMode;
    (function (EMode) {
        EMode["TOC"] = "toc";
        EMode["SEGUE"] = "segue";
        EMode["CONVERSATION"] = "conversation";
        EMode["INFO"] = "info";
    })(EMode || (EMode = {}));
    function _MachineStore() {
        let store = {
            currentMode: accessible(EMode.SEGUE),
            Segue: _store,
            Conversation: ConversationStore,
            Info: InfoStore,
            reset: () => {
                store.currentMode.set(EMode.SEGUE);
                store.Segue.reset();
            },
            mode: (x) => {
                store.currentMode.set(x);
            }
        };
        return store;
    }
    var MachineStore = _MachineStore();

    const ResetComponent = {
        name: CommonSevenComponentIndex.Reset,
        call: (args) => {
            [].forEach((v) => v.reset());
            return true;
        }
    };
    const ListenComponent = {
        name: CommonSevenComponentIndex.Listen,
        call: (args, machine) => {
            machine.variableMap[args.name].subscribe(args.callback);
            return true;
        }
    };
    const PauseComponent = {
        name: CommonSevenComponentIndex.Pause,
        call: () => {
            // intentionally left blank.
            // when `call` does not return any `true`-equivalent value the
            // machine will stop stepping, hence it's `PAUSE`.
        }
    };
    const LoadComponent = {
        name: CommonSevenComponentIndex.Load,
        call: (args, machine) => {
            try {
                let jitted = jit(args.data);
                machine.loadProgram(jitted);
                machine.unlock();
                SystemStateStore.ready();
                machine.step();
            }
            catch (e) {
                SystemErrorStore.error(e.message, `Source data:
                <pre>${JSON.stringify(args.data, undefined, '    ')}</pre>
                Generated data:
                <pre>${JSON.stringify(e.data, undefined, '    ')}</pre>
                `);
                SystemStateStore.currentStatus.set(SystemCurrentStatus.ERROR);
            }
        }
    };
    const LoadFileComponent = {
        name: CommonSevenComponentIndex.LoadFile,
        call: (args, machine) => {
            var _a;
            try {
                let data = (_a = window.__CSARDAS) === null || _a === void 0 ? void 0 : _a.session.docsJson[args.fileName];
                if (!data) {
                    throw {
                        message: `No file named ${args.fileName}`,
                    };
                }
                let jitted = jit(data);
                machine.loadProgram(jitted);
                machine.unlock();
                SystemStateStore.ready();
                machine.step();
            }
            catch (e) {
                SystemErrorStore.error(e.message, `Source file:
                <pre>${JSON.stringify(args.fileName, undefined, '    ')}</pre>
                Generated data:
                <pre>${JSON.stringify(e.data, undefined, '    ')}</pre>
                `);
                SystemStateStore.currentStatus.set(SystemCurrentStatus.ERROR);
            }
        }
    };
    const SetMachineModeComponent = {
        name: CommonSevenComponentIndex.SetMode,
        call: (args, machine) => {
            console.log(`Switch mode: ${args.modeType}`);
            MachineStore.mode(args.modeType);
            return true;
        }
    };

    class ConversationMessageReceiverManager {
        static get currentMessageReceiver() { return ConversationMessageReceiverManager._currentMessageReceiver; }
        static registerCurrentMessageReceiver(x) {
            ConversationMessageReceiverManager._currentMessageReceiver = x;
            while (ConversationMessageReceiverManager._messageQueue.length > 0) {
                x.contentWindow.postMessage(ConversationMessageReceiverManager._messageQueue.shift(), '*');
            }
        }
        static sendMessage(x) {
            if (!ConversationMessageReceiverManager._currentMessageReceiver) {
                this._messageQueue.push();
            }
            else {
                ConversationMessageReceiverManager._currentMessageReceiver.contentWindow.postMessage(x, '*');
            }
        }
    }
    ConversationMessageReceiverManager._messageQueue = [];

    const ConversationHeaderComponent = {
        name: ConversationSevenComponentIndex.Header,
        call: (args, m) => {
            MachineStore.Conversation.nextPhraseWith({
                type: ConversationPhraseType.HEADER,
                level: args.level,
                text: args.text
            });
        }
    };
    const ConversationNarratorComponent = {
        name: ConversationSevenComponentIndex.Narrator,
        call: (args, m) => {
            MachineStore.Conversation.nextPhraseWith({
                type: ConversationPhraseType.NARRATOR,
                text: args.text
            });
        }
    };
    const ConversationSetCharacterComponent = {
        name: ConversationSevenComponentIndex.SetCharacter,
        call: (args, m) => {
            MachineStore.Conversation.setCharacterDict(args.characterDict);
            return true;
        }
    };
    const ConversationTextComponent = {
        name: ConversationSevenComponentIndex.Text,
        call: (args, m) => {
            MachineStore.Conversation.nextPhraseWith(Object.assign({ type: ConversationPhraseType.CHARACTER }, args));
        }
    };
    const ConversationSetBackgroundComponent = {
        name: ConversationSevenComponentIndex.SetBackground,
        call: (args, m) => {
            MachineStore.Conversation.setBackground(args);
            return true;
        }
    };
    const ConversationSetModeComponent = {
        name: ConversationSevenComponentIndex.SetMode,
        call: (args, m) => {
            MachineStore.Conversation.setSizeMode(args.mode);
            return true;
        }
    };
    const ConversationSetAnchorComponent = {
        name: ConversationSevenComponentIndex.SetAnchor,
        call: (args, m) => {
            MachineStore.Conversation.setDisplayAnchor(args.anchor);
            return true;
        }
    };
    const ConversationClearComponent = {
        name: ConversationSevenComponentIndex.Clear,
        call: (args, m) => {
            MachineStore.Conversation.reset();
            return true;
        }
    };
    const ConversationHalfviewComponent = {
        name: ConversationSevenComponentIndex.SetHalfview,
        call: (args, m) => {
            MachineStore.Conversation.setHalfview(args);
            return true;
        }
    };
    const ConversationBranchComponent = {
        name: ConversationSevenComponentIndex.Branch,
        call: (args, m) => {
            console.log(args);
            MachineStore.Conversation.nextPhraseWith({
                type: ConversationPhraseType.BRANCHING,
                choice: args.branchList
            });
        }
    };
    const ConversationSendMessageComponent = {
        name: ConversationSevenComponentIndex.SendMessage,
        call: (args, m) => {
            ConversationMessageReceiverManager.sendMessage({ data: args.data });
            return !!!args.stopAfterSend;
        }
    };

    const LoadInfoPageComponent = {
        name: InfoSevenComponentIndex.LoadInfoPage,
        call: (args, m) => {
            MachineStore.Info.loadInfoPage(args.pageList, args._bgList);
            return true;
        }
    };
    /*
    export const ChangeInfoPageComponent: SevenComponent = {
        name: InfoSevenComponentIndex.ChangeInfoPage,
        call: (args: {[name: string]: any}, m: SevenMachine) => {

        }
    };
    */
    const InfoAppendPageComponent = {
        name: InfoSevenComponentIndex.AppendInfoPage,
        call: (args, m) => {
            MachineStore.Info.appendInfoPage(args.page, args.index);
            return true;
        }
    };
    const InfoGotoPageComponent = {
        name: InfoSevenComponentIndex.SetCurrentPageIndex,
        call: (args, m) => {
            MachineStore.Info.setCurrentPageIndex(args.pageIndex);
            return true;
        }
    };
    const InfoDeletePageComponent = {
        name: InfoSevenComponentIndex.DeleteInfoPage,
        call: (args, m) => {
            MachineStore.Info.deleteInfoPage(args.pageIndex);
            return true;
        }
    };
    const InfoPrevPageComponent = {
        name: InfoSevenComponentIndex.PrevPage,
        call: (args, m) => {
            MachineStore.Info.prevPage();
            return true;
        }
    };
    const InfoNextPageComponent = {
        name: InfoSevenComponentIndex.NextPage,
        call: (args, m) => {
            MachineStore.Info.nextPage();
            return true;
        }
    };

    const SegueSetComponent = {
        name: SegueSevenComponentIndex.Set,
        call: (args) => {
            MachineStore.Segue.set({
                currentTitle: args.title || '',
                currentTopTitle: args.topTitle || '',
                currentSubTitle: args.subTitle || '',
                currentBgUrl: args.bgUrl || '',
                currentPosition: args.position || 'center',
            });
        }
    };

    const MACHINE = new Seven.SevenMachine();
    [
        SetTitleComponent,
        SetDescriptionComponent,
        ErrorComponent,
        ResetComponent,
        ListenComponent,
        PauseComponent,
        LoadComponent,
        LoadFileComponent,
        SetMachineModeComponent,
        // segue.
        SegueSetComponent,
        // conversation.
        ConversationHeaderComponent,
        ConversationNarratorComponent,
        ConversationTextComponent,
        ConversationSetBackgroundComponent,
        ConversationSetModeComponent,
        ConversationSetCharacterComponent,
        ConversationSetAnchorComponent,
        ConversationHalfviewComponent,
        ConversationBranchComponent,
        ConversationClearComponent,
        ConversationSendMessageComponent,
        // info.
        LoadInfoPageComponent,
        InfoAppendPageComponent,
        InfoGotoPageComponent,
        InfoDeletePageComponent,
        InfoPrevPageComponent,
        InfoNextPageComponent,
    ].forEach((v) => MACHINE.registerComponent(v));
    console.log(`SevenMachine component registration complete.`);

    const SYSTEM_NAME = 'Csárdás Lite';
    const SYSTEM_VER = 'v0.1.0 2021.11.6';

    /* src/component/ErrorScreen.svelte generated by Svelte v3.44.1 */
    const file$f = "src/component/ErrorScreen.svelte";

    // (17:8) {#if header}
    function create_if_block$a(ctx) {
    	let h3;
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			i = element("i");
    			t = text(/*header*/ ctx[1]);
    			add_location(i, file$f, 16, 56, 607);
    			attr_dev(h3, "class", "error-screen-header-msg svelte-1e6zm7j");
    			add_location(h3, file$f, 16, 20, 571);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, i);
    			append_dev(i, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*header*/ 2) set_data_dev(t, /*header*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(17:8) {#if header}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let html_tag;
    	let raw_value = /*msg*/ ctx[0].replaceAll('\n', '<br />') + "";
    	let t1;
    	let br0;
    	let t2;
    	let div1;
    	let span0;
    	let t4;
    	let span1;
    	let t6;
    	let br1;
    	let t7;
    	let i;
    	let t8;
    	let t9;
    	let t10;
    	let br2;
    	let if_block = /*header*/ ctx[1] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			html_tag = new HtmlTag();
    			t1 = space();
    			br0 = element("br");
    			t2 = space();
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "ERROR.";
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "†";
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			i = element("i");
    			t8 = text("CAI System \"");
    			t9 = text(SYSTEM_NAME);
    			t10 = text("\"");
    			br2 = element("br");
    			html_tag.a = t1;
    			add_location(br0, file$f, 18, 8, 690);
    			attr_dev(div0, "class", "error-screen-msg-container svelte-1e6zm7j");
    			add_location(div0, file$f, 15, 4, 510);
    			attr_dev(span0, "class", "error-screen-prompt svelte-1e6zm7j");
    			add_location(span0, file$f, 21, 8, 766);
    			attr_dev(span1, "class", "error-screen-ornament svelte-1e6zm7j");
    			attr_dev(span1, "alt", "Waiting screen ornament");
    			add_location(span1, file$f, 22, 8, 822);
    			add_location(br1, file$f, 23, 8, 912);
    			add_location(br2, file$f, 24, 37, 956);
    			add_location(i, file$f, 24, 8, 927);
    			attr_dev(div1, "class", "error-screen-ornament-container svelte-1e6zm7j");
    			add_location(div1, file$f, 20, 4, 712);
    			attr_dev(div2, "class", "error-screen svelte-1e6zm7j");
    			add_location(div2, file$f, 14, 0, 479);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t0);
    			html_tag.m(raw_value, div0);
    			append_dev(div0, t1);
    			append_dev(div0, br0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(div1, t4);
    			append_dev(div1, span1);
    			append_dev(div1, t6);
    			append_dev(div1, br1);
    			append_dev(div1, t7);
    			append_dev(div1, i);
    			append_dev(i, t8);
    			append_dev(i, t9);
    			append_dev(i, t10);
    			append_dev(i, br2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*header*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					if_block.m(div0, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*msg*/ 1 && raw_value !== (raw_value = /*msg*/ ctx[0].replaceAll('\n', '<br />') + "")) html_tag.p(raw_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ErrorScreen', slots, []);
    	let msg = '';
    	let header = '';

    	// NOTE: we must stop executing stuff when an error happened.
    	onMount(() => {
    		MACHINE.lock();
    		$$invalidate(0, msg = SystemErrorStore.getValue().message || '');
    		$$invalidate(1, header = SystemErrorStore.getValue().headerMessage || '');
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ErrorScreen> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		MACHINE,
    		SYSTEM_NAME,
    		SystemErrorStore,
    		msg,
    		header
    	});

    	$$self.$inject_state = $$props => {
    		if ('msg' in $$props) $$invalidate(0, msg = $$props.msg);
    		if ('header' in $$props) $$invalidate(1, header = $$props.header);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [msg, header];
    }

    class ErrorScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ErrorScreen",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/component/demonstration/ConversationHalfview.svelte generated by Svelte v3.44.1 */

    const { console: console_1$3 } = globals;
    const file$e = "src/component/demonstration/ConversationHalfview.svelte";

    // (20:42) 
    function create_if_block_2$4(ctx) {
    	let div;
    	let t;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(" ");
    			attr_dev(div, "id", "conversation-halfview-color");
    			attr_dev(div, "style", div_style_value = `background-color:${/*descriptor*/ ctx[0].color}`);
    			attr_dev(div, "class", "svelte-1yzlfdm");
    			add_location(div, file$e, 20, 4, 807);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*descriptor*/ 1 && div_style_value !== (div_style_value = `background-color:${/*descriptor*/ ctx[0].color}`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(20:42) ",
    		ctx
    	});

    	return block;
    }

    // (18:43) 
    function create_if_block_1$7(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "id", "conversation-halfview-iframe");
    			attr_dev(iframe, "title", "conversation halfview iframe");
    			if (!src_url_equal(iframe.src, iframe_src_value = /*descriptor*/ ctx[0].url)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "class", "svelte-1yzlfdm");
    			add_location(iframe, file$e, 18, 4, 623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    			/*iframe_binding*/ ctx[2](iframe);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*descriptor*/ 1 && !src_url_equal(iframe.src, iframe_src_value = /*descriptor*/ ctx[0].url)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    			/*iframe_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(18:43) ",
    		ctx
    	});

    	return block;
    }

    // (16:4) {#if descriptor.type === 'image'}
    function create_if_block$9(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*descriptor*/ ctx[0].url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "info background");
    			add_location(img, file$e, 16, 4, 523);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*descriptor*/ 1 && !src_url_equal(img.src, img_src_value = /*descriptor*/ ctx[0].url)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(16:4) {#if descriptor.type === 'image'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*descriptor*/ ctx[0].type === 'image') return create_if_block$9;
    		if (/*descriptor*/ ctx[0].type === 'iframe') return create_if_block_1$7;
    		if (/*descriptor*/ ctx[0].type === 'color') return create_if_block_2$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "id", "conversation-halfview");
    			attr_dev(div, "class", "svelte-1yzlfdm");
    			add_location(div, file$e, 14, 0, 448);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ConversationHalfview', slots, []);
    	let { descriptor } = $$props;
    	let halfviewIframe;

    	afterUpdate(() => {
    		if (descriptor.type === 'iframe') {
    			console.log(`halfview`, halfviewIframe);
    			ConversationMessageReceiverManager.registerCurrentMessageReceiver(halfviewIframe);
    		}
    	});

    	const writable_props = ['descriptor'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<ConversationHalfview> was created with unknown prop '${key}'`);
    	});

    	function iframe_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			halfviewIframe = $$value;
    			$$invalidate(1, halfviewIframe);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('descriptor' in $$props) $$invalidate(0, descriptor = $$props.descriptor);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		ConversationMessageReceiverManager,
    		descriptor,
    		halfviewIframe
    	});

    	$$self.$inject_state = $$props => {
    		if ('descriptor' in $$props) $$invalidate(0, descriptor = $$props.descriptor);
    		if ('halfviewIframe' in $$props) $$invalidate(1, halfviewIframe = $$props.halfviewIframe);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [descriptor, halfviewIframe, iframe_binding];
    }

    class ConversationHalfview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { descriptor: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConversationHalfview",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*descriptor*/ ctx[0] === undefined && !('descriptor' in props)) {
    			console_1$3.warn("<ConversationHalfview> was created without expected prop 'descriptor'");
    		}
    	}

    	get descriptor() {
    		throw new Error("<ConversationHalfview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set descriptor(value) {
    		throw new Error("<ConversationHalfview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/component/demonstration/NarratorPhrase.svelte generated by Svelte v3.44.1 */

    const file$d = "src/component/demonstration/NarratorPhrase.svelte";

    function create_fragment$h(ctx) {
    	let p;
    	let t_value = /*phraseDescriptor*/ ctx[0].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "narrator-phrase svelte-1idhym2");
    			add_location(p, file$d, 4, 0, 92);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*phraseDescriptor*/ 1 && t_value !== (t_value = /*phraseDescriptor*/ ctx[0].text + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NarratorPhrase', slots, []);
    	let { phraseDescriptor } = $$props;
    	const writable_props = ['phraseDescriptor'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NarratorPhrase> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('phraseDescriptor' in $$props) $$invalidate(0, phraseDescriptor = $$props.phraseDescriptor);
    	};

    	$$self.$capture_state = () => ({ phraseDescriptor });

    	$$self.$inject_state = $$props => {
    		if ('phraseDescriptor' in $$props) $$invalidate(0, phraseDescriptor = $$props.phraseDescriptor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [phraseDescriptor];
    }

    class NarratorPhrase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { phraseDescriptor: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NarratorPhrase",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*phraseDescriptor*/ ctx[0] === undefined && !('phraseDescriptor' in props)) {
    			console.warn("<NarratorPhrase> was created without expected prop 'phraseDescriptor'");
    		}
    	}

    	get phraseDescriptor() {
    		throw new Error("<NarratorPhrase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set phraseDescriptor(value) {
    		throw new Error("<NarratorPhrase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/component/demonstration/NormalPhrase.svelte generated by Svelte v3.44.1 */
    const file$c = "src/component/demonstration/NormalPhrase.svelte";

    // (13:4) {#if phraseDescriptor._order <= 0}
    function create_if_block$8(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*phraseDescriptor*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let div1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "phrase-character-name svelte-yztfqe");
    			attr_dev(div0, "style", `float:${/*position*/ ctx[1]}`);
    			add_location(div0, file$c, 14, 8, 564);
    			set_style(div1, "clear", "both");
    			add_location(div1, file$c, 15, 8, 665);
    			add_location(div2, file$c, 13, 4, 550);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*phraseDescriptor*/ 1 && t0_value !== (t0_value = /*phraseDescriptor*/ ctx[0].name + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(13:4) {#if phraseDescriptor._order <= 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t1;
    	let div0;
    	let t2_value = /*phraseDescriptor*/ ctx[0].text + "";
    	let t2;
    	let if_block = /*phraseDescriptor*/ ctx[0]._order <= 0 && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t1 = space();
    			div0 = element("div");
    			t2 = text(t2_value);
    			attr_dev(img, "class", "" + (null_to_empty(`phrase-icon-pic phrase-icon-${/*position*/ ctx[1]}`) + " svelte-yztfqe"));
    			if (!src_url_equal(img.src, img_src_value = /*icon*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Phrase icon");
    			add_location(img, file$c, 20, 12, 855);
    			attr_dev(div0, "class", "" + (null_to_empty(`phrase-text phrase-text-${/*position*/ ctx[1]}`) + " svelte-yztfqe"));
    			add_location(div0, file$c, 21, 12, 954);
    			attr_dev(div1, "class", "phrase-inner svelte-yztfqe");
    			attr_dev(div1, "style", `flex-direction:row${/*position*/ ctx[1] === 'right' ? '-reverse' : ''}`);
    			add_location(div1, file$c, 19, 8, 750);
    			attr_dev(div2, "class", "phrase");
    			add_location(div2, file$c, 18, 4, 721);
    			add_location(div3, file$c, 11, 0, 501);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			if (if_block) if_block.m(div3, null);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*phraseDescriptor*/ ctx[0]._order <= 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(div3, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*phraseDescriptor*/ 1 && t2_value !== (t2_value = /*phraseDescriptor*/ ctx[0].text + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NormalPhrase', slots, []);
    	var _a, _b;
    	let { phraseDescriptor } = $$props;

    	let position = phraseDescriptor.position || ((_a = MachineStore.Conversation.characterDict[phraseDescriptor.name]) === null || _a === void 0
    	? void 0
    	: _a.position) || 'left';

    	let icon = ((_b = MachineStore.Conversation.characterDict[phraseDescriptor.name]) === null || _b === void 0
    	? void 0
    	: _b.iconUrl) || '';

    	const writable_props = ['phraseDescriptor'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NormalPhrase> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('phraseDescriptor' in $$props) $$invalidate(0, phraseDescriptor = $$props.phraseDescriptor);
    	};

    	$$self.$capture_state = () => ({
    		_a,
    		_b,
    		MachineStore,
    		phraseDescriptor,
    		position,
    		icon
    	});

    	$$self.$inject_state = $$props => {
    		if ('_a' in $$props) _a = $$props._a;
    		if ('_b' in $$props) _b = $$props._b;
    		if ('phraseDescriptor' in $$props) $$invalidate(0, phraseDescriptor = $$props.phraseDescriptor);
    		if ('position' in $$props) $$invalidate(1, position = $$props.position);
    		if ('icon' in $$props) $$invalidate(2, icon = $$props.icon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [phraseDescriptor, position, icon];
    }

    class NormalPhrase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { phraseDescriptor: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NormalPhrase",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*phraseDescriptor*/ ctx[0] === undefined && !('phraseDescriptor' in props)) {
    			console.warn("<NormalPhrase> was created without expected prop 'phraseDescriptor'");
    		}
    	}

    	get phraseDescriptor() {
    		throw new Error("<NormalPhrase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set phraseDescriptor(value) {
    		throw new Error("<NormalPhrase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/component/demonstration/HeaderPhrase.svelte generated by Svelte v3.44.1 */
    const file$b = "src/component/demonstration/HeaderPhrase.svelte";

    // (9:43) 
    function create_if_block_2$3(ctx) {
    	let h3;
    	let t_value = /*phraseDescriptor*/ ctx[0].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(t_value);
    			add_location(h3, file$b, 9, 4, 315);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*phraseDescriptor*/ 1 && t_value !== (t_value = /*phraseDescriptor*/ ctx[0].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(9:43) ",
    		ctx
    	});

    	return block;
    }

    // (7:43) 
    function create_if_block_1$6(ctx) {
    	let h2;
    	let t_value = /*phraseDescriptor*/ ctx[0].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(t_value);
    			add_location(h2, file$b, 7, 4, 234);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*phraseDescriptor*/ 1 && t_value !== (t_value = /*phraseDescriptor*/ ctx[0].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(7:43) ",
    		ctx
    	});

    	return block;
    }

    // (5:4) {#if phraseDescriptor.level === 1}
    function create_if_block$7(ctx) {
    	let h1;
    	let t_value = /*phraseDescriptor*/ ctx[0].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t = text(t_value);
    			add_location(h1, file$b, 5, 4, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*phraseDescriptor*/ 1 && t_value !== (t_value = /*phraseDescriptor*/ ctx[0].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(5:4) {#if phraseDescriptor.level === 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*phraseDescriptor*/ ctx[0].level === 1) return create_if_block$7;
    		if (/*phraseDescriptor*/ ctx[0].level === 2) return create_if_block_1$6;
    		if (/*phraseDescriptor*/ ctx[0].level === 3) return create_if_block_2$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HeaderPhrase', slots, []);
    	let { phraseDescriptor } = $$props;
    	const writable_props = ['phraseDescriptor'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HeaderPhrase> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('phraseDescriptor' in $$props) $$invalidate(0, phraseDescriptor = $$props.phraseDescriptor);
    	};

    	$$self.$capture_state = () => ({ phraseDescriptor });

    	$$self.$inject_state = $$props => {
    		if ('phraseDescriptor' in $$props) $$invalidate(0, phraseDescriptor = $$props.phraseDescriptor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [phraseDescriptor];
    }

    class HeaderPhrase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { phraseDescriptor: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeaderPhrase",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*phraseDescriptor*/ ctx[0] === undefined && !('phraseDescriptor' in props)) {
    			console.warn("<HeaderPhrase> was created without expected prop 'phraseDescriptor'");
    		}
    	}

    	get phraseDescriptor() {
    		throw new Error("<HeaderPhrase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set phraseDescriptor(value) {
    		throw new Error("<HeaderPhrase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/component/demonstration/PhraseListBackground.svelte generated by Svelte v3.44.1 */
    const file$a = "src/component/demonstration/PhraseListBackground.svelte";

    // (21:27) 
    function create_if_block_2$2(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(" ");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`conversation-background-image conversation-background-image-${/*mode*/ ctx[2]}`) + " svelte-k39qpe"));
    			attr_dev(div, "style", div_style_value = `background-color:${/*source*/ ctx[1]}`);
    			add_location(div, file$a, 21, 0, 857);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mode*/ 4 && div_class_value !== (div_class_value = "" + (null_to_empty(`conversation-background-image conversation-background-image-${/*mode*/ ctx[2]}`) + " svelte-k39qpe"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*source*/ 2 && div_style_value !== (div_style_value = `background-color:${/*source*/ ctx[1]}`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(21:27) ",
    		ctx
    	});

    	return block;
    }

    // (19:28) 
    function create_if_block_1$5(ctx) {
    	let iframe;
    	let iframe_class_value;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "class", iframe_class_value = "" + (null_to_empty(`conversation-background-image conversation-background-image-${/*mode*/ ctx[2]}`) + " svelte-k39qpe"));
    			attr_dev(iframe, "title", "conversation background");
    			if (!src_url_equal(iframe.src, iframe_src_value = /*source*/ ctx[1])) attr_dev(iframe, "src", iframe_src_value);
    			add_location(iframe, file$a, 19, 0, 667);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    			/*iframe_binding*/ ctx[4](iframe);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mode*/ 4 && iframe_class_value !== (iframe_class_value = "" + (null_to_empty(`conversation-background-image conversation-background-image-${/*mode*/ ctx[2]}`) + " svelte-k39qpe"))) {
    				attr_dev(iframe, "class", iframe_class_value);
    			}

    			if (dirty & /*source*/ 2 && !src_url_equal(iframe.src, iframe_src_value = /*source*/ ctx[1])) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    			/*iframe_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(19:28) ",
    		ctx
    	});

    	return block;
    }

    // (17:0) {#if type === 'image'}
    function create_if_block$6(ctx) {
    	let img;
    	let img_class_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", img_class_value = "" + (null_to_empty(`conversation-background-image conversation-background-image-${/*mode*/ ctx[2]}`) + " svelte-k39qpe"));
    			if (!src_url_equal(img.src, img_src_value = /*source*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "conversation background");
    			add_location(img, file$a, 17, 0, 509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mode*/ 4 && img_class_value !== (img_class_value = "" + (null_to_empty(`conversation-background-image conversation-background-image-${/*mode*/ ctx[2]}`) + " svelte-k39qpe"))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*source*/ 2 && !src_url_equal(img.src, img_src_value = /*source*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(17:0) {#if type === 'image'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[0] === 'image') return create_if_block$6;
    		if (/*type*/ ctx[0] === 'iframe') return create_if_block_1$5;
    		if (/*type*/ ctx[0] === 'color') return create_if_block_2$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PhraseListBackground', slots, []);
    	let { type = 'image' } = $$props;
    	let { source } = $$props;
    	let { mode } = $$props;
    	let bgIframe;

    	afterUpdate(() => {
    		if (type === 'iframe') {
    			ConversationMessageReceiverManager.registerCurrentMessageReceiver(bgIframe);
    		}
    	});

    	const writable_props = ['type', 'source', 'mode'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PhraseListBackground> was created with unknown prop '${key}'`);
    	});

    	function iframe_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			bgIframe = $$value;
    			$$invalidate(3, bgIframe);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('source' in $$props) $$invalidate(1, source = $$props.source);
    		if ('mode' in $$props) $$invalidate(2, mode = $$props.mode);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		ConversationMessageReceiverManager,
    		type,
    		source,
    		mode,
    		bgIframe
    	});

    	$$self.$inject_state = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('source' in $$props) $$invalidate(1, source = $$props.source);
    		if ('mode' in $$props) $$invalidate(2, mode = $$props.mode);
    		if ('bgIframe' in $$props) $$invalidate(3, bgIframe = $$props.bgIframe);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, source, mode, bgIframe, iframe_binding];
    }

    class PhraseListBackground extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { type: 0, source: 1, mode: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PhraseListBackground",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*source*/ ctx[1] === undefined && !('source' in props)) {
    			console.warn("<PhraseListBackground> was created without expected prop 'source'");
    		}

    		if (/*mode*/ ctx[2] === undefined && !('mode' in props)) {
    			console.warn("<PhraseListBackground> was created without expected prop 'mode'");
    		}
    	}

    	get type() {
    		throw new Error("<PhraseListBackground>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<PhraseListBackground>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get source() {
    		throw new Error("<PhraseListBackground>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set source(value) {
    		throw new Error("<PhraseListBackground>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mode() {
    		throw new Error("<PhraseListBackground>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mode(value) {
    		throw new Error("<PhraseListBackground>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/component/demonstration/BranchingPhrase.svelte generated by Svelte v3.44.1 */
    const file$9 = "src/component/demonstration/BranchingPhrase.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (11:8) {#each phraseDescriptor.choice as ch}
    function create_each_block$3(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*ch*/ ctx[3].text + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[2](/*ch*/ ctx[3], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("⊳ ");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(div, "class", "conversation-branch-choice svelte-1t05h2v");
    			add_location(div, file$9, 11, 8, 295);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*phraseDescriptor*/ 1 && t1_value !== (t1_value = /*ch*/ ctx[3].text + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(11:8) {#each phraseDescriptor.choice as ch}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let each_value = /*phraseDescriptor*/ ctx[0].choice;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "conversation-branch svelte-1t05h2v");
    			add_location(div, file$9, 9, 4, 207);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*branchTo, phraseDescriptor*/ 3) {
    				each_value = /*phraseDescriptor*/ ctx[0].choice;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BranchingPhrase', slots, []);
    	let { phraseDescriptor } = $$props;

    	function branchTo(x) {
    		MACHINE.goto(x);
    	}

    	const writable_props = ['phraseDescriptor'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BranchingPhrase> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (ch, e) => branchTo(ch.target);

    	$$self.$$set = $$props => {
    		if ('phraseDescriptor' in $$props) $$invalidate(0, phraseDescriptor = $$props.phraseDescriptor);
    	};

    	$$self.$capture_state = () => ({ MACHINE, phraseDescriptor, branchTo });

    	$$self.$inject_state = $$props => {
    		if ('phraseDescriptor' in $$props) $$invalidate(0, phraseDescriptor = $$props.phraseDescriptor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [phraseDescriptor, branchTo, click_handler];
    }

    class BranchingPhrase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { phraseDescriptor: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BranchingPhrase",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*phraseDescriptor*/ ctx[0] === undefined && !('phraseDescriptor' in props)) {
    			console.warn("<BranchingPhrase> was created without expected prop 'phraseDescriptor'");
    		}
    	}

    	get phraseDescriptor() {
    		throw new Error("<BranchingPhrase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set phraseDescriptor(value) {
    		throw new Error("<BranchingPhrase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/component/demonstration/PhraseList.svelte generated by Svelte v3.44.1 */

    const { console: console_1$2 } = globals;
    const file$8 = "src/component/demonstration/PhraseList.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (70:4) {#if phraseListSizeMode === 'chatbox'}
    function create_if_block_6(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*showChatbox*/ ctx[6]) return create_if_block_7;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(70:4) {#if phraseListSizeMode === 'chatbox'}",
    		ctx
    	});

    	return block;
    }

    // (73:8) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "phrase-list-show svelte-255qyr");
    			add_location(div, file$8, 73, 12, 2510);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*showPhraseList*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(73:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (71:8) {#if showChatbox}
    function create_if_block_7(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "phrase-list-hide svelte-255qyr");
    			add_location(div, file$8, 71, 12, 2418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*hidePhraseList*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(71:8) {#if showChatbox}",
    		ctx
    	});

    	return block;
    }

    // (77:4) {#if showChatbox}
    function create_if_block$5(ctx) {
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let div0_class_value;
    	let t0;
    	let div1;
    	let span;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$4, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*phraseList*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if_block.c();
    			t0 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "→";
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(`phrase-list phrase-list-${/*phraseListSizeMode*/ ctx[4]} phrase-list-${/*phraseListSizeMode*/ ctx[4]}-${/*phraseListDisplayAnchor*/ ctx[5]}`) + " svelte-255qyr"));
    			add_location(div0, file$8, 77, 8, 2628);
    			attr_dev(span, "class", "svelte-255qyr");
    			add_location(span, file$8, 95, 12, 3711);
    			attr_dev(div1, "id", "phrase-list-next");
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(`phrase-list-next phrase-list-next-${/*phraseListSizeMode*/ ctx[4]} phrase-list-next-${/*phraseListSizeMode*/ ctx[4]}-${/*phraseListDisplayAnchor*/ ctx[5]} phrase-list-next-${/*nextKeyLocked*/ ctx[1]}`) + " svelte-255qyr"));
    			add_location(div1, file$8, 94, 8, 3449);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			if_blocks[current_block_type_index].m(div0, null);
    			/*div0_binding*/ ctx[12](div0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			/*div1_binding*/ ctx[13](div1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*nextPhrase*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div0, null);
    			}

    			if (!current || dirty & /*phraseListSizeMode, phraseListDisplayAnchor*/ 48 && div0_class_value !== (div0_class_value = "" + (null_to_empty(`phrase-list phrase-list-${/*phraseListSizeMode*/ ctx[4]} phrase-list-${/*phraseListSizeMode*/ ctx[4]}-${/*phraseListDisplayAnchor*/ ctx[5]}`) + " svelte-255qyr"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*phraseListSizeMode, phraseListDisplayAnchor, nextKeyLocked*/ 50 && div1_class_value !== (div1_class_value = "" + (null_to_empty(`phrase-list-next phrase-list-next-${/*phraseListSizeMode*/ ctx[4]} phrase-list-next-${/*phraseListSizeMode*/ ctx[4]}-${/*phraseListDisplayAnchor*/ ctx[5]} phrase-list-next-${/*nextKeyLocked*/ ctx[1]}`) + " svelte-255qyr"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if_blocks[current_block_type_index].d();
    			/*div0_binding*/ ctx[12](null);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			/*div1_binding*/ ctx[13](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(77:4) {#if showChatbox}",
    		ctx
    	});

    	return block;
    }

    // (91:12) {:else}
    function create_else_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Empty.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(91:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (79:12) {#if phraseList}
    function create_if_block_1$4(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*phraseList*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*phraseList*/ 1) {
    				each_value = /*phraseList*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(79:12) {#if phraseList}",
    		ctx
    	});

    	return block;
    }

    // (87:48) 
    function create_if_block_5(ctx) {
    	let branchingphrase;
    	let current;

    	branchingphrase = new BranchingPhrase({
    			props: { phraseDescriptor: /*phrase*/ ctx[17] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(branchingphrase.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(branchingphrase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const branchingphrase_changes = {};
    			if (dirty & /*phraseList*/ 1) branchingphrase_changes.phraseDescriptor = /*phrase*/ ctx[17];
    			branchingphrase.$set(branchingphrase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(branchingphrase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(branchingphrase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(branchingphrase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(87:48) ",
    		ctx
    	});

    	return block;
    }

    // (85:48) 
    function create_if_block_4(ctx) {
    	let headerphrase;
    	let current;

    	headerphrase = new HeaderPhrase({
    			props: { phraseDescriptor: /*phrase*/ ctx[17] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(headerphrase.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(headerphrase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const headerphrase_changes = {};
    			if (dirty & /*phraseList*/ 1) headerphrase_changes.phraseDescriptor = /*phrase*/ ctx[17];
    			headerphrase.$set(headerphrase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(headerphrase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(headerphrase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(headerphrase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(85:48) ",
    		ctx
    	});

    	return block;
    }

    // (83:48) 
    function create_if_block_3$1(ctx) {
    	let normalphrase;
    	let current;

    	normalphrase = new NormalPhrase({
    			props: { phraseDescriptor: /*phrase*/ ctx[17] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(normalphrase.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(normalphrase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const normalphrase_changes = {};
    			if (dirty & /*phraseList*/ 1) normalphrase_changes.phraseDescriptor = /*phrase*/ ctx[17];
    			normalphrase.$set(normalphrase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(normalphrase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(normalphrase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(normalphrase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(83:48) ",
    		ctx
    	});

    	return block;
    }

    // (81:20) {#if phrase.type === 1}
    function create_if_block_2$1(ctx) {
    	let narratorphrase;
    	let current;

    	narratorphrase = new NarratorPhrase({
    			props: { phraseDescriptor: /*phrase*/ ctx[17] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(narratorphrase.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(narratorphrase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const narratorphrase_changes = {};
    			if (dirty & /*phraseList*/ 1) narratorphrase_changes.phraseDescriptor = /*phrase*/ ctx[17];
    			narratorphrase.$set(narratorphrase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(narratorphrase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(narratorphrase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(narratorphrase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(81:20) {#if phrase.type === 1}",
    		ctx
    	});

    	return block;
    }

    // (80:16) {#each phraseList as phrase}
    function create_each_block$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$1, create_if_block_3$1, create_if_block_4, create_if_block_5];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*phrase*/ ctx[17].type === 1) return 0;
    		if (/*phrase*/ ctx[17].type === 2) return 1;
    		if (/*phrase*/ ctx[17].type === 3) return 2;
    		if (/*phrase*/ ctx[17].type === 4) return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_2(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(80:16) {#each phraseList as phrase}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let phraselistbackground;
    	let t0;
    	let t1;
    	let div_class_value;
    	let current;

    	phraselistbackground = new PhraseListBackground({
    			props: {
    				mode: /*phraseListSizeMode*/ ctx[4],
    				type: /*bgType*/ ctx[2],
    				source: /*bgSource*/ ctx[3]
    			},
    			$$inline: true
    		});

    	let if_block0 = /*phraseListSizeMode*/ ctx[4] === 'chatbox' && create_if_block_6(ctx);
    	let if_block1 = /*showChatbox*/ ctx[6] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(phraselistbackground.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`phrase-list-container phrase-list-container-${/*phraseListSizeMode*/ ctx[4]}`) + " svelte-255qyr"));
    			add_location(div, file$8, 67, 0, 2168);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(phraselistbackground, div, null);
    			append_dev(div, t0);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const phraselistbackground_changes = {};
    			if (dirty & /*phraseListSizeMode*/ 16) phraselistbackground_changes.mode = /*phraseListSizeMode*/ ctx[4];
    			if (dirty & /*bgType*/ 4) phraselistbackground_changes.type = /*bgType*/ ctx[2];
    			if (dirty & /*bgSource*/ 8) phraselistbackground_changes.source = /*bgSource*/ ctx[3];
    			phraselistbackground.$set(phraselistbackground_changes);

    			if (/*phraseListSizeMode*/ ctx[4] === 'chatbox') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(div, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*showChatbox*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showChatbox*/ 64) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*phraseListSizeMode*/ 16 && div_class_value !== (div_class_value = "" + (null_to_empty(`phrase-list-container phrase-list-container-${/*phraseListSizeMode*/ ctx[4]}`) + " svelte-255qyr"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(phraselistbackground.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(phraselistbackground.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(phraselistbackground);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PhraseList', slots, []);
    	let phraseList;
    	let nextKeyLocked = false;
    	let subscriptionList = [];
    	let sevenSubscriptionList = [];
    	let bgType = 'image';
    	let bgSource = '';
    	let phraseListSizeMode;
    	let phraseListDisplayAnchor;
    	let showChatbox = true;
    	let showByHide = false;

    	onMount(() => {
    		subscriptionList.push(MachineStore.Conversation.currentPhraseListState.currentSizeMode.subscribe(v => {
    			console.log(v);
    			$$invalidate(4, phraseListSizeMode = v);
    		}));

    		subscriptionList.push(MachineStore.Conversation.currentPhraseListState.currentDisplayAnchor.subscribe(v => {
    			$$invalidate(5, phraseListDisplayAnchor = v);
    		}));

    		subscriptionList.push(MachineStore.Conversation.currentPhrases.subscribe(v => {
    			showByHide = false;
    			$$invalidate(0, phraseList = v);
    		}));

    		subscriptionList.push(MachineStore.Conversation.currentBackground.subscribe(v => {
    			$$invalidate(2, bgType = v.type);

    			$$invalidate(3, bgSource = v.type === 'image'
    			? v.url
    			: v.type === 'iframe' ? v.url : v.color);
    		}));

    		sevenSubscriptionList.push(MACHINE.lockVar.subscribe(v => {
    			$$invalidate(1, nextKeyLocked = !v);
    		}));
    	});

    	onDestroy(() => {
    		subscriptionList.forEach(v => v());
    		sevenSubscriptionList.forEach(v => v.unsubscribe());
    	});

    	function nextPhrase() {
    		if (!nextKeyLocked) {
    			MACHINE.step();
    		}
    	}

    	let phraseListElement;

    	afterUpdate(() => {
    		phraseListElement && phraseListElement.scrollTo({
    			behavior: showByHide ? undefined : 'smooth',
    			top: phraseListElement.scrollHeight
    		});
    	});

    	let phraseListNextElement;

    	function showPhraseList() {
    		showByHide = true;
    		$$invalidate(6, showChatbox = true);
    	}

    	function hidePhraseList() {
    		$$invalidate(6, showChatbox = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<PhraseList> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			phraseListElement = $$value;
    			$$invalidate(7, phraseListElement);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			phraseListNextElement = $$value;
    			$$invalidate(8, phraseListNextElement);
    		});
    	}

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		onDestroy,
    		onMount,
    		NarratorPhrase,
    		NormalPhrase,
    		HeaderPhrase,
    		PhraseListBackground,
    		BranchingPhrase,
    		MachineStore,
    		MACHINE,
    		phraseList,
    		nextKeyLocked,
    		subscriptionList,
    		sevenSubscriptionList,
    		bgType,
    		bgSource,
    		phraseListSizeMode,
    		phraseListDisplayAnchor,
    		showChatbox,
    		showByHide,
    		nextPhrase,
    		phraseListElement,
    		phraseListNextElement,
    		showPhraseList,
    		hidePhraseList
    	});

    	$$self.$inject_state = $$props => {
    		if ('phraseList' in $$props) $$invalidate(0, phraseList = $$props.phraseList);
    		if ('nextKeyLocked' in $$props) $$invalidate(1, nextKeyLocked = $$props.nextKeyLocked);
    		if ('subscriptionList' in $$props) subscriptionList = $$props.subscriptionList;
    		if ('sevenSubscriptionList' in $$props) sevenSubscriptionList = $$props.sevenSubscriptionList;
    		if ('bgType' in $$props) $$invalidate(2, bgType = $$props.bgType);
    		if ('bgSource' in $$props) $$invalidate(3, bgSource = $$props.bgSource);
    		if ('phraseListSizeMode' in $$props) $$invalidate(4, phraseListSizeMode = $$props.phraseListSizeMode);
    		if ('phraseListDisplayAnchor' in $$props) $$invalidate(5, phraseListDisplayAnchor = $$props.phraseListDisplayAnchor);
    		if ('showChatbox' in $$props) $$invalidate(6, showChatbox = $$props.showChatbox);
    		if ('showByHide' in $$props) showByHide = $$props.showByHide;
    		if ('phraseListElement' in $$props) $$invalidate(7, phraseListElement = $$props.phraseListElement);
    		if ('phraseListNextElement' in $$props) $$invalidate(8, phraseListNextElement = $$props.phraseListNextElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		phraseList,
    		nextKeyLocked,
    		bgType,
    		bgSource,
    		phraseListSizeMode,
    		phraseListDisplayAnchor,
    		showChatbox,
    		phraseListElement,
    		phraseListNextElement,
    		nextPhrase,
    		showPhraseList,
    		hidePhraseList,
    		div0_binding,
    		div1_binding
    	];
    }

    class PhraseList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PhraseList",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/component/demonstration/Conversation.svelte generated by Svelte v3.44.1 */

    const { console: console_1$1 } = globals;

    // (26:0) {#if sizeMode === 'halfview'}
    function create_if_block$4(ctx) {
    	let conversationhalfview;
    	let current;
    	let conversationhalfview_props = { descriptor: /*halfView*/ ctx[1] };

    	conversationhalfview = new ConversationHalfview({
    			props: conversationhalfview_props,
    			$$inline: true
    		});

    	/*conversationhalfview_binding*/ ctx[3](conversationhalfview);

    	const block = {
    		c: function create() {
    			create_component(conversationhalfview.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(conversationhalfview, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const conversationhalfview_changes = {};
    			if (dirty & /*halfView*/ 2) conversationhalfview_changes.descriptor = /*halfView*/ ctx[1];
    			conversationhalfview.$set(conversationhalfview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(conversationhalfview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(conversationhalfview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*conversationhalfview_binding*/ ctx[3](null);
    			destroy_component(conversationhalfview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(26:0) {#if sizeMode === 'halfview'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let phraselist;
    	let t;
    	let if_block_anchor;
    	let current;
    	phraselist = new PhraseList({ $$inline: true });
    	let if_block = /*sizeMode*/ ctx[0] === 'halfview' && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			create_component(phraselist.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(phraselist, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*sizeMode*/ ctx[0] === 'halfview') {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*sizeMode*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(phraselist.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(phraselist.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(phraselist, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Conversation', slots, []);
    	let subscriptionList = [];
    	let sizeMode;
    	let halfView;
    	let halfViewElement;

    	onMount(() => {
    		subscriptionList.push(MachineStore.Conversation.currentPhraseListState.currentSizeMode.subscribe(v => {
    			$$invalidate(0, sizeMode = v);
    		}));

    		subscriptionList.push(MachineStore.Conversation.currentHalfview.subscribe(v => {
    			$$invalidate(1, halfView = v);
    		}));

    		console.log(halfViewElement);
    	});

    	onDestroy(() => {
    		subscriptionList.forEach(v => v());
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Conversation> was created with unknown prop '${key}'`);
    	});

    	function conversationhalfview_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			halfViewElement = $$value;
    			$$invalidate(2, halfViewElement);
    		});
    	}

    	$$self.$capture_state = () => ({
    		MachineStore,
    		onDestroy,
    		onMount,
    		ConversationHalfview,
    		PhraseList,
    		subscriptionList,
    		sizeMode,
    		halfView,
    		halfViewElement
    	});

    	$$self.$inject_state = $$props => {
    		if ('subscriptionList' in $$props) subscriptionList = $$props.subscriptionList;
    		if ('sizeMode' in $$props) $$invalidate(0, sizeMode = $$props.sizeMode);
    		if ('halfView' in $$props) $$invalidate(1, halfView = $$props.halfView);
    		if ('halfViewElement' in $$props) $$invalidate(2, halfViewElement = $$props.halfViewElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [sizeMode, halfView, halfViewElement, conversationhalfview_binding];
    }

    class Conversation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Conversation",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/component/common/EnterPrompt.svelte generated by Svelte v3.44.1 */

    const file$7 = "src/component/common/EnterPrompt.svelte";

    function create_fragment$a(ctx) {
    	let span;
    	let t0;
    	let t1;
    	let html_tag;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(/*message*/ ctx[0]);
    			t1 = space();
    			html_tag = new HtmlTag();
    			html_tag.a = null;
    			attr_dev(span, "class", "ui-enterprompt svelte-1a9zzxv");
    			add_location(span, file$7, 5, 0, 119);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			html_tag.m(/*ornament*/ ctx[1], span);

    			if (!mounted) {
    				dispose = listen_dev(
    					span,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[2])) /*onClick*/ ctx[2].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*message*/ 1) set_data_dev(t0, /*message*/ ctx[0]);
    			if (dirty & /*ornament*/ 2) html_tag.p(/*ornament*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EnterPrompt', slots, []);
    	let { message = "" } = $$props;
    	let { ornament = "&crarr;" } = $$props;
    	let { onClick = undefined } = $$props;
    	const writable_props = ['message', 'ornament', 'onClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EnterPrompt> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    		if ('ornament' in $$props) $$invalidate(1, ornament = $$props.ornament);
    		if ('onClick' in $$props) $$invalidate(2, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({ message, ornament, onClick });

    	$$self.$inject_state = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    		if ('ornament' in $$props) $$invalidate(1, ornament = $$props.ornament);
    		if ('onClick' in $$props) $$invalidate(2, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [message, ornament, onClick];
    }

    class EnterPrompt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { message: 0, ornament: 1, onClick: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EnterPrompt",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get message() {
    		throw new Error("<EnterPrompt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<EnterPrompt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ornament() {
    		throw new Error("<EnterPrompt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ornament(value) {
    		throw new Error("<EnterPrompt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<EnterPrompt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<EnterPrompt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/component/segue/Segue.svelte generated by Svelte v3.44.1 */
    const file$6 = "src/component/segue/Segue.svelte";

    // (27:4) {#if bgUrl}
    function create_if_block_1$3(ctx) {
    	let link;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "rel", "preload");
    			attr_dev(link, "href", /*bgUrl*/ ctx[3]);
    			attr_dev(link, "as", "image");
    			add_location(link, file$6, 27, 8, 734);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*bgUrl*/ 8) {
    				attr_dev(link, "href", /*bgUrl*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(27:4) {#if bgUrl}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {#if bgUrl}
    function create_if_block$3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "id", "segue-background-image");
    			if (!src_url_equal(img.src, img_src_value = /*bgUrl*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "segue background");
    			attr_dev(img, "class", "svelte-ip6dg3");
    			add_location(img, file$6, 33, 4, 858);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*bgUrl*/ 8 && !src_url_equal(img.src, img_src_value = /*bgUrl*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(33:4) {#if bgUrl}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let if_block0_anchor;
    	let t0;
    	let div1;
    	let t1;
    	let div0;
    	let h20;
    	let t2;
    	let t3;
    	let h1;
    	let t4;
    	let t5;
    	let h21;
    	let t6;
    	let div0_class_value;
    	let t7;
    	let span;
    	let enterprompt;
    	let current;
    	let if_block0 = /*bgUrl*/ ctx[3] && create_if_block_1$3(ctx);
    	let if_block1 = /*bgUrl*/ ctx[3] && create_if_block$3(ctx);

    	enterprompt = new EnterPrompt({
    			props: { onClick: /*func*/ ctx[5] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			t0 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div0 = element("div");
    			h20 = element("h2");
    			t2 = text(/*topTitle*/ ctx[1]);
    			t3 = space();
    			h1 = element("h1");
    			t4 = text(/*title*/ ctx[0]);
    			t5 = space();
    			h21 = element("h2");
    			t6 = text(/*subTitle*/ ctx[2]);
    			t7 = space();
    			span = element("span");
    			create_component(enterprompt.$$.fragment);
    			attr_dev(h20, "id", "segue-top-title");
    			attr_dev(h20, "class", "svelte-ip6dg3");
    			add_location(h20, file$6, 36, 8, 1028);
    			attr_dev(h1, "id", "segue-title");
    			attr_dev(h1, "class", "svelte-ip6dg3");
    			add_location(h1, file$6, 37, 8, 1077);
    			attr_dev(h21, "id", "segue-sub-title");
    			attr_dev(h21, "class", "svelte-ip6dg3");
    			add_location(h21, file$6, 38, 8, 1119);
    			attr_dev(div0, "id", "segue-title-container");
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(`segue-title-container-${/*position*/ ctx[4]}`) + " svelte-ip6dg3"));
    			add_location(div0, file$6, 35, 4, 943);
    			attr_dev(span, "id", "segue-next");
    			attr_dev(span, "class", "svelte-ip6dg3");
    			add_location(span, file$6, 41, 4, 1176);
    			attr_dev(div1, "id", "segue");
    			attr_dev(div1, "class", "segue svelte-ip6dg3");
    			add_location(div1, file$6, 31, 0, 807);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(document.head, null);
    			append_dev(document.head, if_block0_anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, h20);
    			append_dev(h20, t2);
    			append_dev(div0, t3);
    			append_dev(div0, h1);
    			append_dev(h1, t4);
    			append_dev(div0, t5);
    			append_dev(div0, h21);
    			append_dev(h21, t6);
    			append_dev(div1, t7);
    			append_dev(div1, span);
    			mount_component(enterprompt, span, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*bgUrl*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*bgUrl*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*topTitle*/ 2) set_data_dev(t2, /*topTitle*/ ctx[1]);
    			if (!current || dirty & /*title*/ 1) set_data_dev(t4, /*title*/ ctx[0]);
    			if (!current || dirty & /*subTitle*/ 4) set_data_dev(t6, /*subTitle*/ ctx[2]);

    			if (!current || dirty & /*position*/ 16 && div0_class_value !== (div0_class_value = "" + (null_to_empty(`segue-title-container-${/*position*/ ctx[4]}`) + " svelte-ip6dg3"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(enterprompt.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(enterprompt.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			detach_dev(if_block0_anchor);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (if_block1) if_block1.d();
    			destroy_component(enterprompt);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Segue', slots, []);
    	let title;
    	let topTitle;
    	let subTitle;
    	let bgUrl;
    	let position;
    	let subscriptionList = [];

    	onMount(() => {
    		subscriptionList.push(MachineStore.Segue.subscribe(v => {
    			$$invalidate(4, position = v.currentPosition);
    			$$invalidate(0, title = v.currentTitle);
    			$$invalidate(1, topTitle = v.currentTopTitle);
    			$$invalidate(2, subTitle = v.currentSubTitle);
    			$$invalidate(3, bgUrl = v.currentBgUrl);
    		}));
    	});

    	onDestroy(() => {
    		subscriptionList.forEach(v => v());
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Segue> was created with unknown prop '${key}'`);
    	});

    	const func = () => {
    		MACHINE.step();
    	};

    	$$self.$capture_state = () => ({
    		MACHINE,
    		MachineStore,
    		onDestroy,
    		onMount,
    		EnterPrompt,
    		title,
    		topTitle,
    		subTitle,
    		bgUrl,
    		position,
    		subscriptionList
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('topTitle' in $$props) $$invalidate(1, topTitle = $$props.topTitle);
    		if ('subTitle' in $$props) $$invalidate(2, subTitle = $$props.subTitle);
    		if ('bgUrl' in $$props) $$invalidate(3, bgUrl = $$props.bgUrl);
    		if ('position' in $$props) $$invalidate(4, position = $$props.position);
    		if ('subscriptionList' in $$props) subscriptionList = $$props.subscriptionList;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, topTitle, subTitle, bgUrl, position, func];
    }

    class Segue extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Segue",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    var main = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = exports.ParseResult = exports.DefaultRenderer = exports.OrgRenderer = exports.MarkdownRenderer = exports.HTMLRenderer = void 0;
    function _htmlEscape(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    exports.HTMLRenderer = {
        preamble: function () {
            return '';
        },
        postamble: function () {
            return '';
        },
        text: function (content) {
            return _htmlEscape(content) + "<br />";
        },
        link: function (url, alt) {
            return "<a href=\"" + url + "\">" + (alt || url) + "</a><br />\n";
        },
        preformatted: function (content, alt) {
            return "<pre alt=\"" + alt + "\">" + _htmlEscape(content.join('\n')) + "</pre>\n";
        },
        heading: function (level, text) {
            return "<h" + level + ">" + _htmlEscape(text) + "</h" + level + ">\n";
        },
        unorderedList: function (content) {
            return "<ul>" + content.map(function (v) { return "<li>" + _htmlEscape(v) + "</li>"; }).join('') + "</ul>\n";
        },
        quote: function (content) {
            return "<blockquote>" + _htmlEscape(content) + "</blockquote>\n";
        }
    };
    exports.MarkdownRenderer = {
        preamble: function () {
            return '';
        },
        postamble: function () {
            return '';
        },
        text: function (content) {
            return content + "\n";
        },
        link: function (url, alt) {
            return "\n[" + alt + "](" + url + ")\n";
        },
        preformatted: function (content, alt) {
            return "\n``` " + alt + "\n" + content.join('\n') + "\n```\n";
        },
        heading: function (level, text) {
            return '#'.repeat(level) + " " + text + "\n";
        },
        unorderedList: function (content) {
            return "\n" + content.map(function (v) { return "* " + v; }).join('\n') + "\n";
        },
        quote: function (content) {
            return "\n> " + content + "\n";
        }
    };
    exports.OrgRenderer = {
        preamble: function () {
            return '';
        },
        postamble: function () {
            return '';
        },
        text: function (content) {
            return content + "\n";
        },
        link: function (url, alt) {
            return "\n\n[" + alt + "](" + url + ")\n\n";
        },
        preformatted: function (content, alt) {
            return "\n#+BEGIN_SRC " + (alt || 'fundamental') + "\n" + content.join('\n') + "\n#+END_SRC\n";
        },
        heading: function (level, text) {
            return '*'.repeat(level) + " " + text;
        },
        unorderedList: function (content) {
            return "\n" + content.map(function (v) { return "+ " + v; }).join('\n') + "\n";
        },
        quote: function (content) {
            return "\n#+BEGIN_QUOTE\n" + content + "\n#+END_QUOTE\n";
        }
    };
    exports.DefaultRenderer = {
        preamble: function () {
            return '';
        },
        postamble: function () {
            return '';
        },
        text: function (content) {
            return content + "\n";
        },
        link: function (url, alt) {
            return "=> " + url + " " + alt + "\n";
        },
        preformatted: function (content, alt) {
            return "``` " + alt + "\n" + content.join('\n') + "\n```\n";
        },
        heading: function (level, text) {
            return '#'.repeat(level) + " " + text + "\n";
        },
        unorderedList: function (content) {
            return content.map(function (v) { return "+ " + v; }).join('\n') + "\n";
        },
        quote: function (content) {
            return "> " + content + "\n";
        }
    };
    var ParseResult = /** @class */ (function () {
        function ParseResult(data) {
            this.data = data;
        }
        ParseResult.prototype.generate = function (generator) {
            return this.data.map(function (v) {
                switch (v._) {
                    case 1: return generator.text(v.val);
                    case 2: return generator.link(v.url, v.alt);
                    case 3: return generator.preformatted(v.content, v.alt);
                    case 4: return generator.heading(v.level, v.text);
                    case 5: return generator.unorderedList(v.content);
                    case 6: return generator.quote(v.content);
                }
            }).join('');
        };
        return ParseResult;
    }());
    exports.ParseResult = ParseResult;
    function parse(source, strict) {
        if (strict === void 0) { strict = false; }
        var res = [];
        var preformatting = false;
        var preformattingAlt = '';
        var preformattingBuffer = [];
        var listStarted = false;
        var listBuffer = [];
        source.replace(/\r\n/g, '\n').split('\n').forEach(function (v) {
            if (preformatting) {
                if (v.trim() === '```') {
                    res.push({ _: 3, content: preformattingBuffer, alt: preformattingAlt });
                    preformatting = false;
                    preformattingBuffer = [];
                    preformattingAlt = '';
                    return;
                }
                else {
                    preformattingBuffer.push(v);
                    return;
                }
            }
            if (listStarted && !v.startsWith('* ')) {
                res.push({ _: 5, content: listBuffer });
                listStarted = false;
                listBuffer = [];
            }
            if ((strict && v.startsWith('=> ')) || (!strict && v.startsWith('=>'))) {
                var x = v.substring(2).trim();
                var i = 0;
                while (i < x.length && !' \t\r\n\v\b'.includes(x[i])) {
                    i++;
                }
                var url = x.substring(0, i);
                x = x.substring(i).trim();
                res.push({ _: 2, url: url, alt: x });
            }
            else if ((strict && v.startsWith('> ')) || (!strict && v.startsWith('>'))) {
                res.push({ _: 6, content: v.substring(1).trim() });
            }
            else if (v.startsWith('#')) {
                var i = 0;
                while (v[i] == '#') {
                    i++;
                }
                var level = i;
                if (strict) {
                    if (' \t\r\n\v\b'.includes(v[i])) {
                        res.push({ _: 4, level: level, text: v.substring(i).trim() });
                    }
                    else {
                        res.push({ _: 1, val: v });
                    }
                }
                else {
                    res.push({ _: 4, level: level, text: v.substring(i).trim() });
                }
            }
            else if (v.startsWith('```')) {
                preformattingAlt = v.substring(3).trim();
                preformatting = true;
            }
            else if (v.startsWith('* ')) {
                if (!listStarted) {
                    listStarted = true;
                    listBuffer = [];
                }
                listBuffer.push(v.substring(2).trim());
            }
            else {
                res.push({ _: 1, val: v });
            }
        });
        if (preformattingBuffer.length > 0) {
            res.push({ _: 3, content: preformattingBuffer, alt: preformattingAlt });
        }
        if (listBuffer.length > 0) {
            res.push({ _: 5, content: listBuffer });
        }
        return new ParseResult(res);
    }
    exports.parse = parse;
    });

    var main$1 = /*@__PURE__*/getDefaultExportFromCjs(main);

    var Gemtext = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
        __proto__: null,
        'default': main$1
    }, [main]));

    /* src/component/info/subcomponent/InfoPageIndicator.svelte generated by Svelte v3.44.1 */
    const file$5 = "src/component/info/subcomponent/InfoPageIndicator.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let span0;
    	let t0;
    	let span0_class_value;
    	let t1;
    	let t2_value = /*currentPageNum*/ ctx[1] + 1 + "";
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let span1;
    	let t6;
    	let span1_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text("←");
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = text(" ‡ ");
    			t4 = text(/*pageListLength*/ ctx[0]);
    			t5 = space();
    			span1 = element("span");
    			t6 = text("→");
    			attr_dev(span0, "class", span0_class_value = "" + (null_to_empty(`info-page-indicator-button ${/*currentPageNum*/ ctx[1] > 0 ? '' : 'disabled'}`) + " svelte-1ebr9hw"));
    			add_location(span0, file$5, 21, 0, 664);

    			attr_dev(span1, "class", span1_class_value = "" + (null_to_empty(`info-page-indicator-button ${/*currentPageNum*/ ctx[1] + 1 < /*pageListLength*/ ctx[0]
			? ''
			: 'disabled'}`) + " svelte-1ebr9hw"));

    			add_location(span1, file$5, 23, 0, 840);
    			attr_dev(div, "class", "info-page-indicator svelte-1ebr9hw");
    			add_location(div, file$5, 20, 0, 630);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, t5);
    			append_dev(div, span1);
    			append_dev(span1, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", MachineStore.Info.prevPage, false, false, false),
    					listen_dev(span1, "click", MachineStore.Info.nextPage, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentPageNum*/ 2 && span0_class_value !== (span0_class_value = "" + (null_to_empty(`info-page-indicator-button ${/*currentPageNum*/ ctx[1] > 0 ? '' : 'disabled'}`) + " svelte-1ebr9hw"))) {
    				attr_dev(span0, "class", span0_class_value);
    			}

    			if (dirty & /*currentPageNum*/ 2 && t2_value !== (t2_value = /*currentPageNum*/ ctx[1] + 1 + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*pageListLength*/ 1) set_data_dev(t4, /*pageListLength*/ ctx[0]);

    			if (dirty & /*currentPageNum, pageListLength*/ 3 && span1_class_value !== (span1_class_value = "" + (null_to_empty(`info-page-indicator-button ${/*currentPageNum*/ ctx[1] + 1 < /*pageListLength*/ ctx[0]
			? ''
			: 'disabled'}`) + " svelte-1ebr9hw"))) {
    				attr_dev(span1, "class", span1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('InfoPageIndicator', slots, []);
    	let pageListLength;
    	let currentPageNum;
    	let subscriptionList = [];

    	onMount(() => {
    		subscriptionList.push(MachineStore.Info.currentPage.subscribe(v => {
    			$$invalidate(1, currentPageNum = v);
    		}));

    		subscriptionList.push(MachineStore.Info.pages.subscribe(v => {
    			$$invalidate(0, pageListLength = v.length);
    		}));

    		$$invalidate(0, pageListLength = MachineStore.Info.pages.getValue().length);
    		$$invalidate(1, currentPageNum = MachineStore.Info.currentPage.getValue());
    	});

    	onDestroy(() => {
    		subscriptionList.forEach(v => v());
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<InfoPageIndicator> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		MachineStore,
    		onDestroy,
    		onMount,
    		pageListLength,
    		currentPageNum,
    		subscriptionList
    	});

    	$$self.$inject_state = $$props => {
    		if ('pageListLength' in $$props) $$invalidate(0, pageListLength = $$props.pageListLength);
    		if ('currentPageNum' in $$props) $$invalidate(1, currentPageNum = $$props.currentPageNum);
    		if ('subscriptionList' in $$props) subscriptionList = $$props.subscriptionList;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pageListLength, currentPageNum];
    }

    class InfoPageIndicator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InfoPageIndicator",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /**
     * marked - a markdown parser
     * Copyright (c) 2011-2021, Christopher Jeffrey. (MIT Licensed)
     * https://github.com/markedjs/marked
     */

    /**
     * DO NOT EDIT THIS FILE
     * The code in this file is generated from files in ./src/
     */

    function getDefaults() {
      return {
        baseUrl: null,
        breaks: false,
        extensions: null,
        gfm: true,
        headerIds: true,
        headerPrefix: '',
        highlight: null,
        langPrefix: 'language-',
        mangle: true,
        pedantic: false,
        renderer: null,
        sanitize: false,
        sanitizer: null,
        silent: false,
        smartLists: false,
        smartypants: false,
        tokenizer: null,
        walkTokens: null,
        xhtml: false
      };
    }

    let defaults = getDefaults();

    function changeDefaults(newDefaults) {
      defaults = newDefaults;
    }

    /**
     * Helpers
     */
    const escapeTest = /[&<>"']/;
    const escapeReplace = /[&<>"']/g;
    const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
    const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
    const escapeReplacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    const getEscapeReplacement = (ch) => escapeReplacements[ch];
    function escape(html, encode) {
      if (encode) {
        if (escapeTest.test(html)) {
          return html.replace(escapeReplace, getEscapeReplacement);
        }
      } else {
        if (escapeTestNoEncode.test(html)) {
          return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
        }
      }

      return html;
    }

    const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

    function unescape(html) {
      // explicitly match decimal, hex, and named HTML entities
      return html.replace(unescapeTest, (_, n) => {
        n = n.toLowerCase();
        if (n === 'colon') return ':';
        if (n.charAt(0) === '#') {
          return n.charAt(1) === 'x'
            ? String.fromCharCode(parseInt(n.substring(2), 16))
            : String.fromCharCode(+n.substring(1));
        }
        return '';
      });
    }

    const caret = /(^|[^\[])\^/g;
    function edit(regex, opt) {
      regex = regex.source || regex;
      opt = opt || '';
      const obj = {
        replace: (name, val) => {
          val = val.source || val;
          val = val.replace(caret, '$1');
          regex = regex.replace(name, val);
          return obj;
        },
        getRegex: () => {
          return new RegExp(regex, opt);
        }
      };
      return obj;
    }

    const nonWordAndColonTest = /[^\w:]/g;
    const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
    function cleanUrl(sanitize, base, href) {
      if (sanitize) {
        let prot;
        try {
          prot = decodeURIComponent(unescape(href))
            .replace(nonWordAndColonTest, '')
            .toLowerCase();
        } catch (e) {
          return null;
        }
        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
          return null;
        }
      }
      if (base && !originIndependentUrl.test(href)) {
        href = resolveUrl(base, href);
      }
      try {
        href = encodeURI(href).replace(/%25/g, '%');
      } catch (e) {
        return null;
      }
      return href;
    }

    const baseUrls = {};
    const justDomain = /^[^:]+:\/*[^/]*$/;
    const protocol = /^([^:]+:)[\s\S]*$/;
    const domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

    function resolveUrl(base, href) {
      if (!baseUrls[' ' + base]) {
        // we can ignore everything in base after the last slash of its path component,
        // but we might need to add _that_
        // https://tools.ietf.org/html/rfc3986#section-3
        if (justDomain.test(base)) {
          baseUrls[' ' + base] = base + '/';
        } else {
          baseUrls[' ' + base] = rtrim(base, '/', true);
        }
      }
      base = baseUrls[' ' + base];
      const relativeBase = base.indexOf(':') === -1;

      if (href.substring(0, 2) === '//') {
        if (relativeBase) {
          return href;
        }
        return base.replace(protocol, '$1') + href;
      } else if (href.charAt(0) === '/') {
        if (relativeBase) {
          return href;
        }
        return base.replace(domain, '$1') + href;
      } else {
        return base + href;
      }
    }

    const noopTest = { exec: function noopTest() {} };

    function merge(obj) {
      let i = 1,
        target,
        key;

      for (; i < arguments.length; i++) {
        target = arguments[i];
        for (key in target) {
          if (Object.prototype.hasOwnProperty.call(target, key)) {
            obj[key] = target[key];
          }
        }
      }

      return obj;
    }

    function splitCells(tableRow, count) {
      // ensure that every cell-delimiting pipe has a space
      // before it to distinguish it from an escaped pipe
      const row = tableRow.replace(/\|/g, (match, offset, str) => {
          let escaped = false,
            curr = offset;
          while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
          if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return '|';
          } else {
            // add space before unescaped |
            return ' |';
          }
        }),
        cells = row.split(/ \|/);
      let i = 0;

      // First/last cell in a row cannot be empty if it has no leading/trailing pipe
      if (!cells[0].trim()) { cells.shift(); }
      if (!cells[cells.length - 1].trim()) { cells.pop(); }

      if (cells.length > count) {
        cells.splice(count);
      } else {
        while (cells.length < count) cells.push('');
      }

      for (; i < cells.length; i++) {
        // leading or trailing whitespace is ignored per the gfm spec
        cells[i] = cells[i].trim().replace(/\\\|/g, '|');
      }
      return cells;
    }

    // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
    // /c*$/ is vulnerable to REDOS.
    // invert: Remove suffix of non-c chars instead. Default falsey.
    function rtrim(str, c, invert) {
      const l = str.length;
      if (l === 0) {
        return '';
      }

      // Length of suffix matching the invert condition.
      let suffLen = 0;

      // Step left until we fail to match the invert condition.
      while (suffLen < l) {
        const currChar = str.charAt(l - suffLen - 1);
        if (currChar === c && !invert) {
          suffLen++;
        } else if (currChar !== c && invert) {
          suffLen++;
        } else {
          break;
        }
      }

      return str.substr(0, l - suffLen);
    }

    function findClosingBracket(str, b) {
      if (str.indexOf(b[1]) === -1) {
        return -1;
      }
      const l = str.length;
      let level = 0,
        i = 0;
      for (; i < l; i++) {
        if (str[i] === '\\') {
          i++;
        } else if (str[i] === b[0]) {
          level++;
        } else if (str[i] === b[1]) {
          level--;
          if (level < 0) {
            return i;
          }
        }
      }
      return -1;
    }

    function checkSanitizeDeprecation(opt) {
      if (opt && opt.sanitize && !opt.silent) {
        console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
      }
    }

    // copied from https://stackoverflow.com/a/5450113/806777
    function repeatString(pattern, count) {
      if (count < 1) {
        return '';
      }
      let result = '';
      while (count > 1) {
        if (count & 1) {
          result += pattern;
        }
        count >>= 1;
        pattern += pattern;
      }
      return result + pattern;
    }

    function outputLink(cap, link, raw, lexer) {
      const href = link.href;
      const title = link.title ? escape(link.title) : null;
      const text = cap[1].replace(/\\([\[\]])/g, '$1');

      if (cap[0].charAt(0) !== '!') {
        lexer.state.inLink = true;
        const token = {
          type: 'link',
          raw,
          href,
          title,
          text,
          tokens: lexer.inlineTokens(text, [])
        };
        lexer.state.inLink = false;
        return token;
      } else {
        return {
          type: 'image',
          raw,
          href,
          title,
          text: escape(text)
        };
      }
    }

    function indentCodeCompensation(raw, text) {
      const matchIndentToCode = raw.match(/^(\s+)(?:```)/);

      if (matchIndentToCode === null) {
        return text;
      }

      const indentToCode = matchIndentToCode[1];

      return text
        .split('\n')
        .map(node => {
          const matchIndentInNode = node.match(/^\s+/);
          if (matchIndentInNode === null) {
            return node;
          }

          const [indentInNode] = matchIndentInNode;

          if (indentInNode.length >= indentToCode.length) {
            return node.slice(indentToCode.length);
          }

          return node;
        })
        .join('\n');
    }

    /**
     * Tokenizer
     */
    class Tokenizer {
      constructor(options) {
        this.options = options || defaults;
      }

      space(src) {
        const cap = this.rules.block.newline.exec(src);
        if (cap) {
          if (cap[0].length > 1) {
            return {
              type: 'space',
              raw: cap[0]
            };
          }
          return { raw: '\n' };
        }
      }

      code(src) {
        const cap = this.rules.block.code.exec(src);
        if (cap) {
          const text = cap[0].replace(/^ {1,4}/gm, '');
          return {
            type: 'code',
            raw: cap[0],
            codeBlockStyle: 'indented',
            text: !this.options.pedantic
              ? rtrim(text, '\n')
              : text
          };
        }
      }

      fences(src) {
        const cap = this.rules.block.fences.exec(src);
        if (cap) {
          const raw = cap[0];
          const text = indentCodeCompensation(raw, cap[3] || '');

          return {
            type: 'code',
            raw,
            lang: cap[2] ? cap[2].trim() : cap[2],
            text
          };
        }
      }

      heading(src) {
        const cap = this.rules.block.heading.exec(src);
        if (cap) {
          let text = cap[2].trim();

          // remove trailing #s
          if (/#$/.test(text)) {
            const trimmed = rtrim(text, '#');
            if (this.options.pedantic) {
              text = trimmed.trim();
            } else if (!trimmed || / $/.test(trimmed)) {
              // CommonMark requires space before trailing #s
              text = trimmed.trim();
            }
          }

          const token = {
            type: 'heading',
            raw: cap[0],
            depth: cap[1].length,
            text: text,
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }

      hr(src) {
        const cap = this.rules.block.hr.exec(src);
        if (cap) {
          return {
            type: 'hr',
            raw: cap[0]
          };
        }
      }

      blockquote(src) {
        const cap = this.rules.block.blockquote.exec(src);
        if (cap) {
          const text = cap[0].replace(/^ *> ?/gm, '');

          return {
            type: 'blockquote',
            raw: cap[0],
            tokens: this.lexer.blockTokens(text, []),
            text
          };
        }
      }

      list(src) {
        let cap = this.rules.block.list.exec(src);
        if (cap) {
          let raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine,
            line, lines, itemContents;

          let bull = cap[1].trim();
          const isordered = bull.length > 1;

          const list = {
            type: 'list',
            raw: '',
            ordered: isordered,
            start: isordered ? +bull.slice(0, -1) : '',
            loose: false,
            items: []
          };

          bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;

          if (this.options.pedantic) {
            bull = isordered ? bull : '[*+-]';
          }

          // Get next list item
          const itemRegex = new RegExp(`^( {0,3}${bull})((?: [^\\n]*| *)(?:\\n[^\\n]*)*(?:\\n|$))`);

          // Get each top-level item
          while (src) {
            if (this.rules.block.hr.test(src)) { // End list if we encounter an HR (possibly move into itemRegex?)
              break;
            }

            if (!(cap = itemRegex.exec(src))) {
              break;
            }

            lines = cap[2].split('\n');

            if (this.options.pedantic) {
              indent = 2;
              itemContents = lines[0].trimLeft();
            } else {
              indent = cap[2].search(/[^ ]/); // Find first non-space char
              indent = cap[1].length + (indent > 4 ? 1 : indent); // intented code blocks after 4 spaces; indent is always 1
              itemContents = lines[0].slice(indent - cap[1].length);
            }

            blankLine = false;
            raw = cap[0];

            if (!lines[0] && /^ *$/.test(lines[1])) { // items begin with at most one blank line
              raw = cap[1] + lines.slice(0, 2).join('\n') + '\n';
              list.loose = true;
              lines = [];
            }

            const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])`);

            for (i = 1; i < lines.length; i++) {
              line = lines[i];

              if (this.options.pedantic) { // Re-align to follow commonmark nesting rules
                line = line.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');
              }

              // End list item if found start of new bullet
              if (nextBulletRegex.test(line)) {
                raw = cap[1] + lines.slice(0, i).join('\n') + '\n';
                break;
              }

              // Until we encounter a blank line, item contents do not need indentation
              if (!blankLine) {
                if (!line.trim()) { // Check if current line is empty
                  blankLine = true;
                }

                // Dedent if possible
                if (line.search(/[^ ]/) >= indent) {
                  itemContents += '\n' + line.slice(indent);
                } else {
                  itemContents += '\n' + line;
                }
                continue;
              }

              // Dedent this line
              if (line.search(/[^ ]/) >= indent || !line.trim()) {
                itemContents += '\n' + line.slice(indent);
                continue;
              } else { // Line was not properly indented; end of this item
                raw = cap[1] + lines.slice(0, i).join('\n') + '\n';
                break;
              }
            }

            if (!list.loose) {
              // If the previous item ended with a blank line, the list is loose
              if (endsWithBlankLine) {
                list.loose = true;
              } else if (/\n *\n *$/.test(raw)) {
                endsWithBlankLine = true;
              }
            }

            // Check for task list items
            if (this.options.gfm) {
              istask = /^\[[ xX]\] /.exec(itemContents);
              if (istask) {
                ischecked = istask[0] !== '[ ] ';
                itemContents = itemContents.replace(/^\[[ xX]\] +/, '');
              }
            }

            list.items.push({
              type: 'list_item',
              raw: raw,
              task: !!istask,
              checked: ischecked,
              loose: false,
              text: itemContents
            });

            list.raw += raw;
            src = src.slice(raw.length);
          }

          // Do not consume newlines at end of final item. Alternatively, make itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic
          list.items[list.items.length - 1].raw = raw.trimRight();
          list.items[list.items.length - 1].text = itemContents.trimRight();
          list.raw = list.raw.trimRight();

          const l = list.items.length;

          // Item child tokens handled here at end because we needed to have the final item to trim it first
          for (i = 0; i < l; i++) {
            this.lexer.state.top = false;
            list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
            if (list.items[i].tokens.some(t => t.type === 'space')) {
              list.loose = true;
              list.items[i].loose = true;
            }
          }

          return list;
        }
      }

      html(src) {
        const cap = this.rules.block.html.exec(src);
        if (cap) {
          const token = {
            type: 'html',
            raw: cap[0],
            pre: !this.options.sanitizer
              && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
            text: cap[0]
          };
          if (this.options.sanitize) {
            token.type = 'paragraph';
            token.text = this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]);
            token.tokens = [];
            this.lexer.inline(token.text, token.tokens);
          }
          return token;
        }
      }

      def(src) {
        const cap = this.rules.block.def.exec(src);
        if (cap) {
          if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
          const tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
          return {
            type: 'def',
            tag,
            raw: cap[0],
            href: cap[2],
            title: cap[3]
          };
        }
      }

      table(src) {
        const cap = this.rules.block.table.exec(src);
        if (cap) {
          const item = {
            type: 'table',
            header: splitCells(cap[1]).map(c => { return { text: c }; }),
            align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
            rows: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
          };

          if (item.header.length === item.align.length) {
            item.raw = cap[0];

            let l = item.align.length;
            let i, j, k, row;
            for (i = 0; i < l; i++) {
              if (/^ *-+: *$/.test(item.align[i])) {
                item.align[i] = 'right';
              } else if (/^ *:-+: *$/.test(item.align[i])) {
                item.align[i] = 'center';
              } else if (/^ *:-+ *$/.test(item.align[i])) {
                item.align[i] = 'left';
              } else {
                item.align[i] = null;
              }
            }

            l = item.rows.length;
            for (i = 0; i < l; i++) {
              item.rows[i] = splitCells(item.rows[i], item.header.length).map(c => { return { text: c }; });
            }

            // parse child tokens inside headers and cells

            // header child tokens
            l = item.header.length;
            for (j = 0; j < l; j++) {
              item.header[j].tokens = [];
              this.lexer.inlineTokens(item.header[j].text, item.header[j].tokens);
            }

            // cell child tokens
            l = item.rows.length;
            for (j = 0; j < l; j++) {
              row = item.rows[j];
              for (k = 0; k < row.length; k++) {
                row[k].tokens = [];
                this.lexer.inlineTokens(row[k].text, row[k].tokens);
              }
            }

            return item;
          }
        }
      }

      lheading(src) {
        const cap = this.rules.block.lheading.exec(src);
        if (cap) {
          const token = {
            type: 'heading',
            raw: cap[0],
            depth: cap[2].charAt(0) === '=' ? 1 : 2,
            text: cap[1],
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }

      paragraph(src) {
        const cap = this.rules.block.paragraph.exec(src);
        if (cap) {
          const token = {
            type: 'paragraph',
            raw: cap[0],
            text: cap[1].charAt(cap[1].length - 1) === '\n'
              ? cap[1].slice(0, -1)
              : cap[1],
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }

      text(src) {
        const cap = this.rules.block.text.exec(src);
        if (cap) {
          const token = {
            type: 'text',
            raw: cap[0],
            text: cap[0],
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }

      escape(src) {
        const cap = this.rules.inline.escape.exec(src);
        if (cap) {
          return {
            type: 'escape',
            raw: cap[0],
            text: escape(cap[1])
          };
        }
      }

      tag(src) {
        const cap = this.rules.inline.tag.exec(src);
        if (cap) {
          if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
            this.lexer.state.inLink = true;
          } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
            this.lexer.state.inLink = false;
          }
          if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
            this.lexer.state.inRawBlock = true;
          } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
            this.lexer.state.inRawBlock = false;
          }

          return {
            type: this.options.sanitize
              ? 'text'
              : 'html',
            raw: cap[0],
            inLink: this.lexer.state.inLink,
            inRawBlock: this.lexer.state.inRawBlock,
            text: this.options.sanitize
              ? (this.options.sanitizer
                ? this.options.sanitizer(cap[0])
                : escape(cap[0]))
              : cap[0]
          };
        }
      }

      link(src) {
        const cap = this.rules.inline.link.exec(src);
        if (cap) {
          const trimmedUrl = cap[2].trim();
          if (!this.options.pedantic && /^</.test(trimmedUrl)) {
            // commonmark requires matching angle brackets
            if (!(/>$/.test(trimmedUrl))) {
              return;
            }

            // ending angle bracket cannot be escaped
            const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');
            if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
              return;
            }
          } else {
            // find closing parenthesis
            const lastParenIndex = findClosingBracket(cap[2], '()');
            if (lastParenIndex > -1) {
              const start = cap[0].indexOf('!') === 0 ? 5 : 4;
              const linkLen = start + cap[1].length + lastParenIndex;
              cap[2] = cap[2].substring(0, lastParenIndex);
              cap[0] = cap[0].substring(0, linkLen).trim();
              cap[3] = '';
            }
          }
          let href = cap[2];
          let title = '';
          if (this.options.pedantic) {
            // split pedantic href and title
            const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

            if (link) {
              href = link[1];
              title = link[3];
            }
          } else {
            title = cap[3] ? cap[3].slice(1, -1) : '';
          }

          href = href.trim();
          if (/^</.test(href)) {
            if (this.options.pedantic && !(/>$/.test(trimmedUrl))) {
              // pedantic allows starting angle bracket without ending angle bracket
              href = href.slice(1);
            } else {
              href = href.slice(1, -1);
            }
          }
          return outputLink(cap, {
            href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
            title: title ? title.replace(this.rules.inline._escapes, '$1') : title
          }, cap[0], this.lexer);
        }
      }

      reflink(src, links) {
        let cap;
        if ((cap = this.rules.inline.reflink.exec(src))
            || (cap = this.rules.inline.nolink.exec(src))) {
          let link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
          link = links[link.toLowerCase()];
          if (!link || !link.href) {
            const text = cap[0].charAt(0);
            return {
              type: 'text',
              raw: text,
              text
            };
          }
          return outputLink(cap, link, cap[0], this.lexer);
        }
      }

      emStrong(src, maskedSrc, prevChar = '') {
        let match = this.rules.inline.emStrong.lDelim.exec(src);
        if (!match) return;

        // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well
        if (match[3] && prevChar.match(/[\p{L}\p{N}]/u)) return;

        const nextChar = match[1] || match[2] || '';

        if (!nextChar || (nextChar && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
          const lLength = match[0].length - 1;
          let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;

          const endReg = match[0][0] === '*' ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
          endReg.lastIndex = 0;

          // Clip maskedSrc to same section of string as src (move to lexer?)
          maskedSrc = maskedSrc.slice(-1 * src.length + lLength);

          while ((match = endReg.exec(maskedSrc)) != null) {
            rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];

            if (!rDelim) continue; // skip single * in __abc*abc__

            rLength = rDelim.length;

            if (match[3] || match[4]) { // found another Left Delim
              delimTotal += rLength;
              continue;
            } else if (match[5] || match[6]) { // either Left or Right Delim
              if (lLength % 3 && !((lLength + rLength) % 3)) {
                midDelimTotal += rLength;
                continue; // CommonMark Emphasis Rules 9-10
              }
            }

            delimTotal -= rLength;

            if (delimTotal > 0) continue; // Haven't found enough closing delimiters

            // Remove extra characters. *a*** -> *a*
            rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);

            // Create `em` if smallest delimiter has odd char count. *a***
            if (Math.min(lLength, rLength) % 2) {
              const text = src.slice(1, lLength + match.index + rLength);
              return {
                type: 'em',
                raw: src.slice(0, lLength + match.index + rLength + 1),
                text,
                tokens: this.lexer.inlineTokens(text, [])
              };
            }

            // Create 'strong' if smallest delimiter has even char count. **a***
            const text = src.slice(2, lLength + match.index + rLength - 1);
            return {
              type: 'strong',
              raw: src.slice(0, lLength + match.index + rLength + 1),
              text,
              tokens: this.lexer.inlineTokens(text, [])
            };
          }
        }
      }

      codespan(src) {
        const cap = this.rules.inline.code.exec(src);
        if (cap) {
          let text = cap[2].replace(/\n/g, ' ');
          const hasNonSpaceChars = /[^ ]/.test(text);
          const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
          if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
            text = text.substring(1, text.length - 1);
          }
          text = escape(text, true);
          return {
            type: 'codespan',
            raw: cap[0],
            text
          };
        }
      }

      br(src) {
        const cap = this.rules.inline.br.exec(src);
        if (cap) {
          return {
            type: 'br',
            raw: cap[0]
          };
        }
      }

      del(src) {
        const cap = this.rules.inline.del.exec(src);
        if (cap) {
          return {
            type: 'del',
            raw: cap[0],
            text: cap[2],
            tokens: this.lexer.inlineTokens(cap[2], [])
          };
        }
      }

      autolink(src, mangle) {
        const cap = this.rules.inline.autolink.exec(src);
        if (cap) {
          let text, href;
          if (cap[2] === '@') {
            text = escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
            href = 'mailto:' + text;
          } else {
            text = escape(cap[1]);
            href = text;
          }

          return {
            type: 'link',
            raw: cap[0],
            text,
            href,
            tokens: [
              {
                type: 'text',
                raw: text,
                text
              }
            ]
          };
        }
      }

      url(src, mangle) {
        let cap;
        if (cap = this.rules.inline.url.exec(src)) {
          let text, href;
          if (cap[2] === '@') {
            text = escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
            href = 'mailto:' + text;
          } else {
            // do extended autolink path validation
            let prevCapZero;
            do {
              prevCapZero = cap[0];
              cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
            } while (prevCapZero !== cap[0]);
            text = escape(cap[0]);
            if (cap[1] === 'www.') {
              href = 'http://' + text;
            } else {
              href = text;
            }
          }
          return {
            type: 'link',
            raw: cap[0],
            text,
            href,
            tokens: [
              {
                type: 'text',
                raw: text,
                text
              }
            ]
          };
        }
      }

      inlineText(src, smartypants) {
        const cap = this.rules.inline.text.exec(src);
        if (cap) {
          let text;
          if (this.lexer.state.inRawBlock) {
            text = this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0];
          } else {
            text = escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
          }
          return {
            type: 'text',
            raw: cap[0],
            text
          };
        }
      }
    }

    /**
     * Block-Level Grammar
     */
    const block = {
      newline: /^(?: *(?:\n|$))+/,
      code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
      fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
      hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
      heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
      blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
      list: /^( {0,3}bull)( [^\n]+?)?(?:\n|$)/,
      html: '^ {0,3}(?:' // optional indentation
        + '<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
        + '|comment[^\\n]*(\\n+|$)' // (2)
        + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
        + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
        + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
        + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (6)
        + '|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) open tag
        + '|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) closing tag
        + ')',
      def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
      table: noopTest,
      lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
      // regex template, placeholders will be replaced according to different paragraph
      // interruption rules of commonmark and the original markdown spec:
      _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html| +\n)[^\n]+)*)/,
      text: /^[^\n]+/
    };

    block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
    block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
    block.def = edit(block.def)
      .replace('label', block._label)
      .replace('title', block._title)
      .getRegex();

    block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
    block.listItemStart = edit(/^( *)(bull) */)
      .replace('bull', block.bullet)
      .getRegex();

    block.list = edit(block.list)
      .replace(/bull/g, block.bullet)
      .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
      .replace('def', '\\n+(?=' + block.def.source + ')')
      .getRegex();

    block._tag = 'address|article|aside|base|basefont|blockquote|body|caption'
      + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
      + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
      + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
      + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
      + '|track|ul';
    block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
    block.html = edit(block.html, 'i')
      .replace('comment', block._comment)
      .replace('tag', block._tag)
      .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
      .getRegex();

    block.paragraph = edit(block._paragraph)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('blockquote', ' {0,3}>')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
      .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();

    block.blockquote = edit(block.blockquote)
      .replace('paragraph', block.paragraph)
      .getRegex();

    /**
     * Normal Block Grammar
     */

    block.normal = merge({}, block);

    /**
     * GFM Block Grammar
     */

    block.gfm = merge({}, block.normal, {
      table: '^ *([^\\n ].*\\|.*)\\n' // Header
        + ' {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?' // Align
        + '(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells
    });

    block.gfm.table = edit(block.gfm.table)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('blockquote', ' {0,3}>')
      .replace('code', ' {4}[^\\n]')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
      .replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();

    /**
     * Pedantic grammar (original John Gruber's loose markdown specification)
     */

    block.pedantic = merge({}, block.normal, {
      html: edit(
        '^ *(?:comment *(?:\\n|\\s*$)'
        + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
        .replace('comment', block._comment)
        .replace(/tag/g, '(?!(?:'
          + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
          + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
          + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
        .getRegex(),
      def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
      heading: /^(#{1,6})(.*)(?:\n+|$)/,
      fences: noopTest, // fences not supported
      paragraph: edit(block.normal._paragraph)
        .replace('hr', block.hr)
        .replace('heading', ' *#{1,6} *[^\n]')
        .replace('lheading', block.lheading)
        .replace('blockquote', ' {0,3}>')
        .replace('|fences', '')
        .replace('|list', '')
        .replace('|html', '')
        .getRegex()
    });

    /**
     * Inline-Level Grammar
     */
    const inline = {
      escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
      autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
      url: noopTest,
      tag: '^comment'
        + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
        + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
        + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
        + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
        + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', // CDATA section
      link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
      reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
      nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
      reflinkSearch: 'reflink|nolink(?!\\()',
      emStrong: {
        lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
        //        (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
        //        () Skip orphan delim inside strong    (1) #***                (2) a***#, a***                   (3) #***a, ***a                 (4) ***#              (5) #***#                 (6) a***a
        rDelimAst: /^[^_*]*?\_\_[^_*]*?\*[^_*]*?(?=\_\_)|[punct_](\*+)(?=[\s]|$)|[^punct*_\s](\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|[^punct*_\s](\*+)(?=[^punct*_\s])/,
        rDelimUnd: /^[^_*]*?\*\*[^_*]*?\_[^_*]*?(?=\*\*)|[punct*](\_+)(?=[\s]|$)|[^punct*_\s](\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/ // ^- Not allowed for _
      },
      code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
      br: /^( {2,}|\\)\n(?!\s*$)/,
      del: noopTest,
      text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
      punctuation: /^([\spunctuation])/
    };

    // list of punctuation marks from CommonMark spec
    // without * and _ to handle the different emphasis markers * and _
    inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
    inline.punctuation = edit(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex();

    // sequences em should skip over [title](link), `code`, <html>
    inline.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
    inline.escapedEmSt = /\\\*|\\_/g;

    inline._comment = edit(block._comment).replace('(?:-->|$)', '-->').getRegex();

    inline.emStrong.lDelim = edit(inline.emStrong.lDelim)
      .replace(/punct/g, inline._punctuation)
      .getRegex();

    inline.emStrong.rDelimAst = edit(inline.emStrong.rDelimAst, 'g')
      .replace(/punct/g, inline._punctuation)
      .getRegex();

    inline.emStrong.rDelimUnd = edit(inline.emStrong.rDelimUnd, 'g')
      .replace(/punct/g, inline._punctuation)
      .getRegex();

    inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;

    inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
    inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
    inline.autolink = edit(inline.autolink)
      .replace('scheme', inline._scheme)
      .replace('email', inline._email)
      .getRegex();

    inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;

    inline.tag = edit(inline.tag)
      .replace('comment', inline._comment)
      .replace('attribute', inline._attribute)
      .getRegex();

    inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
    inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
    inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

    inline.link = edit(inline.link)
      .replace('label', inline._label)
      .replace('href', inline._href)
      .replace('title', inline._title)
      .getRegex();

    inline.reflink = edit(inline.reflink)
      .replace('label', inline._label)
      .getRegex();

    inline.reflinkSearch = edit(inline.reflinkSearch, 'g')
      .replace('reflink', inline.reflink)
      .replace('nolink', inline.nolink)
      .getRegex();

    /**
     * Normal Inline Grammar
     */

    inline.normal = merge({}, inline);

    /**
     * Pedantic Inline Grammar
     */

    inline.pedantic = merge({}, inline.normal, {
      strong: {
        start: /^__|\*\*/,
        middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
        endAst: /\*\*(?!\*)/g,
        endUnd: /__(?!_)/g
      },
      em: {
        start: /^_|\*/,
        middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
        endAst: /\*(?!\*)/g,
        endUnd: /_(?!_)/g
      },
      link: edit(/^!?\[(label)\]\((.*?)\)/)
        .replace('label', inline._label)
        .getRegex(),
      reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
        .replace('label', inline._label)
        .getRegex()
    });

    /**
     * GFM Inline Grammar
     */

    inline.gfm = merge({}, inline.normal, {
      escape: edit(inline.escape).replace('])', '~|])').getRegex(),
      _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
      url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
      _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
      del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
      text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
    });

    inline.gfm.url = edit(inline.gfm.url, 'i')
      .replace('email', inline.gfm._extended_email)
      .getRegex();
    /**
     * GFM + Line Breaks Inline Grammar
     */

    inline.breaks = merge({}, inline.gfm, {
      br: edit(inline.br).replace('{2,}', '*').getRegex(),
      text: edit(inline.gfm.text)
        .replace('\\b_', '\\b_| {2,}\\n')
        .replace(/\{2,\}/g, '*')
        .getRegex()
    });

    /**
     * smartypants text replacement
     */
    function smartypants(text) {
      return text
        // em-dashes
        .replace(/---/g, '\u2014')
        // en-dashes
        .replace(/--/g, '\u2013')
        // opening singles
        .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
        // closing singles & apostrophes
        .replace(/'/g, '\u2019')
        // opening doubles
        .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
        // closing doubles
        .replace(/"/g, '\u201d')
        // ellipses
        .replace(/\.{3}/g, '\u2026');
    }

    /**
     * mangle email addresses
     */
    function mangle(text) {
      let out = '',
        i,
        ch;

      const l = text.length;
      for (i = 0; i < l; i++) {
        ch = text.charCodeAt(i);
        if (Math.random() > 0.5) {
          ch = 'x' + ch.toString(16);
        }
        out += '&#' + ch + ';';
      }

      return out;
    }

    /**
     * Block Lexer
     */
    class Lexer {
      constructor(options) {
        this.tokens = [];
        this.tokens.links = Object.create(null);
        this.options = options || defaults;
        this.options.tokenizer = this.options.tokenizer || new Tokenizer();
        this.tokenizer = this.options.tokenizer;
        this.tokenizer.options = this.options;
        this.tokenizer.lexer = this;
        this.inlineQueue = [];
        this.state = {
          inLink: false,
          inRawBlock: false,
          top: true
        };

        const rules = {
          block: block.normal,
          inline: inline.normal
        };

        if (this.options.pedantic) {
          rules.block = block.pedantic;
          rules.inline = inline.pedantic;
        } else if (this.options.gfm) {
          rules.block = block.gfm;
          if (this.options.breaks) {
            rules.inline = inline.breaks;
          } else {
            rules.inline = inline.gfm;
          }
        }
        this.tokenizer.rules = rules;
      }

      /**
       * Expose Rules
       */
      static get rules() {
        return {
          block,
          inline
        };
      }

      /**
       * Static Lex Method
       */
      static lex(src, options) {
        const lexer = new Lexer(options);
        return lexer.lex(src);
      }

      /**
       * Static Lex Inline Method
       */
      static lexInline(src, options) {
        const lexer = new Lexer(options);
        return lexer.inlineTokens(src);
      }

      /**
       * Preprocessing
       */
      lex(src) {
        src = src
          .replace(/\r\n|\r/g, '\n')
          .replace(/\t/g, '    ');

        this.blockTokens(src, this.tokens);

        let next;
        while (next = this.inlineQueue.shift()) {
          this.inlineTokens(next.src, next.tokens);
        }

        return this.tokens;
      }

      /**
       * Lexing
       */
      blockTokens(src, tokens = []) {
        if (this.options.pedantic) {
          src = src.replace(/^ +$/gm, '');
        }
        let token, lastToken, cutSrc, lastParagraphClipped;

        while (src) {
          if (this.options.extensions
            && this.options.extensions.block
            && this.options.extensions.block.some((extTokenizer) => {
              if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                return true;
              }
              return false;
            })) {
            continue;
          }

          // newline
          if (token = this.tokenizer.space(src)) {
            src = src.substring(token.raw.length);
            if (token.type) {
              tokens.push(token);
            }
            continue;
          }

          // code
          if (token = this.tokenizer.code(src)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            // An indented code block cannot interrupt a paragraph.
            if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
              lastToken.raw += '\n' + token.raw;
              lastToken.text += '\n' + token.text;
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          // fences
          if (token = this.tokenizer.fences(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // heading
          if (token = this.tokenizer.heading(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // hr
          if (token = this.tokenizer.hr(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // blockquote
          if (token = this.tokenizer.blockquote(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // list
          if (token = this.tokenizer.list(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // html
          if (token = this.tokenizer.html(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // def
          if (token = this.tokenizer.def(src)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
              lastToken.raw += '\n' + token.raw;
              lastToken.text += '\n' + token.raw;
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else if (!this.tokens.links[token.tag]) {
              this.tokens.links[token.tag] = {
                href: token.href,
                title: token.title
              };
            }
            continue;
          }

          // table (gfm)
          if (token = this.tokenizer.table(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // lheading
          if (token = this.tokenizer.lheading(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // top-level paragraph
          // prevent paragraph consuming extensions by clipping 'src' to extension start
          cutSrc = src;
          if (this.options.extensions && this.options.extensions.startBlock) {
            let startIndex = Infinity;
            const tempSrc = src.slice(1);
            let tempStart;
            this.options.extensions.startBlock.forEach(function(getStartIndex) {
              tempStart = getStartIndex.call({ lexer: this }, tempSrc);
              if (typeof tempStart === 'number' && tempStart >= 0) { startIndex = Math.min(startIndex, tempStart); }
            });
            if (startIndex < Infinity && startIndex >= 0) {
              cutSrc = src.substring(0, startIndex + 1);
            }
          }
          if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
            lastToken = tokens[tokens.length - 1];
            if (lastParagraphClipped && lastToken.type === 'paragraph') {
              lastToken.raw += '\n' + token.raw;
              lastToken.text += '\n' + token.text;
              this.inlineQueue.pop();
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else {
              tokens.push(token);
            }
            lastParagraphClipped = (cutSrc.length !== src.length);
            src = src.substring(token.raw.length);
            continue;
          }

          // text
          if (token = this.tokenizer.text(src)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && lastToken.type === 'text') {
              lastToken.raw += '\n' + token.raw;
              lastToken.text += '\n' + token.text;
              this.inlineQueue.pop();
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          if (src) {
            const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
            if (this.options.silent) {
              console.error(errMsg);
              break;
            } else {
              throw new Error(errMsg);
            }
          }
        }

        this.state.top = true;
        return tokens;
      }

      inline(src, tokens) {
        this.inlineQueue.push({ src, tokens });
      }

      /**
       * Lexing/Compiling
       */
      inlineTokens(src, tokens = []) {
        let token, lastToken, cutSrc;

        // String with links masked to avoid interference with em and strong
        let maskedSrc = src;
        let match;
        let keepPrevChar, prevChar;

        // Mask out reflinks
        if (this.tokens.links) {
          const links = Object.keys(this.tokens.links);
          if (links.length > 0) {
            while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
              if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
                maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
              }
            }
          }
        }
        // Mask out other blocks
        while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
          maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
        }

        // Mask out escaped em & strong delimiters
        while ((match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null) {
          maskedSrc = maskedSrc.slice(0, match.index) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
        }

        while (src) {
          if (!keepPrevChar) {
            prevChar = '';
          }
          keepPrevChar = false;

          // extensions
          if (this.options.extensions
            && this.options.extensions.inline
            && this.options.extensions.inline.some((extTokenizer) => {
              if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                return true;
              }
              return false;
            })) {
            continue;
          }

          // escape
          if (token = this.tokenizer.escape(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // tag
          if (token = this.tokenizer.tag(src)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && token.type === 'text' && lastToken.type === 'text') {
              lastToken.raw += token.raw;
              lastToken.text += token.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          // link
          if (token = this.tokenizer.link(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // reflink, nolink
          if (token = this.tokenizer.reflink(src, this.tokens.links)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && token.type === 'text' && lastToken.type === 'text') {
              lastToken.raw += token.raw;
              lastToken.text += token.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          // em & strong
          if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // code
          if (token = this.tokenizer.codespan(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // br
          if (token = this.tokenizer.br(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // del (gfm)
          if (token = this.tokenizer.del(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // autolink
          if (token = this.tokenizer.autolink(src, mangle)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // url (gfm)
          if (!this.state.inLink && (token = this.tokenizer.url(src, mangle))) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // text
          // prevent inlineText consuming extensions by clipping 'src' to extension start
          cutSrc = src;
          if (this.options.extensions && this.options.extensions.startInline) {
            let startIndex = Infinity;
            const tempSrc = src.slice(1);
            let tempStart;
            this.options.extensions.startInline.forEach(function(getStartIndex) {
              tempStart = getStartIndex.call({ lexer: this }, tempSrc);
              if (typeof tempStart === 'number' && tempStart >= 0) { startIndex = Math.min(startIndex, tempStart); }
            });
            if (startIndex < Infinity && startIndex >= 0) {
              cutSrc = src.substring(0, startIndex + 1);
            }
          }
          if (token = this.tokenizer.inlineText(cutSrc, smartypants)) {
            src = src.substring(token.raw.length);
            if (token.raw.slice(-1) !== '_') { // Track prevChar before string of ____ started
              prevChar = token.raw.slice(-1);
            }
            keepPrevChar = true;
            lastToken = tokens[tokens.length - 1];
            if (lastToken && lastToken.type === 'text') {
              lastToken.raw += token.raw;
              lastToken.text += token.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          if (src) {
            const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
            if (this.options.silent) {
              console.error(errMsg);
              break;
            } else {
              throw new Error(errMsg);
            }
          }
        }

        return tokens;
      }
    }

    /**
     * Renderer
     */
    class Renderer {
      constructor(options) {
        this.options = options || defaults;
      }

      code(code, infostring, escaped) {
        const lang = (infostring || '').match(/\S*/)[0];
        if (this.options.highlight) {
          const out = this.options.highlight(code, lang);
          if (out != null && out !== code) {
            escaped = true;
            code = out;
          }
        }

        code = code.replace(/\n$/, '') + '\n';

        if (!lang) {
          return '<pre><code>'
            + (escaped ? code : escape(code, true))
            + '</code></pre>\n';
        }

        return '<pre><code class="'
          + this.options.langPrefix
          + escape(lang, true)
          + '">'
          + (escaped ? code : escape(code, true))
          + '</code></pre>\n';
      }

      blockquote(quote) {
        return '<blockquote>\n' + quote + '</blockquote>\n';
      }

      html(html) {
        return html;
      }

      heading(text, level, raw, slugger) {
        if (this.options.headerIds) {
          return '<h'
            + level
            + ' id="'
            + this.options.headerPrefix
            + slugger.slug(raw)
            + '">'
            + text
            + '</h'
            + level
            + '>\n';
        }
        // ignore IDs
        return '<h' + level + '>' + text + '</h' + level + '>\n';
      }

      hr() {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
      }

      list(body, ordered, start) {
        const type = ordered ? 'ol' : 'ul',
          startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
        return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
      }

      listitem(text) {
        return '<li>' + text + '</li>\n';
      }

      checkbox(checked) {
        return '<input '
          + (checked ? 'checked="" ' : '')
          + 'disabled="" type="checkbox"'
          + (this.options.xhtml ? ' /' : '')
          + '> ';
      }

      paragraph(text) {
        return '<p>' + text + '</p>\n';
      }

      table(header, body) {
        if (body) body = '<tbody>' + body + '</tbody>';

        return '<table>\n'
          + '<thead>\n'
          + header
          + '</thead>\n'
          + body
          + '</table>\n';
      }

      tablerow(content) {
        return '<tr>\n' + content + '</tr>\n';
      }

      tablecell(content, flags) {
        const type = flags.header ? 'th' : 'td';
        const tag = flags.align
          ? '<' + type + ' align="' + flags.align + '">'
          : '<' + type + '>';
        return tag + content + '</' + type + '>\n';
      }

      // span level renderer
      strong(text) {
        return '<strong>' + text + '</strong>';
      }

      em(text) {
        return '<em>' + text + '</em>';
      }

      codespan(text) {
        return '<code>' + text + '</code>';
      }

      br() {
        return this.options.xhtml ? '<br/>' : '<br>';
      }

      del(text) {
        return '<del>' + text + '</del>';
      }

      link(href, title, text) {
        href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }
        let out = '<a href="' + escape(href) + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += '>' + text + '</a>';
        return out;
      }

      image(href, title, text) {
        href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }

        let out = '<img src="' + href + '" alt="' + text + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';
        return out;
      }

      text(text) {
        return text;
      }
    }

    /**
     * TextRenderer
     * returns only the textual part of the token
     */
    class TextRenderer {
      // no need for block level renderers
      strong(text) {
        return text;
      }

      em(text) {
        return text;
      }

      codespan(text) {
        return text;
      }

      del(text) {
        return text;
      }

      html(text) {
        return text;
      }

      text(text) {
        return text;
      }

      link(href, title, text) {
        return '' + text;
      }

      image(href, title, text) {
        return '' + text;
      }

      br() {
        return '';
      }
    }

    /**
     * Slugger generates header id
     */
    class Slugger {
      constructor() {
        this.seen = {};
      }

      serialize(value) {
        return value
          .toLowerCase()
          .trim()
          // remove html tags
          .replace(/<[!\/a-z].*?>/ig, '')
          // remove unwanted chars
          .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
          .replace(/\s/g, '-');
      }

      /**
       * Finds the next safe (unique) slug to use
       */
      getNextSafeSlug(originalSlug, isDryRun) {
        let slug = originalSlug;
        let occurenceAccumulator = 0;
        if (this.seen.hasOwnProperty(slug)) {
          occurenceAccumulator = this.seen[originalSlug];
          do {
            occurenceAccumulator++;
            slug = originalSlug + '-' + occurenceAccumulator;
          } while (this.seen.hasOwnProperty(slug));
        }
        if (!isDryRun) {
          this.seen[originalSlug] = occurenceAccumulator;
          this.seen[slug] = 0;
        }
        return slug;
      }

      /**
       * Convert string to unique id
       * @param {object} options
       * @param {boolean} options.dryrun Generates the next unique slug without updating the internal accumulator.
       */
      slug(value, options = {}) {
        const slug = this.serialize(value);
        return this.getNextSafeSlug(slug, options.dryrun);
      }
    }

    /**
     * Parsing & Compiling
     */
    class Parser {
      constructor(options) {
        this.options = options || defaults;
        this.options.renderer = this.options.renderer || new Renderer();
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;
        this.textRenderer = new TextRenderer();
        this.slugger = new Slugger();
      }

      /**
       * Static Parse Method
       */
      static parse(tokens, options) {
        const parser = new Parser(options);
        return parser.parse(tokens);
      }

      /**
       * Static Parse Inline Method
       */
      static parseInline(tokens, options) {
        const parser = new Parser(options);
        return parser.parseInline(tokens);
      }

      /**
       * Parse Loop
       */
      parse(tokens, top = true) {
        let out = '',
          i,
          j,
          k,
          l2,
          l3,
          row,
          cell,
          header,
          body,
          token,
          ordered,
          start,
          loose,
          itemBody,
          item,
          checked,
          task,
          checkbox,
          ret;

        const l = tokens.length;
        for (i = 0; i < l; i++) {
          token = tokens[i];

          // Run any renderer extensions
          if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
            ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
            if (ret !== false || !['space', 'hr', 'heading', 'code', 'table', 'blockquote', 'list', 'html', 'paragraph', 'text'].includes(token.type)) {
              out += ret || '';
              continue;
            }
          }

          switch (token.type) {
            case 'space': {
              continue;
            }
            case 'hr': {
              out += this.renderer.hr();
              continue;
            }
            case 'heading': {
              out += this.renderer.heading(
                this.parseInline(token.tokens),
                token.depth,
                unescape(this.parseInline(token.tokens, this.textRenderer)),
                this.slugger);
              continue;
            }
            case 'code': {
              out += this.renderer.code(token.text,
                token.lang,
                token.escaped);
              continue;
            }
            case 'table': {
              header = '';

              // header
              cell = '';
              l2 = token.header.length;
              for (j = 0; j < l2; j++) {
                cell += this.renderer.tablecell(
                  this.parseInline(token.header[j].tokens),
                  { header: true, align: token.align[j] }
                );
              }
              header += this.renderer.tablerow(cell);

              body = '';
              l2 = token.rows.length;
              for (j = 0; j < l2; j++) {
                row = token.rows[j];

                cell = '';
                l3 = row.length;
                for (k = 0; k < l3; k++) {
                  cell += this.renderer.tablecell(
                    this.parseInline(row[k].tokens),
                    { header: false, align: token.align[k] }
                  );
                }

                body += this.renderer.tablerow(cell);
              }
              out += this.renderer.table(header, body);
              continue;
            }
            case 'blockquote': {
              body = this.parse(token.tokens);
              out += this.renderer.blockquote(body);
              continue;
            }
            case 'list': {
              ordered = token.ordered;
              start = token.start;
              loose = token.loose;
              l2 = token.items.length;

              body = '';
              for (j = 0; j < l2; j++) {
                item = token.items[j];
                checked = item.checked;
                task = item.task;

                itemBody = '';
                if (item.task) {
                  checkbox = this.renderer.checkbox(checked);
                  if (loose) {
                    if (item.tokens.length > 0 && item.tokens[0].type === 'paragraph') {
                      item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;
                      if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                        item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                      }
                    } else {
                      item.tokens.unshift({
                        type: 'text',
                        text: checkbox
                      });
                    }
                  } else {
                    itemBody += checkbox;
                  }
                }

                itemBody += this.parse(item.tokens, loose);
                body += this.renderer.listitem(itemBody, task, checked);
              }

              out += this.renderer.list(body, ordered, start);
              continue;
            }
            case 'html': {
              // TODO parse inline content if parameter markdown=1
              out += this.renderer.html(token.text);
              continue;
            }
            case 'paragraph': {
              out += this.renderer.paragraph(this.parseInline(token.tokens));
              continue;
            }
            case 'text': {
              body = token.tokens ? this.parseInline(token.tokens) : token.text;
              while (i + 1 < l && tokens[i + 1].type === 'text') {
                token = tokens[++i];
                body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
              }
              out += top ? this.renderer.paragraph(body) : body;
              continue;
            }

            default: {
              const errMsg = 'Token with "' + token.type + '" type was not found.';
              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
          }
        }

        return out;
      }

      /**
       * Parse Inline Tokens
       */
      parseInline(tokens, renderer) {
        renderer = renderer || this.renderer;
        let out = '',
          i,
          token,
          ret;

        const l = tokens.length;
        for (i = 0; i < l; i++) {
          token = tokens[i];

          // Run any renderer extensions
          if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
            ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
            if (ret !== false || !['escape', 'html', 'link', 'image', 'strong', 'em', 'codespan', 'br', 'del', 'text'].includes(token.type)) {
              out += ret || '';
              continue;
            }
          }

          switch (token.type) {
            case 'escape': {
              out += renderer.text(token.text);
              break;
            }
            case 'html': {
              out += renderer.html(token.text);
              break;
            }
            case 'link': {
              out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
              break;
            }
            case 'image': {
              out += renderer.image(token.href, token.title, token.text);
              break;
            }
            case 'strong': {
              out += renderer.strong(this.parseInline(token.tokens, renderer));
              break;
            }
            case 'em': {
              out += renderer.em(this.parseInline(token.tokens, renderer));
              break;
            }
            case 'codespan': {
              out += renderer.codespan(token.text);
              break;
            }
            case 'br': {
              out += renderer.br();
              break;
            }
            case 'del': {
              out += renderer.del(this.parseInline(token.tokens, renderer));
              break;
            }
            case 'text': {
              out += renderer.text(token.text);
              break;
            }
            default: {
              const errMsg = 'Token with "' + token.type + '" type was not found.';
              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
          }
        }
        return out;
      }
    }

    /**
     * Marked
     */
    function marked(src, opt, callback) {
      // throw error in case of non string input
      if (typeof src === 'undefined' || src === null) {
        throw new Error('marked(): input parameter is undefined or null');
      }
      if (typeof src !== 'string') {
        throw new Error('marked(): input parameter is of type '
          + Object.prototype.toString.call(src) + ', string expected');
      }

      if (typeof opt === 'function') {
        callback = opt;
        opt = null;
      }

      opt = merge({}, marked.defaults, opt || {});
      checkSanitizeDeprecation(opt);

      if (callback) {
        const highlight = opt.highlight;
        let tokens;

        try {
          tokens = Lexer.lex(src, opt);
        } catch (e) {
          return callback(e);
        }

        const done = function(err) {
          let out;

          if (!err) {
            try {
              if (opt.walkTokens) {
                marked.walkTokens(tokens, opt.walkTokens);
              }
              out = Parser.parse(tokens, opt);
            } catch (e) {
              err = e;
            }
          }

          opt.highlight = highlight;

          return err
            ? callback(err)
            : callback(null, out);
        };

        if (!highlight || highlight.length < 3) {
          return done();
        }

        delete opt.highlight;

        if (!tokens.length) return done();

        let pending = 0;
        marked.walkTokens(tokens, function(token) {
          if (token.type === 'code') {
            pending++;
            setTimeout(() => {
              highlight(token.text, token.lang, function(err, code) {
                if (err) {
                  return done(err);
                }
                if (code != null && code !== token.text) {
                  token.text = code;
                  token.escaped = true;
                }

                pending--;
                if (pending === 0) {
                  done();
                }
              });
            }, 0);
          }
        });

        if (pending === 0) {
          done();
        }

        return;
      }

      try {
        const tokens = Lexer.lex(src, opt);
        if (opt.walkTokens) {
          marked.walkTokens(tokens, opt.walkTokens);
        }
        return Parser.parse(tokens, opt);
      } catch (e) {
        e.message += '\nPlease report this to https://github.com/markedjs/marked.';
        if (opt.silent) {
          return '<p>An error occurred:</p><pre>'
            + escape(e.message + '', true)
            + '</pre>';
        }
        throw e;
      }
    }

    /**
     * Options
     */

    marked.options =
    marked.setOptions = function(opt) {
      merge(marked.defaults, opt);
      changeDefaults(marked.defaults);
      return marked;
    };

    marked.getDefaults = getDefaults;

    marked.defaults = defaults;

    /**
     * Use Extension
     */

    marked.use = function(...args) {
      const opts = merge({}, ...args);
      const extensions = marked.defaults.extensions || { renderers: {}, childTokens: {} };
      let hasExtensions;

      args.forEach((pack) => {
        // ==-- Parse "addon" extensions --== //
        if (pack.extensions) {
          hasExtensions = true;
          pack.extensions.forEach((ext) => {
            if (!ext.name) {
              throw new Error('extension name required');
            }
            if (ext.renderer) { // Renderer extensions
              const prevRenderer = extensions.renderers ? extensions.renderers[ext.name] : null;
              if (prevRenderer) {
                // Replace extension with func to run new extension but fall back if false
                extensions.renderers[ext.name] = function(...args) {
                  let ret = ext.renderer.apply(this, args);
                  if (ret === false) {
                    ret = prevRenderer.apply(this, args);
                  }
                  return ret;
                };
              } else {
                extensions.renderers[ext.name] = ext.renderer;
              }
            }
            if (ext.tokenizer) { // Tokenizer Extensions
              if (!ext.level || (ext.level !== 'block' && ext.level !== 'inline')) {
                throw new Error("extension level must be 'block' or 'inline'");
              }
              if (extensions[ext.level]) {
                extensions[ext.level].unshift(ext.tokenizer);
              } else {
                extensions[ext.level] = [ext.tokenizer];
              }
              if (ext.start) { // Function to check for start of token
                if (ext.level === 'block') {
                  if (extensions.startBlock) {
                    extensions.startBlock.push(ext.start);
                  } else {
                    extensions.startBlock = [ext.start];
                  }
                } else if (ext.level === 'inline') {
                  if (extensions.startInline) {
                    extensions.startInline.push(ext.start);
                  } else {
                    extensions.startInline = [ext.start];
                  }
                }
              }
            }
            if (ext.childTokens) { // Child tokens to be visited by walkTokens
              extensions.childTokens[ext.name] = ext.childTokens;
            }
          });
        }

        // ==-- Parse "overwrite" extensions --== //
        if (pack.renderer) {
          const renderer = marked.defaults.renderer || new Renderer();
          for (const prop in pack.renderer) {
            const prevRenderer = renderer[prop];
            // Replace renderer with func to run extension, but fall back if false
            renderer[prop] = (...args) => {
              let ret = pack.renderer[prop].apply(renderer, args);
              if (ret === false) {
                ret = prevRenderer.apply(renderer, args);
              }
              return ret;
            };
          }
          opts.renderer = renderer;
        }
        if (pack.tokenizer) {
          const tokenizer = marked.defaults.tokenizer || new Tokenizer();
          for (const prop in pack.tokenizer) {
            const prevTokenizer = tokenizer[prop];
            // Replace tokenizer with func to run extension, but fall back if false
            tokenizer[prop] = (...args) => {
              let ret = pack.tokenizer[prop].apply(tokenizer, args);
              if (ret === false) {
                ret = prevTokenizer.apply(tokenizer, args);
              }
              return ret;
            };
          }
          opts.tokenizer = tokenizer;
        }

        // ==-- Parse WalkTokens extensions --== //
        if (pack.walkTokens) {
          const walkTokens = marked.defaults.walkTokens;
          opts.walkTokens = function(token) {
            pack.walkTokens.call(this, token);
            if (walkTokens) {
              walkTokens.call(this, token);
            }
          };
        }

        if (hasExtensions) {
          opts.extensions = extensions;
        }

        marked.setOptions(opts);
      });
    };

    /**
     * Run callback for every token
     */

    marked.walkTokens = function(tokens, callback) {
      for (const token of tokens) {
        callback.call(marked, token);
        switch (token.type) {
          case 'table': {
            for (const cell of token.header) {
              marked.walkTokens(cell.tokens, callback);
            }
            for (const row of token.rows) {
              for (const cell of row) {
                marked.walkTokens(cell.tokens, callback);
              }
            }
            break;
          }
          case 'list': {
            marked.walkTokens(token.items, callback);
            break;
          }
          default: {
            if (marked.defaults.extensions && marked.defaults.extensions.childTokens && marked.defaults.extensions.childTokens[token.type]) { // Walk any extensions
              marked.defaults.extensions.childTokens[token.type].forEach(function(childTokens) {
                marked.walkTokens(token[childTokens], callback);
              });
            } else if (token.tokens) {
              marked.walkTokens(token.tokens, callback);
            }
          }
        }
      }
    };

    /**
     * Parse Inline
     */
    marked.parseInline = function(src, opt) {
      // throw error in case of non string input
      if (typeof src === 'undefined' || src === null) {
        throw new Error('marked.parseInline(): input parameter is undefined or null');
      }
      if (typeof src !== 'string') {
        throw new Error('marked.parseInline(): input parameter is of type '
          + Object.prototype.toString.call(src) + ', string expected');
      }

      opt = merge({}, marked.defaults, opt || {});
      checkSanitizeDeprecation(opt);

      try {
        const tokens = Lexer.lexInline(src, opt);
        if (opt.walkTokens) {
          marked.walkTokens(tokens, opt.walkTokens);
        }
        return Parser.parseInline(tokens, opt);
      } catch (e) {
        e.message += '\nPlease report this to https://github.com/markedjs/marked.';
        if (opt.silent) {
          return '<p>An error occurred:</p><pre>'
            + escape(e.message + '', true)
            + '</pre>';
        }
        throw e;
      }
    };

    /**
     * Expose
     */
    marked.Parser = Parser;
    marked.parser = Parser.parse;
    marked.Renderer = Renderer;
    marked.TextRenderer = TextRenderer;
    marked.Lexer = Lexer;
    marked.lexer = Lexer.lex;
    marked.Tokenizer = Tokenizer;
    marked.Slugger = Slugger;
    marked.parse = marked;

    const options = marked.options;
    const setOptions = marked.setOptions;
    const use = marked.use;
    const walkTokens = marked.walkTokens;
    const parseInline = marked.parseInline;
    const parse = marked;
    const parser = Parser.parse;
    const lexer = Lexer.lex;

    var Marked = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Lexer: Lexer,
        Parser: Parser,
        Renderer: Renderer,
        Slugger: Slugger,
        TextRenderer: TextRenderer,
        Tokenizer: Tokenizer,
        get defaults () { return defaults; },
        getDefaults: getDefaults,
        lexer: lexer,
        marked: marked,
        options: options,
        parse: parse,
        parseInline: parseInline,
        parser: parser,
        setOptions: setOptions,
        use: use,
        walkTokens: walkTokens
    });

    /* src/component/info/Info.svelte generated by Svelte v3.44.1 */

    const { console: console_1 } = globals;
    const file$4 = "src/component/info/Info.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (77:4) {#each MachineStore.Info.currentBgUrl as url}
    function create_each_block$1(ctx) {
    	let link;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "rel", "preload");
    			attr_dev(link, "href", /*url*/ ctx[10]);
    			attr_dev(link, "as", "image");
    			attr_dev(link, "class", "svelte-ym59cl");
    			add_location(link, file$4, 77, 8, 2862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(77:4) {#each MachineStore.Info.currentBgUrl as url}",
    		ctx
    	});

    	return block;
    }

    // (82:4) {#if backgroundImageUrl}
    function create_if_block_1$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "info-background-image svelte-ym59cl");
    			if (!src_url_equal(img.src, img_src_value = /*backgroundImageUrl*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "info background");
    			add_location(img, file$4, 82, 4, 2986);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*backgroundImageUrl*/ 1 && !src_url_equal(img.src, img_src_value = /*backgroundImageUrl*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(82:4) {#if backgroundImageUrl}",
    		ctx
    	});

    	return block;
    }

    // (87:8) {#if isFinalPage}
    function create_if_block$2(ctx) {
    	let enterprompt;
    	let current;

    	enterprompt = new EnterPrompt({
    			props: { ornament: "→", onClick: /*leave*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(enterprompt.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(enterprompt, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(enterprompt.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(enterprompt.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(enterprompt, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(87:8) {#if isFinalPage}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let each_1_anchor;
    	let t0;
    	let div1;
    	let t1;
    	let div0;
    	let html_tag;
    	let t2;
    	let t3;
    	let infopageindicator;
    	let t4;
    	let span;
    	let i;
    	let t5;
    	let current;
    	let each_value = MachineStore.Info.currentBgUrl;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block0 = /*backgroundImageUrl*/ ctx[0] && create_if_block_1$2(ctx);
    	let if_block1 = /*isFinalPage*/ ctx[3] && create_if_block$2(ctx);
    	infopageindicator = new InfoPageIndicator({ $$inline: true });

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			t0 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div0 = element("div");
    			html_tag = new HtmlTag();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			create_component(infopageindicator.$$.fragment);
    			t4 = space();
    			span = element("span");
    			i = element("i");
    			t5 = text(/*documentTitle*/ ctx[1]);
    			html_tag.a = t2;
    			attr_dev(div0, "class", "info-content svelte-ym59cl");
    			add_location(div0, file$4, 84, 4, 3085);
    			attr_dev(i, "class", "svelte-ym59cl");
    			add_location(i, file$4, 91, 29, 3308);
    			attr_dev(span, "class", "info-title svelte-ym59cl");
    			add_location(span, file$4, 91, 4, 3283);
    			attr_dev(div1, "class", "info svelte-ym59cl");
    			add_location(div1, file$4, 80, 0, 2934);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(document.head, null);
    			}

    			append_dev(document.head, each_1_anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			html_tag.m(/*displayedContent*/ ctx[2], div0);
    			append_dev(div0, t2);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div1, t3);
    			mount_component(infopageindicator, div1, null);
    			append_dev(div1, t4);
    			append_dev(div1, span);
    			append_dev(span, i);
    			append_dev(i, t5);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*MachineStore*/ 0) {
    				each_value = MachineStore.Info.currentBgUrl;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*backgroundImageUrl*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(div1, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty & /*displayedContent*/ 4) html_tag.p(/*displayedContent*/ ctx[2]);

    			if (/*isFinalPage*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*isFinalPage*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*documentTitle*/ 2) set_data_dev(t5, /*documentTitle*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(infopageindicator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(infopageindicator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			detach_dev(each_1_anchor);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(infopageindicator);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Info', slots, []);
    	let contentPageList = MachineStore.Info.pages.getValue();
    	let currentPage = 0;
    	let subscriptionList = [];
    	let backgroundImageUrl;
    	let documentTitle = '';
    	let displayedContent = '';
    	let isFinalPage = false;

    	onMount(() => {
    		subscriptionList.push(MachineStore.Info.currentPage.subscribe(v => {
    			currentPage = v;
    			$$invalidate(2, displayedContent = preprocessCurrentPage());

    			if (contentPageList[currentPage] && contentPageList[currentPage].backgroundImageUrl) {
    				$$invalidate(0, backgroundImageUrl = contentPageList[currentPage].backgroundImageUrl);
    			}

    			$$invalidate(3, isFinalPage = v === contentPageList.length - 1);
    		}));

    		subscriptionList.push(MachineStore.Info.pages.subscribe(v => {
    			contentPageList = v;
    			$$invalidate(2, displayedContent = preprocessCurrentPage());

    			if (contentPageList[currentPage] && contentPageList[currentPage].backgroundImageUrl) {
    				$$invalidate(0, backgroundImageUrl = contentPageList[currentPage].backgroundImageUrl);
    			}
    		}));

    		subscriptionList.push(SystemStateStore.currentDocumentTitle.subscribe(v => {
    			console.log(v);
    			$$invalidate(1, documentTitle = v);
    		}));
    	});

    	onDestroy(() => {
    		subscriptionList.forEach(v => v());
    	});

    	function preprocess(infoPage) {
    		switch (infoPage.format) {
    			case 'html':
    				{
    					return infoPage.content;
    				}
    			case 'gemtext':
    				{
    					return main.parse(infoPage.content).generate(main.HTMLGenerator);
    				}
    			case 'markdown':
    				{
    					return parse(infoPage.content);
    				}
    			default:
    				{
    					SystemErrorStore.error('Unknown info page format.', `Unknown info page format: ${infoPage.format}.`);
    					return undefined;
    				}
    		}
    	}

    	function preprocessCurrentPage() {
    		let currentInfoPage = contentPageList[currentPage];

    		if (!currentInfoPage) {
    			SystemErrorStore.error('Info page not found.', `Trying to find page ${currentPage + 1} in a series of ${contentPageList.length} pages.
                 Related data:
                 <pre>${JSON.stringify(contentPageList, undefined, '    ')}</pre>`);

    			console.log('error');
    			return undefined;
    		}

    		return preprocess(currentInfoPage) || '';
    	}

    	function leave() {
    		MACHINE.unlock();
    		MACHINE.step();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onDestroy,
    		onMount,
    		Gemtext,
    		InfoPageIndicator,
    		Marked,
    		EnterPrompt,
    		MachineStore,
    		SystemErrorStore,
    		MACHINE,
    		SystemStateStore,
    		contentPageList,
    		currentPage,
    		subscriptionList,
    		backgroundImageUrl,
    		documentTitle,
    		displayedContent,
    		isFinalPage,
    		preprocess,
    		preprocessCurrentPage,
    		leave
    	});

    	$$self.$inject_state = $$props => {
    		if ('contentPageList' in $$props) contentPageList = $$props.contentPageList;
    		if ('currentPage' in $$props) currentPage = $$props.currentPage;
    		if ('subscriptionList' in $$props) subscriptionList = $$props.subscriptionList;
    		if ('backgroundImageUrl' in $$props) $$invalidate(0, backgroundImageUrl = $$props.backgroundImageUrl);
    		if ('documentTitle' in $$props) $$invalidate(1, documentTitle = $$props.documentTitle);
    		if ('displayedContent' in $$props) $$invalidate(2, displayedContent = $$props.displayedContent);
    		if ('isFinalPage' in $$props) $$invalidate(3, isFinalPage = $$props.isFinalPage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [backgroundImageUrl, documentTitle, displayedContent, isFinalPage, leave];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/component/toc/TableOfContents.svelte generated by Svelte v3.44.1 */

    const file$3 = "src/component/toc/TableOfContents.svelte";

    function create_fragment$6(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "clite-toc");
    			add_location(div, file$3, 3, 0, 30);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TableOfContents', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TableOfContents> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class TableOfContents extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableOfContents",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/component/Machine.svelte generated by Svelte v3.44.1 */

    // (28:30) 
    function create_if_block_3(ctx) {
    	let info;
    	let current;
    	info = new Info({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(info.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(info, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(info.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(info, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(28:30) ",
    		ctx
    	});

    	return block;
    }

    // (26:38) 
    function create_if_block_2(ctx) {
    	let conversation;
    	let current;
    	conversation = new Conversation({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(conversation.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(conversation, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(conversation.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(conversation.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(conversation, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(26:38) ",
    		ctx
    	});

    	return block;
    }

    // (24:31) 
    function create_if_block_1$1(ctx) {
    	let segue;
    	let current;
    	segue = new Segue({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(segue.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(segue, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(segue.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(segue.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(segue, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(24:31) ",
    		ctx
    	});

    	return block;
    }

    // (22:0) {#if mode === EMode.TOC}
    function create_if_block$1(ctx) {
    	let tableofcontents;
    	let current;
    	tableofcontents = new TableOfContents({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tableofcontents.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tableofcontents, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tableofcontents.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tableofcontents.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tableofcontents, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(22:0) {#if mode === EMode.TOC}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_1$1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*mode*/ ctx[0] === EMode.TOC) return 0;
    		if (/*mode*/ ctx[0] === EMode.SEGUE) return 1;
    		if (/*mode*/ ctx[0] === EMode.CONVERSATION) return 2;
    		if (/*mode*/ ctx[0] === EMode.INFO) return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Machine', slots, []);
    	let mode = undefined;
    	let subscriptionList = [];

    	onMount(() => {
    		subscriptionList.push(MachineStore.currentMode.subscribe(v => {
    			$$invalidate(0, mode = v);
    		}));
    	});

    	onDestroy(() => {
    		subscriptionList.forEach(v => v());
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Machine> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		MachineStore,
    		EMode,
    		onDestroy,
    		onMount,
    		Segue,
    		Info,
    		TableOfContents,
    		Conversation,
    		mode,
    		subscriptionList
    	});

    	$$self.$inject_state = $$props => {
    		if ('mode' in $$props) $$invalidate(0, mode = $$props.mode);
    		if ('subscriptionList' in $$props) subscriptionList = $$props.subscriptionList;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mode];
    }

    class Machine extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Machine",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    function _SystemWaitingStore() {
        let store = {
            message: accessible([]),
            reset: () => {
                store.message.set([]);
            },
            appendWaitingMessage: (x) => {
                store.message.getValue().push(x);
                store.message.set(store.message.getValue());
            },
            clearWaitingMessage: () => {
                store.message.set([]);
            },
        };
        return store;
    }
    var SystemWaitingStore = _SystemWaitingStore();

    /* src/component/WaitingScreen.svelte generated by Svelte v3.44.1 */
    const file$2 = "src/component/WaitingScreen.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (27:8) {#each msg as _msg}
    function create_each_block(ctx) {
    	let t_value = /*_msg*/ ctx[4] + "";
    	let t;
    	let br;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    			br = element("br");
    			add_location(br, file$2, 27, 14, 813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*msg*/ 1 && t_value !== (t_value = /*_msg*/ ctx[4] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(27:8) {#each msg as _msg}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let br0;
    	let t1;
    	let div1;
    	let span0;
    	let t3;
    	let span1;
    	let t5;
    	let br1;
    	let t6;
    	let i;
    	let each_value = /*msg*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "LOADING...";
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "†";
    			t5 = space();
    			br1 = element("br");
    			t6 = space();
    			i = element("i");
    			i.textContent = `CAI System "${SYSTEM_NAME}"`;
    			add_location(br0, file$2, 29, 8, 844);
    			attr_dev(div0, "class", "waiting-screen-msg-container svelte-146x5tw");
    			add_location(div0, file$2, 25, 4, 706);
    			attr_dev(span0, "class", "waiting-screen-prompt svelte-146x5tw");
    			add_location(span0, file$2, 32, 8, 922);
    			attr_dev(span1, "class", "waiting-screen-ornament svelte-146x5tw");
    			attr_dev(span1, "alt", "Waiting screen ornament");
    			add_location(span1, file$2, 33, 8, 984);
    			add_location(br1, file$2, 34, 8, 1076);
    			add_location(i, file$2, 35, 8, 1091);
    			attr_dev(div1, "class", "waiting-screen-ornament-container svelte-146x5tw");
    			add_location(div1, file$2, 31, 4, 866);
    			attr_dev(div2, "class", "waiting-screen svelte-146x5tw");
    			add_location(div2, file$2, 24, 0, 673);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t0);
    			append_dev(div0, br0);
    			/*div0_binding*/ ctx[2](div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(div1, t3);
    			append_dev(div1, span1);
    			append_dev(div1, t5);
    			append_dev(div1, br1);
    			append_dev(div1, t6);
    			append_dev(div1, i);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*msg*/ 1) {
    				each_value = /*msg*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			/*div0_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WaitingScreen', slots, []);
    	let msg = [];
    	let msgWindow;
    	let subscriptionList = [];

    	onMount(() => {
    		subscriptionList.push(SystemWaitingStore.message.subscribe(v => {
    			$$invalidate(0, msg = v);

    			msgWindow.scrollTo({
    				top: msgWindow.scrollHeight - msgWindow.clientHeight,
    				behavior: 'smooth'
    			});
    		}));

    		msgWindow.scrollTo({
    			top: msgWindow.scrollHeight,
    			behavior: 'smooth'
    		});
    	});

    	onDestroy(() => {
    		subscriptionList.forEach(v => v());
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WaitingScreen> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			msgWindow = $$value;
    			$$invalidate(1, msgWindow);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onDestroy,
    		onMount,
    		SystemWaitingStore,
    		SYSTEM_NAME,
    		msg,
    		msgWindow,
    		subscriptionList
    	});

    	$$self.$inject_state = $$props => {
    		if ('msg' in $$props) $$invalidate(0, msg = $$props.msg);
    		if ('msgWindow' in $$props) $$invalidate(1, msgWindow = $$props.msgWindow);
    		if ('subscriptionList' in $$props) subscriptionList = $$props.subscriptionList;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [msg, msgWindow, div0_binding];
    }

    class WaitingScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WaitingScreen",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/component/Main.svelte generated by Svelte v3.44.1 */

    // (25:0) {:else}
    function create_else_block(ctx) {
    	let machine;
    	let current;
    	machine = new Machine({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(machine.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(machine, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(machine.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(machine.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(machine, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(25:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:56) 
    function create_if_block_1(ctx) {
    	let waitingscreen;
    	let current;
    	waitingscreen = new WaitingScreen({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(waitingscreen.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(waitingscreen, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(waitingscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(waitingscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(waitingscreen, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(23:56) ",
    		ctx
    	});

    	return block;
    }

    // (21:0) {#if currentStatus === SystemCurrentStatus.ERROR}
    function create_if_block(ctx) {
    	let errorscreen;
    	let current;
    	errorscreen = new ErrorScreen({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(errorscreen.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(errorscreen, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(errorscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(errorscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(errorscreen, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(21:0) {#if currentStatus === SystemCurrentStatus.ERROR}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*currentStatus*/ ctx[0] === SystemCurrentStatus.ERROR) return 0;
    		if (/*currentStatus*/ ctx[0] === SystemCurrentStatus.WAITING) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	let currentStatus;
    	let subscriptionList = [];

    	onMount(() => {
    		subscriptionList.push(SystemStateStore.currentStatus.subscribe(v => {
    			if (currentStatus !== v) {
    				$$invalidate(0, currentStatus = v);
    			}
    		}));
    	});

    	onDestroy(() => {
    		subscriptionList.forEach(v => v());
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		SystemCurrentStatus,
    		SystemStateStore,
    		onDestroy,
    		onMount,
    		ErrorScreen,
    		Machine,
    		WaitingScreen,
    		currentStatus,
    		subscriptionList
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentStatus' in $$props) $$invalidate(0, currentStatus = $$props.currentStatus);
    		if ('subscriptionList' in $$props) subscriptionList = $$props.subscriptionList;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentStatus];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/component/DebugMain.svelte generated by Svelte v3.44.1 */
    const file$1 = "src/component/DebugMain.svelte";

    function create_fragment$2(ctx) {
    	let div4;
    	let main;
    	let t0;
    	let div3;
    	let div1;
    	let span0;
    	let t2;
    	let div0;
    	let span1;
    	let t4;
    	let span2;
    	let t6;
    	let div2;
    	let textarea0;
    	let t7;
    	let textarea1;
    	let div3_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	main = new Main({ $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			create_component(main.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "Load";
    			t2 = space();
    			div0 = element("div");
    			span1 = element("span");
    			span1.textContent = "⊚";
    			t4 = space();
    			span2 = element("span");
    			span2.textContent = "⨯";
    			t6 = space();
    			div2 = element("div");
    			textarea0 = element("textarea");
    			t7 = space();
    			textarea1 = element("textarea");
    			add_location(span0, file$1, 64, 12, 2051);
    			add_location(span1, file$1, 66, 16, 2160);
    			add_location(span2, file$1, 67, 16, 2228);
    			attr_dev(div0, "class", "mock-editor-actionbar svelte-6q52nd");
    			add_location(div0, file$1, 65, 12, 2108);
    			attr_dev(div1, "class", "mock-editor-toolbar svelte-6q52nd");
    			add_location(div1, file$1, 63, 8, 2005);
    			attr_dev(textarea0, "class", "mock-editor svelte-6q52nd");
    			attr_dev(textarea0, "id", "mock-editor");
    			attr_dev(textarea0, "wrap", "off");
    			add_location(textarea0, file$1, 71, 12, 2370);
    			attr_dev(textarea1, "class", "mock-editor svelte-6q52nd");
    			attr_dev(textarea1, "id", "mock-jit-output");
    			attr_dev(textarea1, "wrap", "off");
    			add_location(textarea1, file$1, 72, 12, 2504);
    			attr_dev(div2, "class", "mock-editor-container-inside svelte-6q52nd");
    			add_location(div2, file$1, 70, 8, 2315);
    			attr_dev(div3, "class", "mock-editor-container svelte-6q52nd");
    			attr_dev(div3, "style", div3_style_value = `visibility:${/*editorVisible*/ ctx[0] ? 'visible' : 'hidden'}`);
    			add_location(div3, file$1, 62, 4, 1872);
    			attr_dev(div4, "class", "mock");
    			add_location(div4, file$1, 60, 0, 1836);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			mount_component(main, div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, span0);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, span1);
    			append_dev(div0, t4);
    			append_dev(div0, span2);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, textarea0);
    			/*textarea0_binding*/ ctx[8](textarea0);
    			append_dev(div2, t7);
    			append_dev(div2, textarea1);
    			/*textarea1_binding*/ ctx[9](textarea1);
    			/*div3_binding*/ ctx[10](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*loadMockProgram*/ ctx[6], false, false, false),
    					listen_dev(span1, "mousedown", /*mouseDownHandler*/ ctx[7], false, false, false),
    					listen_dev(span2, "click", /*toggleEditor*/ ctx[4], false, false, false),
    					listen_dev(textarea0, "change", /*mockSourceChange*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*editorVisible*/ 1 && div3_style_value !== (div3_style_value = `visibility:${/*editorVisible*/ ctx[0] ? 'visible' : 'hidden'}`)) {
    				attr_dev(div3, "style", div3_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(main);
    			/*textarea0_binding*/ ctx[8](null);
    			/*textarea1_binding*/ ctx[9](null);
    			/*div3_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DebugMain', slots, []);
    	let mouseX = 0;
    	let mouseY = 0;
    	let editorX;
    	let editorY;
    	let editorVisible = false;
    	let elemJitOutput;
    	let elemEditor;
    	let elemEditorContainer;

    	function toggleEditor() {
    		$$invalidate(0, editorVisible = !editorVisible);
    	}

    	function mockSourceChange(e) {
    		$$invalidate(1, elemJitOutput.value = JSON.stringify(load(e.target.value), undefined, '    '), elemJitOutput);
    	}

    	function loadMockProgram() {
    		SystemStateStore.notReady();
    		let jitted = jit(load(elemEditor.value));
    		MACHINE.loadProgram(jitted);
    		MACHINE.unlock();
    		SystemStateStore.ready();
    		MACHINE.step();
    	}

    	function globalKeyHandler(e) {
    		if (elemEditor && e.target === elemEditor) {
    			return;
    		}

    		toggleEditor();
    	}

    	onMount(() => {
    		document.addEventListener('keypress', globalKeyHandler);
    	});

    	onDestroy(() => {
    		document.removeEventListener('keypress', globalKeyHandler);
    	});

    	function mouseDownHandler(e) {
    		mouseX = elemEditorContainer.clientX;
    		mouseY = elemEditorContainer.clientY;
    		document.addEventListener('mousemove', mouseMoveHandler);
    		document.addEventListener('mouseup', mouseUpHandler);
    	}

    	function mouseMoveHandler(e) {
    		let dx = e.clientX - mouseX;
    		let dy = e.clientY - mouseY;
    		$$invalidate(3, elemEditorContainer.style.top = `${elemEditorContainer.offsetTop + dy}px`, elemEditorContainer);
    		$$invalidate(3, elemEditorContainer.style.left = `${elemEditorContainer.offsetLeft + dx}px`, elemEditorContainer);
    		mouseX = e.clientX;
    		mouseY = e.clientY;
    	}

    	function mouseUpHandler(e) {
    		document.removeEventListener('mousemove', mouseMoveHandler);
    		document.removeEventListener('mouseup', mouseUpHandler);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DebugMain> was created with unknown prop '${key}'`);
    	});

    	function textarea0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			elemEditor = $$value;
    			$$invalidate(2, elemEditor);
    		});
    	}

    	function textarea1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			elemJitOutput = $$value;
    			$$invalidate(1, elemJitOutput);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			elemEditorContainer = $$value;
    			$$invalidate(3, elemEditorContainer);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Main,
    		yaml,
    		jit,
    		MACHINE,
    		onDestroy,
    		onMount,
    		SystemStateStore,
    		mouseX,
    		mouseY,
    		editorX,
    		editorY,
    		editorVisible,
    		elemJitOutput,
    		elemEditor,
    		elemEditorContainer,
    		toggleEditor,
    		mockSourceChange,
    		loadMockProgram,
    		globalKeyHandler,
    		mouseDownHandler,
    		mouseMoveHandler,
    		mouseUpHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('mouseX' in $$props) mouseX = $$props.mouseX;
    		if ('mouseY' in $$props) mouseY = $$props.mouseY;
    		if ('editorX' in $$props) editorX = $$props.editorX;
    		if ('editorY' in $$props) editorY = $$props.editorY;
    		if ('editorVisible' in $$props) $$invalidate(0, editorVisible = $$props.editorVisible);
    		if ('elemJitOutput' in $$props) $$invalidate(1, elemJitOutput = $$props.elemJitOutput);
    		if ('elemEditor' in $$props) $$invalidate(2, elemEditor = $$props.elemEditor);
    		if ('elemEditorContainer' in $$props) $$invalidate(3, elemEditorContainer = $$props.elemEditorContainer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		editorVisible,
    		elemJitOutput,
    		elemEditor,
    		elemEditorContainer,
    		toggleEditor,
    		mockSourceChange,
    		loadMockProgram,
    		mouseDownHandler,
    		textarea0_binding,
    		textarea1_binding,
    		div3_binding
    	];
    }

    class DebugMain extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DebugMain",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/component/IntroPage.svelte generated by Svelte v3.44.1 */
    const file = "src/component/IntroPage.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let span;
    	let t6;
    	let div1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(SYSTEM_VER);
    			br0 = element("br");
    			t1 = text("\n        CAI System");
    			br1 = element("br");
    			t2 = space();
    			span = element("span");
    			span.textContent = `"${SYSTEM_NAME.toLocaleUpperCase()}"`;
    			t6 = space();
    			div1 = element("div");
    			div1.textContent = "This system is clepub-only.";
    			add_location(br0, file, 11, 20, 335);
    			add_location(br1, file, 12, 18, 360);
    			attr_dev(span, "class", "intropage-header-name svelte-1a2xwwx");
    			add_location(span, file, 13, 8, 375);
    			attr_dev(div0, "class", "intropage-header svelte-1a2xwwx");
    			add_location(div0, file, 10, 4, 284);
    			attr_dev(div1, "class", "intropage-description svelte-1a2xwwx");
    			add_location(div1, file, 17, 4, 475);
    			attr_dev(div2, "class", "intropage svelte-1a2xwwx");
    			add_location(div2, file, 9, 0, 256);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, br0);
    			append_dev(div0, t1);
    			append_dev(div0, br1);
    			append_dev(div0, t2);
    			append_dev(div0, span);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('IntroPage', slots, []);
    	let url;

    	function handlePreview(e) {
    		push(`/preview/direct/data-service?url=${window.encodeURIComponent(url)}`);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<IntroPage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		SYSTEM_NAME,
    		SYSTEM_VER,
    		push,
    		url,
    		handlePreview
    	});

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) url = $$props.url;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class IntroPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IntroPage",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.1 */

    function create_fragment(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const routes = {
    		'/': IntroPage,
    		'/Main': Main,
    		'/Debug': DebugMain,
    		'/Error': ErrorScreen,
    		'/Waiting': WaitingScreen
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		Main,
    		DebugMain,
    		IntroPage,
    		ErrorScreen,
    		WaitingScreen,
    		routes
    	});

    	return [routes];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
