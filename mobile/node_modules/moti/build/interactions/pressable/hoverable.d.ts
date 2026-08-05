import React, { ReactElement as ReactChild } from 'react';
export interface HoverableProps {
    onHoverIn?: () => void;
    onHoverOut?: () => void;
    children: ReactChild;
    childRef?: React.Ref<any>;
}
export declare function Hoverable({ onHoverIn, onHoverOut, children, childRef, }: HoverableProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=hoverable.d.ts.map