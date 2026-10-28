"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.idPattern = exports.getRandomNumber = void 0;
exports.pickNotNil = pickNotNil;
exports.warnUnimplementedFilter = void 0;
function pickNotNil(object) {
  const result = {};
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const value = object[key];
      if (value !== undefined && value !== null) {
        result[key] = value;
      }
    }
  }
  return result;
}
const idPattern = exports.idPattern = /#([^)]+)'?\)?$/;
const getRandomNumber = () => Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
exports.getRandomNumber = getRandomNumber;
const DEV = process.env.NODE_ENV !== 'production';
const warnings = new Set();
function warnOnce(condition, ...rest) {
  if (DEV && condition) {
    const key = rest.join(' ');
    if (warnings.has(key)) {
      return;
    }
    warnings.add(key);
    console.warn(...rest);
  }
}
const warnUnimplementedFilter = () => {
  warnOnce(true, `Some of the used filters are not yet supported on native platforms. Please check the USAGE.md for more info. Not implemented filters:\n`, JSON.stringify(['FeComponentTransfer', 'FeConvolveMatrix', 'FeDiffuseLighting', 'FeDisplacementMap', 'FeFuncA', 'FeFuncB', 'FeFuncG', 'FeFuncR', 'FeImage', 'FeMorphology', 'FePointLight', 'FeSpecularLighting', 'FeSpotLight', 'FeTile', 'FeTurbulence'], null, 2));
};
exports.warnUnimplementedFilter = warnUnimplementedFilter;
//# sourceMappingURL=util.js.map