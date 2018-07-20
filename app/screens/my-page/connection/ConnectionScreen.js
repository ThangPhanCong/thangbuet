import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  FlatList
} from 'react-native';

import BaseScreen from '../../BaseScreen';
import rf from '../../../libs/RequestFactory';
import { CommonStyles, Fonts } from '../../../utils/CommonStyles';
import I18n from '../../../i18n/i18n';
import ScaledSheet from '../../../libs/reactSizeMatter/ScaledSheet';
export default class ConnectionScreen extends BaseScreen {

  _page = 1;
  _hasNext = true;
  _limit = 10;

  constructor(props){
    super(props);

    this.state = {
      connections: [],
      isLoading: false
    }
  }

  componentWillMount() {
    super.componentWillMount()
    this._loadConnections();
  }

  render() {
    return (
      <View style={styles.screen}>
        {this._renderHeader()}
        <FlatList
          style={styles.listView}
          data={this.state.connections}
          extraData={this.state}
          renderItem={this._renderItem.bind(this)}
          ItemSeparatorComponent={this._renderSeparator}
          onRefresh={this._onRefresh.bind(this)}
          onEndReachedThreshold={1}
          onEndReached={this._onLoadMore.bind(this)}
          refreshing={this.state.isLoading}
          keyExtractor={(item, index) => index.toString()}/>
      </View>
    )
  }

  _renderItem({ item }) {
    return (
      <TouchableHighlight
        style={styles.listItem}
        onPress={() => this._onPressItem(item)}
        underlayColor='#FFECED'>
        <View style = {styles.listItemContainer}>
          <View style={styles.dateTimeGroup}>
            <Text style={styles.valueItem}>
              {item.created_at}
            </Text>
          </View>

          <View style={styles.deviceGroup}>
            <Text style={styles.valueItem}>
              {item.device}
            </Text>
          </View>

          <View style={styles.osGroup}>
            <Text style={styles.valueItem}>
              {item.operating_system}
            </Text>
          </View>

          <View style={styles.ipGroup}>
            <Text style={styles.valueItem}>
              {item.ip_address}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    return (
      <View key="rowID" style={styles.separator}/>
    );
  }

  _renderHeader() {
    return (
      <View style={styles.tabBar}>
        <View style={styles.dateTimeGroup}>
          <Text style={styles.normalHeader}>
            {I18n.t('myPage.connection.dateTime')}
          </Text>
        </View>

        <View style={styles.deviceGroup}>
          <Text style={styles.normalHeader}>
            {I18n.t('myPage.connection.device')}
          </Text>
        </View>

        <View style={styles.osGroup}>
          <Text style={styles.normalHeader}>
            {I18n.t('myPage.connection.operatingSystem')}
          </Text>
        </View>

        <View style={styles.ipGroup}>
          <Text style={styles.normalHeader}>
            {I18n.t('myPage.connection.ipAddress')}
          </Text>
        </View>
      </View>
    );
  }

  _onRefresh() {
    this._page = 1;
    this._hasNext = true;
    this.setState({
      connections: []
    })
    this._loadConnections();
  }

  _onPressItem(item) {

  }

  _onLoadMore(info) {
    this._loadConnections();
  }

  async _loadConnections() {
    if (!this._hasNext) {
      this.setState({
        isLoading: false
      })
      return;
    }
    
    this.setState({
      isLoading: true
    })

    try {
      let response = await rf.getRequest('UserRequest').getHistoryConnection({
        page: this._page,
        limit: this._limit
      })
      let data = response.data;
      let newConections = data.data;
      if (this._page < data.last_page) {
        this._page += 1;
        this._hasNext = true;
      }
      else {
        this._hasNext = false;
      }

      this.setState({
        connections: this.state.connections.concat(newConections),
        isLoading: false
      })
    }
    catch(err) {
      console.log('ConnectionScreen._loadConnections', err);
      this.setState({
        isLoading: false
      })
    }
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
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
    paddingLeft: '10@s',
    paddingRight: '10@s'
  },
  separator: {
    flex: 1,
    height: '1@s',
    backgroundColor: '#DEE3EB',
    opacity: 0.3
  },
  dateTimeGroup: {
    flex: 3,
    alignItems: 'center',
  },
  deviceGroup: {
    flex: 2,
    alignItems: 'center',
  },
  osGroup: {
    flex: 4,
    alignItems: 'center',
  },
  ipGroup: {
    flex: 4,
    alignItems: 'center',
  },
  normalHeader: {
    color: '#000',
    fontSize: '12@s',
    ...Fonts.NanumGothic_Bold,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '36@s',
    backgroundColor: '#F8F9FB',
    paddingLeft: '10@s',
    paddingRight: '10@s',
  },
  valueItem: {
    fontSize: '12@s',
    textAlign: 'center',
    ...Fonts.NanumGothic_Regular,
  }
});