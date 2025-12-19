const fs = require('fs')
const path = require('path')
const util = require('util')
const exec = require('child_process').exec
const execPromise = util.promisify(exec)
const prependToJsonFile = require('../utils/writeActivityUrl')

// node serve.timer.js 1 1000         # 1 为 yoho 2 为 hiyoo 1000 为活动 id

const urlMap = {
  Yoho: '../..',
  Hiyoo: '../../../../activity-h5/activity-vite',
  SoulStar: '../../../../maidocha-activity-h5'
}

const prependToJsonFileConfig = async (config) => {
  const content = {
    [config.name]: {
      需求名称: config.name,
      预热时间: config.time,
      活动ID: config.id,
      活动链接: '',
      需求文档: config.url,
      设计链接: ''
    }
  }
  const filePath = path.resolve(
    __dirname,
    config.activityType == '1'
      ? `${urlMap['Yoho']}/server/general_activity.json`
      : `${urlMap['Yoho']}/server/activity.json`
  )
  prependToJsonFile(filePath, content)
}

/**
 * 用于命令行运行的活动时间查询脚本
 * 用法：node serve.timer.js <project> <id>
 * @param {string} project 1=yoho，2=hiyoo
 * @param {string} id 活动 id
 */
async function getActivityTimer() {
  // 解析命令行参数
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.error('用法: node serve.timer.js <project> <id>')
    console.error('  <project>: 1=yoho，2=hiyoo')
    console.error('  <id>: 活动 id')
    process.exit(1)
  }
  const projectArg = args[0]
  const id = args[1]
  let projectName = ''
  if (projectArg === '1') {
    projectName = 'Yoho'
  } else if (projectArg === '2') {
    projectName = 'Hiyoo'
  } else {
    console.error('项目参数错误，只能为 1（yoho）或 2（hiyoo）')
    process.exit(1)
  }

  const scriptPath =
    projectName === 'Yoho'
      ? path.resolve(__dirname, '../../../event/getActivityTime.py')
      : path.resolve(__dirname, '../../../event/getActivityTimeChatchill.py')

  const venvPath = path.resolve(__dirname, '../../../event/myenv')
  const projectRoot = path.resolve(__dirname, '../../..')

  console.log(`项目根目录: ${projectRoot}`)
  console.log(`Python脚本路径: ${scriptPath}`)
  console.log(`虚拟环境路径: ${venvPath}`)

  if (!fs.existsSync(venvPath)) {
    console.error(`错误: 虚拟环境不存在 ${venvPath}`)
    process.exit(1)
  }

  const isWindows = process.platform === 'win32'
  let command

  if (isWindows) {
    // Windows 环境
    command = `cd "${projectRoot}" && "${venvPath}\\Scripts\\activate.bat" && python "${scriptPath}" ${id}`
  } else {
    // Unix/Mac 环境
    const pythonPath = path.join(venvPath, 'bin', 'python3')
    command = `cd "${projectRoot}" && "${pythonPath}" "${scriptPath}" ${id}`
  }

  console.log(`执行命令: ${command}`)

  try {
    const { stdout, stderr } = await execPromise(command, {
      maxBuffer: 1024 * 1024 // 增加缓冲区大小到1MB
    })

    console.log('Python脚本执行完成')
    let jsonString = ''
    let result = ''
    try {
      // 判断 stdout 是否包含多行，优先取第二行，否则直接取全部
      const lines = stdout.split('\n')
      if (lines.length > 1 && lines[1].trim().startsWith('[')) {
        jsonString = lines[1]
      } else if (lines[0].trim().startsWith('[')) {
        jsonString = lines[0]
      } else {
        jsonString = stdout.trim()
      }
      const array = JSON.parse(jsonString) // 解析为数组
      // 解析 Python 脚本输出的 JSON
      result =
        array.map((item) => `${item.area}: ${item.startTime}至${item.endTime}`).join('，') +
        `，后端: ${array[0].operator ? array[0].operator.replace('@micous.com', '') : ''}`

      console.info({
        活动名称: array && array[0] ? array[0].activityDesc : '',
        需求文档: array && array[0] ? array[0].activityLink : '',
        各地区活动时间: result,
        '活动 id': id
      })

      await prependToJsonFileConfig({
        name: array && array[0] ? array[0].activityDesc : '',
        time: result,
        url: array && array[0] ? array[0].activityLink : '',
        id: id,
        activityType: array && array[0] ? array[0].activityType : ''
      })
    } catch (e) {
      console.error('解析 Python 输出或 JSON 失败:', e)
      result = ''
    }
  } catch (err) {
    console.error('执行 Python 脚本失败:', err)
    process.exit(1)
  }
}

getActivityTimer()
