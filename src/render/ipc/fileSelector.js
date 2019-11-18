const ipc = require('electron').ipcRenderer

function select(file, callback) {
    if (file === 'file') {
        ipc.send('open-file-dialog', "file");
    } else if (file === 'directory') {
        ipc.send('open-file-dialog', "directory");
    } else {
        ipc.send('open-file-dialog');
    }
    ipc.once('selected-file', function (event, files) {
        callback(files);
    })
}

function selectDir(callback) {
    select('directory', callback);
}

function selectFile(callback) {
    select('file', callback);
}

export { selectDir, selectFile };