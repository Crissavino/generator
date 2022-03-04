// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
// import Header from "./partials/Header/Header";
//
// ReactDOM.render(
//   <React.StrictMode>
//       <Header />
//     {/*<App />*/}
//   </React.StrictMode>,
//   document.getElementById('root')
// );
//
// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout/Layout";
import NftCreationConfirmed from "./pages/NftCreationConfirmed/NftCreationConfirmed";
import UserArea from "./pages/UserArea/UserArea";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="/react/nft-creation/confirmed" element={<NftCreationConfirmed />} />
                    <Route path="/react/user/area" element={<UserArea />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));