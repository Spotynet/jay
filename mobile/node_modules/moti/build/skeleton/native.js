import { jsx as _jsx } from "react/jsx-runtime";
import LinearGradient from 'react-native-linear-gradient';
import SkeletonNative from './skeleton-new';
export function Skeleton(props) {
    return _jsx(SkeletonNative, { ...props, Gradient: LinearGradient });
}
Skeleton.Group = SkeletonNative.Group;
//# sourceMappingURL=native.js.map