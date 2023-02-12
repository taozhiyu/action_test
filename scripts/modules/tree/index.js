import fs from 'fs'
import parser from '@babel/parser'
import traverse from '@babel/traverse'
import types from '@babel/types'
import { fileURLToPath } from 'url'
import generator from '@babel/generator'
import path from 'path'
import { replaceLists } from './replaceLists.js'
import puppeteer from 'puppeteer'

import Zip from 'jszip'

let warningTips = ""

const handleManifest = (txt) => {
    const obj = JSON.parse(txt)
    delete obj.update_url
    if (obj.manifest_version !== 2) throw 'manifest_version updated!'
    if (!obj.permissions.includes("notifications")) obj.permissions.push("notifications")
    return JSON.stringify(obj, "", 4)
}

const handleBackground = (path) => {
    // const sweetCode = fs.readFileSync('../sweetalert2.min.js')
    // const code = `${sweetCode}`
    const code = ``
    fs.appendFileSync('sample.txt', code, 'utf8');
    return code
}

const handleContent = (rawCode) => {
    const ast = parser.parse(rawCode)
    traverse.default(ast, {
        TemplateLiteral(path) {
            if (path.toString().includes('trial remained')) {
                path.replaceWith(types.stringLiteral('吾爱破解@涛之雨'))
            }
        },
        FunctionDeclaration(path) {
            if (path.toString().includes('subscriptionStatus')) {
                var bodies = path.node.body.body
                if (bodies[0].declarations.length !== 1)
                    throw 'declarations length error'
                var bodies = path.node.body.body
                if (bodies[bodies.length - 1].type !== 'ReturnStatement')
                    throw 'ReturnStatement mode changed'
                var expressions = bodies[bodies.length - 1].argument.expressions
                if (
                    expressions.length !== 2 ||
                    'ObjectExpression' !== expressions[1].type ||
                    expressions[1].properties.length !== 3 ||
                    expressions[1].properties.filter((a) => {
                        if (a.key.type !== 'Identifier' || a.value.type !== 'Identifier')
                            throw 'ObjectExpression changed'
                        return ['remainingTrialDays', 'state', 'authTokenPayload'].includes(
                            a.key.name,
                        )
                    }).length !== 3
                )
                    throw 'ReturnStatement mode changed'
                expressions[1].properties.map((a) => {
                    if (a.key.name === 'remainingTrialDays')
                        a.value = types.NumericLiteral(520)
                    if (a.key.name === 'state')
                        a.value = types.conditionalExpression(
                            types.binaryExpression('===', a.value, types.NumericLiteral(1)),
                            types.NumericLiteral(1),
                            types.NumericLiteral(3),
                        )
                    return a
                })
            }
        },
    })
    let { code } = generator.default(
        ast,
        { minified: true, compact: true, comments: false },
        rawCode,
    )
    const matchRule = /(class\s*=\s*\\?"octotree-footer-trial-info__message[^>]+>[^<]*<\/div>)([^)]+\))/
    if (code.match(new RegExp(matchRule, 'g')).length === 1) {
        try {
            (() => {
                const injectSettings = fs.readFileSync('./tree.injectsettings.js')
                const ast = parser.parse(injectSettings)
                code = code.replace(matchRule, `style=\"flex-grow:1\" $1
            <a class='octotree-settings' id='taozhiyu_setting'>
                <span class='tooltipped tooltipped-n' aria-label='settings about 涛之雨 Mod version'>
                    <i class='octotree-icon-settings'></i>
                </span>
            </a> $2,
            (()=>{${generator.default(
                    ast,
                    { minified: true, compact: true, comments: false },
                    injectSettings,
                ).code}})()`.replace(/\n\s*/g, "")
                )
            })()
        } catch (e) {
            console.error("error occur when inject setting")
            warningTips += `\nerror occur when inject setting\n`
        }
    } else warningTips += `\nerror while adding Mod setting\n`
    return code
}

const handleContent_zh = (code, core) => (
    !replaceLists.map((a) => {
        if (!a.matchedNumber || a.matchedNumber === code.match(a.rule)?.length)
            code = code.replace(a.rule, a.replaceWith)
        else {
            core.warning(
                `[${a.rule.toString()}] matched numbers verified error.\nGot ${code.match(a.rule)?.length
                }, but should be ${a.matchedNumber}.\nskip this rule.`,
            )
            warningTips += `[${a.rule.toString()}] matched numbers verified error.\nGot ${code.match(a.rule)?.length
                }, but should be ${a.matchedNumber}.\n`
        }
    }), code
)

const bundleZIP = async ({ rawPath, targetPath, hash }) => {
    const zip = new Zip();
    ['readme.txt', 'content.js', 'manifest.json', 'background.js'].map(a => zip.file(a, fs.readFileSync(path.join(rawPath, a))))
    await new Promise((resolve, reject) => {
        zip
            .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(fs.createWriteStream(path.join(targetPath, hash + '.zip')))
            .on('finish', function () {
                console.log("out.zip written.");
                resolve()
            });
    })
}

const getVersion = async (ver) => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://www.octotree.io/changes')
    await page.waitForSelector('.releases>*')
    const version = await page.$$eval(
        '.releases>*',
        (el, ver) =>
            el
                .map((a) => {
                    if (a.tagName.toLowerCase() === 'ul') {
                        if (!isRight) return
                        return a
                    } else {
                        isRight = a.innerHTML.includes(ver)
                    }
                })
                .filter((a) => a)
                .flatMap((a) => a.innerText)
                .join('\n'),
        ver,
    )
    browser.close()
    return version
}

