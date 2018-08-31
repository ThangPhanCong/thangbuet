import React, { Component } from 'react';
import TextInputMask from 'react-native-text-input-mask';

export default class CurrencyInput extends Component {

  state = {
    value: '',
    precision: 0
  };

  componentDidMount() {
    this.setState({
      value: this.props.value || '',
      precision: this.props.precision
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.value !== nextProps.value) {
      this.setState({value: nextProps.value});
    }
    if (this.state.precision !== nextProps.precision) {
      this.setState({precision: nextProps.precision});
    }
  }

  render() {
    const { value, precision } = this.state;
    const parseValue = value ? value.toString() : value;

    const props = {
      ...this.props,
      value: parseValue,
      precision: precision
    }

    return (
      <TextInputMask
        mask='[000]'
        { ...props }
        />
    )
  }
}
