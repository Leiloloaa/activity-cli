const fs = require('fs'),
  stat = fs.stat
const path = require('path')
const fsp = require('node:fs/promises')
const { exec } = require('child_process')
let configs

const prependToJsonFile = require('../utils/writeActivityUrl')

function capitalizeFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

/**
 * 执行 git 自动提交和推送
 * @param {Object} config - 配置对象
 */
const autoGitCommit = (config) => {
  return new Promise((resolve, reject) => {
    const commitMessage = `feat: 添加 ${config.catalog}_${capitalizeFirstLetter(
      config.name
    )} 活动配置`

    // 切换到 yoho-activity-h5 目录并执行 git 操作
    const gitCommands = ['git add .', `git commit -m "${commitMessage}"`, 'git push']

    // 执行 git 命令
    exec(
      gitCommands.join(' && '),
      { cwd: path.resolve(__dirname, '../..') },
      (error, stdout, stderr) => {
        if (error) {
          console.error('Git 操作失败:', error)
          reject(error)
          return
        }
        if (stderr) {
          console.log('Git 输出:', stderr)
        }
        console.log('Git 提交和推送成功:', stdout)
        console.log(`已自动提交并推送活动配置: ${commitMessage}`)
        resolve(stdout)
      }
    )
  })
}

const urlMap = {
  Yoho: '../..',
  Hiyoo: '../../../../activity-h5/activity-vite',
  SoulStar: '../../../../maidocha-activity-h5'
}

const prependToJsonFileConfig = async (config) => {
  const content = {
    [config.projectName + '_' + config.catalog + '_' + capitalizeFirstLetter(config.name)]: {
      活动名称: config.activityDesc,
      预热时间: config.time,
      活动ID: config.id,
      活动链接: config.activityUrl.replace('?lang=&key=', ''),
      需求文档: config.url,
      文案链接: config.textUrl,
      设计链接: config.figma
    }
  }

  // 写入到当前项目的配置文件
  const filePath = path.resolve(
    __dirname,
    config.catalog == 'general'
      ? `${urlMap[config.projectName == 'Hiyoo' ? 'Hiyoo' : 'Yoho']}/server/general_activity.json`
      : `${urlMap[config.projectName == 'Hiyoo' ? 'Hiyoo' : 'Yoho']}/server/activity.json`
  )
  prependToJsonFile(filePath, content)

  // 如果是 Hiyoo 项目，同时写入到 Yoho 的配置文件
  if (config.projectName == 'Hiyoo') {
    const yohoFilePath = path.resolve(
      __dirname,
      config.catalog == 'general'
        ? `${urlMap['Yoho']}/server/general_activity.json`
        : `${urlMap['Yoho']}/server/activity.json`
    )
    prependToJsonFile(yohoFilePath, content)
    console.log('活动信息已同时写入到 Yoho 配置文件')
  }
}

const writePreloadConfig = async (config, path) => {
  const imgListKey = [
    // 'head-EG.png',
    // 'head-TR.png',
    // 'tab.png',
    // 'tab-act.png',
    // 'rank-tab.png',
    // 'rank-tab-act.png',
    // 'date-tab-act.png',
    // 'date-tab.png',
    // 'day-act.png',
    // 'day.png',
    // 'a.png',
    // 'a1.png',
    // 'a2.png',
    // 'a3.png',
    // 'card.png'
    // 'card1.png'
  ]
  const prefix = 'https://image.yoko.media/activity/'
  const imgListWithPrefix = imgListKey.map(
    (key) => `${prefix}${config.catalog}_${capitalizeFirstLetter(config.name)}/${key}`
  )
  const imgListStr = JSON.stringify(imgListWithPrefix).replace(/"/g, '\\"')
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path,
      `{
  "${config.catalog}_${capitalizeFirstLetter(config.name)}": {
    "imgList": "${imgListStr}",
    "jsList": "[]"
  }
}
`,
      'utf8',
      function (error) {
        if (error) {
          // console.log(error)
          reject(error)
        } else {
          resolve(true)
        }
      }
    )
  })
}

