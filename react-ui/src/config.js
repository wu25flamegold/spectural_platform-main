let BACKEND_SERVER = null;
if (process.env.REACT_APP_BACKEND_SERVER) {
  BACKEND_SERVER = process.env.REACT_APP_BACKEND_SERVER;
} else {
  BACKEND_SERVER = "http://xds3.cmbm.idv.tw:81/api/";
}

const config = {
    basename: '',
    defaultPath: '/dashboard/default',
    fontFamily: `'Roboto', sans-serif`,
    borderRadius: 12,
    API_SERVER: BACKEND_SERVER
};

export default config;
