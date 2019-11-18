import React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Controller from "./controller";
import Snackbar from "../compoents/snackbar";
import { shell } from 'electron';
import ClickCopyButton from "../compoents/ClickCopyButton";

const styles = theme => ({
    container: {
        width: '100%',
        height: '100%',
        overflow: 'auto',
    },
    firstColumn: {
        width: '10%',
    },
    marginHorizonal: {
        marginLeft: '10px',
        marginRight: '10px',
        width: `calc(100% - ${20}px)`
    },
    marginTop: {
        marginTop: '10px'
    },
    linkStyle: {
        color: '#468CC7',
        cursor: 'pointer',
        marginTop: '4px',
        fontSize: 12,
    },
    handPoniter: {
        cursor: 'pointer',
    },
    highlight: {
        color: '#fc605b'
    },
    appendIcon: {
        color: "#57acf5",
    }
});
class WubaApp extends React.Component {

    ctrl = new Controller();

    state = {
        version_input: '',
        channel_id_input: '',
        apk_links: [],
        qrcode: '',
        selected_link: undefined,
        snackbar: {
            open: false,
            variant: "info",
            message: "This is a success message",
        },
    }

    render() {
        const { classes } = this.props;

        return <div className={classes.container}>
            <h5 className="nav-group-title">版本号</h5>
            <input
                className={classNames('form-control', classes.marginHorizonal)}
                type="text"
                placeholder="如:8.20.0"
                onChange={this.handleInputVersionChnaged}
                value={this.state.version_input}></input>
            <h5 className="nav-group-title">渠道号</h5>
            <input
                className={classNames('form-control', classes.marginHorizonal)}
                type="text"
                placeholder="如:1"
                onChange={this.handleInputChannelIDChnaged}
                value={this.state.channel_id_input}></input>
            <span className={classNames(classes.marginHorizonal, classes.linkStyle)} onClick={this.openLink}>查找内测集成包？</span>
            <table className={classNames("table-striped", classes.marginTop)}>
                <thead>
                    <tr>
                        <th className={classes.firstColumn}>版本</th>
                        <th className={classes.firstColumn}>大小/MB</th>
                        <th className={classes.firstColumn}>类型</th>
                        <th>地址/点击生成二维码</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.apk_links.map((apk, i) => {
                        if (apk.data.link === this.state.selected_link) {
                            return <tr style={{ color: '#fc605b' }} key={i} onClick={(e) => { this.handleURLClick(apk.data.link) }}>
                                <td>{apk.version}</td>
                                <td>{apk.data.readableLength}</td>
                                <td>{apk.data.link.indexOf('_ab') > 0 ? '灰度包' : '全量包'}</td>
                                <td>{apk.data.short_link}<ClickCopyButton text={apk.data.link} onCopyClick={this.handleCopy2Clipboard} /></td>
                            </tr>
                        }
                        return <tr key={i} onClick={(e) => { this.handleURLClick(apk.data.link) }}>
                            <td>{apk.version}</td>
                            <td>{apk.data.readableLength}</td>
                            <td>{apk.data.link.indexOf('_ab') > 0 ? '灰度包' : '全量包'}</td>
                            <td>{apk.data.short_link}<ClickCopyButton text={apk.data.link} onCopyClick={this.handleCopy2Clipboard} /></td>
                        </tr>
                    })}
                </tbody>
            </table>
            {this.state.selected_link && <h5 className="nav-group-title" >扫一扫</h5>}
            {this.state.selected_link && <span dangerouslySetInnerHTML={{ __html: this.state.qrcode }} />}
            {this.state.snackbar && <Snackbar
                open={this.state.snackbar.open}
                variant={this.state.snackbar.variant}
                message={this.state.snackbar.message}
                onClose={this.handleSnackbarClose} />}
        </div>
    }

    handleInputVersionChnaged = (event) => {
        const version = event.target.value
        this.setState({
            version_input: version
        })
        this.updateLink();
    }

    handleInputChannelIDChnaged = (event) => {
        const channel = event.target.value
        this.setState({
            channel_id_input: channel
        })
        console.log(`channel id=${channel}`)
        this.updateLink();
    }
    /**
    * 关闭底部提示bar
    */
    handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        const snackbar = this.state.snackbar;
        snackbar.open = false;
        this.setState({ snackbar: snackbar });
    };

    /**
     * 输入变更后，自动检测潜在安装包地址，避免频率过高，添加500毫秒延时
     */
    linkTimer;
    updateLink = () => {
        if (this.linkTimer) {
            clearTimeout(this.linkTimer)
        }
        this.linkTimer = setTimeout(() => {
            const version = this.state.version_input;
            const channel = this.state.channel_id_input;
            if (version === '' || channel === '') {
                return;
            }
            this.ctrl.findAPKWithVersion(version, channel).then(results => {
                if (results.filter(item => { return item.ok }).length == 0) {
                    this.setState({
                        snackbar: {
                            open: true,
                            variant: 'error',
                            message: `该版本/渠道没有对应发布包：v${version}#${channel}`,
                        }
                    });
                    return;
                }
                this.setState({
                    snackbar: {
                        open: true,
                        variant: 'success',
                        message: `检测到v${version}版本存在渠道包，请查看列表`,
                    }
                });
                results.forEach(result => {
                    console.log(result)
                    if (!result.ok) {
                        return;
                    }
                    this.setState((state, props) => {
                        const exist = state.apk_links.filter(item => {
                            return item.data.link === result.link
                        })
                        let value;
                        // 去重，已经存在的地址不要重复添加
                        if (exist && exist.length > 0) {
                            value = { apk_links: state.apk_links }
                        } else {
                            const length = state.apk_links.length;
                            if (length >= 5) {
                                value = { apk_links: state.apk_links.slice(1).concat({ version, channel, data: result }) }
                            } else {
                                value = { apk_links: state.apk_links.concat({ version, channel, data: result }) }
                            }
                        }
                        return value;
                    });
                    setTimeout(() => {
                        if (this.state.apk_links && this.state.apk_links.length > 0) {
                            const autoSelectLInk = this.state.apk_links[this.state.apk_links.length - 1].data.link
                            this.handleURLClick(autoSelectLInk);
                        }
                    }, 300)
                })
            })
        }, 500)
    }

    timer;
    handleURLClick = (link) => {
        this.setState({
            selected_link: link
        });
        if (this.timer) {
            clearTimeout(this.timer);
        }
        let com = this;
        this.timer = setTimeout(() => {
            this.ctrl.updateQrcode(link).then(string => {
                com.setState({
                    "qrcode": string,
                })
            })
        }, 200);
    }

    openLink = () => {
        let version = this.state.version_input;
        const link = `http://beta.58corp.com/job/list?type=1&plat=Android&searchname=${version}&jobgroupname=58%E5%90%8C%E5%9F%8E-%E9%9B%86%E6%88%90`;
        shell.openExternal(link)
    }

    handleCopy2Clipboard = text => {
        this.setState({
            snackbar: {
                open: true,
                variant: "success",
                message: `文本已拷贝至粘贴板`,
            }
        });
    }
}

export default withStyles(styles)(WubaApp)