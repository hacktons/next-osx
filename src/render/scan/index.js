import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { selectFile } from "../ipc/fileSelector";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Snackbar from "../compoents/snackbar";
import AlertDilaog from '../compoents/ArrayListDialog';
import InputDialog from '../compoents/inputAlert';
import { download } from "../module/utils";
import { cachedir, file } from "../module/context";
import { unzipFile } from "../module/zip";
import path from 'path';

const shell = require('electron').shell
const fs = require('fs');

const styles = theme => ({
    container: {
        width: '100%',
        height: '100%',
        overflow: 'auto',
    },
    button: {
        margin: 10,
    },
    radioLayout: {
        marginLeft: 10,
        marginRight: 10,
    },
    progress: {
        height: '10px',
        marginLeft: 10,
        marginRight: 10,
    },
    list: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    avatar: {
        width: 30,
        height: 30,
    },
});
// 0 初始化， 1 下载json， 2 下载图片，3 内置到工程目录 4 成功完成 5 失败结束
const STATE_INIT = 0;
const STATE_COMPLETE_SUCCESS = 4;
const STATE_COMPLETE_FAILED = 5;
const options = ['浏览本地文件', '输入远程安装包地址'];

class PageScan extends React.Component {

    state = {
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
        selectedValue: 'a',
        dpis: [
            'hdpi',
            'xhdpi',
            'xxhdpi',
            'xxhdpi',
        ]
    }

    handleChange = event => {
        this.setState({ selectedValue: event.target.value });
    };

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
            {this.state.snackbar && <Snackbar
                open={this.state.snackbar.open}
                variant={this.state.snackbar.variant}
                message={this.state.snackbar.message}
                onClose={this.handleClose} />}
            {this.state.data && this.orderList(this.state.data).map((section, i) => {
                let title = i == 0 ? '内存泄漏' : (i == 2 ? '大图片' : '大尺寸');
                return <List className={classes.list} subheader={<ListSubheader>{`${title}/${section.length}`}</ListSubheader>} key={'section_' + i}>
                    {section.map((value, index) => (
                        <ListItem
                            key={index}
                            role={undefined}
                            onClick={this.openFile(value)}
                            dense
                            button
                        >
                            <Avatar src={value.name} className={classes.avatar} />
                            <ListItemText primary={value.name} secondary={'大小：' + new Number(value.size / 1024).toFixed(1) + 'KB    像素：' + value.width + ' x ' + value.height + ''} />
                        </ListItem>
                    ))}
                </List>
            })}
        </div>
        )
    }

    orderList = (data) => {
        let array1 = data.filter(it => {
            return it.type == 1;
        });
        array1 = array1.sort((left, right) => {
            return right.size - left.size;
        })

        let array2 = data.filter(it => {
            return it.type == 2;
        });
        array2 = array2.sort((left, right) => {
            return right.width * right.height - left.width * left.height;
        })
        let array3 = data.filter(it => {
            return it.type == 3;
        });
        array3 = array3.sort((left, right) => {
            return right.width * right.height - left.width * left.height;
        })
        // 内存泄漏，大文件，大尺寸
        return [array3, array1, array2];
    }

    openFile = ele => () => {
        let value = ele.name;
        // 打开外部
        shell.openItem(value);
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
            com.setState({
                snackbar: {
                    open: true,
                    variant: "info",
                    message: '下载安装包...',
                }
            });
            download(this.state.input_apk_path, file(cachedir(), 'app.apk')).then(des => {
                com.setState({
                    snackbar: {
                        open: true,
                        variant: "success",
                        message: '下载完成，开始检测',
                    }
                });
                com.scan(des);
            }).catch(err => {
                console.error(err);
                com.setState({
                    snackbar: {
                        open: true,
                        variant: "error",
                        message: `下载失败: ${err}`,
                    },
                    loading: false,
                });
            });
        } else {
            com.scan(this.state.selected_path);
        }
    }

    updateConsole = (msg) => {
        console.log(msg)
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
        this.setState({
            open_alert: true
        });
    }

    scan = (src) => {
        let com = this;
        let dir = (src.indexOf('.apk') >= 0 ? src.substring(0, src.length - 4) : src) + "-extract-" + new Date().getMilliseconds();
        fs.mkdirSync(dir);
        unzipFile(src, dir).then(() => {
            console.log('unzip done');
            const scriptsDir = path.resolve(__dirname);
            const backgroundImageScanJs = path.resolve(scriptsDir, 'backgroundImageScan.js');
            const worker = new Worker(backgroundImageScanJs)
            worker.postMessage({ dir: dir, config: { oomBytes: 5 * 1024 * 1024, oomDpi: 480 } })
            worker.onmessage = e => {
                const data = e.data;
                console.log('receive work result', data)
                com.setState({
                    operation_state: STATE_COMPLETE_SUCCESS,
                    loading: false,
                    data: data,
                });
                worker.terminate();
            }
        }).catch(err => {
            com.setState({
                operation_state: STATE_COMPLETE_FAILED,
                loading: false,
                snackbar: {
                    open: true,
                    variant: 'error',
                    message: '解压失败，请检查装包:' + src,
                },
            });
            worker.terminate();
        })
    }
}

export default withStyles(styles)(PageScan);