import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import GavelIcon from '@material-ui/icons/Gavel';
import FolderIcon from "@material-ui/icons/Folder";
import LinearProgress from '@material-ui/core/LinearProgress';
import { selectFile } from "./ipc/fileSelector";
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import appRootDir from 'app-root-dir';

import Snackbar from "./compoents/snackbar";
import ScanResult from "./pageScanResult";
import ConsoleArea from "./compoents/consoleArea";
import AlertDilaog from './compoents/ArrayListDialog';
import InputDialog from './compoents/inputAlert';
import { download } from "./module/utils";
import { cachedir, file } from "./module/context";
const remote = require('electron').remote;
const electronFs = remote.require('fs');
const os = require('os');
const path = require('path');
const { execFile } = remote.require('child_process');

const styles = theme => ({
    container: {
        width: '100%',
        height: '100%',
        overflow: 'auto',
    },
    button: {
        margin: 10,
    },
    rightIcon: {
        marginLeft: theme.spacing(1),
    },
    absolute: {
        position: 'absolute',
        right: theme.spacing(1),
    },
    progress: {
        height: '10px',
        marginLeft: 10,
        marginRight: 10,
    },
    wrapper: {
        overflowY: 'auto',
        height: 680,
    },
    console_log: "",
});

// 0 初始化， 1 下载json， 2 下载图片，3 内置到工程目录 4 成功完成 5 失败结束
const STATE_INIT = 0;
const STATE_COMPLETE_SUCCESS = 4;
const STATE_COMPLETE_FAILED = 5;
const options = ['浏览本地文件', '输入远程安装包地址'];

class AppScanner extends React.Component {

    state = {
        console_log: "",
        operation_state: STATE_INIT,
        selected_path: "",
        snackbar: {
            open: false,
            variant: "info",
            message: "This is a success message",
        },
        open_alert: false,
        selectedValue: options[1],
        open_input_apk: false,
        input_apk_path: '',
    };

    constructor(props) {
        super(props);
    }

    render() {
        console.log('reander page scanner')
        const { classes } = this.props;
        var loading;
        if (this.state.loading) {
            loading = <LinearProgress className={classes.progress} />;
        } else if (this.state.operation_state === STATE_COMPLETE_SUCCESS) {
            loading = <LinearProgress variant="determinate" value={100} className={classes.progress} />
        } else {
            loading = <LinearProgress variant="determinate" value={0} className={classes.progress} />
        }
        // TODO
        // getDimensions('/Users/aven/Desktop/leading_bg_1.png').then(dimensions => {
        //     console.log(dimensions.width, dimensions.height);
        // });
        return (<div className={classes.container}>
            <div>
                <Button size="small" variant="outlined" className={classes.button} color="secondary"
                    disabled={this.state.loading}
                    onClick={this.handleClickScan}>
                    开始检测
                </Button>
                <Button size="small" variant="outlined" className={classes.button} color="secondary"
                    onClick={this.handleFileSelectClick}>
                    选择安装包
                </Button>
            </div>
            {loading}
            <div>
                <Tooltip title="清空日志" placement="left">
                    <IconButton aria-label="Delete" className={classes.absolute} onClick={this.handleClearClick}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
                <ConsoleArea text={this.state.console_log} />
            </div>
            {this.state.open_alert && <AlertDilaog
                open={this.state.open_alert}
                onClose={this.handleCloseAlert}
                title="选择方式"
                list={options}
            />}
            {this.state.open_input_apk && <InputDialog
                open={this.state.open_input_apk}
                title="输入安装包"
                description="在下方输入安装包的URL地址"
                onClose={this.handleCloseInput}
                onConfirm={this.handleConfirmInput} />
            }
            {this.state.scan_result && <ScanResult data={this.state.scan_result} />}
            {this.state.snackbar && <Snackbar
                open={this.state.snackbar.open}
                variant={this.state.snackbar.variant}
                message={this.state.snackbar.message}
                onClose={this.handleClose} />}
        </div>
        )
    }

