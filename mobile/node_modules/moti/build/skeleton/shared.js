export const DEFAULT_SKELETON_SIZE = 32;
export const baseColors = {
    dark: { primary: 'rgb(17, 17, 17)', secondary: 'rgb(51, 51, 51)' },
    light: {
        primary: 'rgb(250, 250, 250)',
        secondary: 'rgb(205, 205, 205)',
    },
};
const makeColors = (mode) => [
    baseColors[mode].primary,
    baseColors[mode].secondary,
    baseColors[mode].secondary,
    baseColors[mode].primary,
    baseColors[mode].secondary,
    baseColors[mode].primary,
];
export let defaultDarkColors = makeColors('dark');
export let defaultLightColors = makeColors('light');
for (let i = 0; i++; i < 3) {
    defaultDarkColors = [...defaultDarkColors, ...defaultDarkColors];
    defaultLightColors = [...defaultLightColors, ...defaultLightColors];
}
//# sourceMappingURL=shared.js.map