import type { SupportedColorFormats, ColorFormats, rgbaT, hslaT, hsvaT, hwbaT, ColorTypes, ConversionMethods } from './types';
export declare const colorKitUI: () => {
    HEX: (color: SupportedColorFormats) => string;
    RGB: (color: SupportedColorFormats) => ColorTypes<rgbaT>;
    HSL: (color: SupportedColorFormats) => ColorTypes<hslaT>;
    HWB: (color: SupportedColorFormats) => ColorTypes<hwbaT>;
    HSV: (color: SupportedColorFormats) => ColorTypes<hsvaT>;
    getFormat: (color: SupportedColorFormats) => ColorFormats | 'named' | null;
    getRed: (color: SupportedColorFormats) => number;
    getGreen: (color: SupportedColorFormats) => number;
    getBlue: (color: SupportedColorFormats) => number;
    getHue: (color: SupportedColorFormats) => number;
    getSaturation: (color: SupportedColorFormats) => number;
    getBrightness: (color: SupportedColorFormats) => number;
    getLuminance: (color: SupportedColorFormats) => number;
    getLuminanceWCAG: (color: SupportedColorFormats) => number;
    isDark: (color: SupportedColorFormats) => boolean;
    isLight: (color: SupportedColorFormats) => boolean;
    areColorsEqual: (color1: SupportedColorFormats, color2: SupportedColorFormats, tolerance?: number) => boolean;
    contrastRatio: (color1: SupportedColorFormats, color2: SupportedColorFormats) => number;
    setRed: (color: SupportedColorFormats, amount: number) => ConversionMethods;
    increaseRed: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    decreaseRed: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    setGreen: (color: SupportedColorFormats, amount: number) => ConversionMethods;
    increaseGreen: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    decreaseGreen: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    setBlue: (color: SupportedColorFormats, amount: number) => ConversionMethods;
    increaseBlue: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    decreaseBlue: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    getAlpha: (color: SupportedColorFormats) => number;
    setAlpha: (color: SupportedColorFormats, amount: number) => ConversionMethods;
    increaseAlpha: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    decreaseAlpha: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    setHue: (color: SupportedColorFormats, amount: number) => ConversionMethods;
    increaseHue: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    decreaseHue: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    spin: (color: SupportedColorFormats, degree: number | string) => ConversionMethods;
    setSaturation: (color: SupportedColorFormats, amount: number) => ConversionMethods;
    saturate: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    desaturate: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    setLuminance: (color: SupportedColorFormats, amount: number) => ConversionMethods;
    brighten: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    darken: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    setBrightness: (color: SupportedColorFormats, amount: number) => ConversionMethods;
    increaseBrightness: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    decreaseBrightness: (color: SupportedColorFormats, amount: number | string) => ConversionMethods;
    blend: (color1: SupportedColorFormats, color2: SupportedColorFormats, percentage: number) => ConversionMethods;
    invert: (color: SupportedColorFormats) => ConversionMethods;
    grayscale: (color: SupportedColorFormats) => ConversionMethods;
    randomHslColor: ({ h, s, l, a }?: {
        h?: number[] | undefined;
        s?: number[] | undefined;
        l?: number[] | undefined;
        a?: number[] | undefined;
    }) => ConversionMethods;
    randomHsvColor: ({ h, s, v, a }?: {
        h?: number[] | undefined;
        s?: number[] | undefined;
        v?: number[] | undefined;
        a?: number[] | undefined;
    }) => ConversionMethods;
    randomRgbColor: ({ r, g, b, a }?: {
        r?: number[] | undefined;
        g?: number[] | undefined;
        b?: number[] | undefined;
        a?: number[] | undefined;
    }) => ConversionMethods;
    randomHwbColor: ({ h, w, b, a }?: {
        h?: number[] | undefined;
        w?: number[] | undefined;
        b?: number[] | undefined;
        a?: number[] | undefined;
    }) => ConversionMethods;
    adjustContrast: (color1: SupportedColorFormats, color2: SupportedColorFormats, ratio?: number) => ConversionMethods;
};
type ColorKit = ReturnType<typeof colorKitUI> & {
    /** - Initiates the asynchronous execution of a workletized colorKit function on the UI thread. */
    runOnUI: typeof colorKitUI;
};
declare const colorKit: ColorKit;
export default colorKit;
//# sourceMappingURL=index.d.ts.map