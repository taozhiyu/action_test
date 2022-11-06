import fs from 'fs'
import parser from '@babel/parser'
import traverse from '@babel/traverse'
import types from '@babel/types'
import generator from '@babel/generator'
import path from 'path'

const handleMain = (url) => {
    const fileName = path.basename(url, '.crx')
    const jspath = "../temp/" + fileName + "/content.js"
    const rawCode = fs.readFileSync(jspath, 'utf-8')
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
                        a.value = types.numericLiteral(520)
                    if (a.key.name === 'state') a.value = types.numericLiteral(3)
                    return a
                })
            }
        },
    })
    const output = generator.default(
        ast,
        { minified: true, compact: true, comments: false },
        rawCode,
    )
    console.log(output.code)
    fs.writeFile(
        '../docs/updates/tree/' + fileName + '/content.js',
        output.code,
        (err) => {
            console.log(err)
        },
    )
    return true
}

export default handleMain