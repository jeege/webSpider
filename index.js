import {saveSource, getAllPath} from './download.js'


async function init() {
    const {resources: _urls} = await getAllPath()
    const urls = [...new Set(_urls)]
    for(let i = 0, url; url = urls[i++];){
        saveSource(url)
    }
}

init()