import type { CodegenTypes } from 'react-native';
import { NumberProp } from '../lib/extract/types';
import type { UnsafeMixed } from './codegenUtils';
import type { ViewProps } from './utils';
type Units = 'userSpaceOnUse' | 'objectBoundingBox';
interface NativeProps extends ViewProps {
    name?: string;
    x?: UnsafeMixed<NumberProp>;
    y?: UnsafeMixed<NumberProp>;
    height?: UnsafeMixed<NumberProp>;
    width?: UnsafeMixed<NumberProp>;
    filterUnits?: CodegenTypes.WithDefault<Units, 'objectBoundingBox'>;
    primitiveUnits?: CodegenTypes.WithDefault<Units, 'userSpaceOnUse'>;
}
declare const _default: import("react-native").HostComponent<NativeProps>;
export default _default;
//# sourceMappingURL=FilterNativeComponent.d.ts.map