import React, { Component } from 'react';
import { scale } from "../../../libs/reactSizeMatter/scalingUtils";
import DatePicker from 'react-native-datepicker'
import { Image, View } from "react-native";
import ScaledSheet from "../../../libs/reactSizeMatter/ScaledSheet";

class BitkoexDatePicker extends Component {
  render() {
    const { date, showIcon, changeDate } = this.props;

    return (
      <View style={styles.pickerContainer}>
        {
          showIcon ?
            <View style={styles.imgDate}>
              <Image source={require('../../../../assets/dateIcon/date.png')}/>
            </View> : null
        }

        <View style={styles.datePicker}>
          <DatePicker
            style={{ width: scale(80) }}
            date={date}
            mode="date"
            showIcon={false}
            placeholder="select date"
            format="YYYY-MM-DD"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{
              dateInput: {
                borderWidth: 0,
              },
              dateText: {
                fontSize: scale(9),
              }
            }}
            onDateChange={(date) => changeDate(date)}
          />
        </View>
      </View>
    )
  }
}

export default BitkoexDatePicker;

const styles = ScaledSheet.create({
  pickerContainer: {
    flexDirection: 'row'
  },
  datePicker: {
    height: '22@s',
    width: '60@s',
    borderWidth: '0.5@s',
    borderColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '10@s',
    borderRadius: '2@s',
  },
  imgDate: {
    marginTop: '2@s',
    marginLeft: '10@s'
  }
})
