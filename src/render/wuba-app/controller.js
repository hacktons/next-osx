import QRCode from 'qrcode'

class Controller {

    // fetch存在header跨域缺失问题，如果需要获取全部header则不能使用fetch
    checkUrlByFetch = (link) => {
        return fetch(link, {
            method: "HEAD",
        }).then(response => {
            const headers = response.headers
            headers.forEach(console.log);
            const result = { ok: response.ok, link: link }
            if (response.ok) {
                console.log('有效链接:' + link)
                try {
                    const length = headers.get('content-length');
                    const contentType = headers.get('content-type');
                    //application/vnd.android.package-archive
                    console.log(`类型：${contentType}, 字节数:${length}`)
                    result.type = contentType;
                    result.length = length;
                } catch (error) {
                    console.log('无效链接，忽略')
                    console.error(error);
                }
            } else {
                console.log('无效链接，忽略:' + link)
            }
            return result;
        })
    }

    // 通过XMLHttpRequest获取，可以得到所有header
    checkUrlByAjax = (link) => {
        return new Promise(resolve => {
            const request = new XMLHttpRequest();
            const result = { ok: false, link: link, short_link: link.substring(link.lastIndexOf('/') + 1) };
            request.onload = (e) => {
                // Get the raw header string
                const headers = request.getAllResponseHeaders();
                console.log(headers);
                if (request.status === 200) {
                    const length = request.getResponseHeader('content-length');
                    const contentType = request.getResponseHeader('content-type');
                    console.log(`类型：${contentType}, 字节数:${length}`)
                    result.type = contentType;
                    result.length = length;
                    if (length) {
                        const lengthInt = parseInt(length);
                        if (lengthInt > 0) {
                            result.readableLength = new Number(lengthInt / 1024 / 1024).toFixed(2) + "MB"
                        }
                    }
                }
                result.ok = request.status === 200;
            }
            request.onloadend = (e) => {
                resolve(result)
            }
            request.open('HEAD', link);
            request.send();
        })
    }

    updateQrcode = (link) => {
        return QRCode.toString(link, { type: 'svg', width: '200' });
    }

    findAPKWithVersion = (version, channel) => {
        const links = [`https://sdl.58cdn.com.cn/productor/2016/v${version}_batch/58client_v${version}_${channel}.apk`,
        `https://sdl.58cdn.com.cn/productor/2016/v${version}_ab/58client_v${version}_${channel}.apk`];
        return Promise.all([this.checkUrlByAjax(links[0]), this.checkUrlByAjax(links[1])]);
    }
}

export default Controller