const ipc = require('electron').ipcMain
const dialog = require('electron').dialog

function watchFileSeclector() {
    ipc.on('open-file-dialog', function (event, fileOrDirectory) {
        const props = {
            properties: [],
        }
        if (fileOrDirectory === 'file') {
            props.properties.push('openFile');
        } else if (fileOrDirectory === 'directory') {
            props.properties.push('openDirectory');
        } else {
            props.properties.push('openFile');
            props.properties.push('openDirectory');
        }
        dialog.showOpenDialog(props, function (files) {
            if (!files) {
                return;
            }
            event.sender.send('selected-file', files);
        })
    });
}

export { watchFileSeclector }