import React from 'react';
export declare class Wrap extends React.Component<{
    onGestureHandlerEvent?: unknown;
    children?: React.ReactNode;
}> {
    private childInstance;
    private hostInstance;
    private childRef;
    private attachedChildRef;
    private childRefCleanup;
    getHostInstance(): unknown;
    private detachChildRef;
    private attachChildRef;
    private handleChildRef;
    componentDidUpdate(): void;
    render(): React.FunctionComponentElement<{
        collapsable: boolean;
        ref: (instance: unknown) => void;
    }>;
}
export declare const AnimatedWrap: typeof Wrap | React.ComponentClass<{
    onGestureHandlerEvent?: unknown;
    children?: React.ReactNode;
}, any>;
//# sourceMappingURL=Wrap.d.ts.map