import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { parse, URL } from 'url'
import { config } from './config.js'
import { mkdir } from './utils.js'
import cheerio from 'cheerio'


const { protocol } = new URL(config.url)

const pages = [config.startPage]
const resources = [config.startPage]

// 获取文件存储路径，不存在就创建
function getFilePath(url) {
    const { pathname, query } = parse(url)
    let filePath = config.output + pathname
    if (/\/$/.test(filePath)) {
        filePath = filePath + 'index'
        if (query) {
            filePath = filePath + '_' + query.replace(/\=/g, '_')
        }
    }
    if (!path.parse(filePath).ext) {
        filePath = filePath + '.html'
    }
    if (!fs.existsSync(filePath)) {
        mkdir(filePath)
    }
    return filePath
}

// 保存资源
export async function saveSource(url) {
    const filePath = getFilePath(url)
    const res = await axios.get(url, {
        responseType: "stream"
    })
    const writer = fs.createWriteStream(filePath);
    res.data.pipe(writer)
}

async function parseHtml(url){
    const { data: html } = await axios.get(url)
    const $ = cheerio.load(html)
    const aTags = $('a')
    const scriptTags = $('script')
    const cssTags = $('link[rel="stylesheet"]')
    const imgTags = $('img')
    const _pages = []

    // a标签解析
    aTags.each(function () {
        let _link = $(this).attr('href')
        if(!_link) return true
        if (/^\/.+/.test(_link)) {
            _link = config.url + _link
        } else {
            _link.replace(/http:\/\/|https:\/\//, protocol + '://')
            if(!_link.includes(config.url)) return true
        }
        if(['','.html'].includes(path.parse(parse(_link).pathname).ext && !pages.includes(_link))){
            _pages.push(_link)
        }
        if(!resources.includes(_link)){
            resources.push(_link)
        }
    })

     // script标签解析
     scriptTags.each(function () {
        let _script = $(this).attr('src')
        if (!_script) return true
        if (/^\/.+/.test(_script)) {        
            _script = config.url + _script
        }
        if(!resources.includes(_script)){
            resources.push(_script)
        }
    })

    // css标签解析
    cssTags.each(function () {
        let _css = $(this).attr('href')
        if (!_css)  return true
        if (/^\/.+/.test(_css)) {
            _css = config.url + _css
        }
        if(!resources.includes(_css)){
            resources.push(_css)
        }
    })

    imgTags.each(function () {
        let _src = $(this).attr('src')
        if(!_src) return true
        if (/^\/.+/.test(_src)) {
            _src = config.url + _src
        }
        if(!resources.includes(_src)){
            resources.push(_src)
        }
    })

    return _pages
}

export async function getAllPath(){
    let n = 0
    while(n++ < config.level){
        console.log(`第${n}次扫描`)
        let _pages
        for(let i = 0, len = pages.length; i < len; i ++) {
            _pages = await parseHtml(pages[i])
        }
        pages.push(...new Set(_pages))
    }
    console.log('扫描结束开始下载资源！')
    return resources
}
