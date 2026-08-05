import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, createContext, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { View as MotiView } from '../components';
import { AnimatePresence } from '../core';
import { DEFAULT_SKELETON_SIZE as DEFAULT_SIZE, defaultDarkColors, defaultLightColors, baseColors, } from './shared';
export default function Skeleton(props) {
    const skeletonGroupContext = useContext(SkeletonGroupContext);
    const { radius = 8, children, show = skeletonGroupContext ?? !children, width, height = children ? undefined : DEFAULT_SIZE, boxHeight, colorMode = 'dark', colors = colorMode === 'dark' ? defaultDarkColors : defaultLightColors, backgroundColor = colors[0] ??
        colors[1] ??
        baseColors[colorMode]?.secondary, backgroundSize = 6, disableExitAnimation, transition, } = props;
    const [measuredWidth, setMeasuredWidth] = useState(0);
    const getBorderRadius = () => {
        if (radius === 'square') {
            return 0;
        }
        if (radius === 'round') {
            return 99999;
        }
        return radius;
    };
    const borderRadius = getBorderRadius();
    const getOuterHeight = () => {
        if (boxHeight != null)
            return boxHeight;
        if (show && !children) {
            return height;
        }
        return undefined;
    };
    const outerHeight = getOuterHeight();
    return (_jsxs(View, { style: {
            height: outerHeight,
            minHeight: height,
            minWidth: width ?? (children ? undefined : DEFAULT_SIZE),
        }, children: [children, _jsx(AnimatePresence, { children: show && (_jsx(MotiView, { style: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        borderRadius,
                        width: width ?? (children ? '100%' : DEFAULT_SIZE),
                        height: height ?? '100%',
                        overflow: 'hidden',
                    }, animate: {
                        backgroundColor,
                        opacity: 1,
                    }, transition: {
                        type: 'timing',
                    }, exit: !disableExitAnimation && {
                        opacity: 0,
                    }, onLayout: ({ nativeEvent }) => {
                        if (measuredWidth === nativeEvent.layout.width)
                            return;
                        setMeasuredWidth(nativeEvent.layout.width);
                    }, pointerEvents: "none", children: _jsx(AnimatedGradient
                    // force a key change to make the loop animation re-mount
                    , { colors: colors, backgroundSize: backgroundSize, measuredWidth: measuredWidth, transition: transition }, `${JSON.stringify(colors)}-${measuredWidth}-${JSON.stringify(transition || null)}`) })) })] }));
}
const AnimatedGradient = React.memo(function AnimatedGradient({ measuredWidth, colors, backgroundSize, transition = {}, }) {
    return (_jsx(MotiView, { style: StyleSheet.absoluteFillObject, from: { opacity: 0 }, transition: {
            type: 'timing',
            duration: 200,
        }, animate: measuredWidth
            ? {
                opacity: 1,
            }
            : undefined, children: _jsx(MotiView, { style: [
                StyleSheet.absoluteFillObject,
                {
                    width: measuredWidth * backgroundSize,
                },
            ], from: {
                translateX: 0,
            }, animate: measuredWidth
                ? {
                    translateX: -measuredWidth * (backgroundSize - 1),
                }
                : undefined, transition: {
                loop: true,
                delay: 200,
                type: 'timing',
                duration: 3000,
                ...transition,
            }, children: _jsx(LinearGradient, { colors: colors, start: {
                    x: 0.1,
                    y: 1,
                }, end: {
                    x: 1,
                    y: 1,
                }, style: StyleSheet.absoluteFillObject }) }) }));
}, function propsAreEqual(prev, next) {
    if (prev.measuredWidth !== next.measuredWidth)
        return false;
    if (prev.backgroundSize !== next.backgroundSize)
        return false;
    const didColorsChange = prev.colors.some((color, index) => {
        return color !== next.colors[index];
    });
    if (didColorsChange)
        return false;
    // transition changes will not be respected, but it'll be in the key
    return true;
});
const SkeletonGroupContext = createContext(undefined);
function SkeletonGroup({ children, show, }) {
    return (_jsx(SkeletonGroupContext.Provider, { value: show, children: children }));
}
Skeleton.Group = SkeletonGroup;
//# sourceMappingURL=skeleton.js.map