const writeConfig = async (config, path) => {
  const date = new Date(config.time)
  // 提取年、月、日
  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(date.getDate()).padStart(2, '0')}`

  const info = `export const info =\`
${config.info}
\``
  const documentLink = `export const documentLink =\`
${config.url}
\``
  const textLink = `export const textLink =\`
${config.textUrl}
\``
  const figmaLink = `export const figmaLink =\`
${config.figma}
\``
  const ossLink = `export const ossLink =\`
https://oss.console.aliyun.com/bucket/oss-ap-southeast-1/yoho-activity-www/object/upload?path=activity%2F${
    config.catalog
  }_${capitalizeFirstLetter(config.name)}%2F
\``
  const yohoTestJenkinsLink = `export const yohoTestJenkinsLink =\`
https://jenkins-web.waka.media/job/yoho/job/TestEnv/job/web-activity/job/activity-vite/build?delay=0sec
\``
  const yohoProdJenkinsLink = `export const yohoProdJenkinsLink =\`
https://jenkins-web.waka.media/job/yoho/job/ProdEnv/job/web-activity/job/activity-vite/build?delay=0sec
\``
  const hiyooTestJenkinsLink = `export const hiyooTestJenkinsLink =\`
https://jenkins-web.waka.media/job/hiyoo/job/TestEnv/job/web-activity/job/activity-vite/build?delay=0sec
\``
  const hiyooProdJenkinsLink = `export const hiyooProdJenkinsLink =\`
https://jenkins-web.waka.media/job/hiyoo/job/ProdEnv/job/web-activity/job/activity-vite/build?delay=0sec
\``
  fs.writeFile(
    path,
    `export const config = {
  activityId: ${config.id},
  projectName: '/activity/${config.catalog}_${capitalizeFirstLetter(config.name)}',
  backgroundColor: '${config.bgc}',
}
${info}
${documentLink}
${textLink}
${figmaLink}
${ossLink}
${yohoTestJenkinsLink}
${yohoProdJenkinsLink}
${hiyooTestJenkinsLink}
${hiyooProdJenkinsLink}
`,
    'utf8',
    function (error) {
      if (error) {
        // console.log(error)
        return false
      }
    }
  )
}

const writeMixinScss = (config, path) => {
  const YohoOrHiyooPath = '//image.hoko.media/activity'
  const SoulStarPath = '//static-test.maidocha.com/activity'
  fs.writeFile(
    path,
    `$projectName: '${config.catalog}_${capitalizeFirstLetter(config.name)}';
@mixin bg($imgName, $isImport: false, $w: 100%, $h: 100%, $x:0, $y:0, $repeat: no-repeat) {
  background-image: url('${
    config.projectName == 'SoulStar' ? SoulStarPath : YohoOrHiyooPath
  }/#{$projectName}/#{$imgName}.png') if($isImport,
  !important,
  null);
  background-size: $w $h;
  background-repeat: $repeat;
  background-position: $x $y;
}`,
    'utf8',
    function (error) {
      if (error) {
        // console.log(error)
        return false
      }
    }
  )
}

const modifyPackPath = async (config) => {
  try {
    const basePath = path.resolve(__dirname, `${urlMap[config.projectName]}/config/base.js`)
    const data = await fsp.readFile(basePath, 'utf8', { encoding: 'utf8' })
    const modifiedContent = data.replace(
      /includeProject: \[.*?\]/,
      `includeProject: [/${config.catalog}\\/${config.name}/]`
    )
    await fsp.writeFile(basePath, modifiedContent, 'utf8')
  } catch (err) {
    // console.error('出错:', err)
  }
}

const writeJSON = (config) => {
  writePreloadConfig(
    config,
    path.resolve(
      __dirname,
      `${urlMap[config.projectName]}/src/page/${config.catalog}/${capitalizeFirstLetter(
        config.name
      )}/preload.json`
    )
  )
  // console.log('JSON 更新成功 =========')
}

const writeProjectConfig = (config) => {
  writeConfig(
    config,
    path.resolve(
      __dirname,
      `${urlMap[config.projectName]}/src/page/${config.catalog}/${capitalizeFirstLetter(
        config.name
      )}/config.ts`
    )
  )

  // 写入op配置
  if (config.op == '1') {
    for (let i = 1; i <= config.opNum; i++) {
      writeConfig(
        config,
        path.resolve(
          __dirname,
          `${urlMap[config.projectName]}/src/page/${config.catalog}/${capitalizeFirstLetter(
            config.name
          )}_op${config.opNum == 1 ? '' : i}/config.ts`
        )
      )
    }
  }

  // 写入hot配置
  config.hot == '1' &&
    writeConfig(
      config,
      path.resolve(
        __dirname,
        `${urlMap[config.projectName]}/src/page/${config.catalog}/${capitalizeFirstLetter(
          config.name
        )}_op_hot/config.ts`
      )
    )
  // console.log('config 更新成功 =========')
}

