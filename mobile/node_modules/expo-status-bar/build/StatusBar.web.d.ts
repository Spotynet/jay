import type { VerticalBarEdgeIOS } from './types';
export declare function StatusBar(): null;
export declare namespace StatusBar {
    var setStyle: () => void;
    var setHidden: () => void;
    var getVerticalBarEdgeIOS: () => VerticalBarEdgeIOS | null;
    var setVerticalBarBehaviorIOS: () => void;
}
export declare function setStatusBarStyle(): void;
export declare function setStatusBarHidden(): void;
export declare function useVerticalBarEdgeIOS(): VerticalBarEdgeIOS | null;
