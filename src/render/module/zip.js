const remote = require('electron').remote;
const { exec } = remote.require('child_process');

const unzipFile = (src, des) => {
    return new Promise((resolve, reject) => {
        // 静默解析&自动覆盖重名内容，相比较js代码解压，shell更简洁高效
        exec(`unzip -uo ${src} -d ${des}`, {maxBuffer: 100* 1024 * 500}, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            resolve();
        });
        // TODO 考虑兼容性
    });
}

export { unzipFile };