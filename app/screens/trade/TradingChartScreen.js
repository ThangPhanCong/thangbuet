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
    flex: 1
  },

  chart: {
    flex: 1
  },
  webView: {
  }
});