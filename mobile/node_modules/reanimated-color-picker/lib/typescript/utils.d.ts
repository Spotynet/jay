import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
export declare const isRtl: boolean;
export declare const isWeb: boolean;
/** - Get a specific property from a react native style object */
export declare function getStyle<T extends keyof ViewStyle>(style: StyleProp<ViewStyle>, property: T): ViewStyle[T] | undefined;
/** - Clamp a number value between `0` and a max value */
export declare const clamp: (v: number, max: number) => number;
/** - Convert `HSV` color to an `HSLA` string representation */
export declare const HSVA2HSLA_string: (h: number, s: number, v: number, a?: number) => string;
/** - Render children only if the `render` property is `true` */
export declare function ConditionalRendering(props: {
    children: React.ReactNode;
    if: boolean;
}): React.JSX.Element | null;
/** - Render children for native platforms only (Android, IOS) */
export declare function RenderNativeOnly({ children }: {
    children: React.ReactNode;
}): React.JSX.Element | null;
/** - Render children for Web platform only */
export declare function RenderWebOnly({ children }: {
    children: React.ReactNode;
}): React.JSX.Element | null;
/**
 * Enable Android hardware texture rendering for Android Nougat(API 24) to Pie(API 28) to address an issue when applying a
 * transform on a View with a border radius > 0.
 *
 * See: https://github.com/facebook/react-native/issues/18266
 */
export declare const enableAndroidHardwareTextures: boolean;
//# sourceMappingURL=utils.d.ts.map