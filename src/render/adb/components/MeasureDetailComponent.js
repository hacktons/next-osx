import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

const styles = {
  firstColumn: {
    width: '20%',
  },
  highlight: {
    color: '#fc605b'
  },
  chart: { width: '100%', height: 320 },
  title: {
    color: '#247993'
  }
}

class MeasureDetailComponent extends React.Component {

  render() {
    const { classes, data } = this.props;
    var measure_data = data;
    return (<div>
      <h5 className={classNames("nav-group-title", classes.title)}>页面测量</h5>
      <table className="table-striped">
        <thead>
          <tr>
            <th className={classes.firstColumn}>目标页面</th>
            <th>{measure_data.activity}</th>
          </tr>
        </thead>
        <tbody>

          <tr>
            <td className={classes.firstColumn}>平均打开/This time</td>
            <td>{measure_data.average_this_time}</td>
          </tr>
          <tr>
            <td className={classes.firstColumn}>平均时长/Total time</td>
            <td>{measure_data.average_total_time}</td>
          </tr>
          <tr>
            <td className={classes.firstColumn}>平均等待/Wait time</td>
            <td>{measure_data.average_wait_time}</td>
          </tr>
        </tbody>
      </table>
      <div className={classes.chart}>
        <StackAreaChart
          data={measure_data.data}
          keys={[{ key: 'this_time', name: 'This Time' },
          { key: 'total_time', name: 'Total Time' },
          { key: 'wait_time', name: 'Wait Time' }]} />
      </div>
    </div>)
  }
}

MeasureDetailComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.object,
};

export default withStyles(styles)(MeasureDetailComponent);