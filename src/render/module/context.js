import fsp from './fsPromise';
const os = require('os');
const fs = require('fs');
const path = require('path');
const APP_DIR = 'cn.hacktons.next';
const APP_CACHE = 'cache';
const APP_FILE = "file";

/**
 * 临时根目录
 */
const tmpdir = () => {
    return path.join(os.tmpdir(), APP_DIR);
}
/**
 * 缓存目录
 */
const cachedir = () => {
    const dir = path.join(tmpdir(), APP_CACHE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    return dir;
}
/**
 * 文件目录
 */
const filedir = () => {
    return path.join(tmpdir(), APP_FILE);
}

const file = (dir, name) => {
    return path.join(dir, name);
}
var __port = '';
const serverPort = () => {
    return __port;
}
/**
 * 初始化缓存目录
 */
const initdir = async () => {
    try {
        await fsp.access(tmpdir());
    } catch (error) {
        await fsp.mkdir(tmpdir());
    }
    try {
        await fsp.access(cachedir());
    } catch (error) {
        await fsp.mkdir(cachedir());
    }
    try {
        await fsp.access(filedir());
    } catch (error) {
        await fsp.mkdir(filedir());
    }
    fs.readFile(file(tmpdir(), 'port'), 'UTF-8', (err, data) => {
        if (data) {
            __port = data;
            console.log(`current port is=> ${__port}`)
        }
    })
}

export { tmpdir, cachedir, filedir, initdir, file,serverPort };