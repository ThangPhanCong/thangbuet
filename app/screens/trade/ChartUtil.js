import I18n from '../../i18n/i18n';

export default class ChartUtil {

  static RESOLUTIONS = [60, 300, 900, 1800, 3600, 7200, 14400, 21600, 43200, 86400, 604800];
  static RESOLUTION_WEEK = 604800;
  static RESOLUTION_DAY = 86400;
  static RESOLUTION_HOUR = 3600;
  static RESOLUTION_MINUTE = 60;

  static getResolutionValue(time) {
    if (time >= 604800) {
      return 'W';
    } else if (time >= 86400) {
      return 'D';
    } else {
      return time / 60; // minutes
    }
  }

  static getResolutionLabel(time) {
    const minutes = time / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const weeks = days / 7;
    if (minutes < 60) {
      return I18n.t('marketDetail._minute', {minutes: minutes});
    } else if (hours < 24){
      return I18n.t('marketDetail._hour', {hours: hours});
    } else if (days < 7) {
      return I18n.t('marketDetail._day', {days: days});
    } else {
      return I18n.t('marketDetail._week', {weeks: weeks});
    }
  }

}