import React, { Component } from 'react';
import {
  TouchableHighlight,
  Text
} from 'react-native';

export default class TouchableTextHighlight extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isUnderlay: false
    }
  }

  render() {
    let {
      activeOpacity,
      onPressIn,
      onPressOut,
      style,
      underlayColor,
      delayLongPress,
      delayPressIn,
      delayPressOut,
      disabled,
      hitSlop,
      onLayout,
      onLongPress,
      onPress,
      pressRetentionOffset,
      testID,
      accessible,
      accessibilityLabel,
      accessibilityComponentType,
      accessibilityLiveRegion,
      importantForAccessibility,
      accessibilityElementsHidden,
      accessibilityTraits,
      onAcccessibilityTap,
      onMagicTap
    } = this.props;

    let { textStyle, underlayTextColor, normalTextColor } = this.props;

    return (
      <TouchableHighlight
        activeOpacity={activeOpacity}
        onHideUnderlay={this._onHideUnderlay.bind(this)}
        onShowUnderlay={this._onShowUnderlay.bind(this)}
        style={style}
        underlayColor={underlayColor}
        delayLongPress={delayLongPress}
        delayPressIn={delayPressIn}
        delayPressOut={delayPressOut}
        disabled={disabled}
        hitSlop={hitSlop}
        onLayout={onLayout}
        onLongPress={onLongPress}
        onPress={onPress}
        pressRetentionOffset={pressRetentionOffset}
        testID={testID}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityComponentType={accessibilityComponentType}
        accessibilityLiveRegion={accessibilityLiveRegion}
        importantForAccessibility={importantForAccessibility}
        accessibilityElementsHidden={accessibilityElementsHidden}
        accessibilityTraits={accessibilityTraits}
        onAcccessibilityTap={onAcccessibilityTap}
        onMagicTap={onMagicTap}
        onPressIn={onPressIn}
        onPressOut={onPressOut}>
        <Text style={[textStyle, this.state.isUnderlay ? { color: underlayTextColor } : { color: normalTextColor } ]}>
          {this.props.text}
        </Text>
      </TouchableHighlight>
    )
  }

  _onShowUnderlay() {
    this.setState({
      isUnderlay: true
    })

    let { onShowUnderlay } = this.props;
    if (onShowUnderlay) {
      onShowUnderlay();
    }
  }

  _onHideUnderlay() {
    this.setState({
      isUnderlay: false
    })

    let { onHideUnderlay } = this.props;
    if (onHideUnderlay) {
      onHideUnderlay();
    }
  }
}