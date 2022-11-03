// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
import { readFileSync } from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { xml2js } from 'xml-js'
import { Octokit } from '@octokit/rest'
const pluginId = 'bkhaagjahfmjljalopjnoealnfndnagc',
  url = `https://clients2.google.com/service/update2/crx?response=xml&os=win&arch=x64&os_arch=x86_64&nacl_arch=x86-64&prod=chromecrx&prodchannel=&prodversion=107.0.5304.88&lang=zh-CN&acceptformat=crx3&x=id%3D${pluginId}%26installsource%3Dondemand%26uc`

const release = async () => {
  //发布新release
  const releaseInfo = await github.rest.repos.createRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag_name: 'v' + update_version,
    name: 'v' + update_version,
    body: 'update success!\n\n- [x] Update time: ' + new Date().toUTCString(),
    prerelease: isDev,
  })
  //console.log(releaseInfo);

  const assetInfo = await github.rest.repos.uploadReleaseAsset({
    owner: context.repo.owner,
    repo: context.repo.repo,
    release_id: releaseInfo.data.id,
    name: 'Typro-Update-V' + update_version + '.exe',
    data: readFileSync(exePath),
  })
  //console.log(assetInfo);

  const assetInfo2 = await github.rest.repos.uploadReleaseAsset({
    owner: context.repo.owner,
    repo: context.repo.repo,
    release_id: releaseInfo.data.id,
    name: 'asar-file-V' + update_version + '.zip',
    data: readFileSync(asarZip),
  })
}

const github = new Octokit()
const doUpdate = async (
  {
    //   github,
    //   context,
    //   core,
    //   checkType,
    //   update_version,
    //   forceVersion,
    //   forceUpdate,
  },
) => {
  //获取最新版本信息
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
    .catch((e) => console.error('error happened', e))

  console.log(updateInfo)
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
doUpdate({})
