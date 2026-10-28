"use strict";

import { Platform } from 'react-native';
/**
 * Gesture Handler buttons render the native button component directly, bypassing RN's `<View>` —
 * the only place the `focusable` prop is translated into `isTVSelectable`, which actually drives
 * tvOS focusability.
 */
export function getTVProps(props) {
  if (!Platform.isTV) {
    return {};
  }
  return {
    isTVSelectable: props.focusable ?? props.isTVSelectable ?? true
  };
}
export function applyRelationProp(gesture, relationPropName, relationProp) {
  if (!relationProp) {
    return;
  }
  if (Array.isArray(relationProp)) {
    gesture[relationPropName](...relationProp);
  } else {
    gesture[relationPropName](relationProp);
  }
}
//# sourceMappingURL=utils.js.map