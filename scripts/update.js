// import { readFileSync } from 'fs'
// import path from 'path'
// import { xml2js } from 'xml-js'
// import { Octokit } from '@octokit/rest'
// const release = async () => {
//   //发布新release
//   const releaseInfo = await github.rest.repos.createRelease({
//     owner: context.repo.owner,
//     repo: context.repo.repo,
//     tag_name: 'v' + update_version,
//     name: 'v' + update_version,
//     body: 'update success!\n\n- [x] Update time: ' + new Date().toUTCString(),
//     prerelease: isDev,
//   })
//   //console.log(releaseInfo);

//   const assetInfo = await github.rest.repos.uploadReleaseAsset({
//     owner: context.repo.owner,
//     repo: context.repo.repo,
//     release_id: releaseInfo.data.id,
//     name: 'Typro-Update-V' + update_version + '.exe',
//     data: readFileSync(exePath),
//   })
//   //console.log(assetInfo);

//   const assetInfo2 = await github.rest.repos.uploadReleaseAsset({
//     owner: context.repo.owner,
//     repo: context.repo.repo,
//     release_id: releaseInfo.data.id,
//     name: 'asar-file-V' + update_version + '.zip',
//     data: readFileSync(asarZip),
//   })
// }

String.prototype.colorful = function (...e) {
  const r = ["color", "bgColor"], { styles: o, colorNames: t, modifierNames: n } = function () { const e = 10, r = (e = 0) => r => `\x1b[${r + e}m`, o = (e = 0) => r => `\x1b[${38 + e};5;${r}m`, t = (e = 0) => (r, o, t) => `\x1b[${38 + e};2;${r};${o};${t}m`, n = { modifier: { reset: [0, 0], bold: [1, 22], dim: [2, 22], italic: [3, 23], underline: [4, 24], overline: [53, 55], inverse: [7, 27], hidden: [8, 28], strikethrough: [9, 29] }, color: { black: [30, 39], red: [31, 39], green: [32, 39], yellow: [33, 39], blue: [34, 39], magenta: [35, 39], cyan: [36, 39], white: [37, 39], blackBright: [90, 39], gray: [90, 39], grey: [90, 39], redBright: [91, 39], greenBright: [92, 39], yellowBright: [93, 39], blueBright: [94, 39], magentaBright: [95, 39], cyanBright: [96, 39], whiteBright: [97, 39] }, bgColor: { bgBlack: [40, 49], bgRed: [41, 49], bgGreen: [42, 49], bgYellow: [43, 49], bgBlue: [44, 49], bgMagenta: [45, 49], bgCyan: [46, 49], bgWhite: [47, 49], bgBlackBright: [100, 49], bgGray: [100, 49], bgGrey: [100, 49], bgRedBright: [101, 49], bgGreenBright: [102, 49], bgYellowBright: [103, 49], bgBlueBright: [104, 49], bgMagentaBright: [105, 49], bgCyanBright: [106, 49], bgWhiteBright: [107, 49] } }, i = Object.keys(n.modifier), l = [...Object.keys(n.color), ...Object.keys(n.bgColor)]; return { styles: function () { const i = new Map; for (const [e, r] of Object.entries(n)) { for (const [e, o] of Object.entries(r)) n[e] = { open: `\x1b[${o[0]}m`, close: `\x1b[${o[1]}m` }, r[e] = n[e], i.set(o[0], o[1]); Object.defineProperty(n, e, { value: r, enumerable: !1 }) } return Object.defineProperty(n, "codes", { value: i, enumerable: !1 }), n.color.close = "\x1b[39m", n.bgColor.close = "\x1b[49m", n.color.ansi = r(), n.color.ansi256 = o(), n.color.ansi16m = t(), n.bgColor.ansi = r(e), n.bgColor.ansi256 = o(e), n.bgColor.ansi16m = t(e), Object.defineProperties(n, { rgbToAnsi256: { value: (e, r, o) => e === r && r === o ? e < 8 ? 16 : e > 248 ? 231 : Math.round((e - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(e / 255 * 5) + 6 * Math.round(r / 255 * 5) + Math.round(o / 255 * 5), enumerable: !1 }, hexToRgb: { value: e => { const r = /[a-f\d]{6}|[a-f\d]{3}/i.exec(e.toString(16)); if (!r) return [0, 0, 0]; let [o] = r; 3 === o.length && (o = [...o].map(e => e + e).join("")); const t = Number.parseInt(o, 16); return [t >> 16 & 255, t >> 8 & 255, 255 & t] }, enumerable: !1 }, hexToAnsi256: { value: e => n.rgbToAnsi256(...n.hexToRgb(e)), enumerable: !1 }, ansi256ToAnsi: { value: e => { if (e < 8) return 30 + e; if (e < 16) return e - 8 + 90; let r, o, t; if (e >= 232) o = r = (10 * (e - 232) + 8) / 255, t = r; else { const n = (e -= 16) % 36; r = Math.floor(e / 36) / 5, o = Math.floor(n / 6) / 5, t = n % 6 / 5 } const n = 2 * Math.max(r, o, t); if (0 === n) return 30; let i = 30 + (Math.round(t) << 2 | Math.round(o) << 1 | Math.round(r)); return 2 === n && (i += 60), i }, enumerable: !1 }, rgbToAnsi: { value: (e, r, o) => n.ansi256ToAnsi(n.rgbToAnsi256(e, r, o)), enumerable: !1 }, hexToAnsi: { value: e => n.ansi256ToAnsi(n.hexToAnsi256(e)), enumerable: !1 } }), n }(), colorNames: l, modifierNames: i } }(); if (e.find(e => "[object String]" !== Object.prototype.toString.call(e))) throw new Error("Invalid color"); let i = this; return e.forEach((e, l) => { [...t, ...n].includes(e) ? i = o[e].open + i + o[e].close : e.startsWith("#") && (i = o[r[+!!l]].ansi(o.hexToAnsi(e)) + i + o[r[+!!l]].close) }), i
};


module.exports = async ({
  github,
  context,
  core,
  type,
  id,
  ver: oldVer,
}) => {
  const forceUpdate = core.getBooleanInput('force-update-type'),
    forceVersion = core.getInput('force-version')
  core.startGroup('base info'.colorful('green'))
  core.info('type:', type.colorful('red'))
  core.info('id', id.colorful('red'))
  core.info('version', oldVer.colorful('red'))
  core.endGroup()
  //获取最新版本信息

  const url = `https://clients2.google.com/service/update2/crx?response=xml&os=win&arch=x64&os_arch=x86_64&nacl_arch=x86-64&prod=chromecrx&prodchannel=&prodversion=107.0.5304.88&lang=zh-CN&acceptformat=crx3&x=id%3D${id}%26installsource%3Dondemand%26uc`

  const updateInfo = await github
    .request({
      method: 'GET',
      url,
    })
    .then(({ data }) => {
      const {
        gupdate: {
          app: {
            updatecheck: {
              _attributes: { version, codebase },
            },
          },
        },
      } = xml2js(data, { compact: true })
      return { version: forceVersion, codebase }
    })
    .catch((e) => {
      console.error('error happened', e)
      return {}
    })
  if (!updateInfo) {
    core.endGroup()
    core.setfailed('get update info failed')
    return
  }
  console.log(`Latest Version: 
${'version'.colorful('whiteBright', 'bgYellow')}: ${updateInfo.version.colorful(
    'yellow',
  )}
${'codebase'.colorful(
    'whiteBright',
    'bgGreen',
  )}: ${updateInfo.codebase.colorful('green')}`)
  core.endGroup()
  return
  // 获取最新tag
  const tagInfo = await github.rest.repos.listTags(
    ({ owner, repo } = context.repo),
  )
  console.log(tagInfo)
  //console.log(assetInfo2);

  //更新json配置
  //   if (!(forceVersion && forceUpdate !== '1')) {
  //     const conf = JSON.parse(fs.readFileSync(win64ConfigPath))
  //     console.log(conf)
  //     conf.version = update_version
  //     conf.download = assetInfo.data.browser_download_url
  //     conf.downloadCN = assetInfo.data.browser_download_url.replace(
  //       'github.com',
  //       'hub.fastgit.xyz',
  //     )
  //     if (isDev) conf.download = conf.downloadCN
  //     fs.writeFileSync(win64ConfigPath, JSON.stringify(conf, '', 4))
  //   }
  //   //删除缓存文件
  //   fs.unlinkSync(exePath)
  //   fs.unlinkSync(asarZip)

  //   core.setOutput('commit_message', `update ${checkType} V${update_version}`)
}
