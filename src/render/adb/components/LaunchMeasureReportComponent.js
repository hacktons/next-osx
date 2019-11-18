import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import MixBarChart from '../../../render/compoents/MixBarChart'

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
  title: {
    color: '#247993'
  }
}

class LaunchMeasureReportComponent extends React.Component {
  render() {
    const { classes, launchData, launchDataAverage } = this.props;
    const chartData = launchData;
    const averageData = launchDataAverage;

    return (<div>
      <h5 className={classNames("nav-group-title", classes.title)}>启动报表</h5>
      <table className="table-striped">
        <thead>
          <tr>
            <th className={classes.firstColumn}>启动页面</th>
            <th>{averageData.launcher.activity}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>平均耗时</td>
            <td>{averageData.launcher.consumed}</td>
          </tr>
          <tr>
            <td>主体页面</td>
            <td>{averageData.home.activity}</td>
          </tr>
          <tr>
            <td>平均耗时</td>
            <td>{averageData.home.consumed}</td>
          </tr>
          <tr>
            <td>混合载体</td>
            <td>{averageData.singleActivity ? '启动页与主页载体复用' : '启动页与主页载体独立'}</td>
          </tr>
          <tr>
            <td>启动时长</td>
            <td>{averageData.total}</td>
          </tr>
        </tbody>
      </table>
      <div className={classes.chart}>
        <MixBarChart data={chartData} keys={[{ key: 'total', name: '完整启动' }, { key: 'home', name: '主页面', }, { key: 'splash', name: '启动页' }]} />
      </div>
    </div>)
  }
}

LaunchMeasureReportComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  launchData: PropTypes.array,
  launchDataAverage: PropTypes.object,
  launchLog: PropTypes.object,
};

export default withStyles(styles)(LaunchMeasureReportComponent);