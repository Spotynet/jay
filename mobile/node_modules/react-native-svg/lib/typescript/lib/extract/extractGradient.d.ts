import type { ReactElement } from 'react';
import * as React from 'react';
import type { TransformProps } from './types';
import type { StopProps } from '../../elements/Stop';
type StopValues = Pick<StopProps, 'offset' | 'stopColor' | 'stopOpacity'>;
export default function extractGradient(props: {
    id?: string;
    children?: ReactElement[];
    transform?: TransformProps['transform'];
    gradientTransform?: TransformProps['transform'];
    gradientUnits?: 'objectBoundingBox' | 'userSpaceOnUse';
} & TransformProps, parent: unknown): {
    name: string;
    gradient: number[];
    children: ReactElement<StopValues & {
        style?: StopValues;
        parent?: unknown;
    }, string | React.JSXElementConstructor<any>>[];
    gradientUnits: number;
    gradientTransform: import("./types").ColumnMajorTransformMatrix | null;
} | null;
export {};
//# sourceMappingURL=extractGradient.d.ts.map