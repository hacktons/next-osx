import ADB from 'appium-adb';
import fs from 'fs';
const sizeOf = require('image-size');

let sharedADB = undefined;

const adb = async (forceCreate = false) => {
    if (!sharedADB || forceCreate) {
        sharedADB = await ADB.createADB();
    }
    return sharedADB;
}

const shell = async (params, opts = {}) => {
    const _adb = await adb();
    const output = await _adb.shell(params, opts);
    return output;
}

/**
 * 当前连接的设备列表
 */
const devices = async () => {
    const _adb = await adb();
    const devices = await _adb.getConnectedDevices();
    return devices;
}
/**
 * 用户安装的应用列表
 */
const apps = async () => {
    const app_output = await shell(['pm list packages -3']);
    const user_apps = app_output.split('\n').map(app => {
        return app.split(':')[1].trim();
    }).sort();
    console.log('user-app count = ' + user_apps.length);
    return user_apps;
}

/**
 * 设备基本信息
 */
const deviceDetail = async () => {
    const model = await shell(['getprop ro.product.model']);
    const brand = await shell(['getprop ro.product.brand']);
    const name = await shell(['getprop ro.product.name']);
    const os_version = await shell(['getprop ro.build.version.release']);
    const sdk = await shell(['getprop ro.build.version.sdk']);
    let battery = await shell(['dumpsys battery']);
    let level = '';
    let scale = '';
    battery.split('\n').forEach(element => {
        if (element.indexOf('level') >= 0) {
            level = element.split(':')[1].trim();
        } else if (element.indexOf('scale') >= 0) {
            scale = element.split(':')[1].trim();
        }
    });
    battery = parseInt(level) * 100 / parseInt(scale) + '%';
    let size = await shell(['wm size']);
    //Physical size: 1080x1920
    size = size.split(':')[1].trim();
    let density = await shell(['wm density']);
    let densityArray = density.split('\n');
    //Physical density: 480
    //Override density: 440
    if (densityArray.length > 1) {
        console.log(density)
        density = densityArray[1];
        console.log('use override density')
    }
    if (density.indexOf(":") >= 0) {
        density = density.split(':')[1].trim()
    }
    const android_id = await shell(['settings get secure android_id']);
    const cpuinfo = await shell(['cat /proc/cpuinfo']);
    const cpuArray = cpuinfo.split("\n");
    let cpu_count = 0;
    let processor = '';
    cpuArray.forEach(cpu => {
        if (cpu.indexOf('processor') === 0) {
            cpu_count++;
        } else if (cpu.indexOf('Processor') >= 0 || cpu.indexOf('model name') >= 0) {
            processor = cpu.split(':')[1].trim();
        }
    })
    return { model, brand, name, os_version, sdk, size, density, android_id, cpuinfo, battery, cpu_count, processor };
}
// adb shell dumpsys activity top
const dumpsysyActivityTop = async () => {
    const output = await shell(['dumpsys activity top']);
    const lines = output.split('\n');
    let topActivitys = [];
    try {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.indexOf('ACTIVITY') >= 0) {
                //  ACTIVITY com.tencent.mm/.ui.LauncherUI 91a1a1b pid=4731
                let tmp = line.trim().split(' ');
                const name = tmp[1];
                const pid = tmp[3].split('=')[1];
                topActivitys.push({
                    name, pid
                });
            }
        }
    } catch (error) {
        console.error(error);
    }

    //{appPackage: "com.oppo.launcher", appActivity: ".Launcher"}
    const _adb = await adb();
    const top = await _adb.getFocusedPackageAndActivity();
    topActivitys = topActivitys.sort((left, right) => {
        return left.name.indexOf(top.appPackage) == 0 ? -1 : (right.name.indexOf(top.appPackage) == 0 ? 1 : 0);
    })

    return topActivitys;
}

