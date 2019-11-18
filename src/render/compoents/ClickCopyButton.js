import React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { clipboard } from "../module/utils";
import Tooltip from '@material-ui/core/Tooltip';
import FileCopyOutlined from '@material-ui/icons/FileCopyOutlined';

const styles = theme => ({
    copyStyle: {
        color: "#247993",
        cursor: 'pointer',
        fontSize: '1.2em',
        marginLeft: theme.spacing(1),
        verticalAlign: 'middle',
    },
});

export default withStyles(styles)(function (props) {
    const { text, onCopyClick, classes, style } = props;
    return <Tooltip placement="right" title="点击复制" style={style} className={props.className}>
        <FileCopyOutlined className={classes.copyStyle}
            onClick={() => {
                clipboard.writeText(text);
                onCopyClick(text);
            }} />
    </Tooltip>
})