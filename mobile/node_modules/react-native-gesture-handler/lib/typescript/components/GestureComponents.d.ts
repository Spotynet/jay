import type { PropsWithChildren, ReactElement } from 'react';
import * as React from 'react';
import type { DrawerLayoutAndroid as RNDrawerLayoutAndroid, DrawerLayoutAndroidProps as RNDrawerLayoutAndroidProps, FlatListProps as RNFlatListProps, ScrollViewProps as RNScrollViewProps, SwitchProps as RNSwitchProps, TextInputProps as RNTextInputProps } from 'react-native';
import { FlatList as RNFlatList, RefreshControl as RNRefreshControl, ScrollView as RNScrollView, Switch as RNSwitch, TextInput as RNTextInput } from 'react-native';
import type { NativeViewGestureHandlerProps } from '../handlers/NativeViewGestureHandler';
/**
 * @deprecated use `RefreshControl` instead
 */
export declare const LegacyRefreshControl: {
    (props: import("react-native").RefreshControlProps & NativeViewGestureHandlerProps & {
        ref?: React.Ref<React.ComponentType<any> | null> | undefined;
    }): React.JSX.Element;
    displayName: any;
};
export type LegacyRefreshControl = typeof LegacyRefreshControl & RNRefreshControl;
declare const GHScrollView: {
    (props: RNScrollViewProps & {
        children?: React.ReactNode | undefined;
    } & NativeViewGestureHandlerProps & {
        ref?: React.Ref<React.ComponentType<any> | null> | undefined;
    }): React.JSX.Element;
    displayName: any;
};
/**
 * @deprecated use `ScrollView` instead
 */
export declare const LegacyScrollView: (props: RNScrollViewProps & NativeViewGestureHandlerProps & {
    ref?: React.Ref<React.ComponentRef<typeof RNScrollView> | null>;
}) => React.JSX.Element;
export type LegacyScrollView = typeof GHScrollView & React.ComponentRef<typeof RNScrollView>;
/**
 * @deprecated use `Switch` instead
 */
export declare const LegacySwitch: {
    (props: RNSwitchProps & NativeViewGestureHandlerProps & {
        ref?: React.Ref<React.ComponentType<any> | null> | undefined;
    }): React.JSX.Element;
    displayName: any;
};
export type LegacySwitch = typeof LegacySwitch & RNSwitch;
/**
 * @deprecated use `RefreshControl` instead
 */
export declare const LegacyTextInput: {
    (props: RNTextInputProps & NativeViewGestureHandlerProps & {
        ref?: React.Ref<React.ComponentType<any> | null> | undefined;
    }): React.JSX.Element;
    displayName: any;
};
export type LegacyTextInput = typeof LegacyTextInput & RNTextInput;
/**
 * @deprecated use `DrawerLayoutAndroid` instead
 */
export declare const LegacyDrawerLayoutAndroid: React.ComponentType<PropsWithChildren<RNDrawerLayoutAndroidProps> & NativeViewGestureHandlerProps & {
    ref?: React.Ref<React.ComponentType<any> | null>;
}>;
export type LegacyDrawerLayoutAndroid = typeof LegacyDrawerLayoutAndroid & React.ComponentRef<typeof RNDrawerLayoutAndroid>;
/**
 * @deprecated use `FlatList` instead
 */
export declare const LegacyFlatList: <ItemT>(props: PropsWithChildren<Omit<RNFlatListProps<ItemT>, "renderScrollComponent"> & NativeViewGestureHandlerProps & {
    ref?: React.Ref<RNFlatList<ItemT> | null>;
}>) => ReactElement | null;
export type LegacyFlatList<ItemT = any> = typeof LegacyFlatList & RNFlatList<ItemT>;
export {};
//# sourceMappingURL=GestureComponents.d.ts.map