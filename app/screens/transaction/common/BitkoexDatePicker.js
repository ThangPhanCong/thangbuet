import React, { Component } from 'react';
import { scale } from "../../../libs/reactSizeMatter/scalingUtils";
import DatePicker from 'react-native-datepicker'

class BitkoexDatePicker extends Component {
  render() {
    const { date, showIcon, changeDate } = this.props;

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
            left: scale(0),
            top: scale(2),
            marginLeft: scale(0)
          },
          dateInput: {
            marginLeft: scale(20),
            height: '100%',
            borderRadius: scale(2),
          },
          dateText: {
            fontSize: scale(11)
          }
        }}
        onDateChange={(date) => changeDate(date)}
      />

    )
  }
}

export default BitkoexDatePicker;