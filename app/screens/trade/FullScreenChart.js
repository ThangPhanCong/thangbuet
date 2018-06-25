import React from 'react';
import { PixelRatio, StyleSheet, Text, TouchableWithoutFeedback, View, WebView } from 'react-native';
import { Popover, PopoverController } from 'react-native-modal-popover';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Orientation from 'react-native-orientation';
import rf from '../../libs/RequestFactory';
import I18n from '../../i18n/i18n';
import BaseScreen from '../BaseScreen';
import AppConfig from '../../utils/AppConfig';
import Utils from '../../utils/Utils';
import { CommonColors, CommonSize, CommonStyles } from '../../utils/CommonStyles';
import { formatCurrency, formatPercent, getCurrencyName } from '../../utils/Filters';
import ChartUtil from './ChartUtil';
import PopupStyles from './PopupStyles';

export default class FullScreenChart extends BaseScreen {
  static navigationOptions = {
    header: null
  };

  static MENU_HOUR = 'hour';
  static MENU_MINUTE = 'minute';

  constructor(props) {
    super(props);
    const {params} = this.props.navigation.state;
    this.state = {
      currency: params.currency,
      coin: params.coin,
      resolution: params.resolution,
      marketData: {},
      isChartLoaded: false,
      selectedMenu: FullScreenChart.MENU_HOUR
    };
    this.initialResolution = params.resolution;
  }

  getScreenOrientation() {
    return BaseScreen.ORIENTATION_LANDSCAPE;
  }

  _getCurrency() {
    return this.state.currency;
  }

  _getCoin() {
    return this.state.coin;
  }

  componentWillMount() {
    super.componentWillMount();
    Orientation.lockToLandscape();
    this._loadData();
  }

  async _loadData() {
    try {
      let priceResponse = await rf.getRequest('PriceRequest').getPrices();
      this._onPriceUpdated(priceResponse.data);
    } catch (e) {
      console.log('FullScreenChart._loadData', e);
    }
  }

  getSocketEventHandlers() {
    return {
      PricesUpdated: this._onPriceUpdated.bind(this),
    };
  }

  _onPriceUpdated(data) {
    key = Utils.getPriceKey(this._getCurrency(), this._getCoin());
    if (data[key]) {
      this.setState({marketData: data[key]});
    }
  }

  _onPressBack() {
    this.props.navigation.state.params.onGoBack();
    this.props.navigation.goBack();
  }

  _getPriceAbsoluteChanged() {
    return this.state.marketData.price - this.state.marketData.last_24h_price;
  }

  _getPricePercentageChanged() {
    if (this.state.marketData.last_24h_price) {
      return this._getPriceAbsoluteChanged() / this.state.marketData.last_24h_price;
    } else {
      return 0;
    }
  }

  _getPriceChangedStyle() {
    let absoluteChanged = this._getPriceAbsoluteChanged();
    if (absoluteChanged > 0) {
      return CommonStyles.priceIncreased
    } else if (absoluteChanged == 0) {
      return CommonStyles.priceNotChanged;
    } else {
      return CommonStyles.priceDecreased;
    }
  }

