(this.webpackJsonpfrontend=this.webpackJsonpfrontend||[]).push([[0],{204:function(e,t,n){e.exports={UserArea:"UserArea_UserArea__2-XFJ"}},224:function(e,t){},227:function(e,t){},230:function(e,t){},234:function(e,t){},260:function(e,t){},262:function(e,t){},276:function(e,t){},278:function(e,t){},309:function(e,t){},311:function(e,t){},402:function(e,t){},403:function(e,t){},501:function(e,t,n){e.exports={NftCreationConfirmed:"NftCreationConfirmed_NftCreationConfirmed__3f4fR",paymentModal:"NftCreationConfirmed_paymentModal__1T_Yp"}},502:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return E}));var a=n(202),r=n.n(a),c=n(113),o=n(10),s=n(7),i=n(8),l=n(13),u=n(12),d=n(4),p=n(111),h=n.n(p),m=(n(497),n(24)),f=n.n(m),b=n(2),g=function(e){Object(l.a)(n,e);var t=Object(u.a)(n);function n(){return Object(s.a)(this,n),t.apply(this,arguments)}return Object(i.a)(n,[{key:"render",value:function(){return Object(b.jsx)("header",{className:"header navbar-area",children:Object(b.jsx)("div",{className:"container",children:Object(b.jsx)("div",{className:"row",children:Object(b.jsx)("div",{className:"col-lg-12",children:Object(b.jsxs)("nav",{className:"navbar navbar-expand-lg custom",children:[Object(b.jsx)("a",{className:"navbar-brand",href:"/",children:"NFT CREATOR"}),Object(b.jsxs)("button",{className:"navbar-toggler",type:"button","data-toggle":"collapse","data-target":"#navbarSupportedContent","aria-controls":"navbarSupportedContent","aria-expanded":"false","aria-label":"Toggle navigation",children:[Object(b.jsx)("span",{className:"toggler-icon"}),Object(b.jsx)("span",{className:"toggler-icon"}),Object(b.jsx)("span",{className:"toggler-icon"})]}),Object(b.jsx)("div",{className:"collapse navbar-collapse sub-menu-bar",id:"navbarSupportedContent"})]})})})})})}},{key:"componentDidMount",value:function(){this.attachScripts()}},{key:"attachScripts",value:function(){var e=document.createElement("script");e.async=!0,e.src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js",document.body.appendChild(e);var t=document.createElement("script");t.async=!0,t.src="//cdn.jsdelivr.net/npm/sweetalert2@11",document.body.appendChild(t)}}]),n}(d.Component);g.defaultProps={};var j=g,x=function(){return Object(b.jsxs)(b.Fragment,{children:[Object(b.jsx)(j,{}),Object(b.jsx)(o.a,{})]})},v=n(31),y=n(14),O=n.n(y),w=(n(501),function(e){Object(l.a)(n,e);var t=Object(u.a)(n);function n(){return Object(s.a)(this,n),t.apply(this,arguments)}return Object(i.a)(n,[{key:"render",value:function(){var e=this;return Object(b.jsxs)(b.Fragment,{children:[Object(b.jsx)("section",{id:"home",className:"hero-section",children:Object(b.jsx)("div",{className:"container",children:Object(b.jsxs)("div",{className:"col-12 col-lg-10 p-3 mx-auto text-center big-white-modal d-flex flex-column justify-content-center align-items-center",children:[Object(b.jsx)("h2",{children:"We are creating your NFTs"}),Object(b.jsx)("h4",{children:"This could take a while..."}),Object(b.jsx)("p",{children:"We will email you when your NFTs are ready."}),Object(b.jsx)("div",{className:"row container nft-image-container mx-auto",children:Object(b.jsx)("div",{className:"col-5 col-lg-3 p-2 custom-preloader-container",children:Object(b.jsx)("div",{className:"custom-preloader",children:Object(b.jsx)("div",{className:"custom-preloader-inner",children:Object(b.jsxs)("div",{className:"custom-preloader-icon",children:[Object(b.jsx)("span",{}),Object(b.jsx)("span",{})]})})})})})]})})}),Object(b.jsx)("div",{className:"payment-modal",style:{visibility:"hidden"},children:Object(b.jsx)("div",{className:" container",children:Object(b.jsx)("div",{className:"row justify-content-center",children:Object(b.jsxs)("form",{className:"col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 payment-form p-5",children:[Object(b.jsxs)("div",{className:"col-12 mb-4",children:[Object(b.jsxs)("div",{className:"d-flex align-items-center justify-content-between mb-1",children:[Object(b.jsx)("label",{htmlFor:"userEmail",children:"Email"}),Object(b.jsx)("span",{className:"text-muted",children:"For receive the access to your NFTs images and metadata"})]}),Object(b.jsx)("input",{type:"email",name:"userEmail",id:"userEmail",className:"form-control custom",placeholder:"receivemynfts@nft.com"})]}),Object(b.jsxs)("div",{className:"col-12",children:[Object(b.jsxs)("div",{className:"d-flex align-items-center justify-content-between mb-1",children:[Object(b.jsx)("label",{htmlFor:"userEmail",children:"Payment"}),Object(b.jsx)("span",{className:"text-muted",children:"Because we need to eat"})]}),Object(b.jsx)("div",{className:"d-flex flex-column justify-content-center",children:Object(b.jsxs)("button",{type:"submit",className:"btn btn-lg theme-btn payment-button",onClick:function(){return e.pay()},children:[Object(b.jsx)("div",{className:"logo-container",id:"logo-container"}),"Metamask"]})})]})]})})})})]})}},{key:"componentDidMount",value:function(){var e=Object(v.a)(O.a.mark((function e(){return O.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:this.attachScripts(),this.loadNewNftImages();case 2:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"attachScripts",value:function(){var e=document.createElement("script");e.async=!0,e.src="/js/metamaskLogo.js",document.body.appendChild(e);var t=document.createElement("script");t.async=!0,t.src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js",document.body.appendChild(t)}},{key:"loadNewNftImages",value:function(){try{var e=0,t=setInterval((function(){fetch("/nft-creation/are-new-images",{method:"post",headers:{"Content-Type":"application/json"},body:JSON.stringify({userUuid:localStorage.getItem("userUuid")})}).then((function(e){return e.json()})).then((function(n){0===n.imagePaths.length&&++e>1003&&(localStorage.removeItem("userUuid"),clearInterval(t),f.a.fire({title:"Error",text:"Something went wrong. Please try again later.",icon:"error",confirmButtonText:"Ok"}).then((function(){window.location.href="/"})));var a=document.querySelector(".nft-image-container");if(3===a.querySelectorAll(".nft-image").length){var r=document.createElement("div");r.classList.add("custom-preloader"),r.setAttribute("style","width: 100% !important; height: 100% !important;"),r.innerHTML='\n                            <div class="">\n                                <div class="custom-preloader-icon" style="position: relative; right: 50px;">\n                                    <span></span>\n                                    <span></span>\n                                </div>\n                            </div>';var c=document.createElement("div");return c.classList.add("col-5","col-lg-3","p-2","m-auto"),c.appendChild(r),a.appendChild(c),console.log(a),clearInterval(t),void(document.querySelector(".payment-modal").style.visibility="visible")}var o="";if(console.log({data:n}),n.imagePaths[0]&&0===a.querySelectorAll(".nft-image").length)o=n.imagePaths[0];else if(n.imagePaths[1]&&1===a.querySelectorAll(".nft-image").length)o=n.imagePaths[1];else{if(!n.imagePaths[2]||2!==a.querySelectorAll(".nft-image").length)return;o=n.imagePaths[2]}var s=document.createElement("img");s.classList.add("nft-image"),s.src=o;var i=document.createElement("div");i.classList.add("col-5","col-lg-3","p-2"),i.appendChild(s),a.appendChild(i);var l=document.querySelector(".custom-preloader-container");l&&l.parentNode.removeChild(l)})).catch((function(e){console.log(e)}))}),3e3)}catch(n){console.log(n)}document.querySelector(".payment-form").addEventListener("submit",(function(e){e.preventDefault()}))}},{key:"pay",value:function(){var e=Object(v.a)(O.a.mark((function e(){var t,n,a,r;return O.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t=localStorage.getItem("userUuid")){e.next=4;break}return e.next=4,f.a.fire("Oops...","You need to start again, please!","error").then((function(){window.location.href="/"}));case 4:return e.prev=4,e.next=7,window.ethereum.enable();case 7:return e.next=9,window.ethereum.request({method:"eth_requestAccounts"});case 9:return n=e.sent,a=n[0],r=this,e.t2=fetch("/api/v1/auth/".concat(a),{method:"get",headers:{"Content-Type":"application/json"}}).then((function(e){return e.json()})).then(function(){var e=Object(v.a)(O.a.mark((function e(n){return O.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!n){e.next=6;break}return e.next=3,r.handleSignup(a,t);case 3:return e.abrupt("return",e.sent);case 6:return e.next=8,f.a.fire("Oops...","You need to start again, please!","error").then((function(){window.location.reload()}));case 8:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()),e.next=15,r.handleSignMessage;case 15:return e.t3=e.sent,e.t1=e.t2.then.call(e.t2,e.t3),e.next=19,r.handleAuthentication;case 19:return e.t4=e.sent,e.t0=e.t1.then.call(e.t1,e.t4),e.next=23,r.transaction;case 23:return e.t5=e.sent,e.next=26,e.t0.then.call(e.t0,e.t5).catch((function(e){console.log(e)}));case 26:e.next=33;break;case 28:e.prev=28,e.t6=e.catch(4),console.log(e.t6),console.log(e.t6.code),console.log(e.t6.message);case 33:case"end":return e.stop()}}),e,this,[[4,28]])})));return function(){return e.apply(this,arguments)}}()},{key:"handleSignup",value:function(){var e=Object(v.a)(O.a.mark((function e(t,n){return O.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t&&n){e.next=2;break}return e.abrupt("return",f.a.fire("Oops...","Something went wrong, please try again!","error").then((function(){window.location.reload()})));case 2:return console.log("handleSignup"),console.log({publicAddress:t,userUuid:n}),console.log("handleSignup"),e.next=7,fetch("/api/v1/auth/create",{body:JSON.stringify({publicAddress:t,userUuid:n}),headers:{"Content-Type":"application/json"},method:"POST"}).then((function(e){return e.json()})).then(function(){var e=Object(v.a)(O.a.mark((function e(t){return O.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log({data:t}),e.next=3,t;case 3:if(!e.sent){e.next=7;break}return e.abrupt("return",{publicAddress:t.user.publicAddress,nonce:t.user.nonce});case 7:return e.next=9,f.a.fire("Oops...","You need to start again, please!","error").then((function(){window.location.reload()}));case 9:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()).catch((function(e){return console.log(e),{success:!1}}));case 7:return e.abrupt("return",e.sent);case 8:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}()},{key:"handleSignMessage",value:function(){var e=Object(v.a)(O.a.mark((function e(t){var n,a,r;return O.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=t.publicAddress,a=t.nonce,n&&a){e.next=3;break}return e.abrupt("return",f.a.fire("Oops...","Something went wrong, please try again!","error").then((function(){window.location.href="/"})));case 3:return console.log("handleSignMessage"),console.log({publicAddress:n,nonce:a}),console.log("handleSignMessage"),r="\n        Welcome to NFT Creator!\n        You are signing in with this nonce: ".concat(a,"\n        this will change after a successful login for\n        security reasons."),e.next=9,window.ethereum.request({method:"personal_sign",params:[r,n]}).then((function(e){return console.log({publicAddress:n,nonce:a,signature:e}),{publicAddress:n,nonce:a,signature:e,msg:r}})).catch((function(e){return console.log(e),{success:!1}}));case 9:return e.abrupt("return",e.sent);case 10:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()},{key:"handleAuthentication",value:function(){var e=Object(v.a)(O.a.mark((function e(t){var n,a,r,c;return O.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=t.publicAddress,a=t.nonce,r=t.signature,c=t.msg,n&&a&&r&&c){e.next=3;break}return e.abrupt("return",f.a.fire("Oops...","Something went wrong, please try again!","error").then((function(){window.location.reload()})));case 3:return console.log("handleAuthentication"),console.log({publicAddress:n,nonce:a,signature:r}),console.log("handleAuthentication"),e.next=8,fetch("/api/v1/auth/authenticate",{body:JSON.stringify({publicAddress:n,nonce:a,signature:r,msg:c}),headers:{"Content-Type":"application/json"},method:"POST"}).then((function(e){return e.json()})).then(function(){var e=Object(v.a)(O.a.mark((function e(t){return O.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(console.log("handleAuthentication response"),console.log(t),console.log("handleAuthentication response"),!t.success){e.next=7;break}return e.abrupt("return",{publicAddress:n,userUuid:t.user.uuid});case 7:console.log(t);case 8:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}());case 8:return e.abrupt("return",e.sent);case 9:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()},{key:"transaction",value:function(){var e=Object(v.a)(O.a.mark((function e(t){var n,a,r,c;return O.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=t.publicAddress,a=t.userUuid,n&&a){e.next=3;break}return e.abrupt("return",f.a.fire("Oops...","Something went wrong, please try again!","error").then((function(){window.location.reload()})));case 3:if(console.log("transaction"),console.log({publicAddress:n,userUuid:a}),n&&a){e.next=7;break}return e.abrupt("return",f.a.fire("Oops...","You need to start again, please!","error").then((function(){window.location.href="/"})));case 7:if(console.log("transaction"),!window.ethereum){e.next=20;break}return r=h.a.utils.toWei("0.00002","ether"),console.log(r),e.next=13,window.ethereum.request({method:"eth_gasPrice"});case 13:c=e.sent,console.log("gas price"),console.log({gasPrice:c}),console.log("gas price"),window.ethereum.request({method:"eth_sendTransaction",params:[{from:n,to:"0x2479c5E000b275FA758882c973b565823b2eaeC4",value:"0x".concat(r),gasPrice:"0x09184e72a000",gas:"0x5208"}]}).then((function(e){console.log("txHash"),console.log(e),console.log("txHash"),window.location.href="/user/area/"+a})).catch((function(e){return console.error})),e.next=21;break;case 20:f.a.fire({title:"Please install MetaMask",html:'<a href="https://metamask.io/">Install MetaMask</a>',icon:"warning",showConfirmButton:!1});case 21:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()}]),n}(d.Component)),N=w,k=n(204),S=n.n(k),A=function(){return Object(b.jsx)("div",{className:S.a.UserArea,children:"UserArea Component"})};A.defaultProps={};var C=A;function E(){return Object(b.jsx)(c.a,{children:Object(b.jsx)(o.d,{children:Object(b.jsxs)(o.b,{path:"/",element:Object(b.jsx)(x,{}),children:[Object(b.jsx)(o.b,{path:"/nft-creation/confirmed",element:Object(b.jsx)(N,{})}),Object(b.jsx)(o.b,{path:"/react/user/area",element:Object(b.jsx)(C,{})})]})})})}r.a.render(Object(b.jsx)(E,{}),document.getElementById("root"))}},[[502,1,2]]]);
//# sourceMappingURL=main.aa481618.chunk.js.map