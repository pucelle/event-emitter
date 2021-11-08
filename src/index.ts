// At beginning, I implemented a good Emitter by inferring listener parameters and emitting parameters.
// But then I meet a big problem when extending the class, described by:
// https://stackoverflow.com/questions/55813041/problems-on-typescript-event-interface-extends

// I'm trying to merge event listener interfaces but failed,
// Guess the main reason is when one of the the event listener interface is generic parameter and not known yet,
// TS can't merge two event listener interfaces and infer types of listener parameters for one listener,
// The type of listener becomes `resolved Listener A & unresolved Listener B`, it's parameters can't be inferred.


/** Cache each registered event. */
interface ListenerItem {
	listener: any
	scope?: object
	once: boolean
}

/** Event listener. */
type EventListener = (...args: any[]) => void


/** 
 * Event emitter as super class to listen and emit custom events.
 * It's name is Emitter to avoid conflicts with node API.
 * @typeparam E Event interface in `{eventType: (...args) => void}` format.
 */
export abstract class EventEmitter<E = any> {

	/** Registered event listeners. */
	private __listeners: Map<keyof E, ListenerItem[]> = new Map()

	/** Ensure event cache items to cache item. */
	private __ensureListenerList<T extends keyof E>(type: T): ListenerItem[] {
		let listeners = this.__listeners.get(type)
		if (!listeners) {
			this.__listeners.set(type, listeners = [])
		}

		return listeners
	}

	/**
	 * Registers an event `listener` to listen event with specified `type`.
	 * @param type The event type.
	 * @param listener The event listener.
	 * @param scope The scope will be binded to listener.
	 */
	on<T extends keyof E>(type: T, listener: EventListener, scope?: object) {
		let listeners = this.__ensureListenerList(type)
		
		listeners.push({
			listener,
			scope,
			once: false,
		})
	}

	/**
	 * Registers an event `listener` to listen event with specified `type`, triggers for only once.
	 * @param type The event type.
	 * @param listener The event listener.
	 * @param scope The scope will be binded to listener.
	 */
	once<T extends keyof E>(type: T, listener: EventListener, scope?: object) {
		let listeners = this.__ensureListenerList(type)

		listeners.push({
			listener,
			scope,
			once: true
		})
	}

	/**
	 * Removes the `listener` that is listening specified event `type`.
	 * @param type The event type.
	 * @param listener The event listener, only matched listener will be removed.
	 * @param scope The scope binded to listener. If provided, remove listener only when scope match.
	 */
	off<T extends keyof E>(type: T, listener: EventListener, scope?: object) {
		let listeners = this.__listeners.get(type)
		if (listeners) {
			for (let i = listeners.length - 1; i >= 0; i--) {
				let event = listeners[i]
				if (event.listener === listener && (!scope || event.scope === scope)) {
					listeners.splice(i, 1)
				}
			}

			if (listeners.length === 0) {
				this.__listeners.delete(type)
			}
		}
	}

	/**
	 * Check whether `listener` is in the list for listening specified event `type`.
	 * @param type The event type.
	 * @param listener The event listener to check.
	 * @param scope The scope binded to listener. If provided, will additionally check whether the scope match.
	 */
	hasListener(type: string, listener: Function, scope?: object) {
		let listeners = this.__listeners.get(type as any)
		if (listeners) {
			for (let i = 0, len = listeners.length; i < len; i++) {
				let event = listeners[i]

				if (event.listener === listener && (!scope || event.scope === scope)) {
					return true
				}
			}
		}

		return false
	}

	/**
	 * Check whether any `listener` is listening specified event `type`.
	 * @param type The event type.
	 */
	hasListenerType(type: string) {
		let listeners = this.__listeners.get(type as any)
		return !!listeners && listeners.length > 0
	}

	/**
	 * Emit specified event with event `type` and parameters.
	 * @param type The event type.
	 * @param args The parameters that will be passed to event listeners.
	 */
	emit<T extends keyof E>(type: T, ...args: any[]) {
		let listeners = this.__listeners.get(type)
		if (listeners) {
			for (let i = 0; i < listeners.length; i++) {
				let event = listeners[i]

				// The listener may call off, so must remove it before handling
				if (event.once === true) {
					listeners.splice(i--, 1)
				}

				event.listener.apply(event.scope, args)
			}
		}
	}

	/** Removes all the event listeners. */
	removeAllListeners() {
		this.__listeners = new Map()
	}
}
