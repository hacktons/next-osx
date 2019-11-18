const nodeStatic = require('node-static');
const http = require('http');
const path = require('path');
const os = require('os');
const fs = require('fs');
const APP_DIR = 'cn.hacktons.next';

const tmpdir = () => {
    return path.join(os.tmpdir(), APP_DIR);
}

const server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        new nodeStatic.Server(tmpdir()).serve(request, response)
    }).resume()
}).listen(0);
server.on('listening', function () {
    var port = server.address().port
    console.log(`serve on port => ${port}`)
    fs.writeFile(path.join(tmpdir(), "port"), `${port}`, function (err) {
        if (err) {
            console.log('save port failed', err);
            reject(err);
            return
        }
    });
});