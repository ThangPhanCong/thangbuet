import React, { Component } from 'react';
import { scale } from "../../../libs/reactSizeMatter/scalingUtils";
import DatePicker from 'react-native-datepicker'
import { Image, View } from "react-native";
import ScaledSheet from "../../../libs/reactSizeMatter/ScaledSheet";

class BitkoexDatePicker extends Component {
  render() {
    const { date, showIcon, changeDate } = this.props;

    return (
      <DatePicker
        style={{ width: scale(80)}}
        date={date}
        mode="date"
        showIcon={showIcon}
        placeholder="select date"
        format="YYYY-MM-DD"
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        iconComponent={
          <View style={styles.imgDate}>
            <Image source={require('../../../../assets/dateIcon/date.png')}/>
          </View>
        }
        customStyles={{
          dateInput: {
            marginLeft: showIcon ? scale(20): scale(10),
            // marginTop: scale(10),
            height: '60%',
            borderRadius: scale(2),
          },
          dateText: {
            fontSize: scale(9),
          }
        }}
        onDateChange={(date) => changeDate(date)}
      />

    )
  }
}

export default BitkoexDatePicker;

const styles = ScaledSheet.create({
  imgDate: {
    position: 'absolute',
    left: 0,
    marginLeft: 0,
    top: '10@s',
  }
})
