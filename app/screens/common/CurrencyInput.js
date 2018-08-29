import React, { Component } from 'react';
import TextInputMask from 'react-native-text-input-mask';

export default class CurrencyInput extends Component {

  state = {
    value: ''
  };

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
}
