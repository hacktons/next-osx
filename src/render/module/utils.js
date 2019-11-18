const fs = require('fs');
const { clipboard } = require('electron')

const withProgress = (promises, callback) => {
    let len = promises.length;
    promises.forEach((p, index) => {
        p.then((data) => {
            callback((index + 1) * 100 / len, data);
            return data;
        })
    });
    return Promise.all(promises);
}

const extractBranchList = (value) => {
    let map = new Map();
    let array = value.split("\n");
    let orderBranch = array.map(ele => {
        let item = ele.trim();
        item = item.substring('remotes/origin/'.length);
        return item;
    }).filter(item => {
        if (item.length == 0) {
            return false;
        }
        let n = item.substring('release-'.length);
        let version = n.replace(/\./gi, '');
        if (isNaN(+version)) {
            return false;
        }
        let nSplit = n.split(".");// , 
        let parsedVersion;
        if (nSplit.length > 3) {//6.3.2.0 => 6320
            parsedVersion = version;
        } else { //8.12.0  => 81200
            parsedVersion = parseInt(nSplit[0]) * 10000 + parseInt(nSplit[1]) * 100 + parseInt(nSplit[2])
        }
        map.set(item, parseInt(parsedVersion));
        //console.log(`${item} => ${parsedVersion}`);
        return true;
    }).sort((left, right) => {// high => low
        return map.get(right) - map.get(left);
    });
    return orderBranch;
}

const runSerial = (tasks, callback) => {
    if (callback) {
        let len = tasks.length;
        tasks.forEach((p, index) => {
            p.then((data) => {
                callback((index + 1) * 100 / len);
                return data;
            });
        });
    }

    var result = Promise.resolve();
    tasks.forEach(task => {
        result = result.then(() => { return task });
    });
    return result;
}

const delay = (p, t) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(p);
        }, t);
    })
}

const download = async (url, desFile) => {
    console.log(`start donwload: ${url}`);
    let response = await fetch(url);
    if (response.status !== 200) {
        throw Error('status=' + response.status);
    }
    let reader = response.body.getReader();
    if (fs.existsSync(desFile)) {
        try {
            fs.unlinkSync(desFile);
        } catch (error) {
            console.log('remove exist file failed', error);
        }
    }
    const writer = fs.createWriteStream(desFile, {
        flags: 'w',
        autoClose: true
    });

    console.log('read & write chunk...')
    let chunk = await reader.read();
    while (!chunk.done) {
        if (chunk.value) {
            //console.log('write chunk...')
            writer.write(Buffer.from(chunk.value));
        }
        //console.log('read chunk...')
        chunk = await reader.read();
    }
    console.log('done');
    return desFile;
}

const previewMergeUrl = (project, project_id, branch_from, branch_to) => {
    return `http://igit.58corp.com/${project}/merge_requests/new/diffs?utf8=%E2%9C%93&merge_request%5Bsource_project_id%5D=${project_id}&merge_request%5Bsource_branch%5D=${branch_from}&merge_request%5Btarget_project_id%5D=${project_id}&merge_request%5Btarget_branch%5D=${branch_to}`;
}

const writeFile = (des, content) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(des, content, function (err) {
            if (err) {
                console.log(err);
                reject(err);
                return
            }
            resolve();
        });
    })
}

const _date = new Date();
const formatDate = (timestamp, opt = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
}) => {
    _date.setTime(timestamp);
    return _date.toLocaleTimeString('zh-Hans-CN', opt);
}

export { withProgress, extractBranchList, runSerial, delay, download, previewMergeUrl, writeFile, clipboard, formatDate };