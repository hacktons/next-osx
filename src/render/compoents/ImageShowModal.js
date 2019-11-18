import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';

function rand() {
    return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
    const top = 50 + rand();
    const left = 50 + rand();

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles(theme => ({
    paper: {
        position: 'absolute',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        outline: 'none',
    },
    img: {
        width: '240px',
    }
}));

function SimpleModal({ source }) {
    const [open, setOpen] = React.useState(false);
    // getModalStyle is not a pure function, we roll the style only on the first render
    const [modalStyle] = React.useState(getModalStyle);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const classes = useStyles();

    if (!source) {
        source = {
            img: '/var/folders/_9/60pyz1lx0dd7yd3z_x6py25r0000gq/T/cn.hacktons.next/cache/device-2019-06-13-162033.png',
            title: "Hello World"
        }
    }

    return (
        <div>
            <Button onClick={handleOpen}>查看大图</Button>
            <Modal
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={open}
                onClose={handleClose}
            >
                <div style={modalStyle} className={classes.paper}>
                    <img src={source.img} alt={source.title} className={classes.img} />
                </div>
            </Modal>
        </div>
    );
}

export default SimpleModal;
