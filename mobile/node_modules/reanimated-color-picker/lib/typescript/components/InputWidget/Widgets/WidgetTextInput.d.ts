import React from 'react';
import type { InputProps } from '../../../types';
import type { StyleProp, TextStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
type Props = {
    textValue: SharedValue<string>;
    textKeyboard?: boolean;
    decimal?: boolean;
    title: string;
    inputStyle: StyleProp<TextStyle>;
    textStyle: StyleProp<TextStyle>;
    onEndEditing: (text: string) => void;
    inputProps: InputProps;
};
export default function WidgetTextInput({ textValue, decimal, textKeyboard, title, inputStyle, textStyle, inputProps, onEndEditing, }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=WidgetTextInput.d.ts.map