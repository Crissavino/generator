import React, {Component, useEffect} from 'react';
import PropTypes from 'prop-types';
import styles from './NftCreationConfirmed.module.css';
import Swal from 'sweetalert2'

class NftCreationConfirmed extends Component {

    render() {
        return (
            <>
                <section id="home" className="hero-section">
                    <div className="container">
                        <div
                            className="col-12 col-lg-10 p-3 mx-auto text-center big-white-modal d-flex flex-column justify-content-center align-items-center">
                            <h2>We are creating your NFTs</h2>
                            <h4>This could take a while...</h4>
                            <p>
                                We will email you when your NFTs are ready.
                            </p>
                            <div className="row container nft-image-container mx-auto">
                                {/*Preloader*/}
                                <div className="col-5 col-lg-3 p-2 custom-preloader-container">
                                    <div className="custom-preloader">
                                        <div className="custom-preloader-inner">
                                            <div className="custom-preloader-icon">
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/*End Preloader*/}
                            </div>
                        </div>
                    </div>
                </section>
                <div className="payment-modal" style={{visibility: 'hidden'}}>
                    <div className=" container">
                        <div className="row justify-content-center">
                            <form className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 payment-form p-5">
                                <div className="col-12 mb-4">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label htmlFor="userEmail">Email</label>
                                        <span className="text-muted">For receive the access to your NFTs images and metadata</span>
                                    </div>
                                    <input type="email" name="userEmail" id="userEmail" className="form-control custom"
                                           placeholder="receivemynfts@nft.com"/>
                                </div>
                                <div className="col-12">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label htmlFor="userEmail">Payment</label>
                                        <span className="text-muted">Because we need to eat</span>
                                    </div>
                                    <div className="d-flex flex-column justify-content-center">
                                        <button type="submit" className="btn btn-lg theme-btn payment-button">
                                            <div className="logo-container" id="logo-container"></div>
                                            Metamask
                                        </button>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    async componentDidMount() {
        this.attachScripts();

        this.loadNewNftImages();

        await this.transaction();
    }

    attachScripts() {
        const metamaskLogo = document.createElement("script");
        metamaskLogo.async = true;
        metamaskLogo.src = "/js/metamaskLogo.js";
        document.body.appendChild(metamaskLogo);

        const web3 = document.createElement("script");
        web3.async = true;
        web3.src = "https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js";
        document.body.appendChild(web3);
    }

    loadNewNftImages() {
        const STOP_SET_INTERVAL = 10000;
        const NUMBER_MAX_EMPTY_RETRY = 1003;

        try {
            let numberOfEmptyRetries = 0;
            let interval = setInterval(function () {
                // fetch call to updateNftImageInView url
                fetch('/nft-creation/are-new-images', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        // userUuid: `{{ userUuid }}`
                        userUuid: localStorage.getItem('userUuid')
                    })
                })
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {

                        if (data.imagePaths.length === 0) {
                            numberOfEmptyRetries++;
                            if (numberOfEmptyRetries > NUMBER_MAX_EMPTY_RETRY) {
                                localStorage.removeItem('userUuid');
                                clearInterval(interval);
                                Swal.fire({
                                    title: 'Error',
                                    text: 'Something went wrong. Please try again later.',
                                    icon: 'error',
                                    confirmButtonText: 'Ok'
                                }).then(function () {
                                    window.location.href = '/';
                                });
                            }
                        }

                        let nftImageContainer = document.querySelector('.nft-image-container');
                        if (nftImageContainer.querySelectorAll('.nft-image').length === 3) {
                            // create custom preloader and append it last
                            let customPreloader = document.createElement('div');
                            customPreloader.classList.add('custom-preloader');
                            customPreloader.setAttribute('style', 'width: 100% !important; height: 100% !important;');
                            customPreloader.innerHTML = `
                            <div class="">
                                <div class="custom-preloader-icon" style="position: relative; right: 50px;">
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>`;
                            let div = document.createElement('div');
                            div.classList.add('col-5', 'col-lg-3', 'p-2', 'm-auto');
                            div.appendChild(customPreloader);
                            nftImageContainer.appendChild(div);
                            console.log(nftImageContainer)
                            // close sockets
                            clearInterval(interval);

                            // show payment modal
                            let paymentModal = document.querySelector('.payment-modal');
                            paymentModal.style.visibility = 'visible';

                            return;
                        }

                        let imagePath = '';
                        console.log({data})
                        if (data.imagePaths[0] && nftImageContainer.querySelectorAll('.nft-image').length === 0) imagePath = data.imagePaths[0];
                        else if (data.imagePaths[1] && nftImageContainer.querySelectorAll('.nft-image').length === 1) imagePath = data.imagePaths[1];
                        else if (data.imagePaths[2] && nftImageContainer.querySelectorAll('.nft-image').length === 2) imagePath = data.imagePaths[2];
                        else return;

                        let nftImage = document.createElement('img');
                        nftImage.classList.add('nft-image');
                        nftImage.src = imagePath;
                        let div = document.createElement('div');
                        div.classList.add('col-5', 'col-lg-3', 'p-2');
                        div.appendChild(nftImage);
                        nftImageContainer.appendChild(div);
                        // destroy the preloader
                        let preloader = document.querySelector('.custom-preloader-container');
                        if (preloader) {
                            preloader.parentNode.removeChild(preloader);
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }, 3000);
        } catch (e) {
            console.log(e);
        }

        let paymentForm = document.querySelector('.payment-form');
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
        })
    }

    async transaction() {
        if (window.ethereum) {
            const sendEthButton = document.querySelector('.payment-button');

            let accounts = [];
            await getAccount();

            // let paymentModal = document.querySelector('.payment-modal');
            // paymentModal.style.visibility = 'visible';

            //Sending Ethereum to an address
            sendEthButton.addEventListener('click', async () => {
                await getAccount();
                // let dollarPrice = 1;
                // // convert to wei
                // let amount = window.ethereum.utils.toWei(String(dollarPrice), 'ether');
                // console.log(amount)
                // // send transaction


                window.ethereum
                    .request({
                        method: 'eth_sendTransaction',
                        params: [
                            {
                                from: accounts[0],
                                to: '0x2479c5E000b275FA758882c973b565823b2eaeC4',
                                value: '0x29a2241af62c0000',
                                // gasPrice: '0x09184e72a000',
                                gas: '0x2710',
                            },
                        ],
                    })
                    .then((txHash) => console.log(txHash))
                    .catch((error) => console.error);

                localStorage.removeItem('userUuid');

            });

            async function getAccount() {
                accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            }
        } else {
            Swal.fire({
                title: 'Please install MetaMask',
                html: '<a href="https://metamask.io/">Install MetaMask</a>',
                icon: 'warning',
                showConfirmButton: false,
            });
        }
    }

}

export default NftCreationConfirmed;
