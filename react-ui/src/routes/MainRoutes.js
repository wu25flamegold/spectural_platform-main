import React, { lazy } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';

// project imports
import MainLayout from './../layout/MainLayout';
import Loadable from '../ui-component/Loadable';
import AuthGuard from './../utils/route-guard/AuthGuard';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('../views/dashboard/Default')));

// page routing
const SimulateSignalPage = Loadable(lazy(() => import('../views/simulateSignal')));
const HHSAPage = Loadable(lazy(() => import('../views/hhsa')));



//-----------------------|| MAIN ROUTING ||-----------------------//

const MainRoutes = () => {
    const location = useLocation();

    return (
        <Route
            path={[
                '/dashboard/default',
                '/hhsa',
                '/simulateSignal',  
            ]}
        >
            <MainLayout>
                <Switch location={location} key={location.pathname}>
                    <Route path="/dashboard/default" component={DashboardDefault} />
                    <AuthGuard>
                        <Route path="/simulateSignal" component={SimulateSignalPage} />
                        <Route path="/hhsa" component={HHSAPage} />
                    </AuthGuard>
                </Switch>
            </MainLayout>
        </Route>
    );
};

export default MainRoutes;
