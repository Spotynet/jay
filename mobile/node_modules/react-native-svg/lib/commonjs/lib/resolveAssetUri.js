"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveAssetUri = resolveAssetUri;
var _reactNative = require("react-native");
// On native, React Native resolves assets itself. The web implementation
// lives in resolveAssetUri.web.ts, so native bundles do not depend on
// @react-native/assets-registry, which react-native no longer ships (0.87+).
function resolveAssetUri(source) {
  return _reactNative.Image.resolveAssetSource(source);
}
//# sourceMappingURL=resolveAssetUri.js.map