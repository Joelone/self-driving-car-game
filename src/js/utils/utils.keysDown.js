/** keysDown Utility Module
 * Monitors and determines whether a key 
 * is pressed down at any given moment.
 * Returns getters for each key.
 */
function keysDown() {
    this.isPressed = {};

    const _isPressed = {};

    const watchedKeys = [
        'ArrowUp',
        'ArrowLeft',
        'ArrowDown',
        'ArrowRight',
        'KeyA',
        'KeyZ',
        'KeyS',
        'KeyX'
    ];



    // Set up `onkeydown` event handler.
    document.onkeydown = function (ev) {
        _isPressed[ev.code] = true;
    };

    // Set up `onkeyup` event handler.
    document.onkeyup = function (ev) {
        _isPressed[ev.code] = false;
    };

    // Define getters for each key
    // * Not strictly necessary. Could just return
    // * an object literal of methods, the syntactic
    // * sugar of `defineProperty` is just so much sweeter :)

    watchedKeys.forEach((key) => {
        Object.defineProperty(this.isPressed, key, {
            get: () => { return _isPressed[key]; },
            configurable: true,
            enumerable: true
        });

    });

    return this;
}

module.exports = keysDown();