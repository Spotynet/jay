import { NumberArray } from '../../lib/extract/types';
import FilterPrimitive from './FilterPrimitive';
export interface FeMorphologyProps {
    in?: string;
    operator?: 'erode' | 'dilate';
    radius?: NumberArray;
}
export default class FeMorphology extends FilterPrimitive<FeMorphologyProps> {
    static displayName: string;
    static defaultProps: {
        x?: import("../..").NumberProp;
        y?: import("../..").NumberProp;
        width?: import("../..").NumberProp;
        height?: import("../..").NumberProp;
        result?: string;
    };
    render(): null;
}
//# sourceMappingURL=FeMorphology.d.ts.map