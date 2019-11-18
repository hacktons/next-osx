import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import QRCode from 'qrcode'

const styles = theme => ({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
  },
  input: {
    margin: 10,
    width: `calc(100% - ${20}px)`,
  },
  pre: {
    outline: '1px solid #ccc',
    padding: '5px',
    margin: 10,
  },
  string: { color: 'green', },
  number: { color: 'darkorange' },
  boolean: { color: 'blue' },
  null: { color: 'magenta' },
  key: { color: 'red' },

});

class WbmainParsePage extends React.Component {
  state = {
    input: "wbmain://jump/core/singleSharePage?params=%7B%22key%22%3A%22value%22%7D",
    "qrcode": "",
  };
  timer;

  componentDidMount() {
    this.refreshQrcode();
  }

  render() {
    const { classes } = this.props;
    let formatParams;
    let header;
    try {
      let url = new URL(this.state.input);
      header = url.protocol + url.pathname;
      let params = url.searchParams.get('params')
      formatParams = JSON.stringify(JSON.parse(params), null, 2);
    } catch (error) {
      // ignore
    }
    if (!header || header === 'null') {
      header = "协议错误";
    }
    if (!formatParams || formatParams === 'null') {
      formatParams = "未解析到合法参数";
    }
    return (
      <div className={classes.container}>
        <h5 className="nav-group-title" >输入协议</h5>
        <input className={classNames("form-control", classes.input)} placeholder="wbmain://" onChange={this.handleChange}
          value={this.state.input} />
        <br />
        <h5 className="nav-group-title" >协议头</h5>
        <span className="padded-horizontally">{header}</span>
        <br />
        <h5 className="nav-group-title" >参数</h5>
        <pre className={classNames('padded-horizontally', classes.pre)} dangerouslySetInnerHTML={{ __html: formatParams }} />
        <h5 className="nav-group-title" >扫一扫</h5>
        <span dangerouslySetInnerHTML={{ __html: this.state.qrcode }} />
      </div>
    );
  }

  handleChange = event => {
    this.setState({
      "input": event.target.value,
    });
    this.refreshQrcode();
  };

  refreshQrcode = () => {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    let com = this;
    this.timer = setTimeout(() => {
      if (!com.state.input || com.state.input === '') {
        return;
      }
      QRCode.toString(com.state.input, { type: 'svg', width: '200' }, function (err, string) {
        if (err) throw err
        com.setState({
          "qrcode": string,
        })
      })
    }, 200);
  }
  syntaxHighlight = (json) => {
    if (typeof json != 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }
}

WbmainParsePage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(WbmainParsePage);