import React from 'react';
import { PixelRatio, StyleSheet, Text, TouchableWithoutFeedback, View, WebView } from 'react-native';
import { Popover, PopoverController } from 'react-native-modal-popover';
import Orientation from 'react-native-orientation';
import Icon from 'react-native-vector-icons/FontAwesome';
import I18n from '../../i18n/i18n';
import BaseScreen from '../BaseScreen';
import AppConfig from '../../utils/AppConfig';
import Consts from '../../utils/Consts';
import Utils from '../../utils/Utils';
import ChartUtil from './ChartUtil';
import { CommonColors, CommonSize, CommonStyles } from '../../utils/CommonStyles';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';

export default class TradingChartScreen extends BaseScreen {

  constructor(props) {
    super(props);
    this.state = {
      isChartTimeSelected: true,
      isChartLoaded: false,
      resolution: 60
    };
  }

  componentDidUpdate() {
    let { coin, currency } = this.props.screenProps
    if (coin != this.state.coin || currency != this.state.currency) {
      this.setState({ coin, currency })
      this.reloadData()
    }
    return
  }

  reloadData() {
    this.setState({ isChartLoaded: false });
    this._webView.reload();
  }

  _onLoadChartEnd() {
    this.setState({ isChartLoaded: true });
  }

  _getChartUrl() {
    let params = `coin=${this.props.screenProps.coin}&currency=${this.props.screenProps.currency}`;
    if (this.state.isChartTimeSelected) { // show candlestick chart
      return `${AppConfig.getAssetServer()}/webview/chart/candle?${params}`;
    } else { // show depth chart
      return `${AppConfig.getAssetServer()}/webview/chart/depth?${params}`;
    }
  }

  _renderChart() {
    return (
      <View style={styles.chart}>
        <WebView
          ref={ref => this._webView = ref}
          source={{ uri: this._getChartUrl() }}
          style={[styles.webView, { opacity: this.state.isChartLoaded ? 1 : 0 }]}
          onLoadEnd={this._onLoadChartEnd.bind(this)} />
      </View>
    );
  }

  render() {
    return (
      <View style={styles.screen}>
        {this._renderChart()}
      </View>
    )
  }
}

const chartButtonMargin = PixelRatio.getPixelSizeForLayoutSize(5);

const styles = ScaledSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#12151B'
  },

  chartToolbar: {
    flexDirection: 'row',
    backgroundColor: '#191E26',
    height: PixelRatio.getPixelSizeForLayoutSize(20),
  },
  buttonGroup: {
    flex: 1,
    flexDirection: 'row',
  },
  chartTimeGroup: {
    width: PixelRatio.getPixelSizeForLayoutSize(35),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: chartButtonMargin,
    marginRight: chartButtonMargin,
    borderBottomWidth: PixelRatio.getPixelSizeForLayoutSize(1),
    borderBottomColor: '#0000',
    borderTopWidth: PixelRatio.getPixelSizeForLayoutSize(1),
    borderTopColor: '#0000',
  },
  charTimeButton: {
    color: CommonColors.mainText,
    marginRight: PixelRatio.getPixelSizeForLayoutSize(2),
  },
  depthGroup: {
    width: PixelRatio.getPixelSizeForLayoutSize(35),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: chartButtonMargin,
    marginRight: chartButtonMargin,
    borderBottomWidth: PixelRatio.getPixelSizeForLayoutSize(1),
    borderBottomColor: '#0000',
    borderTopWidth: PixelRatio.getPixelSizeForLayoutSize(1),
    borderTopColor: '#0000',
  },
  depthButton: {
    color: CommonColors.mainText,
    textAlign: 'center',
  },
  chartButtonSelectedStyle: {
    borderBottomColor: CommonColors.highlightText,
  },
  fullGroupContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  fullGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: PixelRatio.getPixelSizeForLayoutSize(1),
    borderWidth: 1,
    borderColor: '#000',
    paddingLeft: PixelRatio.getPixelSizeForLayoutSize(5),
    paddingRight: PixelRatio.getPixelSizeForLayoutSize(5),
    paddingTop: PixelRatio.getPixelSizeForLayoutSize(2),
    paddingBottom: PixelRatio.getPixelSizeForLayoutSize(2),
    marginRight: PixelRatio.getPixelSizeForLayoutSize(2)
  },
  fullText: {
    color: CommonColors.mainText,
    marginRight: PixelRatio.getPixelSizeForLayoutSize(3)
  },

  popupContainer: {
    backgroundColor: CommonColors.popupBg,
    borderRadius: PixelRatio.getPixelSizeForLayoutSize(3),
    borderWidth: 1,
    borderColor: CommonColors.border
  },
  arrow: {
    borderColor: CommonColors.border,
    borderTopColor: CommonColors.popupBg
  },
  popup: {
    width: PixelRatio.getPixelSizeForLayoutSize(170),
    backgroundColor: CommonColors.popupBg
  },
  menuRow: {
    flex: 1,
    flexDirection: 'row'
  },
  menuItem: {
    flex: 1,
    paddingTop: PixelRatio.getPixelSizeForLayoutSize(5),
    paddingBottom: PixelRatio.getPixelSizeForLayoutSize(5)
  },
  menuItemText: {
    flex: 1,
    color: CommonColors.mainText,
    textAlign: 'center'
  },

  chart: {
    flex: 1,
    borderWidth: 1,
    borderColor: CommonColors.border,
  },
  webView: {
    backgroundColor: '#000'
  }
});