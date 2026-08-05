'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
var _exportNames = {
  colorKit: true,
  useColorPickerContext: true,
  Panel1: true,
  Panel2: true,
  Panel3: true,
  Panel4: true,
  Panel5: true,
  HueSlider: true,
  HueCircular: true,
  SaturationSlider: true,
  BrightnessSlider: true,
  LuminanceSlider: true,
  LuminanceCircular: true,
  HSLSaturationSlider: true,
  OpacitySlider: true,
  RedSlider: true,
  GreenSlider: true,
  BlueSlider: true,
  Preview: true,
  PreviewText: true,
  InputWidget: true,
  Swatches: true,
  ExtraThumb: true,
};
Object.defineProperty(exports, 'BlueSlider', {
  enumerable: true,
  get: function () {
    return _BlueSlider.BlueSlider;
  },
});
Object.defineProperty(exports, 'BrightnessSlider', {
  enumerable: true,
  get: function () {
    return _BrightnessSlider.BrightnessSlider;
  },
});
Object.defineProperty(exports, 'ExtraThumb', {
  enumerable: true,
  get: function () {
    return _ExtraThumb.ExtraThumb;
  },
});
Object.defineProperty(exports, 'GreenSlider', {
  enumerable: true,
  get: function () {
    return _GreenSlider.GreenSlider;
  },
});
Object.defineProperty(exports, 'HSLSaturationSlider', {
  enumerable: true,
  get: function () {
    return _HSLSaturationSlider.HSLSaturationSlider;
  },
});
Object.defineProperty(exports, 'HueCircular', {
  enumerable: true,
  get: function () {
    return _HueCircular.HueCircular;
  },
});
Object.defineProperty(exports, 'HueSlider', {
  enumerable: true,
  get: function () {
    return _HueSlider.HueSlider;
  },
});
Object.defineProperty(exports, 'InputWidget', {
  enumerable: true,
  get: function () {
    return _InputWidget.InputWidget;
  },
});
Object.defineProperty(exports, 'LuminanceCircular', {
  enumerable: true,
  get: function () {
    return _LuminanceCircular.LuminanceCircular;
  },
});
Object.defineProperty(exports, 'LuminanceSlider', {
  enumerable: true,
  get: function () {
    return _LuminanceSlider.LuminanceSlider;
  },
});
Object.defineProperty(exports, 'OpacitySlider', {
  enumerable: true,
  get: function () {
    return _OpacitySlider.OpacitySlider;
  },
});
Object.defineProperty(exports, 'Panel1', {
  enumerable: true,
  get: function () {
    return _Panel.Panel1;
  },
});
Object.defineProperty(exports, 'Panel2', {
  enumerable: true,
  get: function () {
    return _Panel2.Panel2;
  },
});
Object.defineProperty(exports, 'Panel3', {
  enumerable: true,
  get: function () {
    return _Panel3.Panel3;
  },
});
Object.defineProperty(exports, 'Panel4', {
  enumerable: true,
  get: function () {
    return _Panel4.Panel4;
  },
});
Object.defineProperty(exports, 'Panel5', {
  enumerable: true,
  get: function () {
    return _Panel5.Panel5;
  },
});
Object.defineProperty(exports, 'Preview', {
  enumerable: true,
  get: function () {
    return _Preview.Preview;
  },
});
Object.defineProperty(exports, 'PreviewText', {
  enumerable: true,
  get: function () {
    return _PreviewText.PreviewText;
  },
});
Object.defineProperty(exports, 'RedSlider', {
  enumerable: true,
  get: function () {
    return _RedSlider.RedSlider;
  },
});
Object.defineProperty(exports, 'SaturationSlider', {
  enumerable: true,
  get: function () {
    return _SaturationSlider.SaturationSlider;
  },
});
Object.defineProperty(exports, 'Swatches', {
  enumerable: true,
  get: function () {
    return _Swatches.Swatches;
  },
});
Object.defineProperty(exports, 'colorKit', {
  enumerable: true,
  get: function () {
    return _index.default;
  },
});
exports.default = void 0;
Object.defineProperty(exports, 'useColorPickerContext', {
  enumerable: true,
  get: function () {
    return _AppContext.default;
  },
});
var _ColorPicker = _interopRequireDefault(require('./ColorPicker'));
var _index = _interopRequireDefault(require('./colorKit/index'));
var _AppContext = _interopRequireDefault(require('./AppContext'));
var _Panel = require('./components/Panels/Panel1');
var _Panel2 = require('./components/Panels/Panel2');
var _Panel3 = require('./components/Panels/Panel3/Panel3');
var _Panel4 = require('./components/Panels/Panel4');
var _Panel5 = require('./components/Panels/Panel5');
var _HueSlider = require('./components/Sliders/Hue/HueSlider');
var _HueCircular = require('./components/Sliders/Hue/HueCircular');
var _SaturationSlider = require('./components/Sliders/HSB/SaturationSlider');
var _BrightnessSlider = require('./components/Sliders/HSB/BrightnessSlider');
var _LuminanceSlider = require('./components/Sliders/HSL/LuminanceSlider');
var _LuminanceCircular = require('./components/Sliders/HSL/LuminanceCircular');
var _HSLSaturationSlider = require('./components/Sliders/HSL/HSLSaturationSlider');
var _OpacitySlider = require('./components/Sliders/OpacitySlider');
var _RedSlider = require('./components/Sliders/RGB/RedSlider');
var _GreenSlider = require('./components/Sliders/RGB/GreenSlider');
var _BlueSlider = require('./components/Sliders/RGB/BlueSlider');
var _Preview = require('./components/Preview');
var _PreviewText = require('./components/PreviewText');
var _InputWidget = require('./components/InputWidget/InputWidget');
var _Swatches = require('./components/Swatches');
var _ExtraThumb = require('./components/Panels/Panel3/ExtraThumb');
var _types = require('./types');
Object.keys(_types).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    },
  });
});
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
var _default = (exports.default = _ColorPicker.default);
