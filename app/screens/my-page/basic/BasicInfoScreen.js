import React from 'react';
import {
  StyleSheet,
  PixelRatio,
  Text,
  TouchableHighlight,
  View,
  FlatList,
  Image
} from 'react-native';

import BaseScreen from '../../BaseScreen';
import I18n from '../../../i18n/i18n';
import rf from '../../../libs/RequestFactory';
import ScaledSheet from '../../../libs/reactSizeMatter/ScaledSheet';

export default class BasicInfoScreen extends BaseScreen {
  _infoProps = [{
    prop: 'security_level',
    locale: I18n.t('myPage.basic.securityLevel'),
    prefix: 'Level '
  }, {
    prop: 'fee_level',
    locale: I18n.t('myPage.basic.feeLevel'),
    prefix: 'Level '
  }, {
    prop: 'id',
    locale: I18n.t('myPage.basic.id'),
    prefix: ''
  }, {
    prop: 'phone_no',
    locale: I18n.t('myPage.basic.phone'),
    prefix: ''
  }];

  constructor(props) {
    super(props);

    this.state = {
      info: {}
    }
  }

  componentWillMount(){
    super.componentWillMount()
    this._getCurrentUser();
  }

  render() {
    return(
      <FlatList
        style={styles.listView}
        data={this._infoProps}
        extraData={this.state}
        renderItem={this._renderItem.bind(this)}
        ItemSeparatorComponent={this._renderSeparator}
        keyExtractor={(item, index) => index.toString()}
      />
    )
  }

  _renderItem({item}) {
    return (
      <TouchableHighlight
        style={styles.listItem}
        onPress={() => this._onPressItem(item)}
        underlayColor='#FFECED'>
        <View style = {styles.listItemContainer}>
          <View style={styles.nameGroup}>
            <Text style={styles.text}>
              {item.locale}
            </Text>
          </View>

          <View style={styles.valueGroup}>
            <Text style={styles.text}>
              {this.state.info[item.prop] ? item.prefix + this.state.info[item.prop] : null}
            </Text>
          </View>

          <View style={styles.iconGroup}>
            <Image
              style={styles.iconArrow}
              source={require('../../../../assets/myPage/basic/arrow.png')}
            />
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    return (
      <View key={`rowId`} style={styles.separator}/>
    );
  }

  _onPressItem(item) {

  }

  async _getCurrentUser() {
    try {
      let res = await rf.getRequest('UserRequest').getCurrentUser();
      let user = res.data;
      let info = {};
      for (el of this._infoProps) {
        info[el.prop] = user[el.prop];
      }
      
      this.setState({ info })
    }
    catch(err) {
      console.log('BasicInfoScreen._getCurrentUser', err);
    }
  }
}

const styles = ScaledSheet.create({
  listView: {
    flex: 1,
  },
  listItem: {
    height: '64@s'
  },
  listItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: '20@s',
    paddingRight: '20@s',
    borderBottomWidth: 0.2,
    borderBottomColor: '#C9C7C5'
  },
  separator: {
    flex: 1,
    height: '1@s',
    backgroundColor: '#DEE3EB',
    opacity: 0.3
  },
  nameGroup: {
    flex: 2,
    justifyContent: 'center'
  },
  valueGroup: {
    flex: 4,
    justifyContent: 'center'
  },
  iconGroup: {
    flex: 0.4,
    justifyContent: 'center'
  },
  text: {
    fontSize: '14@s',
  },
  iconArrow: {
    width: '12@s',
    height: '18@s'
  }
});