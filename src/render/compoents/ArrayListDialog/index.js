/* eslint-disable react/no-multi-comp */

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import blue from '@material-ui/core/colors/blue';

const styles = theme => ({
    avatar: {
        backgroundColor: blue[100],
        color: blue[600],
    },
});

class ArrayListDialog extends React.Component {

    render() {
        const { classes, onClose, list, title, ...other } = this.props;
        return (
            <Dialog
                fullWidth
                onClose={this.handleClose} aria-labelledby="simple-dialog-title" {...other}>
                <DialogTitle id="simple-dialog-title">{title}</DialogTitle>
                <div>
                    <List>
                        {list.map((option, index) => (
                            <ListItem button onClick={() => this.handleListItemClick(option, index)} key={option}>
                                <ListItemText primary={option} />
                            </ListItem>
                        ))}
                    </List>
                </div>
            </Dialog>
        );
    }

    handleClose = () => {
        this.props.onClose(undefined, -1);
    };

    handleListItemClick = (value, index) => {
        this.props.onClose(value, index);
    };
}

ArrayListDialog.propTypes = {
    classes: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    title: PropTypes.string.isRequired,
    list: PropTypes.array.isRequired,
};

export default withStyles(styles)(ArrayListDialog);