import React, { Component } from "react";
import I18n from "../../i18n/i18n";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import UIUtils from "../../utils/UIUtils";
import { Fonts } from "../../utils/CommonStyles";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal"
import { Card } from "react-native-elements";

class ModalHelp extends Component {
  render() {
    const { closeModalHelp, helpContent, isShowModalHelp } = this.props;

    return(
      <Modal
        animationType="slide"
        backdropColor='red'
        visible={isShowModalHelp}
        onBackdropPress={closeModalHelp}
        onRequestClose={() => {
        }}>
        <Card containerStyle={styles.containerCard}>
          <SafeAreaView style={styles.viewCardOpenHelp}>
            <Text style={styles.modalLine}>{helpContent[0]}</Text>
            <Text style={styles.modalLine}>{helpContent[1]}</Text>
            <Text style={styles.modalLine}>{helpContent[2]}</Text>
            <Text style={styles.modalLine}>{helpContent[3]}</Text>
            <Text style={styles.modalLine}>{helpContent[4]}</Text>
            <Text style={styles.modalLine}>{helpContent[5]}</Text>

            <TouchableOpacity
              onPress={closeModalHelp}
              style={styles.executeBtn}>
              <View>
                <Text style={styles.executeBtnText}>{I18n.t('funds.helpBtn')}</Text>
              </View>
            </TouchableOpacity>
          </SafeAreaView>
        </Card>

      </Modal>
    )
  }
}

export default ModalHelp;

const styles = ScaledSheet.create({
  containerCard: {
    borderRadius: '5@s',
    marginStart: '5@s',
    marginEnd: '5@s',
    padding: 0,
    height: '310@s',
    ...UIUtils.generateShadowStyle(5),
  },
  viewCardOpenHelp: {
    marginRight: '20@s', marginLeft: '20@s'
  },
  modalLine: {
    ...Fonts.OpenSans, fontSize: '12@s', textAlign: 'left',
    marginTop: '10@s',
    width: '100%', lineHeight: '20@s',
  },
  executeBtn: {
    width: '100%', justifyContent: 'center', backgroundColor: 'rgba(0, 112, 192, 1)', height: '35@s',
    marginTop: '20@s',
    borderRadius: '4@s',
  },
  executeBtnText: { color: 'white', fontSize: '12@s', textAlign: 'center', ...Fonts.NanumGothic_Regular },
})