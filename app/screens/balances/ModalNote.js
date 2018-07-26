import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, Image,} from 'react-native'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import I18n from '../../i18n/i18n'
import Modal from "react-native-modal"
import { Fonts } from '../../utils/CommonStyles'
import { scale } from '../../libs/reactSizeMatter/scalingUtils';
import UIUtils from "../../utils/UIUtils";
import { Card } from 'react-native-elements';

export default class ModalNote extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <Modal
        isVisible={this.props.noteDeposit}
        avoidKeyboard={true}
        useNativeDriver={true}
        backdropColor='transparent'
        onBackdropPress={() => this.props.hideModalNote.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={styles.largerContainerCard}>
          <Text style={styles.initOtpVerification}>
            {I18n.t('deposit.noteDepositModal.title')}
          </Text>
          <View style={styles.crossBar}/>
          <ScrollView
            style={styles.initVerificationScrollView}
            contentContainerStyle={{ padding: scale(10) }}>
            <Text style={[styles.contentRegular, styles.marginBottom5]}>
              {I18n.t('deposit.noteDepositModal.content1')}
            </Text>
            <Text style={[styles.contentRegular, styles.marginBottom5]}>
              {I18n.t('deposit.noteDepositModal.content2_1')}
              <Text style={{ ...Fonts.NanumGothic_Bold }}>
                {I18n.t('deposit.noteDepositModal.content2_2')}
              </Text>
              {I18n.t('deposit.noteDepositModal.content2_3')}
              <Text style={{ color: 'red' }}>
                {I18n.t('deposit.noteDepositModal.content2_4')}
              </Text>
              {I18n.t('deposit.noteDepositModal.content2_5')}
            </Text>
            <Text style={[styles.contentRegular, styles.marginBottom5]}>
              {I18n.t('deposit.noteDepositModal.content3_1')}
              <Text style={{ color: 'red' }}>
                {I18n.t('deposit.noteDepositModal.content3_2')}
              </Text>
              {I18n.t('deposit.noteDepositModal.content3_3')}
            </Text>
            <Text style={styles.contentRegular}>
              {I18n.t('deposit.noteDepositModal.content4_1')}
            </Text>
            <View style={[styles.marginBottom5, { flexDirection: 'row' }]}>
              <Image
                style={styles.iconHand}
                resizeMode={'contain'}
                source={require('../../../assets/funds/hand.png')}
              />
              <Text style={[styles.contentRegular, { color: 'blue' }]}>
                {" " + I18n.t('deposit.noteDepositModal.content4_2')}
              </Text>
            </View>
            <Text style={[styles.contentRegular, styles.marginBottom5]}>
              {I18n.t('deposit.noteDepositModal.content5')}
            </Text>
            <Text style={[styles.contentRegular, styles.marginBottom5]}>
              {I18n.t('deposit.noteDepositModal.content6')}
            </Text>
            <Text style={[styles.contentRegular, styles.marginBottom5]}>
              {I18n.t('deposit.noteDepositModal.content7')}
            </Text>
            <Text style={[styles.contentRegular, styles.marginBottom5]}>
              {I18n.t('deposit.noteDepositModal.content8_1')}
              <Text style={{ ...Fonts.NanumGothic_Bold }}>
                {I18n.t('deposit.noteDepositModal.content8_2')}
              </Text>
            </Text>
          </ScrollView>
          <TouchableOpacity
            style={[styles.submitCancelOtpButton, { marginTop: scale(20), marginBottom: scale(30) }]}
            onPress={() => {this.props.confirmChecked(); this.props.hideModalNote()}}>
            <Text style={{ fontSize: scale(13), color: '#FFF', ...Fonts.NanumGothic_Regular }}>
              {I18n.t('deposit.noteDepositModal.confirm')}
            </Text>
          </TouchableOpacity>
        </Card>
      </Modal>
    )
  }
}

const styles = ScaledSheet.create({
  contentRegular: {
    ...Fonts.NanumGothic_Regular,
    fontSize: '11@s',
    lineHeight: '15@s'
  },
  marginBottom5: {
    marginBottom: '7@s'
  },
  largerContainerCard: {
    borderRadius: '5@s',
    marginStart: '5@s',
    marginEnd: '5@s',
    padding: 0,
    ...UIUtils.generateShadowStyle(5)
  },
  initOtpVerification: {
    fontSize: '13@s',
    marginTop: '16@s',
    marginBottom: '16@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    ...Fonts.NanumGothic_Regular
  },
  dialog: {
    backgroundColor: '#FFF'
  },
  crossBar: {
    height: '1@s',
    backgroundColor: '#EBEBEB'
  },
  initOtpVerificationDescEmail: {
    fontSize: '14@s',
    lineHeight: '22@s',
    ...Fonts.NanumGothic_Regular
  },
  initVerificationScrollView: {
    marginTop: '8@s',
    paddingLeft: '20@s',
    paddingRight: '20@s',
    height: '250@s'
  },
  submitCancelOtpButton: {
    marginTop: '30@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    height: '40@s',
    backgroundColor: '#0070C0',
    borderRadius: '5@s',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconHand: {
    width: '13.33@s',
    height: '10@s',
    marginTop: '3@s'
  }
})