import { useEffect, useMemo } from 'react';
import { useAnimatedStyle, useSharedValue, withDecay, withSpring, withTiming, withDelay, withRepeat, withSequence, runOnJS, ReduceMotion, } from 'react-native-reanimated';
import { PackageName } from './constants/package-name';
const debug = (...args) => {
    'worklet';
    // @ts-ignore
    if (!global.shouldDebugMoti) {
        return;
    }
    if (args) {
        // hi
    }
    console.log('[moti]', ...args);
};
const isColor = (styleKey) => {
    'worklet';
    const keys = {
        backgroundColor: true,
        borderBottomColor: true,
        borderLeftColor: true,
        borderRightColor: true,
        borderTopColor: true,
        color: true,
        shadowColor: true,
        borderColor: true,
        borderEndColor: true,
        borderStartColor: true,
    };
    return Boolean(keys[styleKey]);
};
const isTransform = (styleKey) => {
    'worklet';
    const transforms = {
        perspective: true,
        rotate: true,
        rotateX: true,
        rotateY: true,
        rotateZ: true,
        scale: true,
        scaleX: true,
        scaleY: true,
        translateX: true,
        translateY: true,
        skewX: true,
        skewY: true,
    };
    return Boolean(transforms[styleKey]);
};
function animationDelay(_key, transition, defaultDelay) {
    'worklet';
    const key = _key;
    let delayMs = defaultDelay;
    if (transition?.[key]?.delay != null) {
        delayMs = transition?.[key]?.delay;
    }
    else if (transition?.delay != null) {
        delayMs = transition.delay;
    }
    return {
        delayMs,
    };
}
const withSpringConfigKeys = [
    'stiffness',
    'overshootClamping',
    'restDisplacementThreshold',
    'restSpeedThreshold',
    'velocity',
    'reduceMotion',
    'mass',
    'damping',
    'duration',
    'dampingRatio',
];
function animationConfig(styleProp, transition) {
    'worklet';
    const key = styleProp;
    let repeatCount = 0;
    let repeatReverse = true;
    let animationType = 'spring';
    if (isColor(key) || key === 'opacity')
        animationType = 'timing';
    const styleSpecificTransition = transition?.[key];
    // say that we're looking at `width`
    // first, check if we have transition.width.type
    if (styleSpecificTransition?.type) {
        animationType = styleSpecificTransition.type;
    }
    else if (transition?.type) {
        // otherwise, fallback to transition.type
        animationType = transition.type;
    }
    const loop = styleSpecificTransition?.loop ?? transition?.loop;
    if (loop != null) {
        repeatCount = loop ? -1 : 0;
    }
    if (styleSpecificTransition?.repeat != null) {
        repeatCount = styleSpecificTransition?.repeat;
    }
    else if (transition?.repeat != null) {
        repeatCount = transition.repeat;
    }
    if (styleSpecificTransition?.repeatReverse != null) {
        repeatReverse = styleSpecificTransition.repeatReverse;
    }
    else if (transition?.repeatReverse != null) {
        repeatReverse = transition.repeatReverse;
    }
    // debug({ loop, key, repeatCount, animationType })
    let config = {};
    let reduceMotion = ReduceMotion.System;
    // so sad, but fix it later :(
    let animation = (...props) => props;
    if (animationType === 'timing') {
        const duration = transition?.[key]?.duration ??
            transition?.duration;
        const easing = transition?.[key]?.easing ??
            transition?.easing;
        const timingReduceMotion = transition?.[key]?.reduceMotion ??
            transition?.reduceMotion;
        if (easing) {
            config['easing'] = easing;
        }
        if (duration != null) {
            config['duration'] = duration;
        }
        if (reduceMotion) {
            reduceMotion = timingReduceMotion ?? reduceMotion;
            config['reduceMotion'] = reduceMotion;
        }
        animation = withTiming;
    }
    else if (animationType === 'spring') {
        animation = withSpring;
        config = {};
        for (const configKey of withSpringConfigKeys) {
            const styleSpecificConfig = transition?.[key]?.[configKey];
            const transitionConfigForKey = transition?.[configKey];
            if (configKey === 'reduceMotion') {
                reduceMotion = transitionConfigForKey || styleSpecificConfig;
            }
            if (styleSpecificConfig != null) {
                config[configKey] = styleSpecificConfig;
            }
            else if (transitionConfigForKey != null) {
                config[configKey] = transitionConfigForKey;
            }
        }
    }
    else if (animationType === 'decay') {
        animation = withDecay;
        config = {};
        const configKeys = [
            'clamp',
            'velocity',
            'deceleration',
            'velocityFactor',
            'reduceMotion',
            'velocityFactor',
        ];
        for (const configKey of configKeys) {
            const styleSpecificConfig = transition?.[key]?.[configKey];
            const transitionConfigForKey = transition?.[configKey];
            if (configKey === 'reduceMotion') {
                reduceMotion = transitionConfigForKey || styleSpecificConfig;
            }
            if (styleSpecificConfig != null) {
                config[configKey] = styleSpecificConfig;
            }
            else if (transitionConfigForKey != null) {
                config[configKey] = transitionConfigForKey;
            }
        }
    }
    else if (animationType === 'no-animation') {
        animation = (value) => value;
        config = {};
        repeatCount = 0;
    }
    return {
        animation,
        config,
        reduceMotion,
        repeatReverse,
        repeatCount,
        shouldRepeat: !!repeatCount,
    };
}
const getSequenceArray = (sequenceKey, sequenceArray, delayMs, config, animation, callback) => {
    'worklet';
    const sequence = [];
    for (const step of sequenceArray) {
        const shouldPush = typeof step === 'object'
            ? step && step?.value != null && step?.value !== false
            : step != null && step !== false;
        let stepOnDidAnimate;
        if (shouldPush) {
            let stepDelay = delayMs;
            let stepValue = step;
            let stepReduceMotion = ReduceMotion.System;
            let stepConfig = Object.assign({}, config);
            let stepAnimation = animation;
            if (typeof step === 'object') {
                // not allowed in Reanimated: { delay, value, ...transition } = step
                const stepTransition = Object.assign({}, step);
                delete stepTransition.delay;
                delete stepTransition.value;
                const { config: inlineStepConfig, animation, reduceMotion, } = animationConfig(sequenceKey, stepTransition);
                stepConfig = Object.assign({}, stepConfig, inlineStepConfig);
                stepAnimation = animation;
                stepReduceMotion = reduceMotion;
                if (step.delay != null) {
                    stepDelay = step.delay;
                }
                stepValue = step.value;
                stepOnDidAnimate = step.onDidAnimate;
            }
            const sequenceValue = stepAnimation(stepValue, stepConfig, (completed = false, maybeValue) => {
                'worklet';
                callback(completed, maybeValue, {
                    attemptedSequenceValue: stepValue,
                });
                if (stepOnDidAnimate) {
                    runOnJS(stepOnDidAnimate)(completed, maybeValue, {
                        attemptedSequenceItemValue: stepValue,
                        attemptedSequenceArray: maybeValue,
                    });
                }
            });
            if (stepDelay != null) {
                sequence.push(withDelay(stepDelay, sequenceValue, stepReduceMotion));
            }
            else {
                sequence.push(sequenceValue);
            }
        }
    }
    return sequence;
};
export function useMotify({ animate: animateProp, from: fromProp = false, transition: transitionProp, exitTransition: exitTransitionProp, delay: defaultDelay, state, stylePriority = 'animate', onDidAnimate, exit: exitProp, animateInitialState = false, usePresenceValue, presenceContext, }) {
    const isMounted = useSharedValue(false);
    const [isPresent, safeToUnmount] = usePresenceValue ?? [];
    const disableInitialAnimation = presenceContext?.initial === false && !animateInitialState;
    const { custom, reanimatedSafeToUnmount, reanimatedOnDidAnimate } = useMemo(() => ({
        custom: () => {
            'worklet';
            return presenceContext?.custom;
        },
        reanimatedSafeToUnmount: () => {
            safeToUnmount?.();
        },
        reanimatedOnDidAnimate: (...args) => {
            onDidAnimate?.(...args);
        },
    }), [onDidAnimate, presenceContext, safeToUnmount]);
    const hasExitStyle = Boolean(typeof exitProp === 'function' ||
        (typeof exitProp === 'object' &&
            exitProp &&
            Object.keys(exitProp).length > 0));
    const style = useAnimatedStyle(() => {
        const final = {
            // initializing here fixes reanimated object.__defineProperty bug(?)
            transform: [],
        };
        const variantStyle = state?.__state?.value || {};
        let animateStyle;
        if (animateProp && 'value' in animateProp) {
            animateStyle = (animateProp.value || {});
        }
        else {
            animateStyle = (animateProp || {});
        }
        debug('style', animateStyle);
        const initialStyle = fromProp || {};
        let exitStyle = exitProp || {};
        if (typeof exitStyle === 'function') {
            exitStyle = exitStyle(custom());
        }
        const isExiting = !isPresent && hasExitStyle;
        let mergedStyles = {};
        if (stylePriority === 'state') {
            mergedStyles = Object.assign({}, animateStyle, variantStyle);
        }
        else {
            mergedStyles = Object.assign({}, variantStyle, animateStyle);
        }
        if (!isMounted.value &&
            !disableInitialAnimation &&
            Object.keys(initialStyle).length) {
            mergedStyles = initialStyle;
        }
        else {
            mergedStyles = Object.assign({}, initialStyle, mergedStyles);
        }
        if (isExiting && exitStyle) {
            mergedStyles = Object.assign({}, exitStyle);
        }
        const exitingStyleProps = {};
        const disabledExitStyles = new Set([
            'position',
            'zIndex',
            'borderTopStyle',
            'borderBottomStyle',
            'borderLeftStyle',
            'borderRightStyle',
            'borderStyle',
            'pointerEvents',
            'outline',
        ]);
        Object.keys(exitStyle || {}).forEach((key) => {
            if (!disabledExitStyles.has(key)) {
                exitingStyleProps[key] = true;
            }
        });
        // allow shared values as transitions
        let transition;
        if (transitionProp && 'value' in transitionProp) {
            transition = transitionProp.value;
        }
        else {
            transition = transitionProp;
        }
        // let the state prop drive transitions too
        if (variantStyle.transition) {
            transition = Object.assign({}, transition, variantStyle.transition);
        }
        if (isExiting && exitTransitionProp) {
            let exitTransition;
            if (exitTransitionProp && 'value' in exitTransitionProp) {
                exitTransition = exitTransitionProp.value;
            }
            else if (typeof exitTransitionProp == 'function') {
                exitTransition = exitTransitionProp(custom());
            }
            else {
                exitTransition = exitTransitionProp;
            }
            transition = Object.assign({}, transition, exitTransition);
        }
        // need to use forEach to work with Hermes...https://github.com/nandorojo/moti/issues/214#issuecomment-1399055535
        Object.keys(mergedStyles).forEach((key) => {
            let value = mergedStyles[key];
            let inlineOnDidAnimate;
            if (typeof value === 'object' && value && 'onDidAnimate' in value) {
                inlineOnDidAnimate = value.onDidAnimate;
                value = value.value;
            }
            const { animation, config, reduceMotion, shouldRepeat, repeatCount, repeatReverse, } = animationConfig(key, transition);
            const callback = (completed = false, recentValue, info) => {
                if (onDidAnimate) {
                    runOnJS(reanimatedOnDidAnimate)(key, completed, recentValue, {
                        attemptedValue: value,
                        attemptedSequenceItemValue: info?.attemptedSequenceValue,
                    });
                }
                if (inlineOnDidAnimate) {
                    runOnJS(inlineOnDidAnimate)(completed, recentValue, {
                        attemptedValue: value,
                    });
                }
                if (isExiting) {
                    exitingStyleProps[key] = false;
                    const areStylesExiting = Object.values(exitingStyleProps).some(Boolean);
                    // if this is true, then we've finished our exit animations
                    if (!areStylesExiting) {
                        runOnJS(reanimatedSafeToUnmount)();
                    }
                }
            };
            let { delayMs } = animationDelay(key, transition, defaultDelay);
            if (value == null || value === false) {
                // skip missing values
                // this is useful if you want to do {opacity: loading && 1}
                // without this, those values will break I think
                return;
            }
            if (key === 'transform') {
                if (!Array.isArray(value)) {
                    console.error(`[${PackageName}]: Invalid transform value. Needs to be an array.`);
                }
                else {
                    value.forEach((transformObject) => {
                        final['transform'] = final['transform'] || [];
                        const transformKey = Object.keys(transformObject)[0];
                        const transformValue = transformObject[transformKey];
                        const transform = {};
                        if (Array.isArray(transformValue)) {
                            // we have a sequence in this transform...
                            const sequence = getSequenceArray(transformKey, transformValue, delayMs, config, animation, callback);
                            if (sequence.length) {
                                let finalValue = withSequence(sequence[0], ...sequence.slice(1));
                                if (shouldRepeat) {
                                    finalValue = withRepeat(finalValue, repeatCount, repeatReverse, callback, reduceMotion);
                                }
                                transform[transformKey] = finalValue;
                            }
                        }
                        else {
                            if (transition?.[transformKey]?.delay != null) {
                                delayMs = transition?.[transformKey]?.delay;
                            }
                            let configKey = transformKey;
                            if (transition &&
                                'transform' in transition &&
                                !(configKey in transition)) {
                                configKey = 'transform';
                            }
                            const { animation, config, shouldRepeat, repeatCount, repeatReverse, } = animationConfig(configKey, transition);
                            let finalValue = animation(transformValue, config, callback);
                            if (shouldRepeat) {
                                finalValue = withRepeat(finalValue, repeatCount, repeatReverse, undefined, reduceMotion);
                            }
                            if (delayMs != null) {
                                transform[transformKey] = withDelay(delayMs, finalValue, reduceMotion);
                            }
                            else {
                                transform[transformKey] = finalValue;
                            }
                        }
                        if (Object.keys(transform).length &&
                            Array.isArray(final['transform'])) {
                            final['transform'].push(transform);
                        }
                    });
                }
            }
            else if (Array.isArray(value)) {
                // we have a sequence
                const sequence = getSequenceArray(key, value, delayMs, config, animation, callback);
                let finalValue = withSequence(...sequence);
                if (shouldRepeat) {
                    finalValue = withRepeat(finalValue, repeatCount, repeatReverse, undefined, reduceMotion);
                }
                if (isTransform(key)) {
                    // we have a sequence of transforms
                    final['transform'] = final['transform'] || [];
                    if (sequence.length) {
                        const transform = {};
                        transform[key] = finalValue;
                        // @ts-expect-error transform had the wrong type
                        final['transform'].push(transform);
                    }
                }
                else {
                    // we have a normal sequence of items
                    // shadows not supported
                    if (sequence.length) {
                        final[key] = finalValue;
                    }
                }
            }
            else if (isTransform(key)) {
                final['transform'] = final['transform'] || [];
                if (transition?.[key]?.delay != null) {
                    delayMs = transition?.[key]?.delay;
                }
                const transform = {};
                let finalValue = animation(value, config, callback);
                if (shouldRepeat) {
                    finalValue = withRepeat(finalValue, repeatCount, repeatReverse, undefined, reduceMotion);
                }
                if (delayMs != null) {
                    transform[key] = withDelay(delayMs, finalValue, reduceMotion);
                }
                else {
                    transform[key] = finalValue;
                }
                // @ts-expect-error transform had the wrong type
                final['transform'].push(transform);
            }
            else if (typeof value === 'object') {
                // shadows
                final[key] = {};
                for (const innerStyleKey in value || {}) {
                    let finalValue = animation(value, config, callback);
                    if (shouldRepeat) {
                        finalValue = withRepeat(finalValue, repeatCount, repeatReverse, undefined, reduceMotion);
                    }
                    if (delayMs != null) {
                        final[key][innerStyleKey] = withDelay(delayMs, finalValue, reduceMotion);
                    }
                    else {
                        final[key][innerStyleKey] = finalValue;
                    }
                }
            }
            else {
                let finalValue = animation(value, config, callback);
                if (shouldRepeat) {
                    finalValue = withRepeat(finalValue, repeatCount, repeatReverse, undefined, reduceMotion);
                }
                if (delayMs != null && typeof delayMs === 'number') {
                    final[key] = withDelay(delayMs, finalValue, reduceMotion);
                }
                else {
                    final[key] = finalValue;
                }
            }
        });
        if (!final.transform?.length) {
            delete final.transform;
        }
        return final;
        // @ts-ignore complex union lol...
    }, [
        animateProp,
        custom,
        defaultDelay,
        disableInitialAnimation,
        exitProp,
        exitTransitionProp,
        fromProp,
        hasExitStyle,
        isMounted,
        isPresent,
        onDidAnimate,
        reanimatedOnDidAnimate,
        reanimatedSafeToUnmount,
        state,
        stylePriority,
        transitionProp,
    ]);
    useEffect(function allowUnMountIfMissingExit() {
        if (fromProp && isMounted.value === false) {
            // put this here just to avoid having another useEffect
            isMounted.value = true;
        }
        if (!isPresent && !hasExitStyle) {
            reanimatedSafeToUnmount();
        }
    }, [hasExitStyle, isPresent, reanimatedSafeToUnmount]);
    return {
        style,
    };
}
//# sourceMappingURL=use-motify.js.map