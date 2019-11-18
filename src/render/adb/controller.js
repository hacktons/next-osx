import {
    adb, devices, apps, deviceDetail, dumpsysyActivityTop,
    dumsysPackage, dumpsysActivityProcesses, measureActivityLaunch,
    getLaunchActivityList, clearLog, screencap, startApp
} from "../module/adb";
import { openTerminalWith } from "../module/terminal";
import { writeFile } from "../module/utils";
import path from 'path';
import { cachedir, file, serverPort } from "../module/context";
import EmptyWorker from "./EmptyWorker";

class Controller {

    // 更新设备列表，并连接指定设备/默认设备
    refreshPageContent = async (deviceUDID) => {
        const devicesList = await devices();
        if (devicesList && devicesList.length > 1) {
            const matchedDevice = devicesList.filter(item => item.udid === deviceUDID);
            try {
                const _adb = await adb();
                if (matchedDevice && matchedDevice.length > 0) {
                    _adb.setDeviceId(deviceUDID);
                } else {
                    console.log('invalid udid, set to the first device');
                    _adb.setDeviceId(devicesList[0].udid);
                }
            } catch (err) {
                console.error(err);
                adb(true).then(() => {
                    console.log('new adb instance created')
                });
            }
        }
        const appList = await apps();
        return { devices: devicesList, apps: appList };
    }

    resetAdb = () => {
        adb(true).then(() => {
            console.log('new adb instance created')
        });
    }
    // 获取设备信息
    getDeviceDetail = async () => {
        return await deviceDetail();
    }

    // 获取当前活动Activity信息
    getActivityTop = async () => {
        return await dumpsysyActivityTop();
    }

    // 连接设备，并返回设备信息和当前活动Activity信息
    selectDevice = async (udid) => {
        const _adb = await adb();
        _adb.setDeviceId(udid)
        console.log('set deviceid success', udid)
        const detail = await this.getDeviceDetail();
        const activityTop = await this.getActivityTop();
        return { detail, activityTop };
    }

    // 获取指定app信息
    getAppDetail = async (pkgName) => {
        const packageInfo = await dumsysPackage(pkgName);
        const processes = await dumpsysActivityProcesses(pkgName);
        return { packageInfo, processes }
    }

    openData = (selected_app_package) => {
        const script = file(cachedir(), "open-data.command");
        const scriptContent = "#!/bin/bash\n" +
            '# Set terminal title\n' +
            'echo -en "\\033]0;Android Debug Bridge\\a"\n' +
            'clear\n' +
            'THIS_DIR=$(cd -P "$(dirname "$(readlink "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")")" && pwd)\n' +
            'echo $THIS_DIR\n' +
            `if [ ! -d ${selected_app_package} ]; then\n` +
            `  mkdir ${selected_app_package}\n` +
            'fi\n' +
            `adb exec-out run-as ${selected_app_package} tar c ./ > ${selected_app_package}/data.tar\n` +
            `cd ${selected_app_package} && tar -xvf data.tar\n` +
            'rm -rf data.tar\n' +
            'open ./\n' +
            'if [ $? -ne 0 ]; then\n' +
            '  echo "数据同步失败"\n' +
            'else\n' +
            '  echo "data数据已同步至本地"\n' +
            'fi\n';
        console.log(script);
        writeFile(script, scriptContent).then(() => {
            openTerminalWith(script, { cwd: cachedir() });
        })
    }

    openDumpTermial = () => {
        // don't support win
        const scriptFile = /^win/.test(process.platform) ?
            'launch.bat' :
            'launch.command';
        const scriptsDir = path.resolve(__dirname);
        const launchPackagerScript = path.resolve(scriptsDir, scriptFile);
        const procConfig = { cwd: scriptsDir };
        openTerminalWith(launchPackagerScript, procConfig);
    }

    measureStateTime = async (activity, count = 10) => {
        return measureActivityLaunch(activity, count).then(result => {
            const average_this_time = result.reduce((pre, current) => pre + current.this_time, 0) / result.length;
            const average_total_time = result.reduce((pre, current) => pre + current.total_time, 0) / result.length;
            const average_wait_time = result.reduce((pre, current) => pre + current.wait_time, 0) / result.length;
            const data = result.map((it, i) => {
                return { name: `测量#${i + 1}`, ...it }
            })
            return { activity, average_this_time, average_total_time, average_wait_time, data: data }
        })
    }

    launchActivityCache = {}