//adb shell dumpsys package xxx.xxx
const dumsysPackage = async (pkgName) => {
    const output = await shell([`dumpsys package ${pkgName}`]);
    const index = output.indexOf("Packages:");
    const appDetail = output.substring(index);
    //console.log(appDetail);
    const detailLines = appDetail.split('\n');
    let versionCode = '';
    let versionName = '';
    let apkSigningVersion = '';
    let minSdk = '';
    let targetSdk = '';
    let debugAble = false;
    let firstInstallTime = '';
    let declaredPermissions = [];
    let declaredStart = false;
    let requestedPermissions = [];
    let requestedStart = false;
    let installPermissions = [];
    let installStart = false;
    try {
        for (let i = 0; i < detailLines.length; i++) {
            //console.log(`line => ${detailLines[i]}`)
            if (detailLines[i].indexOf('versionName') >= 0) {
                versionName = detailLines[i].split('=')[1].trim();
            } else if (detailLines[i].indexOf('apkSigningVersion') >= 0) {
                apkSigningVersion = detailLines[i].split('=')[1].trim();
            } else if (detailLines[i].indexOf('versionCode') >= 0) {
                let tmp = detailLines[i].trim().split(' ');
                versionCode = tmp[0].split('=')[1].trim();
                minSdk = tmp[1].split('=')[1].trim();
                targetSdk = tmp[2].split('=')[1].trim();
            } else if (detailLines[i].indexOf('firstInstallTime') >= 0) {
                firstInstallTime = detailLines[i].split('=')[1].trim();
            } else if (detailLines[i].indexOf('declared permissions:') >= 0) {
                declaredStart = true;
            } else if (detailLines[i].indexOf('requested permissions:') >= 0) {
                requestedStart = true;
                declaredStart = false;
            } else if (detailLines[i].indexOf('install permissions:') >= 0) {
                declaredStart = false;
                requestedStart = false;
                installStart = true;
            } else if (detailLines[i].indexOf('pkgFlags=') >= 0) {
                //pkgFlags=[ DEBUGGABLE HAS_CODE ALLOW_CLEAR_USER_DATA TEST_ONLY LARGE_HEAP ]
                debugAble = detailLines[i].indexOf('DEBUGGABLE') >= 0;
            } else if (declaredStart) {
                //com.wuba.permission.MIPUSH_RECEIVE: prot=signature, INSTALLED
                let p = detailLines[i].trim();
                let a = p.split(':');
                const per = {
                    permission: a[0],
                    prot: a[1].split(',')[0].split('=')[1]
                };
                declaredPermissions.push(per)
            } else if (requestedStart) {
                //android.permission.INTERACT_ACROSS_USERS_FULL
                requestedPermissions.push(detailLines[i].trim());
            } else if (installStart) {
                if (detailLines[i].indexOf('User') >= 0) {
                    installStart = false;
                } else {
                    installPermissions.push(detailLines[i].split(':')[0].trim());
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
    declaredPermissions = declaredPermissions.sort();
    requestedPermissions = requestedPermissions.sort();
    installPermissions = installPermissions.sort()
    return {
        versionCode, versionName, apkSigningVersion, minSdk, targetSdk, firstInstallTime, debugAble,
        declaredPermissions, requestedPermissions, installPermissions
    };
}

// adb shell dumpsys activity -p com.wuba processes
const dumpsysActivityProcesses = async (pkgName) => {
    const output = await shell([`dumpsys activity -p ${pkgName} processes`]);
    //*APP* UID 10425 ProcessRecord{70da9cb 28447:com.wuba/u0a425}
    //*APP* UID 10425 ProcessRecord{2ae0c22 28568:com.wuba:downloadapkservice/u0a425}
    const processes = [];
    const lines = output.split('\n');
    try {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.indexOf('*APP* UID ') >= 0) {
                let tmp = line.split(' ');
                let uid = tmp[2];
                //28447:com.wuba/u0a425}
                let p_index = tmp[4].indexOf(':');
                let pid = tmp[4].substring(0, p_index);
                let pname = tmp[4].substring(p_index + 1, tmp[4].indexOf('/'));
                processes.push({ uid, pid, pname });
            }
        }
    } catch (error) {
        console.error(error);
    }
    console.log(processes);
    return processes;
}

// adb shell am start -S -W -R 3 com.wuba/.home.activity.HomeActivity
const measureActivityLaunch = async (activity, count = 10) => {
    const output = await shell([`am start -S -W -R ${count} ${activity}`], { timeout: count * 8000 });
    const lines = output.split('\n');
    // Stopping: com.wuba
    // Starting: Intent { act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] cmp=com.wuba/.home.activity.HomeActivity }
    // Status: ok
    // Activity: com.wuba/.home.activity.HomeActivity
    // ThisTime: 2601
    // TotalTime: 2601
    // WaitTime: 2661
    // Complete
    const result = [];
    try {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.indexOf('ThisTime') == 0) {
                const thisTime = line.split(':')[1].trim();
                const totalTime = lines[i + 1].split(':')[1].trim();
                const waitTime = lines[i + 2].split(':')[1].trim();
                result.push({ this_time: parseInt(thisTime), total_time: parseInt(totalTime), wait_time: parseInt(waitTime) });
                continue;
            }
        }
    } catch (error) {
        console.error(error);
    }
    console.log('measure completed', result)
    return result;
}

