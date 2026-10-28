"use strict";

import { tagMessage } from '../../utils';
import { installUIRuntimeBindings } from './installUIRuntimeBindings';
let Reanimated;
let Worklets;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Worklets = require('react-native-worklets');
} catch (e) {
  // When 'react-native-worklets' is not available we want to quietly continue
  Worklets = undefined;
}
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Reanimated = require('react-native-reanimated');
} catch (e) {
  // When 'react-native-reanimated' is not available we want to quietly continue
  // @ts-ignore TS demands the variable to be initialized
  Reanimated = undefined;
}
if (Worklets !== undefined) {
  installUIRuntimeBindings(Worklets.getUIRuntimeHolder);
}
if (Reanimated !== undefined && !Reanimated.setGestureState) {
  // The loaded module is Reanimated but it doesn't have the setGestureState defined
  Reanimated.setGestureState = () => {
    'worklet';

    console.warn(tagMessage('Please use newer version of react-native-reanimated in order to control state of the gestures.'));
  };
}
export { Reanimated, Worklets };
//# sourceMappingURL=reanimatedWrapper.js.map