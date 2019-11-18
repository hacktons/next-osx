import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core';

const styles = theme => ({
    progress: {
        margin: theme.spacing(2),
    },
});
class ResponsiveLoadingDialog extends React.Component {
    state = {
        open: true,
    };

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        if (this.props.dissmisOnOutSide) {
            this.setState({ open: false });
        }
    };

    render() {
        const { fullScreen, classes } = this.props;

        return (
            <div>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="responsive-dialog-title"
                >
                    <CircularProgress className={classes.progress} style={{ color: '#F9432B' }} thickness={7} />
                </Dialog>
            </div>
        );
    }
}

ResponsiveLoadingDialog.propTypes = {
    fullScreen: PropTypes.bool.isRequired,
    dissmisOnOutSide: PropTypes.bool,
};

const wraprer = withMobileDialog()(ResponsiveLoadingDialog);
export default withStyles(styles)(wraprer);
