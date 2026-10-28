"use strict";

export const Gestures = {
  NativeViewGestureHandler: undefined,
  PanGestureHandler: undefined,
  TapGestureHandler: undefined,
  LongPressGestureHandler: undefined,
  PinchGestureHandler: undefined,
  RotationGestureHandler: undefined,
  FlingGestureHandler: undefined,
  ManualGestureHandler: undefined
};
export default {
  createGestureHandler(_handlerName, _handlerTag, _config) {
    // NO-OP
  },
  attachGestureHandler(_handlerTag,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _newView, _actionType, _propsRef) {
    // NO-OP
  },
  setGestureHandlerConfig(_handlerTag, _newConfig) {
    // NO-OP
  },
  updateGestureHandlerConfig(_handlerTag, _newConfig) {
    // NO-OP
  },
  getGestureHandlerNode(_handlerTag) {
    // NO-OP
  },
  dropGestureHandler(_handlerTag) {
    // NO-OP
  },
  flushOperations() {
    // NO-OP
  }
};
//# sourceMappingURL=RNGestureHandlerModule.windows.js.map