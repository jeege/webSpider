import {getAllPath, searchUrlByClass} from './download.js'
import {config} from './config.js'

async function init() {
    const {pages: _urls} = await getAllPath()
    const urls = [...new Set(_urls)]
    for(let i = 0, url; url = urls[i++];){
        if(await searchUrlByClass(url, config.searchClass )){
            console.log(url)
        }
    }
}

init()