    // 获取Launcher Activity，存在多个则取第一个
    getLauncherActivity = async (packageName, cache = true) => {
        const cacheActivity = this.launchActivityCache[packageName];
        if (cache && cacheActivity && cacheActivity !== '') {
            console.log('return cached Launch Activity')
            return cacheActivity;
        }
        return getLaunchActivityList(packageName).then(list => {
            const activity = list.length > 0 ? list[0] : '';
            this.launchActivityCache[packageName] = activity;
            return activity;
        });
    }

    watchLogcat = async (handler) => {
        const clearResult = await clearLog();
        console.log(`logcat clear ${clearResult}`);
        const _adb = await adb();
        await _adb.stopLogcat();
        const callback = handler;
        _adb.startLogcat().then(() => {
            console.log('logcat connected...')
            _adb.setLogcatListener(line => {
                callback && callback(line)
            })
        });
    }

    takeScreenshot = async (fileName = 'next-screenshot.png') => {
        const path = file(cachedir(), fileName);
        const success = await screencap(path);
        return { success, file: path };
    }

    measureDataContainer = {};

    newContainer(onMessage) {
        return {
            result: [],
            mesauredCount: 0,
            screenshot: false,
            retry: 0,
            measuring: false,
            callback: onMessage,
            notifyComplete: function () {
                this.callback && this.callback(this.result);
            },
        }
    }

    measureAverageAppLaunchTime = async (packageName, onMessage, count = 5, needScreenshot = false, timeout = 10) => {
        this.measureDataContainer = this.newContainer(onMessage);
        this.measureDataContainer.screenshot = needScreenshot;
        this.measureDataContainer.timeout = timeout;
        // 定时检测是否需要开始下一轮测量，避免出现递归调用后卡死的情况(实际上并为彻底解决)
        this.measureDataContainer.interval = setInterval(() => {
            if (this.measureDataContainer.measuring) {
                console.log('skip as measuring');
                return;
            }
            if (this.measureDataContainer.mesauredCount < count) {
                console.log(`===>trigger next measure #${this.measureDataContainer.mesauredCount}`)
                this.nextMeasureRound(packageName);
            } else {
                console.log('finished');
                clearInterval(this.measureDataContainer.interval);
                this.measureDataContainer.notifyComplete();
            }
        }, 500);
    }

    nextMeasureRound = (packageName) => {
        console.log('execute nextMeasureRound');
        const _callback = data => {
            if (data.failed) {
                if (this.measureDataContainer.retry < 3) {
                    this.measureDataContainer.mesauredCount--;
                    this.measureDataContainer.retry++;
                    console.log('retry measure:', this.measureDataContainer.retry);
                } else {
                    console.log('retry measure skip');
                    this.measureDataContainer.retry = 0;
                }
                this.measureDataContainer.measuring = false;
                return;
            }
            this.measureDataContainer.result.push(data);
            console.log('handle message #', this.measureDataContainer.mesauredCount)
            this.measureDataContainer.measuring = false;
            this.measureDataContainer.retry = 0;
        }
        this.measureDataContainer.measuring = true;
        this.measureDataContainer.mesauredCount++;
        this.meaureAppLaunch(packageName, _callback, this.measureDataContainer.timeout).then(() => {
            console.log('app measuring...')
        }).catch(err => {
            console.error(`failed to measure #${this.measureDataContainer.mesauredCount}`, err);
            this.measureDataContainer.measuring = false;
        });
    }

