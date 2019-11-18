import React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Controller from "./controller";
import FullscreenLoading from '../compoents/FullscreenLoading';
import Snackbar from "../compoents/snackbar";
import Highlight from 'react-highlight'
import ClickCopyButton from "../compoents/ClickCopyButton";
import HorizonalGallery from "../compoents/HorizonalGallery";
import { formatDate } from "../module/utils";
import { cachedir } from "../module/context";
import Storage from "../module/store";
import DeviceListComponent from './components/DeviceListComponent';
import DeviceDetailComponent from './components/DeviceDetailComponent';
import ActivityListComponent from './components/ActivityListComponent';
import MeasureDetailComponent from './components/MeasureDetailComponent';
import AppListComponent from './components/AppListComponent';
import AppDetailComponent from './components/AppDetailComponent';
import LaunchMeasureReportComponent from './components/LaunchMeasureReportComponent';

const shell = require('electron').shell

const styles = theme => ({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
  },
  firstColumn: {
    width: '20%',
  },
  marginHorizonal: {
    marginLeft: '10px',
    marginRight: '10px',
    width: `calc(100% - ${20}px)`
  },
  handPoniter: {
    cursor: 'pointer',
  },
  highlight: {
    color: '#fc605b'
  },
  appendIcon: {
    color: "#247993",
  },
  terminal: {
    position: 'relative',
    marginLeft: '10px',
    marginRight: '10px',
    width: `calc(100% - ${20}px)`
  },
  copy: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1)
  },
  chart: { width: '100%', height: 320 },
  title: {
    color: '#247993'
  }
});

class PageDevice extends React.Component {
  // 业务逻辑处理器
  ctrl = new Controller();
  storage = new Storage();
  // 数据状态
  state = {
    is_connected: undefined,
    adb: undefined,
    devices: undefined,
    selected_device_udid: '',
    detail: undefined,
    user_apps: undefined,
    selected_app_package: undefined,
    selected_app_info: undefined,
    show_progress_bar: false,
    measure_data: undefined,
    snackbar: {
      open: false,
      variant: "info",
      message: "This is a success message",
    },
    open_alert: false,
    alert_data: undefined,
    selected_image: undefined,
    launch_config: {},
  }

  componentDidMount() {
    setTimeout(() => {
      this.handleRefreshPage();
    }, 300)
    this.storage.getLaunchConfig().then(data => {
      this.setState({ launch_config: data })
      console.log(`luanch config`, data);
    })
  }

  render() {
    const { classes } = this.props;
    let defaultSelected = this.state.selected_app_package;
    return (
      <div className={classes.container}>
        {this.state.devices && <DeviceListComponent
          devices={this.state.devices}
          device_udid={this.state.selected_device_udid}
          onClickDevice={this.hanldeClickItem} 
          onClickMenuItem={(index)=>{
            if(index==0){
              this.handleRefreshPage();
            } else if(index==1){
              this.openCacheDirectory();
            }
          }}/>
        }

        {this.state.detail && <DeviceDetailComponent
          device_udid={this.state.selected_device_udid}
          data={this.state.detail}
          onCopyClick={this.handleCopy2Clipboard} />
        }

        {this.state.top_activities && <ActivityListComponent
          activities={this.state.top_activities}
          onClickMeasure={this.handleMeasueActivity}
          onClickMenuItem={this.handleMenuItem} />
        }

        {this.state.measure_data && <MeasureDetailComponent data={this.state.measure_data} />}

        {this.state.user_apps && <AppListComponent
          data={this.state.user_apps}
          onChange={this.handleAppSelected}
          defaultValue={defaultSelected} />
        }
        {this.state.selected_app_info && <AppDetailComponent
          processes={this.state.selected_app_processes}
          app={this.state.selected_app_info}
          appPackage={this.state.selected_app_package}
          onClickMeasure={this.handleMeasueAppLaunch}
          onClickOpenDir={this.openDataDir} />
        }
        {this.state.app_launch_datas && <LaunchMeasureReportComponent
          launchData={this.state.app_launch_datas}
          launchDataAverage={this.state.app_launch_datas_average} />
        }
        {this.viewOfScreenshot()}
        {this.viewOfLogTerminal()}
        {this.state.show_progress_bar && <FullscreenLoading fullScreen={true} />}
        {this.state.snackbar && <Snackbar
          open={this.state.snackbar.open}
          variant={this.state.snackbar.variant}
          message={this.state.snackbar.message}
          onClose={this.handleCloseSnackbar} />}
        {this.state.open_alert && <AlertDilaog
          open={this.state.open_alert}
          onClose={this.handleCloseAlert}
          title="选择启动页"
          list={this.state.alert_data}
        />}
      </div>
    );
  }

