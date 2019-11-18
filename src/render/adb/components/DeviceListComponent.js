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

class DeviceListComponent extends React.Component {
  render() {
    const { classes, device_udid, devices, onClickDevice, onClickMenuItem } = this.props;
    return <div>
      <h5 className={classNames("nav-group-title", classes.title)}>设备列表
                    <Tooltip placement="right" title="刷新">
          <span className={classNames("icon icon-arrows-ccw padded-horizontally", classes.handPoniter)}
            onClick={() => onClickMenuItem(0)}></span>
        </Tooltip>
        <Tooltip placement="right" title="缓存目录">
          <span className={classNames("icon icon-home", classes.handPoniter)} onClick={() => onClickMenuItem(1)}></span>
        </Tooltip>
      </h5>
      <table className="table-striped">
        <thead>
          <tr>
            <th className={classes.firstColumn}>UDID</th>
            <th>类型</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((item) => {
            if (item.udid === device_udid) {
              return <tr key={item.udid} className={classes.highlight} onClick={(event) => { onClickDevice(event, item.udid) }}>
                <td>{item.udid}</td>
                <td>{item.state}</td>
              </tr>
            }
            return <tr key={item.udid} onClick={(event) => { onClickDevice(event, item.udid) }}>
              <td>{item.udid}</td>
              <td>{item.state}</td>
            </tr>
          })}
        </tbody>
      </table></div>
  }
}
DeviceListComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  device_udid: PropTypes.string,
  devices: PropTypes.array,
  onClickMenuItem: PropTypes.func,
  onClickDevice: PropTypes.func,
};

export default withStyles(styles)(DeviceListComponent);
