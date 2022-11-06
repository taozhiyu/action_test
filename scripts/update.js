import { readFileSync, appendFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
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
import styles from 'ansi-styles'

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

const getConfig = (type) => {
  const configPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../docs/updates/' + type + '/config.json',
  )
  return JSON.parse(readFileSync(configPath, 'utf-8'))
}

const getLatestVersion = async ({ github, id, core }) => {
  //获取最新版本信息
  core.startGroup('get latest info')

  const url = `https://clients2.google.com/service/update2/crx?response=xml&os=win&arch=x64&os_arch=x86_64&nacl_arch=x86-64&prod=chromecrx&prodchannel=&prodversion=200&lang=&acceptformat=crx3&x=id%3D${id}%26installsource%3Dondemand%26uc`

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
      return { version, codebase }
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
  return updateInfo
}

const fetchAndUnzip = async ({ github, core, exec, url }) => {
  core.debug('request crx file')
  // 确保不重复(似乎没有必要？)Math.random().toString(36).slice(2) + '__' +
  const crxFileName = path.basename(url)
  const crxPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../' + crxFileName,
  )
  const req = await github.request({
    method: 'GET',
    url,
  })
  appendFileSync(crxFileName, Buffer.from(req.data))
  core.startGroup('ls')
  await exec.exec('ls -al')
  console.log('ls'.colorful('yellow') + " " + 'finished'.colorful('green'))
  core.endGroup()

  core.startGroup('unzip')
  try {
    await exec.exec('unzip ' + crxFileName + ' -d ' + path.basename(url, '.crx'))
    console.log('unzip'.colorful('yellow') + ' ' + 'finished'.colorful('green'))
  } catch (error) {
    if (!error.endWith('exit code 1'))
      core.setfailed('unzip failed')
    // core.info(error)
  }
  core.endGroup()

  core.startGroup('ls twice')
  await exec.exec('ls -al')
  console.log('ls'.colorful('yellow') + " " + 'finished'.colorful('green'))
  core.endGroup()
}

const doUpdate = async ({
  github,
  context,
  core,
  type,
  id,
  exec,
}) => {
  const forceUpdate = core.getInput('force-update-type') === "yes",
    forceVersion = core.getInput('force-version')

  // 获取最新version
  const config = getConfig(type)
  console.log(config)
  const updateInfo = await getLatestVersion({ github, id, core })
  if (forceVersion) updateInfo.version = forceVersion

  if (updateInfo.version === config.latestVersion) {
    core.setOutput('commit_message', '');
    core.info('No nee to update'.colorful('bgGreen'))
    return
  }
  core.info('update ready'.colorful('yellow'))
  fetchAndUnzip({ github, core, url: updateInfo.codebase, exec })

  const { default: handleMain } = await import('./modules/' + type + '.js')
  console.log(handleMain)
  handleMain('test')
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

export default doUpdate