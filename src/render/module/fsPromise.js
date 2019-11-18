const remote = require('electron').remote;
const electronFs = remote.require('fs');

class FsPromise {

    access(dir) {
        return new Promise((resolve, reject) => {
            electronFs.access(dir, electronFs.constants.F_OK, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    stat(dir) {
        return new Promise((resolve, reject) => {
            electronFs.stat(dir, (err, stat) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(stat);
            });
        });
    }
    
    mkdir(dir) {
        return new Promise((resolve, reject) => {
            electronFs.mkdir(dir, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            })
        });
    }
    rmdir(dir) {
        return new Promise((resolve, reject) => {
            electronFs.rmdir(dir, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            })
        });
    }
}

export default new FsPromise();