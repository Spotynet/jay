function _extends() {
  return (
    (_extends = Object.assign
      ? Object.assign.bind()
      : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }),
    _extends.apply(null, arguments)
  );
}
import React, { useEffect } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedRef, useDerivedValue } from 'react-native-reanimated';
import { styles } from '../../../styles';
import { isWeb } from '../../../utils';
Animated.addWhitelistedNativeProps({
  text: true,
});
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
export default function WidgetTextInput({
  textValue,
  decimal = false,
  textKeyboard = false,
  title,
  inputStyle,
  textStyle,
  inputProps,
  onEndEditing,
}) {
  const inputRef = useAnimatedRef();
  const animatedProps = useAnimatedProps(
    () => ({
      text: textValue.value,
    }),
    [textValue],
  );
  const submit = e => {
    const text = e.nativeEvent.text;

    // number input mode
    if (decimal || !textKeyboard) {
      const num = parseFloat(text);
      if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
        textValue.value = ''; // reset input
        return;
      }
    }
    onEndEditing(text);
  };
  useEffect(() => {
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      if (!inputRef.current) return;
      inputRef.current.blur();
    });
    return () => hideSubscription.remove();
  }, []);

  // For web platform only
  useDerivedValue(() => {
    if (!isWeb || !inputRef.current) return;

    // @ts-expect-error value doesn't exist
    inputRef.current.value = textValue.value;
  }, [textValue]);
  return /*#__PURE__*/ React.createElement(
    View,
    {
      style: styles.inputsContainer,
    },
    /*#__PURE__*/ React.createElement(
      AnimatedTextInput,
      _extends(
        {
          ref: inputRef,
          style: [styles.input, inputStyle],
          defaultValue: textValue.value,
          maxLength: decimal ? 4 : textKeyboard ? 9 : 3, // length example: Alpha (1.55), RGB (255), Hue (360), Brightness (100), hex (#00000000)
          onEndEditing: submit,
          onBlur: isWeb ? submit : undefined,
          enterKeyHint: 'enter',
          returnKeyType: 'done',
          keyboardType: decimal ? 'decimal-pad' : textKeyboard ? 'default' : 'number-pad',
          inputMode: decimal ? 'decimal' : textKeyboard ? 'text' : 'numeric',
          autoComplete: 'off',
          autoCorrect: false,
          autoFocus: false,
        },
        inputProps,
        {
          selectTextOnFocus: !textKeyboard,
          animatedProps: animatedProps,
        },
      ),
    ),
    /*#__PURE__*/ React.createElement(
      Text,
      {
        style: [styles.inputTitle, textStyle],
      },
      title,
    ),
  );
}
