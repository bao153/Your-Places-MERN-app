import React, { useEffect } from "react";
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
import { useAuth } from './shared/hooks/auth-hook'

const App = () => {
    useEffect(() => {
        const index = window.document.getElementsByTagName('script')[0];
        let script = window.document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`;
        script.async = true;
        script.defer = true;
        index.parentNode.insertBefore(script, index);
    }, []);

    const { token, login, logout, userId } = useAuth();

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
