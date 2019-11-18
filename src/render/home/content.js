import React from 'react';
import Loadable from 'react-loadable';
import LoadingPage from "../compoents/loadingPage";
import PropTypes from 'prop-types';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';

const theme = createMuiTheme({
    palette: {
        primary: blueGrey,
        secondary: {
            main: blueGrey[500],
        },
    },
});

const Loading = () => <LoadingPage />;

const PageHelp = Loadable({
    loader: () => import('../pageHelp'),
    loading: Loading,
})
const PageWBMain = Loadable({
    loader: () => import('../wbmain/index'),
    loading: Loading,
})

const PageScan = Loadable({
    loader: () => import('../scan/index'),
    loading: Loading,
})

const PageADB = Loadable({
    loader: () => import('../adb/index'),
    loading: Loading,
})

const PageWubaApp = Loadable({
    loader: () => import('../wuba-app/index'),
    loading: Loading,
})

const PageSetting = Loadable({
    loader: () => import('../setting/index'),
    loading: Loading,
})

const MENU = {
    App58: 1,
    WBMAIN: 3,
    SCAN_ASSETS: 4,
    ADB: 5,
    SETTING:6,
}

/**
 * 内容面板，与菜单栏通过索引位置映射
 */
class MainContentPage extends React.Component {

    render() {
        let Content = this.content
        return <MuiThemeProvider theme={theme}>
            <Content />
        </MuiThemeProvider>
    }

    content = () => {
        switch (this.props.index) {
            case MENU.App58:
                return (<PageWubaApp />);
            case MENU.WBMAIN:
                return (<PageWBMain />);
            case MENU.SCAN_ASSETS:
                return (<PageScan />);
            case MENU.ADB:
                return (<PageADB />);
            case MENU.SETTING:
                return (<PageSetting/>)
        }
        return (<PageHelp />);
    }
}

MainContentPage.propTypes = {
    index: PropTypes.number.isRequired,
};
export default MainContentPage;
