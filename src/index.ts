// It may be complex to implement a extendable event system,
// and can infer event type and listener parameters.
// 
// Asume a class A:
// `class A extends EventEmitter<AEvents>`
//
// And later a class B want to inherit A:
// `class A<E> extends EventEmitter<AEvents & E>`
// `class B extends A<BEvents>`
//
// Infering `(AEvents & E)[T]` will fail because E is unknown.
// But can infer `key of (AEvents & E)`.
//
// Have no perfect solution, but two options:
// 1. Only infer event type, not infer listener parameters.
// 2. Explicitly specifies `this` in A as `A<{}>`, or just `A` if defined as `A<E = {}>.


/** Cache each registered event. */
interface ListenerItem {
	listener: any
	scope?: object
	once: boolean
}

/** 
 * Try infer parameters for function type, no type limit compare with `Parameters<...>`. */
type InferParameters<T> = T extends (...args: any) => any ? T extends (...args: infer P) => any ? P : any[] : any[]



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
	on<T extends keyof E>(type: T, listener: E[T], scope?: object) {
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
	once<T extends keyof E>(type: T, listener: E[T], scope?: object) {
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
	off<T extends keyof E>(type: T, listener: E[T], scope?: object) {
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
	emit<T extends keyof E>(type: T, ...args: InferParameters<E[T]>) {
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
