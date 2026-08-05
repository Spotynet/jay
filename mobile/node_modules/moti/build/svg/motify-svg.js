import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import Animated from 'react-native-reanimated';
import { useMotify } from '../core/use-motify';
export function motifySvg(ComponentWithoutAnimation) {
    const withAnimations = () => {
        const AnimatedComponent = Animated.createAnimatedComponent(ComponentWithoutAnimation);
        const Motified = forwardRef(function Moti(props, ref) {
            const animated = useMotify(props);
            if (props.animatedProps) {
                console.warn(`Moti: You passed animatedProps to a Moti SVG component. This will do nothing. You should use the animate prop directly. This will have no effect.`);
            }
            return (_jsx(AnimatedComponent, { ...props, animatedProps: animated.style, 
                // @ts-ignore
                ref: ref }));
        });
        Motified.displayName = `MotiSvg.${ComponentWithoutAnimation.displayName ||
            ComponentWithoutAnimation.name ||
            'NoName'}`;
        return Motified;
    };
    return withAnimations;
}
//# sourceMappingURL=motify-svg.js.map