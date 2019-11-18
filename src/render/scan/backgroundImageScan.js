const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const SIZE_LIMIT = 50 * 1024; // 50KB
const DIMENSION_LIMIT = 200 * 200; // 200 x 200px 

/**
 * 获取文件的长&宽
 * 
 */
const getDimensions = (img) => {
    try {
        return sizeOf(img);
    } catch (error) {
        console.error(error);
        return { width: 0, height: 0 }
    }
}
/**
 * 获取文件大小（字节数）
 */
const getSize = (img) => {
    return fs.statSync(img).size;
}

/**
 * 遍历目录
 */
function travel(dir, callback) {
    fs.readdirSync(dir).forEach(function (file) {
        var pathname = path.join(dir, file);
        if (fs.statSync(pathname).isDirectory()) {
            travel(pathname, callback);
        } else {
            callback(pathname);
        }
    });
}

/**
 * 查找大图：文件大小或者文件尺寸
 */
const findLargeImage = async (des, { oomBytes = DIMENSION_LIMIT * 4, oomDpi = 480, pixel = DIMENSION_LIMIT }) => {
    let largeImage = [];
    travel(des, (fileName) => {
        if (fileName.endsWith('.png') || fileName.endsWith('.jpg')) {
            const size = getSize(fileName);
            const dimension = getDimensions(fileName);
            const pixels = dimension.width * dimension.height;
            let dpiNum = dpi(fileName)
            let scale = dpiNum > 0 ? oomDpi / dpiNum : 1;
            console.log('dpi', fileName, dpiNum, scale);
            if (4 * pixels * scale > oomBytes) {
                largeImage.push({ type: 3, name: fileName, size: size, width: dimension.width, height: dimension.height })
            } else if (size > SIZE_LIMIT) {
                largeImage.push({ type: 1, name: fileName, size: size, width: dimension.width, height: dimension.height })
            } else if (pixels > pixel) {
                largeImage.push({ type: 2, name: fileName, size: size, width: dimension.width, height: dimension.height })
            }
        }
    })
    return largeImage;
}

const DPI = new Map([
    ['-ldpi', 120],
    ['-mdpi', 160],
    ['-hdpi', 240],
    ['-xhdpi', 320],
    ['-xxhdpi', 480],
    ['-xxxhdpi', 640],
])

const dpi = (fileName) => {
    for (let [key, value] of DPI.entries()) {
        if (fileName.indexOf(key) > -1) {
            return value;
        }
    }
    return 0;
}

onmessage = e => {
    const params = e.data;
    console.log('receive message from main thread', params)
    findLargeImage(params.dir, params.config).then(images => {
        console.log('scan complete');
        postMessage(images)
    })
}