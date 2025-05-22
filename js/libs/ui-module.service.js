/**
 * Store Registered UI Modules
 * 
 * @typedef {object} DefaultModule
 * @prop {function():void} DefaultModule.init
 * @prop {function():void} DefaultModule.onInit
 * @prop {function():void} DefaultModule.destroy
 * @prop {function():void} DefaultModule.onDestroy
 * @prop {(eventName: string, listener: () => void) => typeof listener} DefaultModule.addEventListener
 */

(() => {
	/**
	 * Store Registered UI Modules
	 *
	 * @type {Record<string, DefaultModule>}
	 */
	const modules = {};

	/**
	 * Register a UI Module
	 * 
	 * @template ArgType
	 * @param {string} name
	 * @param {ArgType} args
	 * @param {(args: ArgType) => DefaultModule} moduleFn
	 * @returns {DefaultModule}
	 */
	function registerUiModule(name, args, moduleFn) {
		/** @type {DefaultModule} */
		const defaultModule = {
			eventListeners: {},
			init: function () {
				this.onInit();
			},
			onInit: () => { },
			onDestroy: () => { },
			destroy: function () {
				this.onDestroy();
			},
			get addEventListener() {
				return (eventName, callback) => {
					if (Array.isArray(this.eventListeners[eventName])) {
						this.eventListeners[eventName].push(callback);
					} else {
						this.eventListeners[eventName] = [callback];
					}
					return this.eventListeners[eventName];
				}
			},
			get removeEventListener() {
				return (eventName, listener) => {
					if (Array.isArray(this.eventListeners[eventName])) {
						this.eventListeners[eventName] = this.eventListeners[eventName].filter((_listener) => _listener !== listener);
					}
				};
			},
			get fireEvent() {
				return async (eventName, ...args) => {
					if (Array.isArray(this.eventListeners[eventName])) {
						for (const listener of this.eventListeners[eventName]) {
							await listener(...args);
						}
					}
				};
			},
		};

		const customModule = moduleFn(args);
		modules[name] = { ...defaultModule, ...customModule };
		return modules[name];
	}

	/**
	 * Get an instance of a Registered UI Module
	 *
	 * @param {string} name
	 * @returns {DefaultModule} 
	 */
	function getUiModule(name) {
		if (modules[name]) {
			return modules[name];
		} else {
			throw new Error(`Module ${name} not found`);
		}
	}

	globalThis.registerUiModule = registerUiModule;
	globalThis.getUiModule = getUiModule;
})();

/**
 * Register a UI Module
 * 
 * @template T
 * @type {(name: string, args: T, moduleFn: (args: T) => DefaultModule) => DefaultModule}
 */
globalThis.registerUiModule = registerUiModule;

/**
 * Get an instance of a Registered UI Module
 * @type {(name: string) => DefaultModule}
 */
globalThis.getUiModule
