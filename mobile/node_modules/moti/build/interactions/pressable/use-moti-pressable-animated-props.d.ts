import type { MotiPressableInteractionState } from './types';
import { MotiPressableInteractionIds } from './context';
type Factory<Props> = (interaction: MotiPressableInteractionState) => Props;
type Deps = unknown[] | null | undefined;
/**
 * Replacement for `useAnimatedProps`, which receives the interaction state as the first argument.
 * @param factory function that receives the interaction state and returns the props
 */
export declare function useMotiPressableAnimatedProps<Props>(id: MotiPressableInteractionIds['id'], factory: Factory<Props>, deps?: Deps): Partial<Props>;
export declare function useMotiPressableAnimatedProps<Props>(factory: Factory<Props>, deps?: Deps): Partial<Props>;
export {};
//# sourceMappingURL=use-moti-pressable-animated-props.d.ts.map