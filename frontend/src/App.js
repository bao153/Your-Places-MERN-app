import React, { useState, useCallback, useEffect } from "react";
import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Switch,
} from "react-router-dom";

import Users from "./user/pages/Users";
import NewPlace from "./places/pages/NewPlace";
import UserPlaces from "./places/pages/UserPlaces";
import UpdatePlace from "./places/pages/UpdatePlace";
import Auth from "./user/pages/Authenticate";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import { AuthContext } from "./shared/context/auth-context";

let logoutTimerId;

const App = () => {
    const [token, setToken] = useState(false);
    const [tokenExpirationDate, setTokenExpirationDate] = useState();
    const [userId, setUserId] = useState(null);

    // const loadGoogleMapScript = (url) => {
    //     const index = window.document.getElementsByTagName('script')[0];
    //     let script = window.document.createElement('script');
    //     script.src = url;
    //     script.async = true;
    //     script.defer = true;
    //     index.parentNode.insertBefore(script, index);
    // }

    useEffect(() => {
        const index = window.document.getElementsByTagName('script')[0];
        let script = window.document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`;
        script.async = true;
        script.defer = true;
        index.parentNode.insertBefore(script, index);
    }, []);

    const login = useCallback((uid, token, expirationDate) => {
        setToken(token);
        setUserId(uid);
        const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
        setTokenExpirationDate(tokenExpirationDate);
        localStorage.setItem('userData', JSON.stringify({
            userId: uid,
            token: token,
            expiration: tokenExpirationDate.toISOString()
        }));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setTokenExpirationDate(null);
        setUserId(null);
        localStorage.removeItem('userData');
    }, []);

    useEffect(() => {
        if (token && tokenExpirationDate) {
            const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
            logoutTimerId = setTimeout(logout, remainingTime);
        } else {
            clearTimeout(logoutTimerId);
        }
    }, [token, logout, tokenExpirationDate]);

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('userData'));
        if (storedData && storedData.token && new Date(storedData.expiration) > new Date()) {
            login(storedData.userId, storedData.token, new Date(storedData.expiration));
        }
    }, [login]);

    let routes;

    if (token) {
        routes = (
            <Switch>
                <Route path="/" exact>
                    <Users />
                </Route>

                <Route path="/:userId/places" exact>
                    <UserPlaces />
                </Route>

                <Route path="/places/new" exact>
                    <NewPlace />
                </Route>

                <Route path="/places/:placeId">
                    <UpdatePlace />
                </Route>

                <Redirect to="/" />
            </Switch>
        );
    } else {
        routes = (
            <Switch>
                <Route path="/" exact>
                    <Users />
                </Route>

                <Route path="/:userId/places" exact>
                    <UserPlaces />
                </Route>

                <Route path="/auth">
                    <Auth />
                </Route>

                <Redirect to="/auth" />
            </Switch>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!token,
                token: token,
                userId: userId,
                login: login,
                logout: logout,
            }}
        >
            <Router>
                <MainNavigation />
                <main>{routes}</main>
            </Router>
        </AuthContext.Provider>
    );
};

export default App;