  handleMenuItem = (index) => {
    switch (index) {
      case 0:
        this.handleRefreshActivity();
        break;
      case 1:
        this.openTerminal();
        break;
      case 2:
        this.takeScreenShot();
        break;
    }
  }

  handleCloseAlert = (value, index) => {

  }

  /**
    * 截屏面板
    */
  viewOfScreenshot = () => {
    if (!this.state.launch_config.screenshot_checked) {
      return ""
    }
    if(!this.state.app_launch_images){
      return ""
    }
    return <HorizonalGallery source={this.state.app_launch_images} />
  }
  /**
   * 日志面板
   */
  viewOfLogTerminal = () => {
    if (!this.state.launch_config.launch_log_checked) {
      return ""
    }
    const logs = this.state.app_launch_logs;
    if (!logs) {
      return ""
    }
    const logitem = this.state.app_launch_logs[this.state.app_launch_log_selected_index];
    const outputLog = logitem && logitem.map(it => (it.message)).join('\n');
    if (!outputLog) {
      return ""
    }
    const { classes } = this.props;
    return <div>
      <h5 className={classNames("nav-group-title", classes.title)}>启动日志</h5>
      {logs && <select className={classNames('form-control', classes.marginHorizonal)} onChange={this.handleLogSelected}>
        {logs.map((log, id) => {
          // 每个测量日志都是一个具体的日志数组，去第一个日志作为标记
          return <option key={id} index={id}>{formatDate(log[0].timestamp)} 测量点#{id + 1}</option>
        })}
      </select>}
      <div className={classNames('terminal', classes.terminal)}>
        <Highlight language="bash">
          {outputLog}
        </Highlight>
        <ClickCopyButton className={classes.copy} text={outputLog} onCopyClick={this.handleCopy2Clipboard} />
      </div>
    </div>
  }

  // Event: 处理页面刷新
  handleRefreshPage = () => {
    this.setState({
      devices: undefined,
      detail: undefined,
      user_apps: undefined,
      selected_app_package: undefined,
      selected_app_info: undefined
    })
    this.ctrl.refreshPageContent().then(result => {
      const { devices, apps } = result;
      const hasDevices = devices.length > 0;
      this.setState({
        is_connected: hasDevices,
        devices,
        user_apps: apps,
      });
      if (!hasDevices) {
        return
      }
      const udid = this.state.selected_device_udid == '' ? devices[0].udid : this.state.selected_device_udid
      this.hanldeClickItem({}, udid);
      let selected = undefined;
      apps && apps.forEach(app => {
        if (app === 'com.wuba') {
          selected = app;
        }
      })
      if (!selected) {
        selected = apps[0];
      }
      let mockEvent = {
        target: {
          value: selected
        }
      }
      this.handleAppSelected(mockEvent);
    }).catch(err => {
      console.error(err);
      this.setState({
        show_progress_bar: false,
        snackbar: {
          open: true,
          variant: "error",
          message: `页面刷新失败，请检查USB连接后重试，错误信息：${err}`,
        }
      });
      this.ctrl.resetAdb();
    });
  }
  // Event: 刷新Activity列表
  handleRefreshActivity = () => {
    this.ctrl.getActivityTop().then(topActivitys => {
      this.setState({
        top_activities: topActivitys
      })
    });
  }

  // Event: 处理设备选择动作
  hanldeClickItem = (event, udid) => {
    console.log(udid);
    if (udid !== this.state.selected_device_udid) {
      this.setState({ selected_device_udid: udid, show_progress_bar: true, });
    }
    this.ctrl.selectDevice(udid).then(result => {
      const { detail, activityTop } = result;
      this.setState({
        detail: detail,
        top_activities: activityTop,
        show_progress_bar: false,
      })
    })
  }

  // Event: 处理app选择动作
  handleAppSelected = (event) => {
    const pkgName = event.target.value;
    console.log(`slected app ${pkgName}`);
    this.setState({
      selected_app_package: pkgName
    })
    this.ctrl.getAppDetail(pkgName).then(result => {
      const { packageInfo, processes } = result;
      this.setState({
        selected_app_info: packageInfo,
        selected_app_processes: processes
      });
    })
  }

  // Event: 处理日志列表选择
  handleLogSelected = event => {
    let index = event.target.selectedOptions[0].index;
    this.setState({
      app_launch_log_selected_index: index,
    })
  }

  // Event: 打开dumpsys activity页面
  openTerminal = () => {
    this.ctrl.openDumpTermial();
  }

  // Event: 打开缓存目录
  openCacheDirectory = () => {
    shell.openItem(cachedir());
  }

