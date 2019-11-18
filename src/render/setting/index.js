import React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Storage from "../module/store";
import FullscreenLoading from '../compoents/FullscreenLoading';

const styles = theme => ({
    container: {
        width: '100%',
        height: '100%',
        overflow: 'auto',
    },
    title: {
        color: '#247993'
    },
    marginHorizonal: {
        marginLeft: '10px',
        marginRight: '10px',
        width: `calc(100% - ${20}px)`
    },
    checkbox: {
        marginTop: 0,
        marginBottom: 0,
        position: 'relative',
        display: 'block',
        lineHeight: '1'
    },
    tips: {
        color: '#fc605b',
        fontSize: '0.7rem',
        marginTop: '5px',
    },
    confirm: {
        marginLeft: '10px',
        marginRight: '10px',
        width: 80
    }
});

const SAMPLE_COUNT = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
const TIME_OUT = [6, 8, 10, 12, 14];
class SettingPage extends React.PureComponent {

    state = {
        screenshot_checked: false,
        launch_log_checked: true,
        custom_sample_count_checked: false,
        sample_count_value: 10,
        custom_timeout_checked: false,
        timeout_value: 10,
        show_progress_bar: false,
    }

    storage = new Storage();

    componentWillMount() {
        this.setState({
            show_progress_bar: true,
        });
        this.refreshPage();
    }

    render() {
        const { classes } = this.props;

        return <div className={classes.container}>
            <h5 className={classNames("nav-group-title")}>启动配置</h5>
            <div className={classNames(classes.marginHorizonal, classes.checkbox)}>
                <label>
                    <input type="checkbox" checked={this.state.screenshot_checked} onChange={this.handleScreenshotCheck} /> 采集页面截图(Beta)
                </label>
            </div>
            <div className={classNames(classes.marginHorizonal, classes.checkbox)}>
                <label>
                    <input type="checkbox" checked={this.state.launch_log_checked} onChange={this.handleLogCheck} /> 采集流程日志
                </label>
            </div>
            <div className={classNames(classes.marginHorizonal, classes.checkbox)}>
                <label>
                    <input type="checkbox" checked={this.state.custom_timeout_checked} onChange={this.handleCustomTimeoutCheck} /> 调整超时时间
                </label>
            </div>
            <select disabled={!this.state.custom_timeout_checked}
                className={classNames("form-control", classes.marginHorizonal)}
                value={`超时阈值${this.state.timeout_value}秒`}
                onChange={this.handleTimeoutChange}>
                {TIME_OUT.map(it => (<option key={it}>超时阈值{it}秒</option>))}
            </select>

            <div className={classNames(classes.marginHorizonal, classes.checkbox)}>
                <label>
                    <input type="checkbox" checked={this.state.custom_sample_count_checked} onChange={this.handleSampeleCustomCheck} /> 调整启动采集次数
                </label>
            </div>
            <select disabled={!this.state.custom_sample_count_checked}
                className={classNames("form-control", classes.marginHorizonal)}
                value={`连续采集${this.state.sample_count_value}次`}
                onChange={this.handleSampleCountChange}>
                {SAMPLE_COUNT.map(it => (<option key={it}>连续采集{it}次</option>))}
            </select>
            <label className={classNames(classes.tips, classes.marginHorizonal)}>提示：采集次数越大，整体需要时间越长</label>

            <h5 className={classNames("nav-group-title")}>缓存清理</h5>
            <div className={classNames(classes.marginHorizonal, classes.checkbox)}>
                <label>
                    <input type="checkbox" onChange={this.handleClearCache} /> 清理本地缓存数据
                </label>
            </div>
            <div className={classes.marginHorizonal} style={{ marginTop: '10px' }}>
                <button className={'btn btn-primary'} onClick={this.handleSaveState}>保存</button>
                <button className={'btn btn-default'} style={{ marginLeft: '10px' }} onClick={this.handleResetState}>重置</button>
            </div>
            {this.state.show_progress_bar && <FullscreenLoading fullScreen={true} />}
        </div>
    }

    refreshPage = () => {
        this.storage.getLaunchConfig().then(data => {
            const {
                screenshot_checked,
                launch_log_checked,
                sample_count_value,
                custom_sample_count_checked,
                custom_timeout_checked,
                timeout_value,
            } = data;
            this.setState({
                screenshot_checked,
                launch_log_checked,
                custom_sample_count_checked,
                sample_count_value,
                custom_timeout_checked,
                timeout_value,
                show_progress_bar: false,
            })
        })
    }

    handleScreenshotCheck = e => {
        this.setState({
            screenshot_checked: e.target.checked
        })
    }

    handleLogCheck = e => {
        this.setState({
            launch_log_checked: e.target.checked
        })
    }

    handleSampleCountChange = (e) => {
        let index = event.target.selectedIndex;
        this.setState({
            sample_count_value: SAMPLE_COUNT[index],
        })
    }

    handleSampeleCustomCheck = e => {
        this.setState({
            custom_sample_count_checked: e.target.checked
        })
    }
    handleCustomTimeoutCheck = e => {
        this.setState({
            custom_timeout_checked: e.target.checked
        })
    }
    handleTimeoutChange = (e) => {
        let index = event.target.selectedIndex;
        this.setState({
            timeout_value: TIME_OUT[index],
        })
    }

    handleClearCache = () => {
        this.setState({
            clear_cache_checked: e.target.checked
        })
    }

    handleSaveState = () => {
        this.setState({
            show_progress_bar: true,
        });
        const {
            launch_log_checked,
            screenshot_checked,
            sample_count_value,
            custom_sample_count_checked,
            custom_timeout_checked,
            timeout_value,
        } = this.state;
        this.storage.saveLaunchConfig({
            screenshot_checked,
            launch_log_checked,
            sample_count_value,
            custom_sample_count_checked,
            custom_timeout_checked,
            timeout_value,
        }).then(() => {
            this.setState({
                show_progress_bar: false,
            });
        })
    }

    handleResetState = () => {
        this.setState({
            show_progress_bar: true,
        });
        this.storage.saveLaunchConfig().then(() => {
            this.refreshPage();
        })
    }
}

export default withStyles(styles)(SettingPage)