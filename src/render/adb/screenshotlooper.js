import ADB from 'appium-adb';
import shellEnv from 'shell-env';
import fixPath from 'fix-path';
const isDevMode = process.execPath.match(/[\\/]electron/);

if (!isDevMode) {
    // if we're running from the app package, we won't have access to env vars
    // normally loaded in a shell, so work around with the shell-env module
    const decoratedEnv = shellEnv.sync();
    process.env = { ...process.env, ...decoratedEnv };
    // and we need to do the same thing with PATH
    fixPath();
}

// 截屏文件前缀
const SCREENSHOT_PATH_PREFFIX = 'sdcard/next-screenshot';
const INTERVAL = 300;
// 截屏文件列表
const screenshots = [];
// 批量截屏后，导出的本地目录
let desDir;
let __port;
// 截屏定时器
let intervalTimer;
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

const takeScreenshot = () => {
    const name = `${SCREENSHOT_PATH_PREFFIX}-${Date.now()}.png`;
    return shell(['screencap', '-p', name]).then(output => {
        //console.log(`screenshot ${name} done ${output}`)
        screenshots.push(name);
    }).catch(err => {
        console.log(`screenshot failed: ${name}`, err);
    })
}

const terminateWorker = async () => {
    clearInterval(intervalTimer);
    const _adb = await adb();
    const result = [];
    //console.log('current screenshots list', screenshots);
    const pullPromiseList = screenshots.map(pic => {
        result.push(`http://localhost:${__port}/cache/${pic.split('/')[1]}`);
        return _adb.adbExec(['pull', pic, desDir]);
    })
    const outputList = await Promise.all(pullPromiseList);
    console.log('pull state', outputList);
    const output = await shell(['rm', '-rf', `${SCREENSHOT_PATH_PREFFIX}*`]);
    console.log(output);
    return result.sort();
}

const startWorker = () => {
    if (intervalTimer) {
        console.log('skip duplicate start')
        return
    }
    intervalTimer = setInterval(() => {
        takeScreenshot();
    }, INTERVAL);
}

onmessage = e => {
    const params = e.data;
    console.log('receive message from main thread', params);
    if (params.terminate) {
        const timeout = params.timeout;
        terminateWorker().then(result => {
            return result.map(it => {
                const start = it.lastIndexOf('-');
                const end = it.lastIndexOf('.');
                return { path: it, timestamp: parseInt(it.substring(start + 1, end)) }
            })
        }).then(result => {
            console.log(`post images result back`);
            postMessage({ image: result, timeout: timeout })
        }).catch(err => {
            console.error('finish worker failed', err)
        });
        return
    }
    desDir = params.desDir;
    __port = params.port;
    startWorker();
}