    handleClick = () => {
        this.setState({
            snackbar: {
                open: true,
                variant: "success",
                message: "This is a success message",
            }
        });
    };

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        const snackbar = this.state.snackbar;
        snackbar.open = false;
        this.setState({ snackbar: snackbar });
    };

    handleClickScan = () => {
        console.log('click scan')
        if (!this.state.selected_path && !this.state.input_apk_path) {
            this.setState({
                snackbar: {
                    open: true,
                    variant: "info",
                    message: "请先选择安装包",
                }
            })
            this.updateConsole('请先选择安装包!');
            return;
        }
        this.setState({
            loading: true,
        })
        const com = this;
        if (this.state.input_apk_path && this.state.input_apk_path !== '') {
            com.updateConsole('下载安装包...');
            download(this.state.input_apk_path, file(cachedir(), 'app.apk')).then(des => {
                com.updateConsole(`下载完成：${des}`);
                com.scan(des);
            }).catch(err => {
                com.updateConsole(`下载失败: ${err}`);
                console.error(err);
                this.setState({
                    snackbar: {
                        open: true,
                        variant: "error",
                        message: `下载失败: ${err}`,
                    }
                })
            });
        } else {
            com.scan(this.state.selected_path);
        }
    }

    scan = (desFile) => {
        const com = this;
        this.updateConsole(`安装包:${desFile}`);
        this.updateConsole('开始检测...');
        const binPath = path.join(appRootDir.get(), 'assets/bin/apkscanner-darwin');
        const keywordPath = path.join(appRootDir.get(), 'assets/bin/keywords.json');
        const outputPath = path.join(os.tmpdir(), 'report.json');
        const args = ['-j', keywordPath, '-p', `${desFile}`, '-o', outputPath];
        this.updateConsole(`tmp dir is ${os.tmpdir()}`)
        execFile(binPath, args, { cwd: os.tmpdir() }, (error, stdout, stderr) => {
            com.setState({
                loading: false,
                operation_state: STATE_COMPLETE_SUCCESS
            })
            if (error) {
                console.error(`${error}`);
                com.updateConsole(`${error}`);
                com.setState({
                    snackbar: {
                        open: true,
                        variant: "error",
                        message: "安装检测失败，请查看日志",
                    }
                })
                return;
            }
            stdout && com.updateConsole(`安装检测完成，请查看日志:\n${stdout}`);
            stderr && com.updateConsole(`安装检测失败，请查看日志:\n${stderr}`);
            electronFs.readFile(outputPath, (err, data) => {
                if (err) {
                    com.updateConsole(`exec error: ${err}`);
                    com.setState({
                        snackbar: {
                            open: true,
                            variant: "error",
                            message: "读取报告失败，请查看日志",
                        }
                    })
                    return;
                }
                com.setState({
                    scan_result: JSON.parse(new String(data))
                })
            });
            com.setState({
                snackbar: {
                    open: true,
                    variant: "success",
                    message: "安装检测完成，请查看日志",
                }
            })
        });
    }
    handleCloseAlert = (value, index) => {
        if (index < 0) {
            this.setState({ open_alert: false });
            return;
        }
        this.setState({ selectedValue: value, open_alert: false });
        if (index === 0) {
            const com = this;
            selectFile((filePath) => {
                console.log(`file selected ${filePath}`);
                com.updateConsole(`选择文件 ${filePath[0]}`);
                if (filePath[0].endsWith(".apk")) {
                    com.setState({
                        selected_path: filePath[0],
                        input_apk_path: '',
                    })
                } else {
                    com.setState({
                        snackbar: {
                            open: true,
                            variant: "error",
                            message: "文件不支持，请选择Android安装包！",
                        }
                    });
                }
            });
        } else if (index == 1) {
            this.setState({
                open_input_apk: true,
            });
        }
    };

    handleCloseInput = () => {
        this.setState({
            open_input_apk: false,
        })
    }

    handleConfirmInput = (value) => {
        if (value === '' || !value) {
            this.setState({
                open_input_apk: false,
                input_apk_path: '',
                snackbar: {
                    open: true,
                    variant: 'error',
                    message: '没有输入安装包地址',
                },
            })
            return;
        }
        if (!value.startsWith('http')) {
            this.setState({
                open_input_apk: false,
                input_apk_path: '',
                snackbar: {
                    open: true,
                    variant: 'error',
                    message: 'URL格式不正确',
                },
            })
            return;
        }

        this.setState({
            input_apk_path: value,
            open_input_apk: false,
            selected_path: '',
        })
        this.updateConsole(`输入地址\n${value}`);
    }
    /**
     * 处理目录选择动作
     */
    handleFileSelectClick = () => {
        if (true) {
            // let url = 'http://10.9.188.58:9999/release_apk/35/58client_v8.10.1_58585858_20180905_13.51_release.apk'
            // download(url, '/Users/aven/Desktop/temp.apk').then((data)=>{
            //     console.log('donwload completed');
            // })
            // return;
        }
        this.setState({
            open_alert: true
        });
    }

    handleClearClick = () => {
        console.log('reset console');
        this.setState({
            console_log: ""
        });
    }
    /**
    * 更新输出窗口内容
    */
    updateConsole = (log) => {
        this.setState((preState, pros) => {
            return { console_log: preState.console_log + "\n" + log }
        });
    }
}

AppScanner.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(AppScanner);