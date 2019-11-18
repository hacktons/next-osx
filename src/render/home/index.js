import React from 'react';
import classNames from 'classnames';
import MainContentPage from './content';
import shellEnv from 'shell-env';
import fixPath from 'fix-path';
import {initdir} from '../module/context'

// if we're running from the app package, we won't have access to env vars
// normally loaded in a shell, so work around with the shell-env module
const decoratedEnv = shellEnv.sync();
process.env = { ...process.env, ...decoratedEnv };
// and we need to do the same thing with PATH
fixPath();
class App extends React.Component {

    state = {
        menus: [
            {
                section: true,
                text: '58专用',
            },
            {
                section: false,
                text: '同城版本',
                icon: 'icon-home',
            },
            {
                section: true,
                text: '常用工具',
            },
            {
                section: false,
                text: '协议解码',
                icon: 'icon-window',
            },
            {
                section: false,
                text: '大图检测',
                icon: 'icon-picture',
            },
            {
                section: false,
                text: '安卓设备',
                icon: 'icon-drive',
            },
            {
                section: false,
                text: '参数配置',
                icon: 'icon-cog',
            },
        ],
        active: 1,
    }

    componentDidMount() {
        // devices().then(devices => {
        //     if (devices.length > 0) {
        //         let myNotification = new Notification('Android设备连接', {
        //             body: '您有新的设备已连接，点击查看设备信息'
        //         })

        //         myNotification.onclick = () => {
        //             // 自动切换到设备面板
        //             this.setState({
        //                 active: 8,
        //             })
        //         }
        //     }
        // })
        initdir().then(()=>{
            // done
        })
    }

    render() {
        return (<div className="window">
            <div className="window-content">
                <div className="pane-group">
                    {this.sideBar()}
                    <div className="pane">
                        <MainContentPage index={this.state.active} />
                    </div>
                </div>
            </div>
        </div>);
    }

    sideBar = () => {
        let menuList = this.state.menus.map((it, index) => {
            if (it.section) {
                return (<h5 className="nav-group-title" key={index}>{it.text}</h5>)
            }
            let state = this.state.active === index ? 'nav-group-item active' : 'nav-group-item';
            return (
                <span className={state} key={index} onClick={(event) => { this.hanldeClickItem(event, index) }}>
                    <span className={classNames("icon", it.icon)} ></span>
                    {it.text}
                </span>
            );
        });

        return (
            <div className="pane pane-sm sidebar">
                <nav className="nav-group">{menuList}</nav>
            </div>
        );
    }

    hanldeClickItem = (e, index) => {
        this.setState({
            active: index,
        })
    }
}
export default App;