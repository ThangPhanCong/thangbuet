import React from 'react';
import {
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Image,
  StyleSheet
} from 'react-native';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { scale } from '../../libs/reactSizeMatter/scalingUtils';
import { CommonColors, CommonSize, CommonStyles } from '../../utils/CommonStyles';

export default class DropdownMenu extends React.Component {

  state = {
    isVisible: false,
    sourcePosition: undefined,
    containerPosition: undefined,
    options: {}
  };

  componentDidMount () {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {
    this.setState({ isVisible: false });
  }

  _keyboardDidHide() {
    this.setState({ isVisible: false });
  }

  show(items, options) {
    items = items.map((item, index) => { return {label: item, key: index + ''} });
    options.sourceView.measure((x, y, width, height, px, py) => {
      this.setState({
        sourcePosition: { x, y, width, height, px, py },
        isVisible: true,
        items: items,
        options: options
      });
    });
  }

  render() {
    const { isVisible, items, options, sourcePosition, containerPosition } = this.state;

    let dropdownStyle = undefined;
    if (isVisible && sourcePosition && containerPosition) {
      let sourceLeft = sourcePosition.px;
      let sourceBottom = sourcePosition.py + sourcePosition.height;
      let width = sourcePosition.width;
      let top = sourceBottom - containerPosition.py;
      height = containerPosition.height - top;

      dropdownStyle = {
        position: 'absolute',
        left: sourceLeft - containerPosition.px,
        top: top,
        width: width,
        height: height
      };
    }

    let separatorStyle = this._getStyleProps(this.props.separatorStyle) || {};
    let dropdownPropsStyle = options.dropdownStyle || this._getStyleProps(this.props.dropdownStyle) || {};
    return (
      <View style={isVisible ? styles.container : {}}
        ref={ref => this._container = ref}
        onLayout={this._onLayoutContainer.bind(this)}>
        <TouchableWithoutFeedback onPress={() => this.setState({ isVisible: false })}>
          <View style={CommonStyles.matchParent}>
            {dropdownStyle && <FlatList
              style={[dropdownStyle, dropdownPropsStyle]}
              keyboardShouldPersistTaps='always'
              data={items}
              ItemSeparatorComponent={() => (<View style={separatorStyle}/>)}
              renderItem={this._renderItem.bind(this)}/>}
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  _onLayoutContainer(event) {
    this._container.measure((x, y, width, height, px, py) => {
      this.setState({
        containerPosition: { x, y, width, height, px, py }
      });
    });
  }

  _renderItem({item, index}) {
    const options = this.state.options;
    let itemButtonStyle = options.itemButtonStyle || this._getStyleProps(this.props.itemButtonStyle) || {};
    let itemTextStyle = options.itemTextStyle || this._getStyleProps(this.props.itemTextStyle) || {};
    return (
      <TouchableWithoutFeedback onPress={() => {this._onSelectItem(index)}}>
        <View style={itemButtonStyle}>
          <Text style={itemTextStyle}>{item.label}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  _getStyleProps(style) {
    if (style) {
      return StyleSheet.flatten(style);
    }
  }

  _onSelectItem(index) {
    const onSelectItem = this.state.options.onSelectItem || this.props.onSelectItem;
    onSelectItem && onSelectItem(index);
    this.setState({ isVisible: false });
  }
}

const styles = ScaledSheet.create({
  container: {
    position:'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  }
});