const writeScss = (config) => {
  writeMixinScss(
    config,
    path.resolve(
      __dirname,
      `${urlMap[config.projectName]}/src/page/${config.catalog}/${capitalizeFirstLetter(
        config.name
      )}/scss/public_mixin.scss`
    )
  )

  // 写入op配置
  if (config.op == '1') {
    for (let i = 1; i <= config.opNum; i++) {
      writeMixinScss(
        config,
        path.resolve(
          __dirname,
          `${urlMap[config.projectName]}/src/page/${config.catalog}/${capitalizeFirstLetter(
            config.name
          )}_op${config.opNum == 1 ? '' : i}/scss/public_mixin.scss`
        )
      )
    }
  }

  // 写入hot配置
  config.hot == '1' &&
    writeMixinScss(
      config,
      path.resolve(
        __dirname,
        `${urlMap[config.projectName]}/src/page/${config.catalog}/${capitalizeFirstLetter(
          config.name
        )}_op_hot/scss/public_mixin.scss`
      )
    )

  // console.log('scss 更新成功 =========')
}

/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
async function copy(src, dst) {
  // 读取目录中的所有文件/目录
  await fs.readdir(src, function (err, paths) {
    if (err) {
      throw err
    }
    paths.forEach(function (path) {
      // 排除 business 目录
      if (path === 'business' || path === 'template') {
        return
      }

      var _src = src + '/' + path,
        _dst = dst + '/' + path,
        readable,
        writable
      // && needComponent.includes(path + ".vue")
      if (path == 'public_mixin.scss') {
        // writeScss(configs)
      } else if (path == 'config.ts') {
        writeProjectConfig(configs)
      } else if (path == 'preload.json') {
        writeJSON(configs)
      } else {
        stat(_src, function (err, st) {
          if (err) {
            throw err
          }
          // 判断是否为文件
          if (st.isFile()) {
            // 创建读取流
            readable = fs.createReadStream(_src)
            // 创建写入流
            writable = fs.createWriteStream(_dst)
            // 通过管道来传输流
            readable.pipe(writable)
          }
          // 如果是目录则递归调用自身
          else if (st.isDirectory()) {
            createDir(_src, _dst)
          }
        })
      }
    })
  })
}

// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
function exist(src, dst) {
  if (fs.existsSync(dst)) {
    fs.rm(dst, { recursive: true }, function () {
      createDir(src, dst)
    })
  } else {
    createDir(src, dst)
  }
}

function createDir(src, dst) {
  fs.mkdir(dst, function () {
    copy(src, dst)
  })
}

const createFile = async (config) => {
  configs = config
  if (
    !fs.existsSync(
      path.resolve(__dirname, `${urlMap[config.projectName]}/src/page/${config.catalog}`)
    )
  ) {
    fs.mkdir(
      path.resolve(__dirname, `${urlMap[config.projectName]}/src/page/${config.catalog}`),
      function () {}
    )
  }

  await exist(
    path.resolve(__dirname, './template/activity'),
    path.resolve(
      __dirname,
      `${urlMap[config.projectName]}/src/page/${config.catalog}/${capitalizeFirstLetter(
        config.name
      )}`
    )
  )

  if (config.op == '1') {
    for (let i = 1; i <= config.opNum; i++) {
      await exist(
        path.resolve(__dirname, './template/activity_op'),
        path.resolve(
          __dirname,
          `${urlMap[config.projectName]}/src/page/${config.catalog}/${capitalizeFirstLetter(
            config.name
          )}_op${config.opNum == 1 ? '' : i}`
        )
      )
    }
  }

  config.hot == '1' &&
    (await exist(
      path.resolve(__dirname, './template/activity_op_hot'),
      path.resolve(
        __dirname,
        `${urlMap[config.projectName]}/src/page/${config.catalog}/${capitalizeFirstLetter(
          config.name
        )}_op_hot`
      )
    ))
  // 修改打包路径
  config.projectName == 'Yoho' && modifyPackPath(config)

  // 写入配置文件 - 在所有模板复制完成后写入
  writeProjectConfig(config)
  writeScss(config)
  writeJSON(config)

  console.info(`${config.projectName} 活动创建成功！`)

  // 写入活动链接
  prependToJsonFileConfig(config)

  // // 如果是 Hiyoo 项目，在所有操作完成后自动提交和推送 git
  // if (config.projectName == 'Hiyoo') {
  //   try {
  //     await autoGitCommit(config)
  //     console.log('Git 自动提交和推送完成')
  //   } catch (error) {
  //     console.error('Git 自动提交和推送失败:', error)
  //   }
  // }
}

module.exports = { createFile, writeProjectConfig, modifyPackPath }
