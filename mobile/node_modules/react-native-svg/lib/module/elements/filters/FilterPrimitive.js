import { Component } from 'react';
export default class FilterPrimitive extends Component {
  root = null;
  static defaultPrimitiveProps = {};
  refMethod = instance => {
    this.root = instance;
  };
  setNativeProps = props => {
    this.root?.setNativeProps(props);
  };
}
//# sourceMappingURL=FilterPrimitive.js.map