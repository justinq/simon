// To be called when there's a move event on the body itself:
function BlockMove(event) {
  event.preventDefault(); // Tell Safari not to move the window.
}
/*
 * Check for touch-enabled browser
 */
var check_touch_device = function() {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
}
var is_touch_device = check_touch_device();
