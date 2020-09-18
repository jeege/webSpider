import fs from 'fs'

export function mkdir(filePath) {
    const dirCache = {};
    const arr = filePath.split('/');
    let dir = '/';
    for (let i = 0; i < arr.length; i++) {
        if (!dirCache[dir] && !fs.existsSync(dir)) {
            dirCache[dir] = true;
            fs.mkdirSync(dir);
        }
        dir = dir + '/' + arr[i];
    }
    fs.writeFileSync(filePath, '')
}
