import type { PresenceContext, usePresence as useFramerPresence } from 'framer-motion';
import type { TransformsStyle } from 'react-native';
import type { MotiProps } from './types';
export declare function useMotify<Animate>({ animate: animateProp, from: fromProp, transition: transitionProp, exitTransition: exitTransitionProp, delay: defaultDelay, state, stylePriority, onDidAnimate, exit: exitProp, animateInitialState, usePresenceValue, presenceContext, }: MotiProps<Animate> & {
    presenceContext?: Pick<NonNullable<React.ContextType<typeof PresenceContext>>, 'custom' | 'initial'> | null;
    usePresenceValue?: ReturnType<typeof useFramerPresence>;
}): {
    style: {
        transform: TransformsStyle["transform"];
    };
};
//# sourceMappingURL=use-motify.d.ts.map