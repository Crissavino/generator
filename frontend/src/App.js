import './App.css';
import Web3 from "web3";
import Web3Token from "web3-token";

async function test() {
  const web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const yourAddress = (await web3.eth.getAccounts())[0];
  const token = await Web3Token.sign(
      (msg) => web3.eth.personal.sign(msg, yourAddress, ""),
      "1d"
  );

  console.log("TOKEN_CREATED", token);

  const { address, body } = await Web3Token.verify(token);

  console.log("ADDRESS", address, body);

}

function App() {
  return (
    <div className="App">
      <button onClick={() => test()}>Test</button>
    </div>
  );
}

export default App;
