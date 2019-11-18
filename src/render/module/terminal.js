
import fs from 'fs';
import { spawnSync } from 'child_process';
/**
 * 打开Mac终端，并执行指定脚本文件
 */
const openTerminalWith = (launchPackagerScript, procConfig) => {
    const terminal = '/Applications/Utilities/Terminal.app';
    fs.chmodSync(launchPackagerScript, 0o765);
    spawnSync('open', ['-a', terminal, launchPackagerScript, '--args', 'this is optional param'], procConfig);
}

export {openTerminalWith}