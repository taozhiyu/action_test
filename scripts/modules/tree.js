import fs from 'fs'
import parser from '@babel/parser'
import traverse from '@babel/traverse'
import types from '@babel/types'
import { fileURLToPath } from 'url'
import generator from '@babel/generator'
import path from 'path'

const replaceLists = [
    {
        rule: /("Pin)? this sidebar/g,
        replaceWith: (matched) =>
            (matched.startsWith('"') ? '"' : '') + '固定侧边栏',
        matchedNumber: 2,
    },
    {
        rule: /"\s*?Unpin\s*?"\s*?:\s*?"\s*?Pin\s*?"/,
        replaceWith: '"取消":""',
        matchedNumber: 1,
    },
    {
        rule: /([">])Settings/g,
        replaceWith: '$1设置',
        matchedNumber: 11,
    },
    {
        rule: /Or enter access token/,
        replaceWith: '或者输入访问令牌',
        matchedNumber: 1,
    },
    {
        rule: /Other GitHub Accounts/,
        replaceWith: '其他GitHub账户',
        matchedNumber: 1,
    },
    {
        rule: /Clear GitHub OAuth/,
        replaceWith: '清除GitHub OAuth',
        matchedNumber: 1,
    },
    {
        rule: /Add more account/,
        replaceWith: '添加更多账户',
        matchedNumber: 1,
    },
    {
        rule: /"Username/,
        replaceWith: '"用户名',
        matchedNumber: 1,
    },
    {
        rule: /"Token/,
        replaceWith: '"Token 令牌',
        matchedNumber: 1,
    },
    {
        rule: /Show sidebar on hover/,
        replaceWith: '悬停时显示侧边栏',
        matchedNumber: 1,
    },
    {
        rule: /Shrink GitHub header/,
        replaceWith: '收缩GitHub头部',
        matchedNumber: 1,
    },
    {
        rule: />Hotkeys/,
        replaceWith: '>快捷键',
        matchedNumber: 1,
    },
    {
        rule: />Display</,
        replaceWith: '>显示<',
        matchedNumber: 1,
    },
    {
        rule: /"Keys?/g,
        replaceWith: '"键',
        matchedNumber: 2,
    },
    {
        rule: /Show in/,
        replaceWith: '显示在',
        matchedNumber: 1,
    },
    {
        rule: /Code & pulls/,
        replaceWith: '代码和拉取请求(PRs)',
        matchedNumber: 1,
    },
    {
        rule: /Code<\/option>/,
        replaceWith: '代码</option>',
        matchedNumber: 1,
    },
    {
        rule: />Pull requests/,
        replaceWith: '>拉取请求(PRs)',
        matchedNumber: 1,
    },
    {
        rule: /All pages/,
        replaceWith: '所有页面',
        matchedNumber: 1,
    },
    {
        rule: />Icons/,
        replaceWith: '>图标',
        matchedNumber: 1,
    },
    {
        rule: /Learn more/g,
        replaceWith: '了解更多',
        matchedNumber: 3,
    },
    {
        rule: /\(default\)/g,
        replaceWith: '(默认)',
        matchedNumber: 2,
    },
    {
        rule: /Classic/,
        replaceWith: '经典',
        matchedNumber: 1,
    },
    {
        rule: /Multi-tab/,
        replaceWith: '多标签',
        matchedNumber: 1,
    },
    {
        rule: /Enable \(double-clicking files\)/,
        replaceWith: '启用(双击文件)',
        matchedNumber: 1,
    },
    {
        rule: /<label>Switcher<\/label>/,
        replaceWith: '<label>切换</label>',
        matchedNumber: 1,
    },
    {
        rule: /Code Font/,
        replaceWith: '代码字体',
        matchedNumber: 1,
    },
    {
        rule: />Name/,
        replaceWith: '>字体',
        matchedNumber: 1,
    },
    {
        rule: />Default/,
        replaceWith: '>默认(我也不知道默认是多少🤷‍♂️)',
        matchedNumber: 1,
    },
    {
        rule: /FONT_FAMILY\}".{0,50}</,
        replaceWith: (matched) =>
            matched.replace(
                /\$\{([^}]+)\}/,
                "${$1.join('').replace(/>Default/,'>默认(字体名咋翻译啊🤷‍♂️)')}",
            ),
        matchedNumber: 1,
    },
    {
        rule: />Size/,
        replaceWith: '>字号',
        matchedNumber: 1,
    },
    {
        rule: /Others/,
        replaceWith: '其他',
        matchedNumber: 1,
    },
    {
        rule: /Cache</,
        replaceWith: '缓存<',
        matchedNumber: 1,
    },
    {
        rule: /Disabled</,
        replaceWith: '禁用<',
        matchedNumber: 1,
    },
    {
        rule: /30 minutes/,
        replaceWith: '30分钟',
        matchedNumber: 1,
    },
    {
        rule: /24 hours/,
        replaceWith: '24小时',
        matchedNumber: 1,
    },
    {
        rule: /(1)?2 hours/g,
        replaceWith: '$12小时',
        matchedNumber: 2,
    },
    {
        rule: /Enable bookmarking/,
        replaceWith: '启用书签',
        matchedNumber: 1,
    },
    {
        rule: /Apply settings/,
        replaceWith: '应用设置',
        matchedNumber: 1,
    },
    {
        rule: /([>"])Bookmarks/g,
        replaceWith: '$1书签',
        matchedNumber: 2,
    },
    {
        rule: />Authentication/,
        replaceWith: '>身份认证',
        matchedNumber: 1,
    },
    {
        rule: /Logged in as.*?\$[^}]+\}/,
        replaceWith: (matched) =>
            matched.replace(/Logged in as/g, '以') + '身份登录',
        matchedNumber: 1,
    },
    {
        rule: /Change sidebar docking location/,
        replaceWith: '更改侧边栏停靠位置',
        matchedNumber: 1,
    },
    {
        rule: /Logout/g,
        replaceWith: '退出登录',
        matchedNumber: 2,
    },
    {
        rule: /Filter by type/,
        replaceWith: '按类型过滤',
        matchedNumber: 1,
    },
    {
        rule: /Sort by/,
        replaceWith: '排序',
        matchedNumber: 1,
    },
    {
        rule: /Name</,
        replaceWith: '名称<',
        matchedNumber: 1,
    },
    {
        rule: /URL</,
        replaceWith: '链接<',
        matchedNumber: 1,
    },
    {
        rule: /Date</,
        replaceWith: '日期<',
        matchedNumber: 1,
    },
    {
        rule: /Order/,
        replaceWith: '顺序',
        matchedNumber: 1,
    },
    {
        rule: /Ascending/,
        replaceWith: '升序',
        matchedNumber: 1,
    },
    {
        rule: /Descending/,
        replaceWith: '降序',
        matchedNumber: 1,
    },
    {
        rule: /Filter"/,
        replaceWith: '过滤"',
        matchedNumber: 1,
    },
    {
        rule: /\] Bookmark/g,
        replaceWith: ' Pro] 书签',
        matchedNumber: 2,
    },
    {
        rule: /\] Remove bookmark/,
        replaceWith: ' Pro] 移除书签',
        matchedNumber: 1,
    },
    {
        rule: /There is no bookmark yet. Click the/,
        replaceWith: '目前还没有书签。请点击在版本库、拉动请求、文件或问题旁边的',
        matchedNumber: 1,
    },
    {
        rule: /icon next to a repository, pull request, file or issue to bookmark it./,
        replaceWith: '图标，以将其加入书签。',
        matchedNumber: 1,
    },
    {
        rule: /Search files and folders/,
        replaceWith: '搜索文件和文件夹',
        matchedNumber: 1,
    },
    {
        rule: /(>|")Search/g,
        replaceWith: '$1搜索',
        matchedNumber: 3,
    },
    {
        rule: /Collapse all/,
        replaceWith: '折叠所有',
        matchedNumber: 1,
    },
    {
        rule: /Expand all/,
        replaceWith: '展开所有',
        matchedNumber: 1,
    },
    {
        rule: /Lazy-load this branch/,
        replaceWith: '延迟加载此分支',
        matchedNumber: 1,
    },
    {
        rule: /Stop lazy-loading this branch/,
        replaceWith: '停止延迟加载此分支',
        matchedNumber: 1,
    },
    {
        rule: /This branch is too big and automatically lazily loaded/,
        replaceWith: '当前分支过大，已自动延迟加载',
        matchedNumber: 1,
    },
    {
        rule: /Clear cache and reload tree/,
        replaceWith: '清除缓存并重新加载树',
        matchedNumber: 1,
    },
    {
        rule: /can't cache the repository tree because the browser cache is full./,
        replaceWith: '无法缓存仓库树，因为浏览器缓存已满。',
        matchedNumber: 1,
    },
    {
        rule: /Please either/,
        replaceWith: '请',
        matchedNumber: 1,
    },
    {
        rule: /clean up the browser cache/,
        replaceWith: '清理浏览器缓存',
        matchedNumber: 1,
    },
    {
        rule: /> or/,
        replaceWith: '> 或者',
        matchedNumber: 1,
    },
    {
        rule: /disable Cache feature/,
        replaceWith: '禁用缓存功能',
        matchedNumber: 1,
    },
    {
        rule: /Go to pull request fork/,
        replaceWith: '转到拉取请求分支',
        matchedNumber: 1,
    },
    {
        rule: /Go to /,
        replaceWith: '转到 ',
        matchedNumber: 1,
    },
    {
        rule: /View pull requests/,
        replaceWith: '查看拉取请求',
        matchedNumber: 1,
    },
    {
        rule: /Connection error/,
        replaceWith: '连接错误',
        matchedNumber: 1,
    },
    {
        rule: /Cannot connect to website./,
        replaceWith: '无法连接到网站。',
        matchedNumber: 1,
    },
    {
        rule: /If your network connection to this website is fine, maybe there is an outage of the API./,
        replaceWith:
            '如果您的网络连接正常，请尝试挂\u4ee3\u7406访问；如果仍然出现问题，那么可能是 API 接口出现故障。（多半是因为 GitHub 被\u5899了的原因）',
        matchedNumber: 1,
    },
    {
        rule: /Please try again later./g,
        replaceWith: '请稍后再试。',
        matchedNumber: 2,
    },
    {
        rule: /Cannot connect to server. /,
        replaceWith: '无法连接到服务器。',
        matchedNumber: 1,
    },
    {
        rule: /Empty repository/,
        replaceWith: '空仓库',
        matchedNumber: 1,
    },
    {
        rule: /This repository is empty./,
        replaceWith: '当前仓库是空的。',
        matchedNumber: 1,
    },
    {
        rule: /Invalid token/,
        replaceWith: '无效的令牌',
        matchedNumber: 1,
    },
    {
        rule: /Not found/,
        replaceWith: '未找到',
        matchedNumber: 1,
    },
    {
        rule: /This branch was either deleted or you don't have access to it./g,
        replaceWith: '此分支已被删除或您没有访问权限。',
        matchedNumber: 2,
    },
    {
        rule: /Please go to /g,
        replaceWith: '请转到 ',
        matchedNumber: 8,
    },
    {
        rule: /to input a GitHub access token./,
        replaceWith: '输入 GitHub 访问令牌。',
        matchedNumber: 1,
    },
    {
        rule: /Note that OAuth doesn't work with GitHub Enterprise, you need to provide access token instead./,
        replaceWith: '注意：OAuth 不适用于 GitHub 企业版，您需要提供访问令牌。',
        matchedNumber: 1,
    },
    {
        rule: /to login with GitHub OAuth or input a GitHub access token./g,
        replaceWith: '，使用 GitHub OAuth 登录或输入 GitHub 访问令牌。',
        matchedNumber: 3,
    },
    {
        rule: /GitHub API rate limit/,
        replaceWith: 'GitHub API 速率限制',
        matchedNumber: 1,
    },
    {
        rule: /rate limit exceeded/,
        replaceWith: '请求速率超出限制',
        matchedNumber: 1,
    },
    {
        rule: /API limit exceeded/,
        replaceWith: 'API 速率超出限制',
        matchedNumber: 1,
    },
    {
        rule: /You have exceeded the /g,
        replaceWith: '您已超出 ',
        matchedNumber: 2,
    },
    {
        rule: /Forbidden/,
        replaceWith: '禁止访问',
        matchedNumber: 1,
    },
    {
        rule: /The provided GitHub access token is invalid./g,
        replaceWith: '提供的 GitHub 访问令牌无效。',
        matchedNumber: 2,
    },
    {
        rule: /to either update the token or delete it because it overrides GitHub OAuth./,
        replaceWith: '，更新或删除令牌，因为它会覆盖 GitHub OAuth。',
        matchedNumber: 1,
    },
    {
        rule: /to update the token or login to Octotree via GitHub OAuth./,
        replaceWith: '，更新令牌或使用 GitHub OAuth 登录。',
        matchedNumber: 1,
    },
    {
        rule: /Access to this repository requires a GitHub token./,
        replaceWith: '访问此仓库需要 GitHub 访问令牌。',
        matchedNumber: 1,
    },
    {
        rule: /added(<|")/g,
        replaceWith: '已添加$1',
        matchedNumber: 2,
    },
    {
        rule: /renamed/,
        replaceWith: '已更名',
        matchedNumber: 1,
    },
    {
        rule: /removed(<|")/g,
        replaceWith: '已删除$1',
        matchedNumber: 2,
    },
    {
        rule: /View all tags/,
        replaceWith: '查看所有标签',
        matchedNumber: 1,
    },
    {
        rule: /Login with GitHub/g,
        replaceWith: '使用 GitHub 登录',
        matchedNumber: 3,
    },
    {
        rule: /"Connect to":"Login with"\} Github/,
        replaceWith: '"连接到 GitHub ":"使用 Github 登录"}',
        matchedNumber: 1,
    },
    {
        rule: /Login to unlock file search, cache control, display control, bookmarking/,
        replaceWith: '登录以解锁文件搜索、缓存控制、显示控制和书签',
        matchedNumber: 1,
    },
    {
        rule: /and start 15-day trial of (.{70,150} Pro[^>]+>)/g,
        replaceWith: '并开始永久$1的使用<hr/>(啊没错，我，涛之雨，破解了)<br>更<s>离谱</s>（强大）的是，理论上是全自动的',
        matchedNumber: 1,
    },
    {
        rule: /File search/,
        replaceWith: '文件搜索',
        matchedNumber: 1,
    },
    {
        rule: />Bookmarking/,
        replaceWith: '>书签',
        matchedNumber: 1,
    },
    {
        rule: /Display options/,
        replaceWith: '显示选项',
        matchedNumber: 1,
    },
    {
        rule: /Caching & lazy loading/,
        replaceWith: '缓存 & 懒加载',
        matchedNumber: 1,
    },
    {
        rule: /Expand\/collapse all/,
        replaceWith: '展开/折叠所有',
        matchedNumber: 1,
    },
    {
        rule: /15-day Pro trial/,
        replaceWith: '永久免费使用</span></li><li><span>吾爱破解@涛之雨修改',
        matchedNumber: 1,
    },
    {
        rule: /Login<\/a>\s*?to unlock:/,
        replaceWith: '登录</a>以使用完整版。',
        matchedNumber: 1,
    },
    {
        rule: /Login</g,
        replaceWith: '登录<',
        matchedNumber: 1,
    },
    {
        rule: /Enter email/,
        replaceWith: '输入电子邮件',
        matchedNumber: 1,
    },
    {
        rule: /Enter password/,
        replaceWith: '输入密码',
        matchedNumber: 1,
    },
    {
        rule: /Create an account/,
        replaceWith: '创建账户',
        matchedNumber: 1,
    },
]

const handleManifest = (txt) => {
    const obj = JSON.parse(text)
    if (obj.manifest_version !== 2)
        throw 'manifest_version updated!'
    return JSON.stringify(obj, "", 4)
}

const handleContent_zh = (code) =>
    replaceLists.map((a) => {
        if (!a.matchedNumber || a.matchedNumber === code.match(a.rule)?.length)
            code = code.replace(a.rule, a.replaceWith)
        else
            core.warning(
                `[${a.rule.toString()}] matched numbers verified error.\nGot ${code.match(a.rule)?.length
                }, but should be ${a.matchedNumber}.\nskip this rule.`,
            )
    })

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
    const { code } = generator.default(
        ast,
        { minified: true, compact: true, comments: false },
        rawCode,
    )
    return code
}

const handleMain = async ({ url, io }) => {
    const fileName = path.basename(url, '.crx')
    const jspath = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../temp/' + fileName + '/content.js',
    )
    await io.mkdirP(path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../docs/updates/tree/' + fileName
    ));
    const rawCode = fs.readFileSync(jspath, 'utf-8')
    const code = handleContent(rawCode)
    fs.writeFileSync(
        path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            '../../docs/updates/tree/' + fileName + '/content.js',
        ),
        code
    )
    const zhCode = handleContent_zh(code)
    fs.writeFileSync(
        path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            '../../docs/updates/tree/' + fileName + '/content.js',
        ),
        zhCode
    )


    const rawManifest = fs.readFileSync(path.join(path.dirname(jspath), './manifest.json'), 'utf-8')
    const manifest = handleManifest(rawManifest)
    return {
        code: 0,
        output: {
            fileRules: {
                'content.js': 'updates/tree/' + fileName + '/content.js'
            }
        }
    }
}

export default handleMain