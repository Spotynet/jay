import type { MotiPressableInteractionState } from './types';
import { SharedValue } from 'react-native-reanimated';
import { MotiPressableInteractionIds } from './context';
import type { MotiTransition } from '../../core';
type Factory<Props> = (interaction: MotiPressableInteractionState) => Props;
type Deps = unknown[] | null | undefined;
/**
 * `useMotiPressableTransition` lets you access the pressable state, and create a custom moti transition from it.
 *
 * You probably won't need this hook. A normal `transition` prop on components should suffice. However, if you want to transition differently based on whether you are or aren't interacting with something (such as for a tooltip), then this hook comes in handy.
 *
 * Please refer to the Moti `transition` options to see what this hook should return.
 *
 * Example:
 * ```tsx
 * const transition = useMotiPressableTransition(({ pressed, hovered }) => {
 *   'worklet'
 *
 *   if (pressed) {
 *     return {
 *       type: 'timing'
 *     }
 *   }
 *
 *   return {
 *     type: 'spring',
 *     delay: 50
 *   }
 * })
 *
 * return <MotiView transition={transition} />
 * ```
 *
 * If you're passing a unique `id` prop to your pressable, you can also isolate this hook to that pressable.
 *
 * Say the parent pressable has `id="list"`, and you want to isolate this hook to the `list` pressable:
 *
 * ```tsx
 * <MotiPressable id="menu">
 *   <Item />
 * </MotiPressable>
 * ```
 *
 * Then, in the `Item` component:
 *
 * ```tsx
 * const transition = useMotiPressableTransition("list", ({ pressed }) => {
 *   'worklet'
 *
 *   if (pressed) {
 *     return {
 *       type: 'timing'
 *     }
 *   }
 *
 *   return {
 *     type: 'spring',
 *     delay: 50
 *   }
 * })
 *
 * return <MotiView transition={transition} />
 * ```
 */
export declare function useMotiPressableTransition(id: MotiPressableInteractionIds['id'], factory: Factory<MotiTransition>, deps?: Deps): Readonly<SharedValue<MotiTransition>>;
export declare function useMotiPressableTransition(factory: Factory<MotiTransition>, deps?: Deps): Readonly<SharedValue<MotiTransition>>;
export {};
//# sourceMappingURL=use-moti-pressable-transition.d.ts.map