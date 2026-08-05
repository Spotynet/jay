import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { HoveredContext } from './hoverable-context';
export function Hoverable({ children }) {
    return (_jsx(HoveredContext.Provider, { value: useSharedValue(false), children: React.Children.only(children) }));
}
//# sourceMappingURL=hoverable.native.js.map