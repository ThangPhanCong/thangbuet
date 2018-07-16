import React from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { filter, find, orderBy } from 'lodash';
import moment from 'moment';
import Numeral from '../../libs/numeral';
import rf from '../../libs/RequestFactory';
import I18n from '../../i18n/i18n';
import BaseScreen from '../BaseScreen';
import { CommonColors, CommonSize, CommonStyles, Fonts } from '../../utils/CommonStyles';
import { formatPercent, getCurrencyName } from '../../utils/Filters';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { scale } from '../../libs/reactSizeMatter/scalingUtils';

export default class OpenOrders extends BaseScreen {

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      quantityPrecision: 4,
      decimalDigitCount: 4
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this._getTickerSize();
    this._getQuantityPrecision();
    this._loadData();
  }

  componentDidUpdate(prevProps) {
      let { coin, currency } = this.props;
      if (coin != prevProps.coin || currency != prevProps.currency) {
        this.reloadData();
      }
  }

  _getMaxTransactionCount() {
    return 30;
  }

  async reloadData() {
    return await this._loadData();
  }

  async _loadData() {
    let { coin, currency } = this.props

    // let response = await rf.getRequest('OrderRequest').getRecentTransactions({ coin, currency, count });
    // this._onReceiveTransactions(response.data);
  }

  getSocketEventHandlers() {
    return {
      OrderChanged: this._onOrderChanged.bind(this),
    }
  }

  _onOrderChanged(data) {
    this._reloadData();
  }

  async _getTickerSize() {
    let { coin, currency } = this.props;
    let response = await rf.getRequest('MasterdataRequest').getAll()
    let priceGroups = filter(response.price_groups, (value) => {
      return value.currency == currency && value.coin == coin;
    });
    let priceGroup = priceGroups[0];
    this._calculateDecimalDigitCount(parseFloat(priceGroup.value));
  }

  _calculateDecimalDigitCount(tickerSize) {
    let decimalDigitCount = 0;
    while (tickerSize * Math.pow(10, decimalDigitCount) < 1) {
      decimalDigitCount++;
    }
    this.setState({ decimalDigitCount: decimalDigitCount });
  }

  async _getQuantityPrecision() {
    let { coin, currency } = this.props;
    let response = await rf.getRequest('MasterdataRequest').getAll();
    let setting = find(response.coin_settings, (setting) => {
      return setting.currency == currency && setting.coin == coin;
    });
    let quantityPrecision = Math.round(Math.log(1 / setting.minimum_quantity) / Math.log(10));
    this.setState({ quantityPrecision: quantityPrecision });
  }

  _formatQuantity(value) {
    let precision = this.state.quantityPrecision;
    let format = precision == 0 ?
      '0,0' :
      '0,0.' + Array(precision + 1).join('0') + '';
    return value ? Numeral(value).format(format) : '--';
  }

  _formatPrice(value) {
    let precision = this.state.decimalDigitCount;
    let format = precision == 0 ?
      '0,0' :
      '0,0.' + Array(precision + 1).join('0') + '';
    return value ? Numeral(value).format(format) : '--';
  }

  _formatTime(value) {
    return moment(value, 'x').format('HH:mm:ss');
  }

  render() {
    return (
      <View
        style={styles.screen}>
        <View style={styles.title}>
          <Text style={[styles.titleLabel, styles.timeLabel]}>{I18n.t('marketDetail.time')}</Text>
          <Text style={[styles.titleLabel, styles.priceLabel]}>{I18n.t('marketDetail.price')}</Text>
          <Text style={[styles.titleLabel, styles.quantityLabel]}>{I18n.t('marketDetail.amount')}</Text>
        </View>

        <View style={styles.transactions}>
          <FlatList
            data={this.state.transactions}
            keyExtractor={(item, index) => `${index}`}
            ItemSeparatorComponent={() => <View style={styles.separator}/>}
            renderItem={this._renderItem.bind(this)}/>
        </View>
      </View>
    );
  }

  _renderItem({ item }) {
    return (
      <View style={styles.transactionRow}>
        <Text style={[styles.valueText, styles.time]}>{this._formatTime(item.created_at)}</Text>
        <Text style={[styles.valueText, styles.price, item.priceIncreased ? styles.priceIncreased : styles.priceDecreased]}>
          {this._formatPrice(item.price)}
        </Text>
        <Text style={[styles.valueText, styles.quantity, , item.priceIncreased ? styles.priceIncreased : styles.priceDecreased]}>
          {this._formatQuantity(item.quantity)}
        </Text>
      </View>
    );
  }
}

const margin = scale(10);
const fontSize = scale(11);

const styles = ScaledSheet.create({
  screen: {
    flex: 1
  },
  title: {
    flexDirection: 'row',
    height: '28@s',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E8EF'
  },
  titleLabel: {
    flex: 1,
    color: 'black',
    fontSize: fontSize,
    ...Fonts.NotoSans,
    marginLeft: margin,
    marginRight: margin
  },
  timeLabel: {
    textAlign: 'center'
  },
  priceLabel: {
    textAlign: 'right'
  },
  quantityLabel: {
    textAlign: 'right'
  },
  transactions: {
    flex: 1
  },
  transactionRow: {
    flexDirection: 'row',
    height: '28@s',
    alignItems: 'center',
    borderBottomColor: '#F3F4F7'
  },
  valueText: {
    flex: 1,
    fontSize: fontSize,
    ...Fonts.OpenSans,
    marginLeft: margin,
    marginRight: margin
  },
  time: {
    textAlign: 'center'
  },
  price: {
    flex: 1,
    textAlign: 'right'
  },
  priceIncreased: {
    color: CommonColors.increased,
  },
  priceDecreased: {
    color: CommonColors.decreased,
  },
  quantity: {
    textAlign: 'right',
    color: CommonColors.mainText,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F7'
  }
});