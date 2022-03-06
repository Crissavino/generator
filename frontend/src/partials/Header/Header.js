import React, {Component} from 'react';
import Web3 from "web3";
import Web3Token from "web3-token";
import Swal from 'sweetalert2'

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

    attachScripts() {
        // const metamaskLogo = document.createElement("script");
        // metamaskLogo.async = true;
        // metamaskLogo.src = "/js/metamaskLogo2.js";
        // document.body.appendChild(metamaskLogo);

        const web3 = document.createElement("script");
        web3.async = true;
        web3.src = "https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js";
        document.body.appendChild(web3);

        const swal = document.createElement("script");
        swal.async = true;
        swal.src = "//cdn.jsdelivr.net/npm/sweetalert2@11";
        document.body.appendChild(swal);

    }

}

Header.propTypes = {};

Header.defaultProps = {};

export default Header;
