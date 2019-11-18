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

class ActivityListComponent extends React.Component {
  render() {
    const { classes, activities, onClickMenuItem, onClickMeasure } = this.props;

    return <div>
      <h5 className={classNames("nav-group-title", classes.title)}>活动页面
          <Tooltip placement="right" title="刷新列表">
          <span className={classNames("icon icon-arrows-ccw padded-horizontally", classes.handPoniter)}
            onClick={() => onClickMenuItem(0)}>
          </span>
        </Tooltip>
        <Tooltip placement="right" title="查看终端">
          <span className={classNames("icon icon-monitor", classes.handPoniter)}
            onClick={() => onClickMenuItem(1)}>
          </span>
        </Tooltip>
        <Tooltip placement="right" title="手机截屏">
          <span className={classNames("icon icon-camera", classes.handPoniter)} style={{ marginLeft: '10px' }}
            onClick={() => onClickMenuItem(2)}>
          </span>
        </Tooltip>
      </h5>
      <table className="table-striped">
        <thead>
          <tr>
            <th className={classes.firstColumn}>页面</th>
            <th>实例</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity, i) => {
            if (i == 0) {
              return <tr key={i} className={classes.highlight}>
                <td className={classes.firstColumn}>Activity</td>
                <td>pid={activity.pid}, acitivity={activity.name}
                  <Tooltip title="采集启动时间" placement="right">
                    <span className={classNames(classes.handPoniter, classes.appendIcon, "icon icon-gauge padded-horizontally")}
                      onClick={() => onClickMeasure(activity.name)}>
                    </span>
                  </Tooltip>
                </td>
              </tr>
            }
            return <tr key={i}>
              <td className={classes.firstColumn}>Activity</td>
              <td>pid={activity.pid}, acitivity={activity.name}
                <Tooltip title="采集启动时间" placement="right">
                  <span className={classNames("icon icon-gauge padded-horizontally", classes.appendIcon, classes.handPoniter)}
                    onClick={() => onClickMeasure(activity.name)}>
                  </span>
                </Tooltip>
              </td>
            </tr>
          })}
        </tbody>
      </table>
    </div>
  }
}
ActivityListComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  activities: PropTypes.array,
  onClickMenuItem: PropTypes.func,
  onClickMeasure: PropTypes.func,
};

export default withStyles(styles)(ActivityListComponent);