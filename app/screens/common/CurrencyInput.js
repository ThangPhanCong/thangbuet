import React, { Component } from 'react';
import { TextInput } from 'react-native';
import TextInputMask from '../../libs/react-native-text-input-mask/TextInputMask';
import Numeral from '../../libs/numeral';
import { trimCurrency } from '../../utils/Filters';

export default class CurrencyInput extends Component {

  state = {
    value: ''
  };

  // componentWillReceiveProps(nextProps) {
  //   if (this.props.value !== nextProps.value) {
  //     this._formatValue(trimCurrency(nextProps.value));
  //   }
  // }

  // _formatValue(value) {
  //   if (value == this.state.value) {
  //     return;
  //   }

  //   let formatedValue = '';

  //   if (value) {
  //     let dotIndex = value.indexOf('.');
  //     if (dotIndex >= 0 && this.props.precision) {
  //       const naturalPart = value.substring(0, dotIndex);
  //       const decimalPart = value.substring(dotIndex + 1);

  //       formatedValue = this._formatNaturalPart(naturalPart);
  //       formatedValue += '.';
  //       if (decimalPart) {
  //         formatedValue += this._formatDecimalPart(decimalPart);
  //       }
  //     } else {
  //       formatedValue = this._formatNaturalPart(value);
  //     }
  //   } else {
  //     formatedValue = value;
  //   }

  //   this.setState({ value: formatedValue });
  //   if (formatedValue != this.state.value) {
  //     this._callTextChangeEvent(formatedValue);
  //   }
  // }

  // _formatNaturalPart(value) {
  //   let format = '0,0';
  //   return value ? Numeral(value).format(format) : value;
  // }

  // _formatDecimalPart(value) {
  //   const format = '0.[' + Array(this.props.precision + 1).join('0') + ']';
  //   const result = Numeral('0.' + value).format(format);
  //   if (result.indexOf('.') >= 0) {
  //     return result.split('.')[1];
  //   } else {
  //     return '';
  //   }
  // }

  // render() {
  //   const { value } = this.state;
  //   const parseValue = value ? value.toString() : value;

  //   const props = {
  //     ...this.props,
  //     value: parseValue
  //   }

  //   return (<TextInput
  //     { ...props }
  //     ref={ref => {
  //       this.input = ref
  //       if (typeof this.props.refInput === 'function') {
  //         this.props.refInput(ref);
  //       }
  //     }}
  //     onChangeText={masked => {
  //       this._callTextChangeEvent(masked);
  //     }}
  //   />);
  // }

  render() {
    const { value } = this.state;
    const parseValue = value ? value.toString() : value;

    const props = {
      ...this.props,
      value: parseValue
    }

    return (
      <TextInputMask
        mask='currency'
        { ...props }
        />
    )
  }

  // _callTextChangeEvent(masked) {
  //   let unmasked = undefined;
  //   if (masked) {
  //     unmasked = masked.replace(/,/g, '');
  //   }
  //   this.props.onChangeText && this.props.onChangeText(masked, unmasked);
  // }
}
