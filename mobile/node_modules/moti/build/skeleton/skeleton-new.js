import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { createContext, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAnimatedStyle, useDerivedValue, useSharedValue, } from 'react-native-reanimated';
import { View as MotiView } from '../components';
import { DEFAULT_SKELETON_SIZE as DEFAULT_SIZE, defaultDarkColors, defaultLightColors, baseColors, } from './shared';
export default function Skeleton(props) {
    const skeletonGroupContext = useContext(SkeletonGroupContext);
    const { radius = 8, children, show = skeletonGroupContext ?? !children, width, height = children ? undefined : DEFAULT_SIZE, boxHeight, colorMode = 'dark', colors = colorMode === 'dark' ? defaultDarkColors : defaultLightColors, backgroundColor = colors[0] ??
        colors[1] ??
        baseColors[colorMode]?.secondary, backgroundSize = 6, disableExitAnimation, transition, } = props;
    const measuredWidthSv = useSharedValue(0);
    const borderRadius = (() => {
        if (radius === 'square') {
            return 0;
        }
        if (radius === 'round') {
            return 99999;
        }
        return radius;
    })();
    const outerHeight = (() => {
        if (boxHeight != null)
            return boxHeight;
        if (show && !children) {
            return height;
        }
        return undefined;
    })();
    return (_jsxs(View, { style: {
            height: outerHeight,
            minHeight: height,
            minWidth: width ?? (children ? undefined : DEFAULT_SIZE),
        }, children: [children, _jsx(View, { style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    borderRadius,
                    width: width ?? (children ? '100%' : DEFAULT_SIZE),
                    height: height ?? '100%',
                    overflow: 'hidden',
                    backgroundColor: show ? backgroundColor : undefined,
                }, onLayout: ({ nativeEvent }) => {
                    if (measuredWidthSv.value !== nativeEvent.layout.width) {
                        measuredWidthSv.value = nativeEvent.layout.width;
                    }
                }, pointerEvents: "none", children: disableExitAnimation && !show ? null : (_jsx(AnimatedGradient
                // force a key change to make the loop animation re-mount
                , { colors: colors, backgroundSize: backgroundSize, transition: transition, show: show, measuredWidthSv: measuredWidthSv, Gradient: props.Gradient }, colors.join(','))) })] }));
}
const AnimatedGradient = React.memo(function AnimatedGradient({ colors, backgroundSize, transition, show, measuredWidthSv, Gradient, }) {
    return (_jsx(MotiView, { style: [
            StyleSheet.absoluteFillObject,
            useAnimatedStyle(() => ({
                width: measuredWidthSv.value * backgroundSize,
            }), [backgroundSize, measuredWidthSv]),
        ], from: {
            opacity: 0,
            translateX: 0,
        }, animate: useDerivedValue(() => {
            return {
                opacity: show ? 1 : 0,
                translateX: -measuredWidthSv.value * (backgroundSize - 1),
            };
        }, [measuredWidthSv, show]), transition: {
            translateX: {
                type: 'timing',
                loop: show,
                delay: 200,
                duration: 3000,
            },
            opacity: {
                type: 'timing',
                delay: 0,
                duration: 200,
            },
            ...transition,
        }, children: _jsx(Gradient, { colors: colors, start: {
                x: 0.1,
                y: 1,
            }, end: {
                x: 1,
                y: 1,
            }, style: StyleSheet.absoluteFillObject }) }));
}, function propsAreEqual(prev, next) {
    if (prev.backgroundSize !== next.backgroundSize)
        return false;
    if (prev.show !== next.show)
        return false;
    const didColorsChange = prev.colors.some((color, index) => {
        return color !== next.colors[index];
    });
    if (didColorsChange)
        return false;
    // transition changes will not be respected
    return true;
});
const SkeletonGroupContext = createContext(undefined);
function SkeletonGroup({ children, show, }) {
    return (_jsx(SkeletonGroupContext.Provider, { value: show, children: children }));
}
Skeleton.Group = SkeletonGroup;
//# sourceMappingURL=skeleton-new.js.map