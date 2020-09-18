import axios from 'axios'
import path from 'path'
import { parse } from 'url'
import { config } from './config.js'
import { saveSource } from './download.js'


async function downcssBg(url) {
    const { data } = await axios.get(url)
    const noBlankData = data.replace(/\s/img, '');
    const matched = noBlankData.match(/url\((.*?)\)/g).map(i => {
        const _path = i.replace(/url\(\"?(.*?)\"?\)/, '$1')
        return config.url + path.resolve(parse(url).pathname, '..', _path)
    })
    return matched
}

async function init() {
    const urls = await downcssBg(config.cssFile)
    console.log(urls)
    for (let i = 0, url; url = urls[i++];) {
        saveSource(url)
    }
}

init()