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
            top: scale(4),
            marginLeft: scale(0)
          },
          dateInput: {
            marginLeft: scale(30),
            height: scale(25),
            borderRadius: scale(4)
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