const handleMain = async ({ fileName, io, hash, zipWrite, version, github, core }) => {
    const rawPath = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../../temp/' + hash + "/" + fileName,
    )
    const targetPath = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        `../../../docs/updates/tree/${fileName}`
    )
    const jspath = path.join(rawPath, 'content.js')
    await io.mkdirP(path.join(targetPath, 'zh'));

    try {
        const rawManifest = fs.readFileSync(path.join(rawPath, './manifest.json'), 'utf-8')
        const manifest = handleManifest(rawManifest)
        fs.writeFileSync(path.join(rawPath, 'manifest.json'), manifest)
    } catch (e) {
        return { code: -1, message: e || 'handle manifest file error' }
    }


    const bCode = handleBackground(github, fs.readFileSync(path.join(rawPath, 'background.js'), 'utf-8'))
    // fs.writeFileSync(path.join(targetPath, 'background.js'), bCode)
    fs.writeFileSync(path.join(rawPath, 'background.js'), bCode)


    let code = ""
    try {
        const rawCode = fs.readFileSync(jspath, 'utf-8')
        code = handleContent(rawCode)
    } catch (e) {
        return { code: -1, message: e || 'handle content error' }
    }
    // fs.writeFileSync(path.join(targetPath, 'content.js'), code)
    fs.writeFileSync(jspath, code)

    try {
        fs.writeFileSync(path.join(rawPath, 'readme.txt'), `By 涛之雨@52pojie.cn
auto generated by GitHub Action itself:)
use it low-profile`)
        await zipWrite(`./temp/${hash}/${fileName}`, { saveTo: `./docs/updates/tree/${fileName}/full_${hash}.zip` })
    } catch (e) {
        return { code: -1, message: e || 'zip save failed' }
    }

    try {
        fs.appendFileSync(path.join(rawPath, 'readme.txt'), `

HOW TO USE:
Unzip and overwrite.`)
        await bundleZIP({ rawPath, targetPath, hash })
        // await zipWrite(`./temp/${hash}/${fileName}`, { saveTo: `./docs/updates/tree/${hash}/${fileName}/${version}.zip` })
    } catch (e) {
        return { code: -1, message: e || 'zip save failed' }
    }

    let zhCode = ""
    try {
        zhCode = handleContent_zh(code, core)
    } catch (e) {
        return { code: -1, message: e || 'handle content to zh error' }
    }
    fs.writeFileSync(jspath, zhCode)
    try {
        fs.writeFileSync(path.join(rawPath, 'readme.txt'), `By: 涛之雨@吾爱破解
GitHub Action 自动生成:)
别再传播了，球球了`)
        await zipWrite(`./temp/${hash}/${fileName}`, { saveTo: `./docs/updates/tree/${fileName}/full_${hash}.zip` })
    } catch (e) {
        return { code: -1, message: e || 'zip save failed' }
    }
    // fs.writeFileSync(path.join(targetPath, 'zh', 'content.js'), zhCode)

    try {
        fs.appendFileSync(path.join(rawPath, 'readme.txt'), `

补丁使用方法:
解压后覆盖`)
        await bundleZIP({ rawPath, targetPath, hash: hash + ".zh" })
        // await zipWrite(`./temp/${hash}/${fileName}`, { saveTo: `./docs/updates/tree/${hash}/${fileName}/${version}.zip` })
    } catch (e) {
        return { code: -1, message: e || 'zip save failed' }
    }

    return {
        code: 0,
        output: {
            fileRules: {
                file: {
                    'en': `updates/tree/${fileName}/full_${hash}.zip`,
                    'zh': `updates/tree/${fileName}/full_${hash}.zh.zip`,
                }
            }
        },
        warningTips,
        msg: await getVersion('7.7.1')
    }
}

export default handleMain