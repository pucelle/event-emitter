/** Event handler. */
declare type EventHandler = (...args: any[]) => void;
/**
 * Event emitter as super class to listen and emit custom events.
 * It's name is Emitter to avoid conflicts with node API.
 * @typeparam E Event interface in `{eventName: (...args) => void}` format.
 */
export declare abstract class EventEmitter<E = any> {
    /** Registered events. */
    private __events;
    /** Ensure event cache items to cache item. */
    private __ensureEvents;
    /**
     * Registers an event `listener` to listen event with specified `name`.
     * @param name The event name.
     * @param listener The event listener.
     * @param scope The scope will be binded to listener.
     */
    on<K extends keyof E>(name: K, listener: EventHandler, scope?: object): void;
    /**
     * Registers an event `listener` to listen event with specified `name`, triggers for only once.
     * @param name The event name.
     * @param listener The event listener.
     * @param scope The scope will be binded to listener.
     */
    once<K extends keyof E>(name: K, listener: EventHandler, scope?: object): void;
    /**
     * Removes the `listener` that is listening specified event `name`.
     * @param name The event name.
     * @param listener The event listener, only matched listener will be removed.
     * @param scope The scope binded to listener. If provided, remove listener only when scope match.
     */
    off<K extends keyof E>(name: K, listener: EventHandler, scope?: object): void;
    /**
     * Check whether `listener` is in the list for listening specified event `name`.
     * @param name The event name.
     * @param listener The event listener to check.
     * @param scope The scope binded to listener. If provided, will additionally check whether the scope match.
     */
    hasListener(name: string, listener: Function, scope?: object): boolean;
    /**
     * Check whether any `listener` is listening specified event `name`.
     * @param name The event name.
     */
    hasListeners(name: string): boolean;
    /**
     * Emit specified event with event `name` and parameters.
     * @param name The event name.
     * @param args The parameters that will be passed to event listeners.
     */
    emit<K extends keyof E>(name: K, ...args: any[]): void;
    /** Removes all the event listeners. */
    removeAllListeners(): void;
}
export {};
