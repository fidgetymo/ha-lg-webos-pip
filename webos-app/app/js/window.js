/*
 * The app is an overlay (appinfo defaultWindowType). It is drawn on top of
 * whatever is playing and is not a card app, so webOS does not switch to the
 * home screen when the box is removed. These properties only keep the remote
 * on the app underneath. They do not change the window type.
 */
(function (global) {
  'use strict';

  var sys = global.webOSSystem || global.PalmSystem || null;
  var timers = [];

  function apply(passive) {
    if (!sys) return;
    try {
      if (sys.setWindowProperty) {
        sys.setWindowProperty('needFocus', passive ? 'false' : 'true');
      }
      if (sys.setInputRegion) {
        sys.setInputRegion([{ x: 0, y: 0, width: passive ? 0 : 1920, height: passive ? 0 : 1080 }]);
      }
    } catch (e) {
      // Firmware without these properties: the PIP still works, it just takes the remote.
    }
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  global.AppWindow = {
    /** Draw without taking focus or remote input, so the app in front keeps playing. */
    passive: function () {
      clearTimers();
      apply(true);
      // Creating or raising the native window can take focus back.
      [60, 300, 1000].forEach(function (ms) {
        timers.push(setTimeout(function () { apply(true); }, ms));
      });
    },
    /** A normal window that takes the remote (setup screen, preview). */
    interactive: function () {
      clearTimers();
      apply(false);
      if (sys && sys.activate) sys.activate();
    }
  };

  // Every launch starts passive (this runs before the rest of the app loads);
  // the setup screen switches to interactive itself.
  global.AppWindow.passive();
})(window);
