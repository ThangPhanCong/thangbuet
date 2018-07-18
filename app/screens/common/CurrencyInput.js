import React, { Component } from 'react'
import TextInputMask from '../../libs/react-native-text-input-mask/TextInputMask';

export default class CurrencyInput extends Component {

  state = {
    mask: '[999999999999999]'
  };

  componentDidMount() {
    this._updateMask(this.props.precision);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.precision !== nextProps.precision) {
      this._updateMask(nextProps.precision);
    }
  }

  _updateMask(precision) {
    let mask = '[999999999999999]';
    if (precision > 0) {
      mask += '.[' + Array(precision).join('9') + ']';
    }
    this.setState({ mask });
  }

  render() {
    return (<TextInputMask
      {...this.props}
      mask={this.state.mask}
      refInput={ref => {
        this.input = ref
        if (typeof this.props.refInput === 'function') {
          this.props.refInput(ref);
        }
      }}
      onChangeText={(masked, unmasked) => {
        this.props.onChangeText && this.props.onChangeText(masked, unmasked)
      }}
    />);
  }
}
