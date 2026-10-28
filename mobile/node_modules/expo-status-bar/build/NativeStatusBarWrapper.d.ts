import React from 'react';
import type { StatusBarProps, StatusBarStyle, StatusBarAnimation, VerticalBarBehaviorIOS, VerticalBarEdgeIOS } from './types';
/**
 * A component that allows you to configure your status bar declaratively.
 *
 * You will likely have multiple `StatusBar` components mounted in the same app at the same time.
 * For example, if you have multiple screens in your app, you may end up using one per screen.
 * The props of each `StatusBar` component will be merged in the order that they were mounted.
 * This component is built on top of the [StatusBar](https://reactnative.dev/docs/statusbar)
 * component exported from React Native, and it provides defaults that work better for Expo users.
 */
export declare function StatusBar({ style, hideTransitionAnimation, animated, hidden, verticalBarBehaviorIOS, }: StatusBarProps): React.JSX.Element;
export declare namespace StatusBar {
    var setStyle: (style: StatusBarStyle, animated?: boolean) => void;
    var setHidden: (hidden: boolean, animation?: StatusBarAnimation) => void;
    var getVerticalBarEdgeIOS: () => VerticalBarEdgeIOS | null;
    var setVerticalBarBehaviorIOS: (behavior: VerticalBarBehaviorIOS) => void;
}
/**
 * @deprecated Use `StatusBar.setStyle` instead. This will be removed in a future release.
 */
export declare const setStatusBarStyle: (style: StatusBarStyle, animated?: boolean) => void;
/**
 * @deprecated Use `StatusBar.setHidden` instead. This will be removed in a future release.
 */
export declare const setStatusBarHidden: (hidden: boolean, animation?: StatusBarAnimation) => void;
/**
 * A hook that returns the edge where the system places the vertical bar, and updates when it
 * changes, such as when the device rotates. See `StatusBar.getVerticalBarEdgeIOS()`.
 * @platform ios
 */
export declare function useVerticalBarEdgeIOS(): VerticalBarEdgeIOS | null;
