import { Image } from 'react-native';

// On native, React Native resolves assets itself. The web implementation
// lives in resolveAssetUri.web.ts, so native bundles do not depend on
// @react-native/assets-registry, which react-native no longer ships (0.87+).
export function resolveAssetUri(source) {
  return Image.resolveAssetSource(source);
}
//# sourceMappingURL=resolveAssetUri.js.map