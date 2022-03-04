import './App.css';
import Web3 from "web3";
import Web3Token from "web3-token";

async function login() {
  const web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const yourAddress = (await web3.eth.getAccounts())[0];
  try {
    const token = await Web3Token.sign(
        (msg) => web3.eth.personal.sign(msg, yourAddress, ""),
        "1d"
    );

    console.log("TOKEN_CREATED", token);

    const { address, body } = await Web3Token.verify(token);

    console.log("ADDRESS", address, body);

  } catch (e) {
    console.log(e)
    console.log(e.code)
    console.log(e.message)

  }

}

function App() {
  return (
    <div className="App">
      <button
          type="submit"
          className="btn btn-lg theme-btn payment-button"
          onClick={() => login()}
      >
        <div className="logo-container" id="logo-container"></div>
        Metamask
      </button>
    </div>
  );
}

export default App;
