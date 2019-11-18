import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

const styles = {
  title: {
    color: '#247993'
  },
  marginHorizonal: {
    marginLeft: '10px',
    marginRight: '10px',
    width: `calc(100% - ${20}px)`
  },
}

class AppListComponent extends React.Component {
  render() {
    const { classes, data, onChange, defaultValue } = this.props;
    return <div>
      <h5 className={classNames("nav-group-title", classes.title)}>应用列表/{data.length}个</h5>
      <select className={classNames('form-control', classes.marginHorizonal)}
        onChange={onChange}
        value={defaultValue}>
        <option value="" disabled hidden>选择查看应用信息</option>
        {data.map((app, id) => {
          return <option key={id}>{app}</option>
        })}
      </select>
    </div>
  }
}

AppListComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.array,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
};

export default withStyles(styles)(AppListComponent);