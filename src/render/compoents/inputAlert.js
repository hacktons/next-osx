import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const styles = theme => ({
    root: {
    }
});

class InputAlertDialog extends React.Component {
    state = {
        open: false,
        input_value: ''
    };

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
        this.props.onClose();
    };

    handleConfirm = () => {
        this.setState({ open: false });
        this.props.onConfirm(this.state.input_value);
    };

    handleChange = (event) => {
        this.setState({
            input_value: event.target.value
        });
    };

    render() {
        let { classes, title, description, open } = this.props;
        return (
            <div>
                <Dialog
                    fullWidth
                    className={classes.root}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                    open={open}
                >
                    <DialogTitle id="form-dialog-title">{title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {description}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="请输入..."
                            onChange={this.handleChange}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            取消
                        </Button>
                        <Button onClick={this.handleConfirm} color="primary">
                            确认
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

InputAlertDialog.propTypes = {
    classes: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
}

export default withStyles(styles)(InputAlertDialog);