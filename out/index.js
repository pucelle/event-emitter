"use strict";
// At beginning, I implemented a good Emitter by inferring listener parameters and emitting parameters.
// But then I meet a big problem when extending the class, described by:
// https://stackoverflow.com/questions/55813041/problems-on-typescript-event-interface-extends
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
/**
 * Event emitter as super class to listen and emit custom events.
 * It's name is Emitter to avoid conflicts with node API.
 * @typeparam E Event interface in `{eventName: (...args) => void}` format.
 */
class EventEmitter {
    constructor() {
        /** Registered events. */
        this.__events = new Map();
    }
    /** Ensure event cache items to cache item. */
    __ensureEvents(name) {
        let events = this.__events.get(name);
        if (!events) {
            this.__events.set(name, events = []);
        }
        return events;
    }
    /**
     * Registers an event `listener` to listen event with specified `name`.
     * @param name The event name.
     * @param listener The event listener.
     * @param scope The scope will be binded to listener.
     */
    on(name, listener, scope) {
        let events = this.__ensureEvents(name);
        events.push({
            listener,
            scope,
            once: false,
        });
    }
    /**
     * Registers an event `listener` to listen event with specified `name`, triggers for only once.
     * @param name The event name.
     * @param listener The event listener.
     * @param scope The scope will be binded to listener.
     */
    once(name, listener, scope) {
        let events = this.__ensureEvents(name);
        events.push({
            listener,
            scope,
            once: true
        });
    }
    /**
     * Removes the `listener` that is listening specified event `name`.
     * @param name The event name.
     * @param listener The event listener, only matched listener will be removed.
     * @param scope The scope binded to listener. If provided, remove listener only when scope match.
     */
    off(name, listener, scope) {
        let events = this.__events.get(name);
        if (events) {
            for (let i = events.length - 1; i >= 0; i--) {
                let event = events[i];
                if (event.listener === listener && (!scope || event.scope === scope)) {
                    events.splice(i, 1);
                }
            }
        }
    }
    /**
     * Check whether `listener` is in the list for listening specified event `name`.
     * @param name The event name.
     * @param listener The event listener to check.
     * @param scope The scope binded to listener. If provided, will additionally check whether the scope match.
     */
    hasListener(name, listener, scope) {
        let events = this.__events.get(name);
        if (events) {
            for (let i = 0, len = events.length; i < len; i++) {
                let event = events[i];
                if (event.listener === listener && (!scope || event.scope === scope)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Check whether any `listener` is listening specified event `name`.
     * @param name The event name.
     */
    hasListeners(name) {
        let events = this.__events.get(name);
        return !!events && events.length > 0;
    }
    /**
     * Emit specified event with event `name` and parameters.
     * @param name The event name.
     * @param args The parameters that will be passed to event listeners.
     */
    emit(name, ...args) {
        let events = this.__events.get(name);
        if (events) {
            for (let i = 0; i < events.length; i++) {
                let event = events[i];
                // The listener may call off, so must remove it before handling
                if (event.once === true) {
                    events.splice(i--, 1);
                }
                event.listener.apply(event.scope, args);
            }
        }
    }
    /** Removes all the event listeners. */
    removeAllListeners() {
        this.__events = new Map();
    }
}
exports.EventEmitter = EventEmitter;
