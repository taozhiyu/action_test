import { readFileSync, appendFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { xml2js } from 'xml-js'

import { colorNames, modifierNames } from 'ansi-styles'
import styles from 'ansi-styles'

Object.defineProperty(globalThis, 'random', { get: () => Math.random().toString(36).slice(2) })

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
    core.setFailed('get update info failed')
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

const fetchAndUnzip = async ({ github, core, exec, url, hash }) => {
  core.debug('request crx file')
  const randPath = hash
  const crxFileName = path.basename(url)
  const crxPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../temp/' + randPath + '/',
  )

  if (!existsSync(crxPath)) {
    mkdirSync(crxPath, { recursive: true });
  }
  const req = await github.request({
    method: 'GET',
    url,
  })
  appendFileSync(path.join(crxPath, crxFileName), Buffer.from(req.data))
  core.debug('crxFileName' + path.join(crxPath, crxFileName))
  core.startGroup('ls')
  await exec.exec('ls -al', [], { cwd: './temp/' + randPath })
  console.log('ls'.colorful('yellow') + " " + 'finished'.colorful('green'))
  core.endGroup()

  core.startGroup('unzip')
  try {
    // await exec.exec('unzip ' + crxFileName + ' -d ' + path.basename(url, '.crx'), [], { cwd: './temp/' + randPath })
    const resp=await exec.exec('-p','unzip',  [crxFileName, '-d', path.basename(url, '.crx')], { cwd: './temp/' + randPath })
    core.debug("unzip returns"+resp)
    console.log('unzip'.colorful('yellow') + ' ' + 'finished'.colorful('green'))
  } catch (err) {
    if (!err.message.endsWith('exit code 1')) {
      core.info(err)
      core.setFailed('unzip failed')
    }
  }
  core.endGroup()
  core.debug('file path')
  core.startGroup('ls twice')
  await exec.exec('ls -al', [], { cwd: './temp/' + randPath + '/' + crxFileName })
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
  io
}) => {
  const configPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../docs/updates/' + type + '/config.json',
  )

  const forceVersion = core.getInput('force-version')

  // 获取最新version
  const config = JSON.parse(readFileSync(configPath, 'utf-8'))
  core.debug(config)
  const updateInfo = await getLatestVersion({ github, id, core })
  if (forceVersion) updateInfo.version = forceVersion
  //const updateInfo = { version: '7.0.0', codebase: 'https://clients2.googleusercontent.com/crx/blobs/Acy1k0ZvWeOIYO34oMqjhl9sivTd0Wf1g1AJr3-zIrCDRsoaGEkulSMxpcQHiADIqjTz3Ifq3umalcMl1L-pKihTrf116JTl9ga7lOivnKqLCy0W4WUCdwDGUprlQqjEyrWMFqxf1y7mRcN40ePbXV0/extension_7_7_0_0.crx' }
  if (updateInfo.version === config.latestVersion) {
    core.setOutput('commit_message', '');
    core.info('No nee to update'.colorful('bgGreen'))
    return
  }
  core.info('update ready'.colorful('yellow'))
  const hash = random
  try {
    await fetchAndUnzip({ github, core, url: updateInfo.codebase, exec, hash })
  } catch {
    core.setFailed('fetch & unzip failed')
  }

  //const hash = random//'.'

  const { default: handleMain } = await import('./modules/' + type + '.js')
  // try {
  const result = await handleMain({
    fileName: path.basename(updateInfo.codebase, '.crx'),
    io,
    hash
  })
  core.info('handle result:')
  console.log(result)
  if (!result || 0 !== result.code) {
    core.error(result.message || "Unknown error")
    core.setFailed('handle error')
  }
  config.latestVersion = updateInfo.version
  config.updateDate = new Date().toGMTString()
  const newConfig = { ...config, ...result.output }
  core.setOutput('commit_message', `[@${config.updateDate}]${type} has automatically updated to V${config.latestVersion}`);
  writeFileSync(configPath, JSON.stringify(newConfig, "", 4))
  // } catch (error) {
  //   core.error(error)
  //   core.setFailed('handle error')
  // }
}

export default doUpdate