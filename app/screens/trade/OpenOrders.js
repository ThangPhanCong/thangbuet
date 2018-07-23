import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { filter, find, orderBy } from 'lodash';
import BaseScreen from '../BaseScreen';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import rf from "../../libs/RequestFactory";
import I18n from "../../i18n/i18n";
import { getCurrencyName, formatCurrency, getTime } from "../../utils/Filters";
import { CommonColors, CommonStyles, Fonts } from "../../utils/CommonStyles";
import CheckBox from 'react-native-check-box'

export default class OpenOrders extends BaseScreen {

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      ids: [],
      page: 1,
      last_page: 1,
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this._loadData();
  }

  async _loadData() {
    try {
      const { coin, currency } = this.props;
      const { page, orders } = this.state;
      const params = { coin, currency, page };

      const responseOrders = await rf.getRequest('OrderRequest').getOrdersPending(params);

      this.setState({
        orders: [...orders, ...responseOrders.data.data],
        last_page: responseOrders.data.last_page
      });
    } catch (err) {
      console.log("OpenOrderRequest._error:", err)
    }
  }

  _handleLoadMore = () => {
    const { page, last_page } = this.state;

    if (page >= last_page)
      return;
    this.setState(state => ({ page: state.page + 1 }), () => this._loadData());
  }

  async _onCancelOrder() {
    try {
      const { ids } = this.state;

      await Promise.all(ids.map(async (id) => {
        await rf.getRequest('OrderRequest').cancel(id);
      }));

      // for(let i = 0; i < ids.length; i++) {
      //   await rf.getRequest('OrderRequest').cancel(ids[i]);
      // }
      // ids.forEach(async id => await rf.getRequest('OrderRequest').cancel(id));
      const orderFilter = this.state.orders.filter((item) => !ids.includes(item.id));

      this.setState({ orders: orderFilter })
    } catch (err) {
      console.log("CancelOrder._error:", err)
    }
  }

  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    return (
      <View key="rowID" style={styles.separator}/>
    );
  }

  _toggleIdCancel(id) {
    let { ids } = this.state;

    if (ids.includes(id)) {
      let newIds = ids.filter(item => item !== id);

      this.setState({ ids: newIds })
    } else {
      ids.push(id);
      this.setState({ ids })
    }

  }

  _checkStyleQuantity(type) {
    if (type === 'buy') {
      return true;
    }

    return false;
  }


  render() {
    const { orders } = this.state;

    return (
      <View
        style={styles.screen}>
        <View style={styles.viewMore}>
          <Text style={styles.textMore}>{I18n.t('openOrder.textMore')}</Text>
        </View>
        <FlatList data={orders}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={this._renderItem.bind(this)}
                  onEndReached={this._handleLoadMore.bind(this)}
                  ItemSeparatorComponent={this._renderSeparator}
                  onEndThreshold={100}/>
        <TouchableOpacity onPress={() => this._onCancelOrder()}>
          <View style={styles.cancelOrderContainer}>
            <Text style={styles.textCancelOrder}>{I18n.t('openOrder.cancelOrder')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  _renderItem({ item }) {
    const price = formatCurrency(item.price, item.currency);
    const quantity = formatCurrency(item.quantity);
    const date = getTime(item.updated_at);
    const { ids } = this.state;

    return (
      <View style={styles.itemContainer} key={item.id}>
        <View style={styles.coinPairGroup}>
          <View style={styles.checkBoxCoin}>
            <CheckBox
              isChecked={ids.includes(item.id)}
              onClick={() => this._toggleIdCancel(item.id)}
              style={styles.checkBox}
              {...CommonStyles.checkBox}/>
          </View>

          <View style={styles.coinPairContainer}>
            <Text style={styles.itemCoin}>
              {getCurrencyName(item.coin) + ' / ' + getCurrencyName(item.currency)}
            </Text>

            <Text style={styles.timeOrders}>{date}</Text>
          </View>
        </View>

        <View style={styles.titleGroup}>
          <Text style={styles.titleQuantity}>{I18n.t('openOrder.count')}</Text>
          <Text style={styles.titlePrice}>{I18n.t('openOrder.price')}</Text>
        </View>

        <View style={styles.priceGroup}>
          <Text style={this._checkStyleQuantity(item.trade_type) ? styles.increaseQuantity : styles.decreaseQuantity}>{
            this._checkStyleQuantity(item.trade_type) ? '+ ' + quantity : '- ' + quantity}</Text>
          <Text style={styles.price}>{price}</Text>
        </View>
      </View>
    );
  }
}

const styles = ScaledSheet.create({
  screen: {
    flex: 1
  },
  itemContainer: {
    flexDirection: 'row',
    height: '60@s',
    marginLeft: '10@s',
    marginRight: '10@s',
  },
  coinPairGroup: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleGroup: {
    flex: 1,
    alignItems: 'flex-start'
  },
  priceGroup: {
    flexDirection: 'column',
    flex: 1.5,
    alignItems: 'flex-end'
  },
  checkBoxCoin: {
    flex: 0.5,
  },
  checkBox: {
    width: '70@s'
  },
  coinPairContainer: {
    flexDirection: 'column'
  },
  itemCoin: {
    fontSize: '10@s',
    ...Fonts.NotoSans_Bold
  },
  timeOrders: {
    fontSize: '10@s',
    ...Fonts.NotoSans_Regular
  },
  separator: {
    flex: 1,
    height: '1@s',
    backgroundColor: '#DEE3EB',
    opacity: 0.3
  },
  titleQuantity: {
    fontSize: '10@s',
    ...Fonts.NotoSans_Regular
  },
  titlePrice: {
    fontSize: '10@s',
    ...Fonts.NotoSans_Regular
  },
  quantity: {
    fontSize: '10@s',
    ...Fonts.NotoSans_Regular
  },
  price: {
    fontSize: '10@s',
    ...Fonts.NotoSans_Regular
  },
  cancelOrderContainer: {
    height: '30.5@s',
    borderRadius: '3@s',
    marginBottom: '10@s',
    marginLeft: '10@s',
    marginRight: '10@s',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#70AD47'
  },
  textCancelOrder: {
    color: '#FFF',
    fontSize: '12@s',
    ...Fonts.NotoSans_Regular
  },
  textMore: {
    fontSize: '12@s',
    alignSelf: 'flex-end',
    marginRight: '10@s',
    ...Fonts.NotoSans_Regular,
    textDecorationLine: "underline",
    textDecorationColor: CommonColors.decreased,
    color: CommonColors.decreased
  },
  viewMore: {
    borderBottomWidth: '1@s',
    borderBottomColor: CommonColors.separator,
    flexDirection: 'column',
    justifyContent: 'center',
    height: '40@s'
  },
  increaseQuantity: {
    color: CommonColors.increased,
    fontSize: '10@s',
    ...Fonts.NotoSans_Regular
  },
  decreaseQuantity: {
    color: CommonColors.decreased,
    fontSize: '10@s',
    ...Fonts.NotoSans_Regular
  }
});