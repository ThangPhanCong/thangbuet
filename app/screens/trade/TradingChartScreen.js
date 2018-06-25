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

  _onPressChartTime(openPopover) {
    if (!this.state.isChartTimeSelected) {
      this.setState({ isChartTimeSelected: true });
    } else {
      openPopover();
    }
  }

  _onPressDepthChart() {
    this.setState({ isChartTimeSelected: false });
  }

  _onPressFull() {
    const params = {
      currency: this.props.screenProps.currency,
      coin: this.props.screenProps.coin,
      resolution: this.state.resolution,
      onGoBack: () => {
        Orientation.lockToPortrait();
      }
    };
    this.navigate('FullScreenChart', params);
  }

  _renderChartButtons(setPopoverAnchor, openPopover) {
    return (
      <View style={styles.buttonGroup}>

        <TouchableWithoutFeedback onPress={() => this._onPressChartTime(openPopover)}>
          <View style={[styles.chartTimeGroup, this.state.isChartTimeSelected ? styles.chartButtonSelectedStyle : {}]}>
            <Text ref={setPopoverAnchor} style={styles.charTimeButton}>
              {ChartUtil.getResolutionLabel(this.state.resolution)}
            </Text>
            <Icon name="caret-down"
              size={PixelRatio.getPixelSizeForLayoutSize(12)}
              color={CommonColors.highlightText} />
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onPressDepthChart()}>
          <View style={[styles.depthGroup, !this.state.isChartTimeSelected ? styles.chartButtonSelectedStyle : {}]}>
            <Text style={styles.depthButton}>{I18n.t('marketDetail.depth')}</Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onPressFull()}>
          <View style={styles.fullGroupContainer}>
            <View style={styles.fullGroup}>
              <Text style={styles.fullText}>{I18n.t('marketDetail.full')}</Text>
              <Icon name="arrows-alt"
                size={PixelRatio.getPixelSizeForLayoutSize(6)}
                color={CommonColors.mainText} />
            </View>
          </View>
        </TouchableWithoutFeedback>

      </View>
    );
  }

  _onPressTimeMenu(index) {
    if (index >= 0 && index < ChartUtil.RESOLUTIONS.length) {
      let resolution = ChartUtil.RESOLUTIONS[index];
      this.setState({ resolution: resolution });
      let resolutionValue = ChartUtil.getResolutionValue(resolution);
      this._webView.injectJavaScript(`this.setResolutionChart('${resolutionValue}')`);
    }
  }

  _getTimeMenuData(itemPerRow) {
    const times = ChartUtil.RESOLUTIONS;
    let data = [];
    let row = [I18n.t('marketDetail.time')];
    for (time of times) {
      row.push(ChartUtil.getResolutionLabel(time));
      if (row.length >= itemPerRow) {
        data.push(row);
        row = [];
      }
    }
    if (row.length) {
      while (row.length < itemPerRow) {
        row.push('');
      }
      data.push(row);
    }
    return data;
  }

  _renderTimeMenu(closePopover) {
    const itemPerRow = 5;
    const data = this._getTimeMenuData(itemPerRow);

    return (
      <View style={styles.popup}>
        {data.map((row, rowIndex) => {
          return <View key={rowIndex} style={styles.menuRow}>
            {row.map((item, columnIndex) => {
              return (
                <TouchableWithoutFeedback key={columnIndex}
                  onPress={() => {
                    closePopover();
                    this._onPressTimeMenu(rowIndex * itemPerRow + columnIndex - 1)
                  }}>
                  <View style={styles.menuItem}>
                    <Text style={styles.menuItemText}>{item}</Text>
                  </View>
                </TouchableWithoutFeedback>
              );
            })}
          </View>
        })}
      </View>
    );
  }

  _renderChartToolbar() {
    return (
      <View style={styles.chartToolbar}>
        <PopoverController>
          {({ openPopover, closePopover, popoverVisible, setPopoverAnchor, popoverAnchorRect }) => (
            <View style={CommonStyles.matchParent}>
              {this._renderChartButtons(setPopoverAnchor, openPopover)}
              <Popover
                arrowStyle={styles.arrow}
                contentStyle={styles.popupContainer}
                visible={popoverVisible}
                onClose={closePopover}
                fromRect={popoverAnchorRect}
                placement='bottom'
                supportedOrientations={['portrait']}>
                {this._renderTimeMenu(closePopover)}
              </Popover>
            </View>
          )}
        </PopoverController>
      </View>
    );
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
        {this._renderChartToolbar()}
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