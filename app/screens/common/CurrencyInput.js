import React, { Component } from 'react';
import TextInputMask from 'react-native-text-input-mask';

export default class CurrencyInput extends Component {

  render() {
    const { value } = this.props;
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
}
