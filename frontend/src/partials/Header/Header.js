import React, {Component} from 'react';
import Web3 from "web3";
import Web3Token from "web3-token";


class Header extends Component {
    render() {
        return (
            <header className="header navbar-area">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <nav className="navbar navbar-expand-lg custom">
                                <a className="navbar-brand" href="/">
                                    NFT CREATOR
                                </a>

                                <div className="d-flex flex-column justify-content-center">
                                    <button
                                        type="submit"
                                        className="btn login-button navbar-brand"
                                        style={{"backgroundColor": "transparent", "border": "none"}}
                                        onClick={() => this.login()}
                                    >
                                        <div className="logo-container" id="logo-container2"></div>
                                        Login
                                    </button>
                                </div>

                                <button className="navbar-toggler" type="button" data-toggle="collapse"
                                        data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                        aria-expanded="false" aria-label="Toggle navigation">
                                    <span className="toggler-icon"></span>
                                    <span className="toggler-icon"></span>
                                    <span className="toggler-icon"></span>
                                </button>

                                <div className="collapse navbar-collapse sub-menu-bar" id="navbarSupportedContent">
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    componentDidMount() {
        this.attachScripts();

    }

    async login() {


        const web3 = new Web3(window.ethereum);
        let accounts = (await web3.eth.getAccounts());
        const yourAddress = accounts[0];
        try {

            // is address already in backend
            const user = await fetch(`/api/v1/users/${yourAddress}`, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    if (data.success) {
                        return data.user;
                    } else {
                        return null;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });



            if (!user) {

                const token = await Web3Token.sign(
                    (msg) => web3.eth.personal.sign(msg, yourAddress, ""),
                    "1d"
                );

                console.log("TOKEN_CREATED", token);

                const { address, body } = await Web3Token.verify(token);

                // if (address) {
                //     console.log("TOKEN_VERIFIED", address);
                //     const response = await fetch(`/api/v1/users/create`, {
                //         method: "POST",
                //         headers: {
                //             "Content-Type": "application/json"
                //         },
                //         body: JSON.stringify({
                //             address: yourAddress,
                //             token: token
                //         })
                //     });
                //     const user = await response.json();
                //     console.log("USER_CREATED", user);
                // }

            }

        } catch (e) {
            console.log(e)
            console.log(e.code)
            console.log(e.message)

        }

    }

    attachScripts() {
        const metamaskLogo = document.createElement("script");
        metamaskLogo.async = true;
        metamaskLogo.src = "/js/metamaskLogo2.js";
        document.body.appendChild(metamaskLogo);

        const web3 = document.createElement("script");
        web3.async = true;
        web3.src = "https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js";
        document.body.appendChild(web3);
    }

}

Header.propTypes = {};

Header.defaultProps = {};

export default Header;
