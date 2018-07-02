import Numeral from '../libs/numeral';
import I18n from '../i18n/i18n';

export default {
  validateOrderInput: function (data) {
    var errors = [];
    if (!data.base_price && (data.type == 'stop_limit' || data.type == 'stop_market')) {
      errors.push({
        field: 'stop_market',
        message: I18n.t('create_order.error.empty_base_price')
      });
    }
    if (!data.price && (data.type == 'limit' || data.type == 'stop_limit')) {
      errors.push({
        field: 'price',
        message: I18n.t('create_order.error.empty_price')
      });
    }
    if (!data.quantity) {
      errors.push({
        field: 'quantity',
        message: I18n.t('create_order.error.empty_quantity')
      });
    }
    return errors;
  },

};
