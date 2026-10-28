import type { CodegenTypes } from 'react-native';
import type { ViewProps } from './utils';
import { NumberProp } from '../lib/extract/types';
import type { UnsafeMixed } from './codegenUtils';
type FilterEdgeMode = 'duplicate' | 'wrap' | 'none';
interface FilterPrimitiveCommonProps {
    x?: UnsafeMixed<NumberProp>;
    y?: UnsafeMixed<NumberProp>;
    width?: UnsafeMixed<NumberProp>;
    height?: UnsafeMixed<NumberProp>;
    result?: string;
}
export interface NativeProps extends ViewProps, FilterPrimitiveCommonProps {
    in1?: string;
    stdDeviationX?: CodegenTypes.Float;
    stdDeviationY?: CodegenTypes.Float;
    edgeMode?: CodegenTypes.WithDefault<FilterEdgeMode, 'none'>;
}
declare const _default: import("react-native").HostComponent<NativeProps>;
export default _default;
//# sourceMappingURL=FeGaussianBlurNativeComponent.d.ts.map