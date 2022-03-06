import React, {Component, useEffect} from 'react';
import PropTypes from 'prop-types';
import styles from './NftCreationConfirmed.module.css';
import Swal from 'sweetalert2'
import Web3 from "web3";

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
                                        <button
                                            type="submit"
                                            className="btn btn-lg theme-btn payment-button"
                                            onClick={() => this.pay()}
                                        >
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

        // let paymentModal = document.querySelector('.payment-modal');
        // paymentModal.style.visibility = 'visible';
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

    async pay() {
        const userUuid = localStorage.getItem('userUuid');
        if (!userUuid) {
            await Swal.fire(
                'Oops...',
                'You need to start again, please!',
                'error'
            ).then(() => {
                window.location.href = '/';
            });
        }
        try {

            await window.ethereum.enable()

            let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            let publicAddress = accounts[0];

            let that = this;
            // is address already in backend
            await fetch(`/api/v1/auth/${publicAddress}`, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(function (response) {
                    return response.json();
                })
                .then(async function (data) {
                    if(data) {
                        return await that.handleSignup(publicAddress, userUuid);
                    } else {
                        await Swal.fire(
                            'Oops...',
                            'You need to start again, please!',
                            'error'
                        ).then(() => {
                            window.location.reload();
                        });
                    }
                })
                .then(await that.handleSignMessage)
                .then(await that.handleAuthentication)
                .then(await that.transaction)
                .catch(function (error) {
                    console.log(error);
                });

        } catch (e) {
            console.log(e)
            console.log(e.code)
            console.log(e.message)

        }

    }

    async handleSignup (publicAddress, userUuid) {
        if (!publicAddress || !userUuid) {
            return Swal.fire(
                'Oops...',
                'Something went wrong, please try again!',
                'error'
            ).then(() => {
                window.location.reload();
            });
        }
        console.log('handleSignup')
        console.log({publicAddress, userUuid})
        console.log('handleSignup')
        return await fetch(`/api/v1/auth/create`, {
            body: JSON.stringify({publicAddress, userUuid}),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        }).then( response => response.json())
            .then(async function (data) {
                console.log({data})
                if(await data) {
                    return {
                        publicAddress: data.user.publicAddress,
                        nonce: data.user.nonce
                    };
                } else {
                    await Swal.fire(
                        'Oops...',
                        'You need to start again, please!',
                        'error'
                    ).then(() => {
                        window.location.reload();
                    });
                }
            })
            .catch(error => {
                console.log(error);
                return {
                    success: false
                };
            });
    };

    async handleSignMessage({ publicAddress, nonce }) {
        if (!publicAddress || !nonce) {
            return Swal.fire(
                'Oops...',
                'Something went wrong, please try again!',
                'error'
            ).then(() => {
                window.location.href = '/';
            });
        }
        console.log('handleSignMessage')
        console.log({publicAddress, nonce})
        console.log('handleSignMessage')
        const msg = `
        Welcome to NFT Creator!
        You are signing in with this nonce: ${nonce}
        this will change after a successful login for
        security reasons.`;

        return await window.ethereum.request({ method: 'personal_sign', params: [msg, publicAddress] })
            .then(signature => {
                console.log({ publicAddress, nonce, signature })
                return { publicAddress, nonce, signature, msg };
            })
            .catch(error => {
                console.log(error);
                return {
                    success: false
                };
            });
    };

    async handleAuthentication({ publicAddress, nonce, signature, msg }) {
        if (!publicAddress || !nonce || !signature || !msg) {
            return Swal.fire(
                'Oops...',
                'Something went wrong, please try again!',
                'error'
            ).then(() => {
                window.location.reload();
            });
        }
        console.log('handleAuthentication')
        console.log({ publicAddress, nonce, signature })
        console.log('handleAuthentication')
        return await fetch(`/api/v1/auth/authenticate`, {
            body: JSON.stringify({ publicAddress, nonce, signature, msg }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        })
            .then(response => response.json())
            .then(async (data) => {
                console.log('handleAuthentication response')
                console.log(data)
                console.log('handleAuthentication response')
                if (data.success) {
                    return {
                        publicAddress,
                        userUuid: data.user.uuid
                    }
                } else {
                    console.log(data)
                }
            })

    }

    async transaction({publicAddress, userUuid}) {
        if (!publicAddress || !userUuid) {
            return Swal.fire(
                'Oops...',
                'Something went wrong, please try again!',
                'error'
            ).then(() => {
                window.location.reload();
            });
        }
        console.log('transaction')
        console.log({publicAddress, userUuid})
        if (!publicAddress || !userUuid) {
            return Swal.fire(
                'Oops...',
                'You need to start again, please!',
                'error'
            ).then(() => {
                window.location.href = '/';
            });
        }
        console.log('transaction')
        if (window.ethereum) {

            // let paymentModal = document.querySelector('.payment-modal');
            // paymentModal.style.visibility = 'visible';

            //Sending Ethereum to an address
            let amount = Web3.utils.toWei('0.00002', 'ether');
            console.log(amount)
            // // send transaction

            // calculate gas price
            let gasPrice = await window.ethereum.request({ method: 'eth_gasPrice' });

            console.log('gas price')
            console.log({gasPrice})
            console.log('gas price')

            window.ethereum
                .request({
                    method: 'eth_sendTransaction',
                    params: [
                        {
                            from: publicAddress,
                            to: '0x2479c5E000b275FA758882c973b565823b2eaeC4',
                            value: `0x${amount}`,
                            gasPrice: '0x09184e72a000',
                            gas: '0x5208'
                        },
                    ],
                })
                .then((txHash) => {
                    console.log('txHash')
                    console.log(txHash)
                    console.log('txHash')
                    window.location.href = '/user/area/' + userUuid;
                })
                .catch((error) => console.error);
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
