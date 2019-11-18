import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FullscreenLoading from '../compoents/FullscreenLoading';

const styles = theme => ({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
  },
});

function CircularIndeterminate(props) {
  const { classes } = props;
  return (
    <div className={classes.container}>
      <FullscreenLoading fullScreen={true} />
    </div>
  );
}

CircularIndeterminate.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CircularIndeterminate);
