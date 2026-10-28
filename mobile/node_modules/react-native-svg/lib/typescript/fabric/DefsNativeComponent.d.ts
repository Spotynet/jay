import type { CodegenTypes } from 'react-native';
import type { ViewProps } from './utils';
interface SvgNodeCommonProps {
    name?: string;
    opacity?: CodegenTypes.WithDefault<CodegenTypes.Float, 1.0>;
    matrix?: ReadonlyArray<CodegenTypes.Float>;
    mask?: string;
    markerStart?: string;
    markerMid?: string;
    markerEnd?: string;
    clipPath?: string;
    clipRule?: CodegenTypes.WithDefault<CodegenTypes.Int32, 0>;
    responsible?: boolean;
    display?: string;
    pointerEvents?: string;
}
interface NativeProps extends ViewProps, SvgNodeCommonProps {
}
declare const _default: import("react-native").HostComponent<NativeProps>;
export default _default;
//# sourceMappingURL=DefsNativeComponent.d.ts.map