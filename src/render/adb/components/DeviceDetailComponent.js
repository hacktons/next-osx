import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import ClickCopyButton from "../../compoents/ClickCopyButton";

const styles = {
  firstColumn: {
    width: '20%',
  },
  highlight: {
    color: '#fc605b'
  },
  appendIcon: {
    color: "#247993",
  },
  handPoniter: {
    cursor: 'pointer',
  },
  title: {
    color: '#247993'
  }
}

class DeviceDetailComponent extends React.Component {

  render() {
    const { classes, data, device_udid, onCopyClick } = this.props;
    const info = data;
    const xdpi = this.densityToString(info.density);
    return <div>
      <h5 className={classNames("nav-group-title", classes.title)}>设备信息/{device_udid}</h5>
      <table className="table-striped table-disbale-active">
        <thead>
          <tr>
            <th className={classes.firstColumn}>选项</th>
            <th>取值</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>手机型号</td>
            <td>{info.model}</td>
          </tr>
          <tr>
            <td>手机品牌</td>
            <td>{info.brand}</td>
          </tr>
          <tr>
            <td>设备电量</td>
            <td>{info.battery}</td>
          </tr>
          <tr>
            <td>系统版本</td>
            <td>Android {info.os_version}/ API Level {info.sdk}</td>
          </tr>
          <tr>
            <td>屏幕参数</td>
            <td>分辨率{info.size}，密度{info.density}，适用{xdpi}</td>
          </tr>
          <tr>
            <td>androidid</td>
            <td>{info.android_id} <ClickCopyButton text={info.android_id} onCopyClick={onCopyClick} /></td>
          </tr>
          <tr>
            <td>CPU信息</td>
            <td>{info.cpu_count + '核 ' + info.processor}</td>
          </tr>
        </tbody>
      </table>
    </div>
  }

  densityToString = (density) => {
    const dpi = parseInt(density);
    let xdpi = '';
    const x = parseInt(dpi / 160);

    if (x === 1) {
      if (dpi <= 120) {
        xdpi = 'mdpi'
      } else {
        xdpi = 'dpi 1倍图'
      }
    } else if (dpi == 240) {
      xdpi = 'hdpi 1.5倍图'
    } else {
      let xString = '';
      for (let i = 1; i < x; i++) {
        xString += 'x';
      }
      xdpi = `${xString}hdpi ${x}倍图`
    }
    return xdpi;
  }
}
DeviceDetailComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  device_udid: PropTypes.string,
  data: PropTypes.object,
  onCopyClick: PropTypes.func,
};

export default withStyles(styles)(DeviceDetailComponent);
