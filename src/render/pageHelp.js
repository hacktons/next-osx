import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import PageHelpScan from "./pageHelpScan";
import PageHelpAssets from "./pageHelpAssets";
const styles = theme => ({
});

class Help extends React.Component {
    render() {
        return (
            <div>
                <Typography variant="headline">首页内置流程</Typography>
                <PageHelpAssets />
                <Typography variant="headline">安装包检测</Typography>
                <PageHelpScan />
            </div>
        );
    }
}
export default withStyles(styles)(Help);