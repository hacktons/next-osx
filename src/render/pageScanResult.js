import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import DoneIcon from '@material-ui/icons/Done';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

const styles = theme => ({
    root: {
        width: `calc(100% - ${20}px)`,
        marginTop: theme.spacing(1),
        overflow: 'auto',
        marginLeft: 10,
        marginRight:10,
    },
    table_wrapper: {
        overflowX: 'auto',
        height: 400,
    },
    table: {
        minWidth: 500,
    },
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    },
    cell: {
        padding: '4px 24px 4px 24px;',
    },
    border: {
        borderRight: '1px solid rgba(224, 224, 224, 1)',
    },
    index: {
        width: '50px',
    },
    header: {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.common.white,
    },
    center_cell: {
        display: 'flex',
        justifyContent: 'space-between',
    }
});

function createData(name, value) {
    return { name: name, value: value };
}
function CustomizedTable(props) {
    const { classes, data } = props;
    const info = [
        createData('安装包', data.file),
        createData('时间', data.time_scan),
        createData('sha1', data.sha1),
        createData('耗时/s', data.time_consumed),
    ];
    const list = data.data;
    return (
        <Paper className={classes.root}>
            <Toolbar className={classes.header} variant="dense">
                <Typography variant="title" color="inherit">
                    检测报告
                </Typography>
            </Toolbar>
            <div className={classes.table_wrapper}>
                <Table className={classes.table}>
                    <TableBody>
                        {info.map((row, index) => {
                            return (
                                <TableRow key={index}>
                                    <CustomTableCell className={classNames(classes.index, classes.cell, classes.border, classes.row)}>
                                        {row.name}
                                    </CustomTableCell>
                                    <CustomTableCell>{row.value}</CustomTableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                <Table className={classes.table}>
                    <TableBody>
                        {list.map((row, index) => {
                            const matchIcon = (row) => {
                                if (row.value === '58585858') {
                                    return row.hit ? <DoneIcon color='primary' /> : <ErrorOutlineIcon color='error' />
                                } else {
                                    return row.hit ? <ErrorOutlineIcon color='error' /> : <DoneIcon color='primary' />;
                                }
                            }
                            return (
                                <TableRow className={classes.row} key={index} hover>
                                    <CustomTableCell>
                                        <div className={classes.center_cell}>
                                            {`${index + 1}. ${row.description}`}
                                            {matchIcon(row)}
                                        </div>
                                    </CustomTableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </Paper>
    );
}

CustomizedTable.propTypes = {
    classes: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
};

export default withStyles(styles)(CustomizedTable);
