import type { CodegenTypes, HostComponent, ViewProps } from 'react-native';
export interface RootViewNativeProps extends ViewProps {
    unstable_forceActive?: boolean;
}
interface NativeProps extends ViewProps {
    moduleId?: CodegenTypes.WithDefault<CodegenTypes.Int32, -1>;
    unstable_forceActive?: boolean;
}
declare const _default: HostComponent<NativeProps>;
export default _default;
//# sourceMappingURL=RNGestureHandlerRootViewNativeComponent.d.ts.map