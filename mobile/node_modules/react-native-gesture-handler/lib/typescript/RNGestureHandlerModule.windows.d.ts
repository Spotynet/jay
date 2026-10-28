import type React from 'react';
import type { ActionType } from './ActionType';
import type { Config } from './web/interfaces';
export declare const Gestures: {
    NativeViewGestureHandler: undefined;
    PanGestureHandler: undefined;
    TapGestureHandler: undefined;
    LongPressGestureHandler: undefined;
    PinchGestureHandler: undefined;
    RotationGestureHandler: undefined;
    FlingGestureHandler: undefined;
    ManualGestureHandler: undefined;
};
declare const _default: {
    createGestureHandler<T>(_handlerName: keyof typeof Gestures, _handlerTag: number, _config: T): void;
    attachGestureHandler(_handlerTag: number, _newView: any, _actionType: ActionType, _propsRef: React.RefObject<unknown>): void;
    setGestureHandlerConfig(_handlerTag: number, _newConfig: Config): void;
    updateGestureHandlerConfig(_handlerTag: number, _newConfig: Config): void;
    getGestureHandlerNode(_handlerTag: number): void;
    dropGestureHandler(_handlerTag: number): void;
    flushOperations(): void;
};
export default _default;
//# sourceMappingURL=RNGestureHandlerModule.windows.d.ts.map