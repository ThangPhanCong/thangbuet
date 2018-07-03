import React, { Component } from 'react';
import { FlatList, Text, View, ScrollView } from "react-native";
import rf from "../../libs/RequestFactory";
import TransactionRequest from "../../requests/TransactionRequest";
import DatePicker from 'react-native-datepicker'
import moment from "moment";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import { getDayMonth, formatCurrency, getTime, getCurrencyName } from "../../utils/Filters";
import { CommonColors, CommonStyles } from "../../utils/CommonStyles";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";

class TransactionContainerScreen extends Component {

  state = {
    transactions: [],
    page: 1,
    start_date: moment(new Date()).subtract(1, 'months'),
    end_date: new Date(),
  }


  componentDidMount() {
    this._getTransactions();
  }

  async _getTransactions() {
    try {
      const { page, start_date, end_date } = this.state;
      const parseStartDate = start_date.format('x');
      const parseEndDate = moment(end_date).format('x');

      const params = {
        page,
        start_date: parseStartDate,
        end_date: parseEndDate,
      };

      const responseTransaction = await rf.getRequest('TransactionRequest').getOrderHistory(params);

      this.setState({ transactions: responseTransaction.data.data })
      console.log('response:', responseTransaction);
      console.log('date current:', moment(new Date()).format('X'));
    } catch (err) {
      console.log('TransactionRequest._error:', err)
    }

  }

  _changeDate(titleDate, date) {
    this.setState({ [`${titleDate}`]: date });
  }

  _renderDatePicker(titleDate) {
    const date = this.state[titleDate];
    const showIcon = titleDate === 'start_date';

    return (
      <DatePicker
        style={{ width: scale(120) }}
        date={date}
        mode="date"
        showIcon={showIcon}
        placeholder="select date"
        format="YYYY-MM-DD"
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        customStyles={{
          dateIcon: {
            position: 'absolute',
            left: 0,
            top: 4,
            marginLeft: 0
          },
          dateInput: {
            marginLeft: scale(30)
          }
        }}
        onDateChange={(date) => this._changeDate(titleDate, date)}
      />
    )
  }

  _renderItem({ item }) {
    return (
      <View style={styles.itemContainer}>
        <View style={{ flex: 1, flexDirection: 'row',  marginLeft: scale(8)  }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemDayMonth}>{getDayMonth(item.created_at)}</Text>
            <Text style={styles.itemTime}>{getTime(item.created_at)}</Text>
          </View>

          <View style={{ flex: 2, flexDirection: 'row' }}>
            <Text style={[styles.itemCoin, { fontWeight: 'bold' }]}>{getCurrencyName(item.coin)}</Text>
            <Text style={[styles.itemCurrency, { fontWeight: 'bold' }]}>{' / ' + getCurrencyName(item.currency)}</Text>
          </View>
        </View>

        <View style={{ flex: 1.5, flexDirection: 'row' }}
        >
          <View style={styles.itemRight}>
            <Text style={styles.itemQuantity}>
              {formatCurrency(item.quantity, item.coin)}
            </Text>

            <Text style={[styles.itemCoin]}>{getCurrencyName(item.coin)}</Text>
          </View>

          <View style={styles.itemRight}>
            <Text style={styles.itemPrice}>{formatCurrency(item.price, item.currency)}</Text>
            <Text style={styles.itemCurrency}>{getCurrencyName(item.currency)}</Text>
          </View>

          <View style={styles.itemRight}>
            <Text style={styles.itemQuantityPrice}>{formatCurrency(item.price * item.quantity, item.currency)}</Text>
            <Text style={styles.itemCurrency}>{getCurrencyName(item.currency)}</Text>
          </View>

          <View style={styles.itemRight}>
            <Text style={styles.itemFee}>
              {formatCurrency(item.fee, item.coin)}
            </Text>
            <Text style={styles.itemCoin}>{getCurrencyName(item.coin)}</Text>
          </View>
        </View>

      </View>
    )
  }

  render() {
    const { transactions } = this.state;

    return (
      <View style={styles.screen}>
        <View style={{ flexDirection: 'row' }}>
          {this._renderDatePicker('start_date')}
          {this._renderDatePicker('end_date')}
        </View>

        <View>
          <FlatList data={transactions}
                    renderItem={this._renderItem.bind(this)}
            // onEndReached={this._handleLoadMore.bind(this)}
                    onEndThreshold={100}/>
        </View>

      </View>
    )
  }
}

export default TransactionContainerScreen;

const styles = ScaledSheet.create({
  screen: {
    flexDirection: 'column',
    ...CommonStyles.screen
  },
  itemContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '50@s',
    borderBottomColor: CommonColors.separator,
    borderBottomWidth: '1@s',
  },
  itemDayMonth: {
    color: CommonColors.mainText,
    fontWeight: 'bold',
    fontSize: '12@s'
  },
  itemTime: {
    color: CommonColors.mainText,
    fontSize: '11@s'
  },
  itemCoin: {
    color: CommonColors.mainText
  },
  itemCurrency: {
    color: CommonColors.mainText
  },
  itemQuantity: {
    fontSize: '12@s',
    flexWrap: 'wrap'
  },
  itemPrice: {
    color: CommonColors.mainText,
    fontSize: '12@s',
    flexWrap: 'wrap'
  },
  itemQuantityPrice: {
    color: CommonColors.mainText,
    fontSize: '12@s',
  },
  itemRight: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center'
  }
});
