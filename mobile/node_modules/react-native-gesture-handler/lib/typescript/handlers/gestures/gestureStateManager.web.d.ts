/**
 * @deprecated `LegacyGestureStateManagerType` is deprecated and will be removed in the future. Please use the new, hook-based API instead.
 */
export interface GestureStateManagerType {
    begin: () => void;
    activate: () => void;
    fail: () => void;
    end: () => void;
    /** @internal */
    handlerTag: number;
}
export declare const GestureStateManager: {
    create(handlerTag: number): GestureStateManagerType;
};
//# sourceMappingURL=gestureStateManager.web.d.ts.map