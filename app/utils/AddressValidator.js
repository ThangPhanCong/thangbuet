import { debounce } from "throttle-debounce";

export default class AddressValidator {
  constructor () {
    this.sendToServerDebounced = debounce(500, this.sendToServer);
  }

  validateAddress(coin, address, callBack) {
    this.sendToServerDebounced(coin, address, callBack);
  }

  async sendToServer(coin, address, callBack) {
    if (address.trim() === ""){
      callBack(false)
    } else {
      let url = `https://validate-sotatek.herokuapp.com/check/${coin}/${address}`;
      // let url = `http://wallet.sotatek.com/api/${coin}/addr_validation/${address}`;
      let response = await fetch(url);
      if (response.status === 200){
        response.json().then(data => {
          (data.validate == true) ? callBack(true) : callBack(false)
        })
      } else {
        callBack(true)
      }
    }
  }
}
