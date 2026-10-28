import * as React from 'react';
import type { ColorValue, NativeSyntheticEvent, ViewProps } from 'react-native';
import { View } from 'react-native';
import type { ButtonEvent } from '../v3/types';
import { NativeGestureRole } from '../web/interfaces';
type ButtonProps = ViewProps & {
    ref?: React.Ref<React.ComponentRef<typeof View>>;
    enabled?: boolean;
    tapAnimationInDuration?: number;
    tapAnimationOutDuration?: number;
    longPressDuration?: number;
    longPressAnimationOutDuration?: number;
    hoverAnimationInDuration?: number;
    hoverAnimationOutDuration?: number;
    activeOpacity?: number;
    activeScale?: number;
    activeUnderlayOpacity?: number;
    hoverOpacity?: number;
    hoverScale?: number;
    hoverUnderlayOpacity?: number;
    defaultOpacity?: number;
    defaultScale?: number;
    defaultUnderlayOpacity?: number;
    underlayColor?: ColorValue;
    hasLongPressHandler?: boolean;
    moduleId?: number;
    handlerTag?: number;
    cancelOnLeave?: boolean;
    gestureTestID?: string;
    gestureHitSlop?: {
        top?: number;
        left?: number;
        bottom?: number;
        right?: number;
    } | null | undefined;
    onButtonPress?: ((event: NativeSyntheticEvent<ButtonEvent>) => void) | undefined;
    onButtonPressIn?: ((event: NativeSyntheticEvent<ButtonEvent>) => void) | undefined;
    onButtonPressOut?: ((event: NativeSyntheticEvent<ButtonEvent>) => void) | undefined;
    onButtonLongPress?: ((event: NativeSyntheticEvent<ButtonEvent>) => void) | undefined;
    onButtonHoverIn?: ((event: NativeSyntheticEvent<ButtonEvent>) => void) | undefined;
    onButtonHoverOut?: ((event: NativeSyntheticEvent<ButtonEvent>) => void) | undefined;
    onButtonInteractionFinished?: ((event: NativeSyntheticEvent<ButtonEvent>) => void) | undefined;
};
export declare const ButtonComponent: {
    ({ ref: externalRef, enabled, tapAnimationInDuration, tapAnimationOutDuration, longPressDuration, longPressAnimationOutDuration, hoverAnimationInDuration, hoverAnimationOutDuration, activeOpacity, activeScale, activeUnderlayOpacity, hoverOpacity: hoverOpacityProp, hoverScale: hoverScaleProp, hoverUnderlayOpacity: hoverUnderlayOpacityProp, defaultOpacity, defaultScale, defaultUnderlayOpacity, underlayColor, hasLongPressHandler, moduleId: _moduleId, handlerTag, cancelOnLeave, gestureTestID, gestureHitSlop, onButtonPress, onButtonPressIn, onButtonPressOut, onButtonLongPress, onButtonHoverIn, onButtonHoverOut, onButtonInteractionFinished, style, children, ...rest }: ButtonProps): React.JSX.Element;
    displayName: NativeGestureRole;
};
export default ButtonComponent;
//# sourceMappingURL=GestureHandlerButton.web.d.ts.map