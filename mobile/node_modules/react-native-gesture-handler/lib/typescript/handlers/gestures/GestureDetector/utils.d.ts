import type { PropsRef } from '../../../web/interfaces';
import type { GestureType } from '../gesture';
export declare const ALLOWED_PROPS: string[];
export declare function extractGestureRelations(gesture: GestureType): {
    waitFor: number[];
    simultaneousHandlers: number[];
    blocksHandlers: number[];
};
export declare function checkGestureCallbacksForWorklets(gesture: GestureType): void;
export declare function useForceRender(): () => void;
export declare function useWebEventHandlers(): import("react").RefObject<PropsRef>;
//# sourceMappingURL=utils.d.ts.map