  // Event: 截屏操作
  takeScreenShot = () => {
    this.setState({
      show_progress_bar: true
    });
    this.ctrl.takeScreenshot('screentshot-' + Date.now() + ".png").then(result => {
      if (result.success) {
        this.setState({
          show_progress_bar: false,
          snackbar: {
            open: true,
            variant: "success",
            message: "截屏成功",
          }
        });
        shell.openItem(result.file);
      } else {
        this.setState({
          show_progress_bar: false,
          snackbar: {
            open: true,
            variant: "error",
            message: "截屏失败，请检查设备连接状态",
          }
        });
      }
    })
  }

  // Event: 打开data/data目录
  openDataDir = () => {
    this.ctrl.openData(this.state.selected_app_package);
  }

  // Event: 取消loading动画
  handleCloseProgressBar = () => {
    this.setState({ show_progress_bar: false });
  }

  // Event: 测量Activity
  handleMeasueActivity = (activity) => {
    this.setState({ show_progress_bar: true });
    console.log(`start measure ${activity}`);
    this.ctrl.measureStateTime(activity).then(result => {
      console.log('complete', result);
      this.setState({
        show_progress_bar: false,
        measure_data: result,
        snackbar: {
          open: true,
          variant: "success",
          message: "测量结束，详情查看图表",
        }
      });
    }).catch(err => {
      console.log('执行失败');
      this.setState({
        show_progress_bar: false,
        measure_data: undefined,
        snackbar: {
          open: true,
          variant: "error",
          message: `测量失败，请检查USB连接后重试，错误信息：${err}`,
        }
      });
    })
  }

  // Event: 测量App启动流程
  handleMeasueAppLaunch = packageName => {
    this.setState({ show_progress_bar: true });
    console.log(`start measure ${packageName}`);
    const onMessage = data => {
      console.log('receive measure data', data);
      const chartData = data.map((it, i) => ({
        name: `测量#${i + 1}`,
        total: it.launchData.totalTime,
        home: it.launchData.home ? it.launchData.home.consumed : 0,
        splash: it.launchData.launcher.consumed,
      }));
      if(!data || data.length==0){
        return
      }
      const singleActivity = data[0].launchData.singleActivity;
      const average_total = data.reduce((pre, current) => pre + current.launchData.totalTime, 0) / data.length;
      const average_launcher = data.reduce((pre, current) => pre + current.launchData.launcher.consumed, 0) / data.length;
      const average_home = singleActivity ? average_launcher : data.reduce((pre, current) => pre + current.launchData.home.consumed, 0) / data.length;

      const averageItem = {
        singleActivity: singleActivity,
        total: average_total,
        home: { activity: singleActivity ? data[0].launchData.launcher.activity : data[0].launchData.home.activity, consumed: average_home },
        launcher: { activity: data[0].launchData.launcher.activity, consumed: average_launcher },
      }
      const logs = data.map(it => (it.log));

      const images = [];
      const formater = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }
      data.forEach(it => {
        const { launcher, home, finnalScreen } = it.launchData;
        if (launcher && launcher.screen) {
          const { path, timestamp } = launcher.screen;
          if (path && timestamp) {
            images.push({ img: path, title: '启动页面', author: formatDate(timestamp, formater) })
          }
        }
        if (home && home.screen) {
          const { path, timestamp } = home.screen;
          if (path && timestamp) {
            images.push({ img: path, title: '主界面', author: formatDate(timestamp, formater) })
          }
        }
        if (finnalScreen) {
          const { path, timestamp } = finnalScreen;
          if (path && timestamp) {
            images.push({ img: path, title: '最后页面', author: formatDate(timestamp, formater) })
          }
        }
      })
      this.setState({
        show_progress_bar: false,
        app_launch_datas: chartData,
        app_launch_datas_average: averageItem,
        app_launch_logs: logs,
        app_launch_images: images,
        app_launch_log_selected_index: 0,
        snackbar: {
          open: true,
          variant: 'success',
          message: `启动测量结束`,
        }
      });
    }
    const count = this.state.launch_config.sample_count_value;
    const screentshot = this.state.launch_config.screenshot_checked
    const timeout = this.state.launch_config.timeout_value;
    this.ctrl.measureAverageAppLaunchTime(packageName, onMessage, count, screentshot, timeout).then(() => {
      console.log('app measuring...')
    }).catch(err => {
      this.setState({
        show_progress_bar: false,
        snackbar: {
          open: true,
          variant: "error",
          message: `测量失败，请检查USB连接后重试，错误信息：${err}`,
        }
      });
    })
  }

  // Event: 隐藏Snackbar
  handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    const snackbar = this.state.snackbar;
    snackbar.open = false;
    this.setState({ snackbar: snackbar });
  };

  // Event: 拷贝内容到剪贴板后的提示
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

export default withStyles(styles)(PageDevice)