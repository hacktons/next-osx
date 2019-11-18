const remote = require('electron').remote;
const { exec } = remote.require('child_process');

class Git {

    constructor(baseDir) {
        this.baseDir = baseDir
    }

    clone(repo, branch, dir = this.baseDir, delay = 0) {
        return new Promise((resolve, reject) => {
            let run = () => {
                try {
                    console.log(`git clone -b ${branch} ${repo}`);
                    exec(`git clone -b ${branch} ${repo}`, { cwd: dir }, (error, stdout, stderr) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                            return;
                        }
                        stdout && console.log(`clone完成，请查看日志:\n${stdout}\n${stderr}`);
                        resolve(`clone完成：${repo}`);
                    });
                } catch (error) {
                    reject(error);
                }
            }
            if (delay > 0) {
                setTimeout(() => { run() }, delay);
            } else {
                run();
            }
        })
    }

    fetch(dir) {
        const git = this;
        return new Promise((resolve, reject) => {
            try {
                console.log('git fetch');
                exec(`git fetch`, { cwd: `${git.baseDir}/${dir}` }, (error, stdout, stderr) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                        return;
                    }
                    stdout && console.log(`fetch完成，请查看日志:\n${stdout}`);
                    stderr && console.log(`fetch失败，请查看日志:\n${stderr}`);
                    resolve('done');
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    listBranch(dir) {
        const git = this;
        return new Promise((resolve, reject) => {
            try {
                console.log('git branch -a |grep remotes/origin/release-');
                exec(`git branch -a |grep remotes/origin/release-`, { cwd: `${git.baseDir}/${dir}` }, (error, stdout, stderr) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                        return;
                    }
                    stdout && console.log(`完成，请查看日志:\n${stdout}`);
                    stderr && console.log(`失败，请查看日志:\n${stderr}`);
                    resolve(stdout);
                });
            } catch (error) {
                reject(error);
            }
        })
    }
}

export default Git;