  _renderPriceInfo() {
    return (
      <View style={styles.priceInfoGroup}>
        <Text style={styles.symbol}>
          {getCurrencyName(this._getCoin())} / {getCurrencyName(this._getCurrency())}
        </Text>
        <Text style={this._getPriceChangedStyle()}>
          {formatCurrency(this.state.marketData.price, this._getCurrency())}
        </Text>
        <Text style={styles.change24h}>
          {I18n.t('fullScreenChart.change24h')}
        </Text>
        <Text style={[this._getPriceChangedStyle(), styles.priceChange]}>
          {formatCurrency(this._getPriceAbsoluteChanged(), this._getCurrency())}
        </Text>
        <Text style={this._getPriceChangedStyle()}>
          {formatPercent(this._getPricePercentageChanged())}
        </Text>
        <Text style={styles.date}>
          {moment().format('YYYY/DD/MM HH:mm:ss')}
        </Text>

        <TouchableWithoutFeedback onPress={this._onPressBack.bind(this)}>
          <View style={styles.back}>
            <SimpleLineIcons name="size-actual"
              size={PixelRatio.getPixelSizeForLayoutSize(10)}
              color={CommonColors.mainText} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  _getChartResolutionStyle(resolution) {
    const selectedResolution = this.state.resolution;
    if (resolution == ChartUtil.RESOLUTION_WEEK || resolution == ChartUtil.RESOLUTION_DAY) {
      return selectedResolution == resolution ? styles.chartButtonSelectedStyle : {};
    } else if (resolution >= ChartUtil.RESOLUTION_HOUR) {
      return selectedResolution >= ChartUtil.RESOLUTION_HOUR && selectedResolution < ChartUtil.RESOLUTION_DAY
        ? styles.chartButtonSelectedStyle : {};
    } else {
      return selectedResolution >= ChartUtil.RESOLUTION_MINUTE && selectedResolution < ChartUtil.RESOLUTION_HOUR
        ? styles.chartButtonSelectedStyle : {};
    }
  }

  _onWeekSelected() {
    this._setChartResolution(ChartUtil.RESOLUTION_WEEK);
  }

  _onDaySelected() {
    this._setChartResolution(ChartUtil.RESOLUTION_DAY);
  }

  _setChartResolution(resolution) {
    this.setState({resolution});
    const resolutionValue = ChartUtil.getResolutionValue(resolution);
    this._webView.injectJavaScript(`this.setResolutionChart('${resolutionValue}')`);
  }

  _openHourMenu(openPopover, setPopoverAnchor) {
    this.setState({selectedMenu: FullScreenChart.MENU_HOUR}, () => {
      setPopoverAnchor(this._hourButton);
      openPopover();
    });
  }

  _openMinuteMenu(openPopover, setPopoverAnchor) {
    this.setState({selectedMenu: FullScreenChart.MENU_MINUTE}, () => {
      setPopoverAnchor(this._minuteButton);
      openPopover();
    });
  }

  _renderChartButtons(setPopoverAnchor, openPopover) {
    const chartResolution = this.state.resolution;

    return (
      <View style={styles.buttonGroup}>

        <TouchableWithoutFeedback onPress={this._onDaySelected.bind(this)}>
          <View style={[styles.chartTimeGroup, this._getChartResolutionStyle(ChartUtil.RESOLUTION_DAY)]}>
            <Text style={styles.charTimeButton}>
              {ChartUtil.getResolutionLabel(ChartUtil.RESOLUTION_DAY)}
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={this._onWeekSelected.bind(this)}>
          <View style={[styles.chartTimeGroup, this._getChartResolutionStyle(ChartUtil.RESOLUTION_WEEK)]}>
            <Text style={styles.charTimeButton}>
              {ChartUtil.getResolutionLabel(ChartUtil.RESOLUTION_WEEK)}
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._openHourMenu(openPopover, setPopoverAnchor)}>
          <View style={[styles.chartTimeGroup, this._getChartResolutionStyle(ChartUtil.RESOLUTION_HOUR)]}>
            <Text ref={ref => this._hourButton = ref} style={styles.charTimeButton}>
              {chartResolution < ChartUtil.RESOLUTION_DAY && chartResolution >= ChartUtil.RESOLUTION_HOUR
                ? ChartUtil.getResolutionLabel(chartResolution)
                : I18n.t('fullScreenChart.hour')}
            </Text>
            <FontAwesome name="caret-down"
              size={PixelRatio.getPixelSizeForLayoutSize(12)}
              color={CommonColors.highlightText} />
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._openMinuteMenu(openPopover, setPopoverAnchor)}>
          <View style={[styles.chartTimeGroup, this._getChartResolutionStyle(ChartUtil.RESOLUTION_MINUTE)]}>
            <Text ref={ref => this._minuteButton = ref} style={styles.charTimeButton}>
              {chartResolution < ChartUtil.RESOLUTION_HOUR
                ? ChartUtil.getResolutionLabel(chartResolution)
                : I18n.t('fullScreenChart.min')}
            </Text>
            <FontAwesome name="caret-down"
              size={PixelRatio.getPixelSizeForLayoutSize(12)}
              color={CommonColors.highlightText} />
          </View>
        </TouchableWithoutFeedback>

      </View>
    );
  }

  _renderTimeMenu(closePopover) {
    let hourItems = [];
    let minuteItems = [];

    for (let item of ChartUtil.RESOLUTIONS) {
      if (item < ChartUtil.RESOLUTION_HOUR) {
        minuteItems.push(item);
      } else if (item < ChartUtil.RESOLUTION_DAY) {
        hourItems.push(item);
      }
    }

    return (
      <View style={[PopupStyles.popup, styles.popup]}>
        {this.state.selectedMenu == FullScreenChart.MENU_HOUR && this._renderTimeMenuItems(true, hourItems, closePopover)}
        {this.state.selectedMenu == FullScreenChart.MENU_MINUTE && this._renderTimeMenuItems(false, minuteItems, closePopover)}
      </View>
    );
  }

