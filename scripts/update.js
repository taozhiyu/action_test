// import { readFileSync } from 'fs'
// import path from 'path'
import { xml2js } from 'xml-js'
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
import { colorNames, modifierNames } from 'ansi-styles'

String.prototype.colorful = function (...colors) {
  const text = this,
    colorTypes = ['color', 'bgColor']
  if (
    colors.find(
      (color) => Object.prototype.toString.call(color) !== '[object String]',
    )
  )
    throw new Error('Invalid color')
  let ret = text
  colors.forEach((color, i) => {
    if ([...colorNames, ...modifierNames].includes(color)) {
      ret = styles[color].open + ret + styles[color].close
    } else if (color.startsWith('#')) {
      ret =
        styles[colorTypes[+!!i]].ansi(styles.hexToAnsi(color)) +
        ret +
        styles[colorTypes[+!!i]].close
    }
  })
  return ret
}

module.exports = async ({
  github,
  context,
  core,
  type,
  id,
  ver: oldVer,
}) => {
  const forceUpdate = core.getInput('force-update-type') === "yes",
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
