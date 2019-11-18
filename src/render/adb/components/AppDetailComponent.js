import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';

const styles = {
  firstColumn: {
    width: '20%',
  },
  highlight: {
    color: '#fc605b'
  },
  handPoniter: {
    cursor: 'pointer',
  },
  appendIcon: {
    color: "#247993",
  },
}

class AppDetailComponent extends React.Component {

  render() {
    const { classes, app, processes, appPackage, onClickMeasure, onClickOpenDir } = this.props;
    let debugView = undefined;
    const measureIcon = <Tooltip title="启动测量" placement="right">
      <span className={classNames(classes.handPoniter, classes.appendIcon, "icon icon-gauge padded-horizontally")}
        onClick={() => onClickMeasure(appPackage) }></span>
    </Tooltip>
    if (app.debugAble) {
      debugView = <div>
        可调试{measureIcon}
        <Tooltip title="打开目录" placement="right">
          <span className={classNames("icon icon-folder", classes.handPoniter, classes.appendIcon)}
            onClick={onClickOpenDir}></span>
        </Tooltip>
      </div>
    } else {
      debugView = <div>不可调试{measureIcon}</div>;
    }
    return <table className="table-striped">
      <tbody>
        <tr>
          <td className={classes.firstColumn}>应用版本</td>
          <td>{`versionCode=${app.versionCode}, versionName=${app.versionName}`}</td>
        </tr>
        <tr>
          <td>SDK版本</td>
          <td>{`minSdk=${app.minSdk}, targetSdk=${app.targetSdk}, apkSigningVersion=${app.apkSigningVersion}`}</td>
        </tr>
        <tr>
          <td>安装时间</td>
          <td>{app.firstInstallTime}</td>
        </tr>
        <tr>
          <td>调试测量</td>
          <td>{debugView}</td>
        </tr>

        {app.declaredPermissions && app.declaredPermissions.length > 0 && <tr>
          <td>权限声明</td>
          <td>
            <select className={classNames('form-control')} defaultValue={"自定义权限" + app.declaredPermissions.length + "个"}>
              <option value="" disabled>自定义权限{app.declaredPermissions.length}个</option>
              {app.declaredPermissions.map((per, id) => {
                return <option key={id}>{per.permission} {per.prot}</option>
              })}
            </select>
          </td>
        </tr>}
        {app.requestedPermissions && app.requestedPermissions.length > 0 && <tr>
          <td>权限清单</td>
          <td>
            <select className={classNames('form-control')} defaultValue={"申请权限" + app.requestedPermissions.length + "个"}>
              <option value="" disabled>申请权限{app.requestedPermissions.length}个</option>
              {app.requestedPermissions.map((per, id) => {
                return <option key={id}>{per}</option>
              })}
            </select>
          </td>
        </tr>}
        {processes && processes.length > 0 && <tr>
          <td>App进程</td>
          <td>
            <select className={classNames('form-control')} >
              {processes.map((p, id) => {
                return <option key={id}>uid={p.uid} pid={p.pid} {p.pname}</option>
              })}
            </select>
          </td>
        </tr>}
      </tbody>
    </table>
  }
}

AppDetailComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  processes: PropTypes.array,
  app:PropTypes.object,
  appPackage:PropTypes.string,
  onClickMenuItem: PropTypes.func,
  onClickOpenDir: PropTypes.func,
};

export default withStyles(styles)(AppDetailComponent);