  _renderTimeMenuItems(isHourMenu, data, closePopover) {
    return (
      <View style={CommonStyles.matchParent}>
        {data.map((item, index) => {
          return (
            <TouchableWithoutFeedback key={index}
              onPress={() => {
                closePopover();
                this._setChartResolution(item); // minutes
              }}>
              <View style={CommonStyles.matchParent}>
                <Text style={[styles.tickerSizeItem, index == 0 ? {marginTop: 0} : {}]}>
                  {isHourMenu ? item / 3600 : item / 60}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          );
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
                contentStyle={[PopupStyles.popupContainer, styles.popupContainer]}
                visible={popoverVisible}
                onClose={closePopover}
                fromRect={popoverAnchorRect}
                placement='top'
                supportedOrientations={['landscape']}>
                {this._renderTimeMenu(closePopover)}
              </Popover>
            </View>
          )}
        </PopoverController>
      </View>
    );
  }

  _onLoadChartEnd() {
    this.setState({isChartLoaded: true});
  }

  _getChartUrl() {
    const resolutionValue = ChartUtil.getResolutionValue(this.initialResolution);
    let params = `coin=${this._getCoin()}&currency=${this._getCurrency()}&resolution=${resolutionValue}`;
    return `${AppConfig.getAssetServer()}/webview/chart/candle?${params}`;
  }

  _renderChart() {
    return (
      <View style={styles.chart}>
        <WebView
          ref={ref => this._webView = ref}
          source={{uri: this._getChartUrl()}}
          style={[styles.webView, {opacity: this.state.isChartLoaded ? 1 : 0}]}
          onLoadEnd={this._onLoadChartEnd.bind(this)}/>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.screen}>
        {this._renderPriceInfo()}
        {this._renderChart()}
        {this._renderChartToolbar()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#12151B'
  },

  priceInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12151D',
    height: PixelRatio.getPixelSizeForLayoutSize(15),
  },
  symbol: {
    color: CommonColors.mainText,
    marginRight: PixelRatio.getPixelSizeForLayoutSize(10)
  },
  change24h: {
    color: CommonColors.secondaryText,
    marginLeft: PixelRatio.getPixelSizeForLayoutSize(15),
  },
  priceChange: {
    marginLeft: PixelRatio.getPixelSizeForLayoutSize(5),
    marginRight: PixelRatio.getPixelSizeForLayoutSize(5)
  },
  date: {
    flex: 1,
    marginRight: PixelRatio.getPixelSizeForLayoutSize(10),
    color: CommonColors.secondaryText,
    textAlign: 'right'
  },
  back: {
    marginRight: PixelRatio.getPixelSizeForLayoutSize(5),
    marginTop: PixelRatio.getPixelSizeForLayoutSize(1)
  },

  chartToolbar: {
    flexDirection: 'row',
    backgroundColor: '#191E26',
    height: PixelRatio.getPixelSizeForLayoutSize(20),
  },
  buttonGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: PixelRatio.getPixelSizeForLayoutSize(30),
    paddingRight: PixelRatio.getPixelSizeForLayoutSize(30),
  },
  chartTimeGroup: {
    width: PixelRatio.getPixelSizeForLayoutSize(25),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: PixelRatio.getPixelSizeForLayoutSize(1),
    borderBottomColor: '#0000',
    borderTopWidth: PixelRatio.getPixelSizeForLayoutSize(1),
    borderTopColor: '#0000',
  },
  charTimeButton: {
    color: CommonColors.mainText,
    marginRight: PixelRatio.getPixelSizeForLayoutSize(2),
  },
  chartButtonSelectedStyle: {
    borderBottomColor: CommonColors.highlightText,
  },

  popupContainer: {
    borderRadius: PixelRatio.getPixelSizeForLayoutSize(1),
  },
  arrow: {
    borderColor: CommonColors.border,
    borderTopColor: CommonColors.popupBg
  },
  popup: {
    width: PixelRatio.getPixelSizeForLayoutSize(30)
  },
  tickerSizeItem: {
    color: CommonColors.mainText,
    fontSize: PixelRatio.getFontScale() * 12,
    textAlign: 'center',
    paddingTop: PixelRatio.getPixelSizeForLayoutSize(3),
    paddingBottom: PixelRatio.getPixelSizeForLayoutSize(3),
    marginTop: 1,
    backgroundColor: CommonColors.popupBg
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