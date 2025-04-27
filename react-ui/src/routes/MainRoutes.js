import React, { lazy } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';

// project imports
import MainLayout from './../layout/MainLayout';
import Loadable from '../ui-component/Loadable';
import AuthGuard from './../utils/route-guard/AuthGuard';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('../views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('../views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('../views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('../views/utilities/Shadow')));
const UtilsMaterialIcons = Loadable(lazy(() => import('../views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('../views/utilities/TablerIcons')));

// sample page routing
const FFTPage = Loadable(lazy(() => import('../views/fft')));
const HHTPage = Loadable(lazy(() => import('../views/hht')));
const SimulateSignalPage = Loadable(lazy(() => import('../views/simulateSignal')));
const SamplePage = Loadable(lazy(() => import('../views/hhsa')));



//-----------------------|| MAIN ROUTING ||-----------------------//

const MainRoutes = () => {
    const location = useLocation();

    return (
        <Route
            path={[
                '/dashboard/default',
                '/utils/util-typography',
                '/utils/util-color',
                '/utils/util-shadow',
                '/icons/tabler-icons',
                '/icons/material-icons',
                '/fft',
                '/hht',
                '/hhsa',
                '/simulateSignal',  
            ]}
        >
            <MainLayout>
                <Switch location={location} key={location.pathname}>
                    <Route path="/dashboard/default" component={DashboardDefault} />

                    <AuthGuard>
                        <Route path="/utils/util-typography" component={UtilsTypography} />
                        <Route path="/utils/util-color" component={UtilsColor} />
                        <Route path="/utils/util-shadow" component={UtilsShadow} />
                        <Route path="/icons/tabler-icons" component={UtilsTablerIcons} />
                        <Route path="/icons/material-icons" component={UtilsMaterialIcons} />
                        <Route path="/fft" component={FFTPage} />
                        <Route path="/hht" component={HHTPage} />
                        <Route path="/simulateSignal" component={SimulateSignalPage} />
                        <Route path="/hhsa" component={SamplePage} />
                        
                    </AuthGuard>
                </Switch>
            </MainLayout>
        </Route>
    );
};

export default MainRoutes;
