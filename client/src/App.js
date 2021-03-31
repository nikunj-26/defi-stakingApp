import React, { Component } from "react";
import Navbar from "./Navbar";
import "./App.css";
import Web3 from "web3";
import DaiToken from "./contracts/DaiToken.json";
import PogToken from "./contracts/PogToken.json";
import TokenFarm from "./contracts/TokenFarm.json";
import Main from "./Main";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();

    //Load contracts
    try {
      const daiToken = new web3.eth.Contract(DaiToken.abi, DaiToken.networks[networkId].address); //prettier-ignore
      const pogToken = new web3.eth.Contract(PogToken.abi, PogToken.networks[networkId].address); //prettier-ignore
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi,TokenFarm.networks[networkId].address); //prettier-ignore

      console.log(daiToken);
      const daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call(); //prettier-ignore
      const pogTokenBalance = await pogToken.methods.balanceOf(this.state.account).call(); //prettier-ignore
      const stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call(); //prettier-ignore

      this.setState({
        daiToken: daiToken,
        pogToken: pogToken,
        tokenFarm: tokenFarm,
        daiTokenBalance: daiTokenBalance.toString(),
        pogTokenBalance: pogTokenBalance.toString(),
        stakingBalance: stakingBalance.toString(),
        loading: false,
      });
      // console.log(tokenFarm);
      //Somethjing
    } catch (error) {
      console.log("Contract Loading Error : ", error);
      console.log("Contract not deployed");
    }
  }

  stakeTokens = async (amount) => {
    this.setState({ loading: true });
    await this.state.daiToken.methods
      .approve(this.state.tokenFarm._address, amount)
      .send({ from: this.state.account });
    await this.state.tokenFarm.methods
      .stakeTokens(amount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  unstakeTokens = async () => {
    this.setState({ loading: true });
    await this.state.tokenFarm.methods
      .unstakeTokens()
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      daiToken: {},
      pogToken: {},
      tokenFarm: {},
      daiTokenBalance: "0",
      pogTokenBalance: "0",
      stakingBalance: "0",
      loading: true,
    };
  }

  render() {
    let content;
    if (this.state.loading) {
      content = (
        <p id="loader" className="text-center">
          Loading...
        </p>
      );
    } else {
      content = (
        <Main
          daiTokenBalance={this.state.daiTokenBalance.toString()}
          pogTokenBalance={this.state.pogTokenBalance.toString()}
          stakingBalance={this.state.stakingBalance.toString()}
          stakeTokens={this.stakeTokens}
          unstakeTokens={this.unstakeTokens}
        />
      );
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                ></a>

                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
