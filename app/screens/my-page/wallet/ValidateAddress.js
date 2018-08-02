import { debounce } from "throttle-debounce";

var waittingAddress = "";

function changeAddressInput(coin, address, validateTrue, validateFalse) {
  debounce(500, sendToSerVer(coin, address, validateTrue, validateFalse))
}

async function sendToSerVer(coin, address, validateTrue, validateFalse) {
  if (address.trim() === ""){
    validateFalse()
  } else {
    waittingAddress = address;
    let url = `https://validate-sotatek.herokuapp.com/check/${coin}/${address}`;
    // let url = `http://wallet.sotatek.com/api/${coin}/addr_validation/${address}`;
    let response = await fetch(url);
    if (response.status === 200){
      if (waittingAddress === address){
        response.json().then(data => {
          console.log(data);
          data.validate ? validateTrue()
            : validateFalse()
        })
      }
    } else {
      validateTrue()
    }
  }
}
export { changeAddressInput, sendToSerVer }