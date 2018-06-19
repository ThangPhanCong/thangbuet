import React from 'react';
import {
  FlatList
} from 'react-native';
import BaseScreen from '../BaseScreen';
import { connect } from 'redux';
import ActionType from '../../redux/ActionType';

class MarketScreen extends BaseScreen {
  componentDidMount() {
    super.componentDidMount();
    this.dispatch({
      type: ActionType.GET_COIN_LIST
    })
  }

  render() {
    return (
      <FlatList
        data = {this.props.coinsList}
        renderItem = { this._renderItem() }
        />
    );
  }

  _renderItem() {
    return (
      <view/>
    )
  }
}

function mapStateToProps(state) {
  return {
    stats: state.marketReducer
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketScreen);