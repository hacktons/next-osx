import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Modal from '@material-ui/core/Modal';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';

function rand() {
    return 4;
    // return Math.round(Math.random() * 20) - 10;
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
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    gridList: {
        flexWrap: 'nowrap',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)',
    },
    title: {
        fontSize: '0.8rem',
    },
    titleBar: {
        background:
            'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
    paper: {
        position: 'absolute',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        outline: 'none',
    },
    img: {
        width: '250px',
    },
    arrow: {
        color: "#737475",
        fontSize: '4rem',
        cursor: 'pointer',
        marginBottom: '54%',
    }
}));

export default function HorizonalGallery({ source }) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    // getModalStyle is not a pure function, we roll the style only on the first render
    const [modalStyle] = React.useState(getModalStyle);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // selected index
    const [selectedImage, setSelectedImage] = React.useState(0);

    const handleImageClick = (img) => {
        handleOpen();
        setSelectedImage(img);
    }
    const selectedImageInfo = source[selectedImage];

    const handleImageNext = (step) => {
        setSelectedImage(selectedImage + step);
    }

    return (
        <div className={classes.root}>
            <GridList className={classes.gridList} cols={5.5}>
                {source.map((tile, index) => (
                    <GridListTile key={tile.img} onClick={() => { handleImageClick(index) }} style={{ cursor: 'pointer', }}>
                        <img src={tile.img} alt={tile.title} />
                        <GridListTileBar
                            title={tile.title}
                            classes={{
                                root: classes.titleBar,
                                title: classes.title,
                            }}
                            subtitle={<span>{tile.author}</span>}

                        />
                    </GridListTile>
                ))}
            </GridList>
            <Modal
                aria-labelledby="image-modal-title"
                aria-describedby="image-modal-description"
                open={open}
                onClose={handleClose}
            >
                <div style={modalStyle} className={classes.paper}>
                    {selectedImage != 0 ? <ChevronLeft className={classes.arrow} onClick={() => { handleImageNext(-1) }} /> : <ChevronLeft className={classes.arrow} style={{ opacity: 0 }} />}
                    {selectedImageInfo && <img src={selectedImageInfo.img} alt={selectedImageInfo.title} className={classes.img} />}
                    {selectedImage != source.length - 1 ? <ChevronRight className={classes.arrow} onClick={() => { handleImageNext(1) }} /> : <ChevronRight className={classes.arrow} style={{ opacity: 0 }} />}
                </div>
            </Modal>
        </div>
    );
}
