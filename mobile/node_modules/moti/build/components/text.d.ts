export declare const Text: import("react").ForwardRefExoticComponent<import("react-native").TextProps & {
    animatedProps?: Partial<import("react-native").TextProps> | undefined;
    layout?: import("react-native-reanimated").BaseAnimationBuilder | import("react-native-reanimated").LayoutAnimationFunction | typeof import("react-native-reanimated").BaseAnimationBuilder;
    entering?: import("react-native-reanimated").BaseAnimationBuilder | typeof import("react-native-reanimated").BaseAnimationBuilder | import("react-native-reanimated").EntryExitAnimationFunction | Keyframe;
    exiting?: import("react-native-reanimated").BaseAnimationBuilder | typeof import("react-native-reanimated").BaseAnimationBuilder | import("react-native-reanimated").EntryExitAnimationFunction | Keyframe;
} & import("../core").MotiProps<import("react-native").ViewStyle | import("react-native").ImageStyle | import("react-native").TextStyle, import("../core").StyleValueWithReplacedTransforms<import("react-native").ViewStyle | import("react-native").ImageStyle | import("react-native").TextStyle>, Partial<{
    backfaceVisibility: "visible" | "hidden" | import("../core").SequenceItem<"visible" | "hidden" | undefined>[] | undefined;
    backgroundColor: import("react-native").ColorValue | import("../core").SequenceItem<import("react-native").ColorValue | undefined>[] | undefined;
    borderBottomLeftRadius: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined;
    borderBottomRightRadius: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined;
    borderColor: import("react-native").ColorValue | import("../core").SequenceItem<import("react-native").ColorValue | undefined>[] | undefined;
    borderRadius: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined;
    borderTopLeftRadius: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined;
    borderTopRightRadius: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined;
    opacity: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined;
    cursor: import("react-native").CursorValue | import("../core").SequenceItem<import("react-native").CursorValue | undefined>[] | undefined;
    alignContent: "flex-start" | "flex-end" | "center" | "stretch" | "space-between" | "space-around" | "space-evenly" | import("../core").SequenceItem<"flex-start" | "flex-end" | "center" | "stretch" | "space-between" | "space-around" | "space-evenly" | undefined>[] | undefined;
    alignItems: import("react-native").FlexAlignType | import("../core").SequenceItem<import("react-native").FlexAlignType | undefined>[] | undefined;
    alignSelf: "auto" | import("react-native").FlexAlignType | import("../core").SequenceItem<"auto" | import("react-native").FlexAlignType | undefined>[] | undefined;
    aspectRatio: string | number | import("../core").SequenceItem<string | number | undefined>[] | undefined;
    borderBottomWidth: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    borderEndWidth: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    borderLeftWidth: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    borderRightWidth: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    borderStartWidth: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    borderTopWidth: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    borderWidth: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    bottom: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    display: "flex" | "none" | import("../core").SequenceItem<"flex" | "none" | undefined>[] | undefined;
    end: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    flex: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    flexBasis: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    flexDirection: "row" | "column" | "row-reverse" | "column-reverse" | import("../core").SequenceItem<"row" | "column" | "row-reverse" | "column-reverse" | undefined>[] | undefined;
    rowGap: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    gap: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    columnGap: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    flexGrow: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    flexShrink: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    flexWrap: "wrap" | "nowrap" | "wrap-reverse" | import("../core").SequenceItem<"wrap" | "nowrap" | "wrap-reverse" | undefined>[] | undefined;
    height: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    justifyContent: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | import("../core").SequenceItem<"flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | undefined>[] | undefined;
    left: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    margin: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    marginBottom: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    marginEnd: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    marginHorizontal: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    marginLeft: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    marginRight: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    marginStart: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    marginTop: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    marginVertical: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    maxHeight: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    maxWidth: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    minHeight: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    minWidth: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    overflow: "visible" | "hidden" | "scroll" | import("../core").SequenceItem<"visible" | "hidden" | "scroll" | undefined>[] | undefined;
    padding: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    paddingBottom: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    paddingEnd: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    paddingHorizontal: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    paddingLeft: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    paddingRight: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    paddingStart: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    paddingTop: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    paddingVertical: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    position: "absolute" | "relative" | "static" | import("../core").SequenceItem<"absolute" | "relative" | "static" | undefined>[] | undefined;
    right: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    start: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    top: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    width: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined;
    zIndex: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    direction: "inherit" | "ltr" | "rtl" | import("../core").SequenceItem<"inherit" | "ltr" | "rtl" | undefined>[] | undefined;
    shadowColor: import("react-native").ColorValue | import("../core").SequenceItem<import("react-native").ColorValue | undefined>[] | undefined;
    shadowOffset: Readonly<{
        width: number;
        height: number;
    }> | import("../core").SequenceItem<Readonly<{
        width: number;
        height: number;
    }> | undefined>[] | undefined;
    shadowOpacity: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined;
    shadowRadius: number | import("../core").SequenceItem<number | undefined>[] | undefined;
    transformOrigin: string | (string | number)[] | import("../core").SequenceItem<string | (string | number)[] | undefined>[] | undefined;
    transformMatrix: number[] | import("../core").SequenceItem<number[] | undefined>[] | undefined;
    rotation: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined;
} & {
    scaleX?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | undefined>[] | undefined;
    scaleY?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | undefined>[] | undefined;
    translateX?: (string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | undefined>[] | undefined;
    translateY?: (string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | undefined>[] | undefined;
    perspective?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | undefined>[] | undefined;
    rotate?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | undefined;
    rotateX?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | undefined;
    rotateY?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | undefined;
    rotateZ?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | undefined;
    scale?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | undefined>[] | undefined;
    skewX?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | undefined;
    skewY?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | undefined;
} & import("../core").StyleValueWithSequenceArraysWithTransform>, {
    backfaceVisibility?: "visible" | "hidden" | import("../core").SequenceItem<"visible" | "hidden" | undefined>[] | {
        value: "visible" | "hidden" | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<"visible" | "hidden" | import("../core").SequenceItem<"visible" | "hidden" | undefined>[] | undefined>;
    } | undefined;
    backgroundColor?: import("react-native").ColorValue | import("../core").SequenceItem<import("react-native").ColorValue | undefined>[] | {
        value: string | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").ColorValue | import("../core").SequenceItem<import("react-native").ColorValue | undefined>[] | undefined>;
    } | undefined;
    borderBottomLeftRadius?: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined>;
    } | undefined;
    borderBottomRightRadius?: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined>;
    } | undefined;
    borderColor?: import("react-native").ColorValue | import("../core").SequenceItem<import("react-native").ColorValue | undefined>[] | {
        value: string | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").ColorValue | import("../core").SequenceItem<import("react-native").ColorValue | undefined>[] | undefined>;
    } | undefined;
    borderRadius?: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined>;
    } | undefined;
    borderTopLeftRadius?: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined>;
    } | undefined;
    borderTopRightRadius?: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined>;
    } | undefined;
    opacity?: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined>;
    } | undefined;
    cursor?: import("react-native").CursorValue | import("../core").SequenceItem<import("react-native").CursorValue | undefined>[] | {
        value: import("react-native").CursorValue | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").CursorValue | import("../core").SequenceItem<import("react-native").CursorValue | undefined>[] | undefined>;
    } | undefined;
    alignContent?: "flex-start" | "flex-end" | "center" | "stretch" | "space-between" | "space-around" | "space-evenly" | import("../core").SequenceItem<"flex-start" | "flex-end" | "center" | "stretch" | "space-between" | "space-around" | "space-evenly" | undefined>[] | {
        value: "flex-start" | "flex-end" | "center" | "stretch" | "space-between" | "space-around" | "space-evenly" | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<"flex-start" | "flex-end" | "center" | "stretch" | "space-between" | "space-around" | "space-evenly" | import("../core").SequenceItem<"flex-start" | "flex-end" | "center" | "stretch" | "space-between" | "space-around" | "space-evenly" | undefined>[] | undefined>;
    } | undefined;
    alignItems?: import("react-native").FlexAlignType | import("../core").SequenceItem<import("react-native").FlexAlignType | undefined>[] | {
        value: import("react-native").FlexAlignType | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").FlexAlignType | import("../core").SequenceItem<import("react-native").FlexAlignType | undefined>[] | undefined>;
    } | undefined;
    alignSelf?: "auto" | import("react-native").FlexAlignType | import("../core").SequenceItem<"auto" | import("react-native").FlexAlignType | undefined>[] | {
        value: "auto" | import("react-native").FlexAlignType | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<"auto" | import("react-native").FlexAlignType | import("../core").SequenceItem<"auto" | import("react-native").FlexAlignType | undefined>[] | undefined>;
    } | undefined;
    aspectRatio?: string | number | import("../core").SequenceItem<string | number | undefined>[] | {
        value: string | number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<string | number | import("../core").SequenceItem<string | number | undefined>[] | undefined>;
    } | undefined;
    borderBottomWidth?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    borderEndWidth?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    borderLeftWidth?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    borderRightWidth?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    borderStartWidth?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    borderTopWidth?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    borderWidth?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    bottom?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    display?: "flex" | "none" | import("../core").SequenceItem<"flex" | "none" | undefined>[] | {
        value: "flex" | "none" | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<"flex" | "none" | import("../core").SequenceItem<"flex" | "none" | undefined>[] | undefined>;
    } | undefined;
    end?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    flex?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    flexBasis?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | import("../core").SequenceItem<"row" | "column" | "row-reverse" | "column-reverse" | undefined>[] | {
        value: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<"row" | "column" | "row-reverse" | "column-reverse" | import("../core").SequenceItem<"row" | "column" | "row-reverse" | "column-reverse" | undefined>[] | undefined>;
    } | undefined;
    rowGap?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    gap?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    columnGap?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    flexGrow?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    flexShrink?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | import("../core").SequenceItem<"wrap" | "nowrap" | "wrap-reverse" | undefined>[] | {
        value: "wrap" | "nowrap" | "wrap-reverse" | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<"wrap" | "nowrap" | "wrap-reverse" | import("../core").SequenceItem<"wrap" | "nowrap" | "wrap-reverse" | undefined>[] | undefined>;
    } | undefined;
    height?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | import("../core").SequenceItem<"flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | undefined>[] | {
        value: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<"flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | import("../core").SequenceItem<"flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | undefined>[] | undefined>;
    } | undefined;
    left?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    margin?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    marginBottom?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    marginEnd?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    marginHorizontal?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    marginLeft?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    marginRight?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    marginStart?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    marginTop?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    marginVertical?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    maxHeight?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    maxWidth?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    minHeight?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    minWidth?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    overflow?: "visible" | "hidden" | "scroll" | import("../core").SequenceItem<"visible" | "hidden" | "scroll" | undefined>[] | {
        value: "visible" | "hidden" | "scroll" | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<"visible" | "hidden" | "scroll" | import("../core").SequenceItem<"visible" | "hidden" | "scroll" | undefined>[] | undefined>;
    } | undefined;
    padding?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    paddingBottom?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    paddingEnd?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    paddingHorizontal?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    paddingLeft?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    paddingRight?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    paddingStart?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    paddingTop?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    paddingVertical?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    position?: "absolute" | "relative" | "static" | import("../core").SequenceItem<"absolute" | "relative" | "static" | undefined>[] | {
        value: "absolute" | "relative" | "static" | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<"absolute" | "relative" | "static" | import("../core").SequenceItem<"absolute" | "relative" | "static" | undefined>[] | undefined>;
    } | undefined;
    right?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    start?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    top?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    width?: import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | {
        value: number | "auto" | `${number}%` | null | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").DimensionValue | import("../core").SequenceItem<import("react-native").DimensionValue | undefined>[] | undefined>;
    } | undefined;
    zIndex?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    direction?: "inherit" | "ltr" | "rtl" | import("../core").SequenceItem<"inherit" | "ltr" | "rtl" | undefined>[] | {
        value: "inherit" | "ltr" | "rtl" | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<"inherit" | "ltr" | "rtl" | import("../core").SequenceItem<"inherit" | "ltr" | "rtl" | undefined>[] | undefined>;
    } | undefined;
    shadowColor?: import("react-native").ColorValue | import("../core").SequenceItem<import("react-native").ColorValue | undefined>[] | {
        value: string | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").ColorValue | import("../core").SequenceItem<import("react-native").ColorValue | undefined>[] | undefined>;
    } | undefined;
    shadowOffset?: Readonly<{
        width: number;
        height: number;
    }> | import("../core").SequenceItem<Readonly<{
        width: number;
        height: number;
    }> | undefined>[] | {
        value: undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<Readonly<{
            width: number;
            height: number;
        }> | import("../core").SequenceItem<Readonly<{
            width: number;
            height: number;
        }> | undefined>[] | undefined>;
    } | undefined;
    shadowOpacity?: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined>;
    } | undefined;
    shadowRadius?: number | import("../core").SequenceItem<number | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number | import("../core").SequenceItem<number | undefined>[] | undefined>;
    } | undefined;
    transformOrigin?: string | (string | number)[] | import("../core").SequenceItem<string | (string | number)[] | undefined>[] | {
        value: string | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<string | (string | number)[] | import("../core").SequenceItem<string | (string | number)[] | undefined>[] | undefined>;
    } | undefined;
    transformMatrix?: number[] | import("../core").SequenceItem<number[] | undefined>[] | {
        value: undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<number[] | import("../core").SequenceItem<number[] | undefined>[] | undefined>;
    } | undefined;
    rotation?: import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<import("react-native").AnimatableNumericValue | import("../core").SequenceItem<import("react-native").AnimatableNumericValue | undefined>[] | undefined>;
    } | undefined;
    scaleX?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<(string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | undefined>[] | undefined>;
    } | undefined;
    scaleY?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<(string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | undefined>[] | undefined>;
    } | undefined;
    translateX?: (string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | undefined>[] | {
        value: number | `${number}%` | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<(string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | undefined>[] | undefined>;
    } | undefined;
    translateY?: (string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | undefined>[] | {
        value: number | `${number}%` | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<(string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | undefined>[] | undefined>;
    } | undefined;
    perspective?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<(string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | undefined>[] | undefined>;
    } | undefined;
    rotate?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | {
        value: string | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<(string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | undefined>;
    } | undefined;
    rotateX?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | {
        value: string | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<(string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | undefined>;
    } | undefined;
    rotateY?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | {
        value: string | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<(string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | undefined>;
    } | undefined;
    rotateZ?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | {
        value: string | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<(string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | undefined>;
    } | undefined;
    scale?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | undefined>[] | {
        value: number | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<(string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | undefined>[] | undefined>;
    } | undefined;
    skewX?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | {
        value: string | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<(string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | undefined>;
    } | undefined;
    skewY?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | {
        value: string | undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<(string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue | undefined>[] | undefined>;
    } | undefined;
    transform?: Partial<{} & {
        scaleX?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue>[] | undefined;
        scaleY?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue>[] | undefined;
        translateX?: (string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | `${number}%`>[] | undefined;
        translateY?: (string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | `${number}%`>[] | undefined;
        perspective?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue>[] | undefined;
        rotate?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue>[] | undefined;
        rotateX?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue>[] | undefined;
        rotateY?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue>[] | undefined;
        rotateZ?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue>[] | undefined;
        scale?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue>[] | undefined;
        skewX?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue>[] | undefined;
        skewY?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue>[] | undefined;
    } & import("../core").StyleValueWithSequenceArraysWithTransform>[] | {
        value: undefined;
        onDidAnimate: import("../core").InlineOnDidAnimate<Partial<{} & {
            scaleX?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue>[] | undefined;
            scaleY?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue>[] | undefined;
            translateX?: (string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | `${number}%`>[] | undefined;
            translateY?: (string & {}) | import("react-native").AnimatableNumericValue | `${number}%` | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue | `${number}%`>[] | undefined;
            perspective?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue>[] | undefined;
            rotate?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue>[] | undefined;
            rotateX?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue>[] | undefined;
            rotateY?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue>[] | undefined;
            rotateZ?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue>[] | undefined;
            scale?: (string & {}) | import("react-native").AnimatableNumericValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableNumericValue>[] | undefined;
            skewX?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue>[] | undefined;
            skewY?: (string & {}) | import("react-native").AnimatableStringValue | import("../core").SequenceItem<(string & {}) | import("react-native").AnimatableStringValue>[] | undefined;
        } & import("../core").StyleValueWithSequenceArraysWithTransform>[] | undefined>;
    } | undefined;
}> & {
    children?: React.ReactNode;
} & import("react").RefAttributes<unknown>>;
//# sourceMappingURL=text.d.ts.map