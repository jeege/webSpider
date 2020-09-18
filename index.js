import {saveSource, getAllPath} from './download.js'


async function init() {
    const urls = await getAllPath()
    console.log(urls)
    for(let i = 0, url; url = urls[i++];){
        saveSource(url)
    }
}

init()