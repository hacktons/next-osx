import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = theme => ({
    console: {
        width: `calc(100% - ${20}px)`,
        minHeight: '200px',
        resize: 'none',
        margin:10,
    },
    absolute: {
        position: 'absolute',
        right: theme.spacing(3),
    },
});
/**
 * 日志展示控件，增补日志后需自动滑动至底部
 */
class ConsoleArea extends React.Component {

    constructor(props) {
        super(props);
        this.consoleRef = React.createRef();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let com = this;
        if (prevProps.text === this.props.text) {
            console.log('skip dupliacated log');
            return;
        }
        setTimeout(() => {
            if (com.consoleRef.current) {
                com.consoleRef.current.scrollTop = com.consoleRef.current.scrollHeight
                console.log('scroll to bottom');
            }
        }, 100);
    }

    render() {
        let { classes, text } = this.props;
        return (
            <textarea ref={this.consoleRef} className={classes.console} value={text} readOnly />
        )
    }
}

ConsoleArea.propTypes = {
    classes: PropTypes.object.isRequired,
    text: PropTypes.string,
}

export default withStyles(styles)(ConsoleArea);