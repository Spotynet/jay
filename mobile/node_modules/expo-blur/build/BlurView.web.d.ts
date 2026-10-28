import { View } from 'react-native';
import type { BlurViewProps } from './BlurView.types';
declare const BlurView: import("react").ForwardRefExoticComponent<{
    blurTarget?: import("react").RefObject<import("react").ComponentRef<typeof View> | null>;
    tint?: import("./BlurView.types").BlurTint;
    intensity?: number;
    blurReductionFactor?: number;
    experimentalBlurMethod?: import("./BlurView.types").ExperimentalBlurMethod;
    blurMethod?: import("./BlurView.types").BlurMethod;
} & import("react-native").ViewProps & import("react").RefAttributes<{
    setNativeProps: (props: BlurViewProps) => void;
}>>;
export default BlurView;
