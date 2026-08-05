'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = void 0;
var _Circle = _interopRequireDefault(require('./Circle'));
var _DoubleTriangle = _interopRequireDefault(require('./DoubleTriangle'));
var _Hollow = _interopRequireDefault(require('./Hollow'));
var _Line = _interopRequireDefault(require('./Line'));
var _Pill = _interopRequireDefault(require('./Pill'));
var _Plus = _interopRequireDefault(require('./Plus'));
var _Rect = _interopRequireDefault(require('./Rect'));
var _Ring = _interopRequireDefault(require('./Ring'));
var _Solid = _interopRequireDefault(require('./Solid'));
var _TriangleDown = _interopRequireDefault(require('./TriangleDown'));
var _TriangleUp = _interopRequireDefault(require('./TriangleUp'));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const BuiltinThumbs = {
  Ring: _Ring.default,
  Solid: _Solid.default,
  Hollow: _Hollow.default,
  Line: _Line.default,
  Pill: _Pill.default,
  Plus: _Plus.default,
  TriangleUp: _TriangleUp.default,
  TriangleDown: _TriangleDown.default,
  DoubleTriangle: _DoubleTriangle.default,
  Rect: _Rect.default,
  Circle: _Circle.default,
};
var _default = (exports.default = BuiltinThumbs);
