import { Outlet, Link } from "react-router-dom";
import Header from "../../partials/Header/Header";

const Layout = () => {
    return (
        <>
            <Header/>

            <Outlet />
        </>
    )
};

export default Layout;