    /**
     * App启动后，设置超时检测，避免长时间测量
     */
    meaureAppLaunch = async (packageName, onMessage, screenTimeout) => {
        const callback = onMessage;
        console.log('execute meaureAppLaunch')
        let worker;

        if (this.measureDataContainer.screenshot) {
            const scriptsDir = path.resolve(__dirname);
            const workerScript = path.resolve(scriptsDir, 'screenshotlooper.js');
            worker = new Worker(workerScript);
        } else {
            worker = new EmptyWorker();
        }

        const logs = [];

        const launchActivity = await this.getLauncherActivity(packageName);
        console.log(`launch Activity ${launchActivity}`);
        worker.onmessage = e => {
            console.log('receive work result')
            const activityRegex = RegExp(`ActivityManager: Displayed ${packageName}/`)
            const filterLog = logs.filter(line => {
                return activityRegex.test(line.message);
            });
            const launchData = {};
            var launchitem = filterLog.filter(line => (line.message.indexOf(launchActivity) > 0))[0];
            // if launcher not displayed, "Displayed" can not be found
            var unDisplayedLauncher = false;
            if (launchitem == undefined) {
                unDisplayedLauncher = true;
                launchitem = {
                    "timestamp": "",
                    "message": `ActivityManager: Displayed ${launchActivity}: +0ms `
                };
            }
            const launchMessage = launchitem.message;
            if (filterLog.length > 0) {
                launchData.launcher = {
                    timestamp: launchitem.timestamp,
                    activity: launchMessage.substring(launchMessage.indexOf('Displayed ') + 10, launchMessage.lastIndexOf(':')),
                    consumed: this.convertLogTime2Mills(launchMessage.substring(launchMessage.lastIndexOf('+') + 1)),// TODO 格式化
                }

                const findTargetScreen = (sourceData, baseTimestammp) => {
                    let minDiff = Number.MAX_VALUE;
                    let targetImg = undefined;
                    for (let i = 0; i < sourceData.image.length; i++) {
                        const img = sourceData.image[i];
                        const diff = img.timestamp - baseTimestammp
                        if (diff < 0) {
                            continue;
                        }
                        if (diff <= minDiff) {
                            minDiff = diff;
                            targetImg = { ...img };
                        }
                    }
                    return { ...targetImg };
                }

                const data = e.data;
                // 截屏处理
                if (this.measureDataContainer.screenshot) {
                    const launchImg = findTargetScreen(data, launchData.launcher.timestamp);
                    launchData.launcher.screen = launchImg;
                } else {
                    launchData.launcher.screen = '';
                }


                //启动页与主页二合一?
                if (unDisplayedLauncher) {
                    launchData.singleActivity = false;
                } else {
                    launchData.singleActivy = filterLog.length === 1;
                }
                if (!launchData.singleActivity) {
                    const message = filterLog[filterLog.length - 1].message;
                    launchData.home = {
                        timestamp: filterLog[filterLog.length - 1].timestamp,
                        activity: message.substring(message.indexOf('Displayed ') + 10, message.lastIndexOf(':')),
                        consumed: this.convertLogTime2Mills(message.substring(message.lastIndexOf('+') + 1)),// TODO 格式化
                    }
                    // 截屏处理
                    if (this.measureDataContainer.screenshot) {
                        const homeImg = findTargetScreen(data, launchData.home.timestamp);
                        launchData.home.screen = homeImg;
                    } else {
                        launchData.home.screen = '';
                    }
                }
                if (unDisplayedLauncher) {
                    launchData.totalTime = launchData.home.consumed;
                } else {
                    launchData.totalTime = launchData.singleActivity ? launchData.launcher.consumed : (launchData.home.timestamp - launchData.launcher.timestamp);
                }
                // 截屏处理
                if (this.measureDataContainer.screenshot) {
                    launchData.finnalScreen = data.image[data.image.length - 1];
                } else {
                    launchData.finnalScreen = '';
                }
            }


            console.log('shutdown worker');
            worker && worker.terminate();
            console.log('notify message callback');
            callback && callback({ /*screenshots: data, */log: logs, launchData: launchData });
        }

        worker.onerror = err => {
            console.error('load worker failed', err);
            callback && callback({ failed: true });
        }
        // start logcat
        let timeoutTrigger;
        const regex = /ActivityManager:/;
        const regexDisplay = /ActivityManager: Displayed /;
        console.log('start watch logcat');

        await this.watchLogcat(line => {
            if (regex.test(line.message)) {
                console.log(line);
                logs.push(line);
                // new activity displayed
                if (regexDisplay.test(line.message)) {
                    // 设定界面间隔超时
                    if (timeoutTrigger) {
                        clearTimeout(timeoutTrigger);
                    }
                    console.log('reset timeout as new Activity dispalyed')
                    timeoutTrigger = setTimeout(() => {
                        console.log('hit screen timeout')
                        worker.postMessage({ terminate: true })
                    }, screenTimeout * 1000);
                } else {
                    // 设定启动超
                    if (timeoutTrigger) {
                        return;
                    }
                    timeoutTrigger = setTimeout(() => {
                        console.log('hit launch timeout')
                        worker.postMessage({ terminate: true, timeout: true })
                    }, screenTimeout * 1000);
                }
            }
        })
        // start app
        const output = await startApp(packageName);
        console.log(output);
        // start worker
        const dir = file(cachedir(), '/');
        worker.postMessage({ desDir: dir, port: serverPort() });
    }

    //'1m2s100ms' or 2s100ms or 100ms
    convertLogTime2Mills = text => {
        const result = text.match(/([0-9]*)/g);
        console.log(result);
        const filter = result.filter(it => (it !== '')).map(it => (parseInt(it))).reverse();
        console.log(filter)
        const ms = filter[0];
        const s = filter.length > 1 ? filter[1] : 0;
        const m = filter.length > 2 ? filter[2] : 0
        return ms + s * 1000 + m * 60 * 1000;
    }

    test = () => {
        //image();
    }
}

export default Controller;