import { debounce } from "throttle-debounce";

export default class AddressValidator {
  constructor () {
    this.addressSendToServer = ""
  }

  static validateAddress(coin, address, callBack) {
    //Sau 1000ms nguoi dung khong go ki tu tiep theo, se goi ham sendToServer()
    debounce(1000, this.sendToSerVer(coin, address, callBack))
  }

  static async sendToSerVer(coin, address, callBack) {
    if (address.trim() === ""){
      callBack(false)
    } else {
      this.addressSendToServer = address;
      let url = `https://validate-sotatek.herokuapp.com/check/${coin}/${address}`;
      // let url = `http://wallet.sotatek.com/api/${coin}/addr_validation/${address}`;
      let response = await fetch(url);
      if (response.status === 200){
        if (this.addressSendToServer === address){
          response.json().then(data => {
            (data.validate == true) ? callBack(true)
              : callBack(false)
          })
        }
      } else {
        callBack(true)
      }
    }
  }
}
