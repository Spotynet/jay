import { jsx as _jsx } from "react/jsx-runtime";
import { usePresence, PresenceContext } from 'framer-motion';
import { forwardRef, useContext, } from 'react';
import Animated from 'react-native-reanimated';
import { useMotify } from './use-motify';
export default function motify(ComponentWithoutAnimation) {
    const Component = Animated.createAnimatedComponent(ComponentWithoutAnimation);
    const withAnimations = () => {
        const Motified = forwardRef(function Moti(props, ref) {
            const animated = useMotify({
                ...props,
                usePresenceValue: usePresence(),
                presenceContext: useContext(PresenceContext),
            });
            const style = props.style;
            return (_jsx(Component, { ...props, style: style ? [style, animated.style] : animated.style, ref: ref }));
        });
        Motified.displayName = `Moti.${ComponentWithoutAnimation.displayName ||
            ComponentWithoutAnimation.name ||
            'NoName'}`;
        return Motified;
    };
    return withAnimations;
}
//# sourceMappingURL=motify.js.map