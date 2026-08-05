import { jsx as _jsx } from "react/jsx-runtime";
import { LinearGradient } from 'expo-linear-gradient';
import SkeletonNative from './skeleton-new';
export default function SkeletonExpo(props) {
    return _jsx(SkeletonNative, { ...props, Gradient: LinearGradient });
}
SkeletonExpo.Group = SkeletonNative.Group;
//# sourceMappingURL=expo.js.map