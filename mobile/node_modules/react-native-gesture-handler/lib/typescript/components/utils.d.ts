import type { BaseGesture, GestureRef } from '../handlers/gestures/gesture';
type TVProps = {
    focusable?: boolean | undefined;
    isTVSelectable?: boolean | undefined;
};
/**
 * Gesture Handler buttons render the native button component directly, bypassing RN's `<View>` —
 * the only place the `focusable` prop is translated into `isTVSelectable`, which actually drives
 * tvOS focusability.
 */
export declare function getTVProps(props: TVProps): TVProps;
export type RelationPropName = 'simultaneousWithExternalGesture' | 'requireExternalGestureToFail' | 'blocksExternalGesture';
export type RelationPropType = Exclude<GestureRef, number> | Exclude<GestureRef, number>[];
export declare function applyRelationProp(gesture: BaseGesture<any>, relationPropName: RelationPropName, relationProp: RelationPropType): void;
export {};
//# sourceMappingURL=utils.d.ts.map