// adb shell dumpsys package com.wuba|less
//android.intent.action.MAIN:
// 1884e12 com.wuba/.activity.launch.LaunchActivity filter ebe457d
//   Action: "android.intent.action.MAIN"
//   Category: "android.intent.category.LAUNCHER"
// f1eefe0 com.wuba/.plugins.ThirdFolderActivity filter 7294dbe
//   Action: "android.intent.action.VIEW"
//   Action: "android.intent.action.MAIN"
// 4829299 com.wuba/com.squareup.leakcanary.internal.DisplayLeakActivity filter acd456c
//   Action: "android.intent.action.MAIN"
//   Category: "android.intent.category.LAUNCHER"
// android.intent.action.VIEW:
const getLaunchActivityList = async packageName => {
    const output = await shell([`dumpsys package ${packageName}`]);
    const lines = output.split('\n');
    let startParse = false;
    const launcherActivityList = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === 'android.intent.action.MAIN:') {
            startParse = true;
        } else if (startParse) {
            if (line.endsWith(':')) {
                break;
            }
            if (line.indexOf('Category: "android.intent.category.LAUNCHER"') >= 0) {
                let j = i - 1;
                while (lines[j].indexOf(":") > 0) {
                    j--
                }
                launcherActivityList.push(lines[j].trim().split(' ')[1])
            }
        }
    }
    console.log('launch activity',launcherActivityList);
    return launcherActivityList;
}
// adb shell monkey -p your.app.package.name -c android.intent.category.LAUNCHER 1
// 05-29 15:43:10.765  1000  2760 I ActivityManager: Start proc 2775:com.eg.android.AlipayGphone/u0a115 for activity com.eg.android.AlipayGphone/.AlipayLogin
// 05-29 15:43:10.995  1000 15139 I ActivityManager: Start proc 2864:com.eg.android.AlipayGphone:push/u0a115 for service com.eg.android.AlipayGphone/com.alipay.pushsdk.push.NotificationService
// 05-29 15:43:11.066  1000  1000 I ActivityManager: Start proc 2890:com.coloros.notificationmanager/1000 for service com.coloros.notificationmanager/.NotificationChannelListenerService
// 05-29 15:43:11.816  1000  1153 I ActivityManager: Displayed com.eg.android.AlipayGphone/.AlipayLogin: +1s56ms
const startApp = async packageName => {
    const _adb = await adb();
    await _adb.forceStop(packageName);
    const output = await shell(['monkey', '-p', packageName, '-c', 'android.intent.category.LAUNCHER', '1']);
    console.log(`start ${packageName}`, output);
    return output;
}

// 情况日志 adb logcat -c
const clearLog = async () => {
    try {
        const _adb = await adb();
        const output = await _adb.shell(['logcat', '-c'], {});
        return output;
    } catch (error) {
        console.log(`ignore error`, error)
    }
    return '';
}

const screencap = async (des) => {
    const _adb = await adb();

    const name = `sdcard/next-screenshot-${Date.now()}.png`;
    let output = await shell(['screencap', '-p', name]);
    console.log(output)
    output = await _adb.adbExec(['pull', name, des]);
    console.log(output)
    output = await shell(['rm', '-rf', name]);
    console.log(output)
    // adbExec内部会对参数做shell-quote处理，导致特殊字符被转义,源码参见
    // https://github.com/substack/node-shell-quote/blob/master/index.js
    // adb -P 5037 -s KNZPPN55U8A66HRK exec-out screencap -p \> next-screenshot-1.png'
    //const output = await _adb.adbExec(['exec-out', 'screencap', '-p', '>', des]);
    try {
        if (fs.existsSync(des)) {
            const size = sizeOf(des);
            console.log('png exist with size', size);
            return { success: size.width > 0 && size.height > 0, file: des };
        }
        console.log('png not exist')
    } catch (err) {
        console.error(err);
    }
    return { success: false, file: des };
}

const _extractTimeFromLog = log => {
    return "";
}

export {
    adb, shell, devices, apps, deviceDetail, dumpsysyActivityTop, dumsysPackage, startApp,
    dumpsysActivityProcesses, measureActivityLaunch, getLaunchActivityList, clearLog, screencap
};