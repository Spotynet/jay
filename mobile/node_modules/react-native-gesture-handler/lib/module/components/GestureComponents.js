"use strict";

import * as React from 'react';
import { FlatList as RNFlatList, RefreshControl as RNRefreshControl, ScrollView as RNScrollView, Switch as RNSwitch, TextInput as RNTextInput } from 'react-native';
import createNativeWrapper from '../handlers/createNativeWrapper';
import { nativeViewProps } from '../handlers/NativeViewGestureHandler';
import { toArray } from '../utils';

/**
 * @deprecated use `RefreshControl` instead
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const LegacyRefreshControl = createNativeWrapper(RNRefreshControl, {
  disallowInterruption: true,
  shouldCancelWhenOutside: false
});

// eslint-disable-next-line @typescript-eslint/no-redeclare

const GHScrollView = createNativeWrapper(RNScrollView, {
  disallowInterruption: true,
  shouldCancelWhenOutside: false
});

/**
 * @deprecated use `ScrollView` instead
 */
export const LegacyScrollView = props => {
  const refreshControlGestureRef = React.useRef(null);
  const {
    refreshControl,
    waitFor,
    ref,
    ...rest
  } = props;
  return /*#__PURE__*/_jsx(GHScrollView, {
    ...rest,
    ref: ref,
    waitFor: [...toArray(waitFor ?? []), refreshControlGestureRef]
    // @ts-ignore we don't pass `refreshing` prop as we only want to override the ref
    ,
    refreshControl: refreshControl ? /*#__PURE__*/React.cloneElement(refreshControl, {
      // @ts-ignore for reasons unknown to me, `ref` doesn't exist on the type inferred by TS
      ref: refreshControlGestureRef
    }) : undefined
  });
};

// Backward type compatibility with https://github.com/software-mansion/react-native-gesture-handler/blob/db78d3ca7d48e8ba57482d3fe9b0a15aa79d9932/react-native-gesture-handler.d.ts#L440-L457
// include methods of wrapped components by creating an intersection type with the RN component instead of duplicating them.
// eslint-disable-next-line @typescript-eslint/no-redeclare

/**
 * @deprecated use `Switch` instead
 */
export const LegacySwitch = createNativeWrapper(RNSwitch, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true
});
// eslint-disable-next-line @typescript-eslint/no-redeclare

/**
 * @deprecated use `RefreshControl` instead
 */
export const LegacyTextInput = createNativeWrapper(RNTextInput);
// eslint-disable-next-line @typescript-eslint/no-redeclare

// RN's `DrawerLayoutAndroid` export is a getter that logs a deprecation
// warning on access, so resolve it on first render instead of module load.
// `require` is used on purpose: `import * as RN` would read every export
// eagerly under Metro's `experimentalImportSupport`.
let DrawerLayoutAndroidImpl;
const LazyDrawerLayoutAndroid = props => {
  if (!DrawerLayoutAndroidImpl) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {
      DrawerLayoutAndroid
    } = require('react-native');
    DrawerLayoutAndroidImpl = DrawerLayoutAndroid;
  }
  return /*#__PURE__*/_jsx(DrawerLayoutAndroidImpl, {
    ...props
  });
};
LazyDrawerLayoutAndroid.displayName = 'DrawerLayoutAndroid';

/**
 * @deprecated use `DrawerLayoutAndroid` instead
 */
export const LegacyDrawerLayoutAndroid = createNativeWrapper(LazyDrawerLayoutAndroid, {
  disallowInterruption: true
});
// eslint-disable-next-line @typescript-eslint/no-redeclare

/**
 * @deprecated use `FlatList` instead
 */
export const LegacyFlatList = props => {
  const refreshControlGestureRef = React.useRef(null);
  const {
    waitFor,
    refreshControl,
    ...rest
  } = props;
  const flatListProps = {};
  const scrollViewProps = {};
  for (const [propName, value] of Object.entries(rest)) {
    // https://github.com/microsoft/TypeScript/issues/26255
    if (nativeViewProps.includes(propName)) {
      // @ts-ignore - this function cannot have generic type so we have to ignore this error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      scrollViewProps[propName] = value;
    } else {
      // @ts-ignore - this function cannot have generic type so we have to ignore this error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      flatListProps[propName] = value;
    }
  }
  return (
    /*#__PURE__*/
    // @ts-ignore - this function cannot have generic type so we have to ignore this error
    _jsx(RNFlatList, {
      ...flatListProps,
      renderScrollComponent: scrollProps => /*#__PURE__*/_jsx(LegacyScrollView, {
        ...scrollProps,
        ...scrollViewProps,
        waitFor: [...toArray(waitFor ?? []), refreshControlGestureRef]
      })
      // @ts-ignore we don't pass `refreshing` prop as we only want to override the ref
      ,
      refreshControl: refreshControl ? /*#__PURE__*/React.cloneElement(refreshControl, {
        // @ts-ignore for reasons unknown to me, `ref` doesn't exist on the type inferred by TS
        ref: refreshControlGestureRef
      }) : undefined
    })
  );
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
//# sourceMappingURL=GestureComponents.js.map