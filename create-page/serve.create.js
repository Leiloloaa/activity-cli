const express = require('express')
const app = new express()
const axios = require('axios')
const bodyParser = require('body-parser')
const createFile = require('./createFile')
const tool = require('../utils/serverTool')
const colors = require('colors')
const { exec } = require('child_process')
const { promisify } = require('util')
const execPromise = promisify(exec)
const path = require('path')

async function getCurrentGitBranch() {
  try {
    const { stdout } = await execPromise('git rev-parse --abbrev-ref HEAD')
    return stdout.trim()
  } catch (error) {
    console.error(`Error executing command: ${error.message}`)
    throw error
  }
}

/**
 * 检测分支名称是否已包含年份
 * @param {string} branchName - 分支名称
 * @returns {boolean} - 是否包含年份
 */
function hasYearInBranchName(branchName) {
  // 检测是否包含两位数的年份（如 24, 25, 26 等）
  // 排除月份（01-12）
  const yearPattern = /(2[0-9]|[3-9][0-9])$/
  return yearPattern.test(branchName)
}

app.use('/create_page', express.static(__dirname))

// 配置body-parser
// 只要加入这个配置，则在req请求对象上会多出来一个属性：body
// 也就是说可以直接通过req.body来获取表单post请求数据
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.all('*', function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header('Access-Control-Allow-Origin', '*')
  //允许的header类型
  res.header('Access-Control-Allow-Headers', 'content-type')
  //跨域允许的请求方式
  res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS')
  if (req.method.toLowerCase() == 'options') res.send(200)
  //让options尝试请求快速结束
  else next()
})

app.post('/updateBase', async (req, res) => {
  await createFile.modifyPackPath(req.body)
  res.send({
    data: {
      code: 1
    }
  })
})

app.post('/send', async (req, res) => {
  const url =
    'https://dashboard-test.waka.media/activity-platform/api/activity/developer/platform/activity/data/configActivityCopyWriting'
  const data = req.body
  let _res = 1
  await axios
    .post(url, data)
    .then((response) => {
      _res = response.data.data?.status
      // console.log('res ===', _res)
    })
    .catch((error) => {
      console.log('error ===', error)
    })
  res.send({
    data: {
      code: _res
    }
  })
})

app.post('/sendHiyoo', async (req, res) => {
  const url =
    'https://dashboard-test.chatchill.media/activity-platform/api/activity/developer/platform/activity/data/configActivityCopyWriting'
  const data = req.body
  let _res = 1
  await axios
    .post(url, data)
    .then((response) => {
      _res = response.data.data?.status
      // console.log('res ===', _res)
    })
    .catch((error) => {
      console.log('error ===', error)
    })
  res.send({
    data: {
      code: _res
    }
  })
})

app.post('/submit', async (req, res) => {
  // 计算 Python 脚本路径
  const scriptPath =
    req.body.projectName == 'Yoho'
      ? path.resolve(__dirname, '../../../event/getActivityTime.py')
      : path.resolve(__dirname, '../../../event/getActivityTimeChatchill.py')

  const venvPath = path.resolve(__dirname, '../../../event/myenv')
  const projectRoot = path.resolve(__dirname, '../../..')

  console.log(`项目根目录: ${projectRoot}`)
  console.log(`Python脚本路径: ${scriptPath}`)
  console.log(`虚拟环境路径: ${venvPath}`)

  // 检查路径是否存在
  const fs = require('fs')
  if (!fs.existsSync(scriptPath)) {
    console.error(`错误: Python脚本不存在 ${scriptPath}`)
    return res.send({
      data: {
        code: 0,
        message: 'Python脚本文件不存在',
        error: `找不到文件: ${scriptPath}`
      }
    })
  }

  if (!fs.existsSync(venvPath)) {
    console.error(`错误: 虚拟环境不存在 ${venvPath}`)
    return res.send({
      data: {
        code: 0,
        message: 'Python虚拟环境不存在',
        error: `找不到目录: ${venvPath}`
      }
    })
  }

  const isWindows = process.platform === 'win32'
  let command

  if (isWindows) {
    // Windows 环境
    command = `cd "${projectRoot}" && "${venvPath}\\Scripts\\activate.bat" && python "${scriptPath}" ${req.body.id}`
  } else {
    // Unix/Mac 环境
    const pythonPath = path.join(venvPath, 'bin', 'python3')
    command = `cd "${projectRoot}" && "${pythonPath}" "${scriptPath}" ${req.body.id}`
  }

  console.log(`执行命令: ${command}`)

  try {
    const { stdout, stderr } = await execPromise(command, {
      maxBuffer: 1024 * 1024 // 增加缓冲区大小到1MB
    })

    console.log('Python脚本执行完成')
    let jsonString = ''
    let result = ''
    let activityDesc = ''
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
        `，后端: ${array[0].operator.replace('@micous.com', '')}`
      activityDesc = array[0]?.activityDesc || ''
    } catch (e) {
      console.error('解析 Python 输出或 JSON 失败:', e)
      result = ''
    }
    console.info({
      需求名称: activityDesc,
      活动名称: req.body.name,
      '活动 id': req.body.id,
      各地区活动时间: result
    })
    await createFile.createFile({ ...req.body, time: result, activityDesc })

    res.send({
      data: {
        code: 1,
        message: 'getActivityTime.py 执行成功'
      }
    })
  } catch (error) {
    console.error('运行 getActivityTime.py 出错:', error)
    return res.send({
      data: { code: 0, message: '运行 getActivityTime.py 出错', error: error.message }
    })
  }
})

app.get('/info', async (req, res) => {
  const branch = await getCurrentGitBranch()
  res.send({
    data: {
      code: 200,
      branch: branch
    }
  })
})

app.post('/toPythonText', async (req, res) => {
  const data = req.body

  console.log('收到活动信息:', JSON.stringify(data))

  // 数据校验
  if (!data.id || !data.name || !data.textUrl) {
    return res.send({
      data: {
        code: 0,
        message: '参数错误，活动ID(id)、项目名称(name)和飞书文档链接(textUrl)不能为空'
      }
    })
  }

  // 检查活动ID是否为数字
  if (isNaN(parseInt(data.id))) {
    return res.send({
      data: {
        code: 0,
        message: '活动ID必须是数字'
      }
    })
  }

  try {
    // 计算 Python 脚本和虚拟环境的绝对路径
    const scriptPath = path.resolve(__dirname, '../../../event/add_activity.py')
    const venvPath = path.resolve(__dirname, '../../../event/myenv')
    const projectRoot = path.resolve(__dirname, '../../..')

    console.log(`项目根目录: ${projectRoot}`)
    console.log(`Python脚本路径: ${scriptPath}`)
    console.log(`虚拟环境路径: ${venvPath}`)

    // 检查路径是否存在
    const fs = require('fs')
    if (!fs.existsSync(scriptPath)) {
      console.error(`错误: Python脚本不存在 ${scriptPath}`)
      return res.send({
        data: {
          code: 0,
          message: 'Python脚本文件不存在',
          error: `找不到文件: ${scriptPath}`
        }
      })
    }

    if (!fs.existsSync(venvPath)) {
      console.error(`错误: 虚拟环境不存在 ${venvPath}`)
      return res.send({
        data: {
          code: 0,
          message: 'Python虚拟环境不存在',
          error: `找不到目录: ${venvPath}`
        }
      })
    }

    // 使用 Shell 命令激活虚拟环境并执行 Python 脚本
    const isWindows = process.platform === 'win32'
    let command

    if (isWindows) {
      // Windows 环境
      command = `cd "${projectRoot}" && "${venvPath}\\Scripts\\activate.bat" && python "${scriptPath}" ${data.id} "${data.name}" "${data.textUrl}"`
    } else {
      // Unix/Mac 环境 - 注意使用正确的Python解释器路径
      const pythonPath = path.join(venvPath, 'bin', 'python3')
      command = `cd "${projectRoot}" && "${pythonPath}" "${scriptPath}" ${data.id} "${data.name}" "${data.textUrl}"`
    }

    console.log(`执行命令: ${command}`)

    // 使用 child_process.exec 执行Shell命令
    const { stdout, stderr } = await execPromise(command, {
      maxBuffer: 1024 * 1024 // 增加缓冲区大小到1MB
    })

    console.log('Python脚本执行完成')
    console.log('标准输出:', stdout)

    if (stderr && !stderr.includes('WARNING:')) {
      console.error('标准错误:', stderr)
      return res.send({
        data: {
          code: 0,
          message: '处理失败，请查看日志',
          error: stderr
        }
      })
    }

    // 检查输出是否包含成功信息
    const success = stdout.includes('成功添加活动') && stdout.includes('文案上传完成')

    if (success) {
      res.send({
        data: {
          code: 1,
          message: '活动添加成功，文案已上传',
          result: stdout
        }
      })
    } else {
      res.send({
        data: {
          code: 0,
          message: '处理过程中出现问题',
          result: stdout
        }
      })
    }
  } catch (error) {
    console.error('执行Python脚本出错:', error)
    res.send({
      data: {
        code: 0,
        message: '系统错误',
        error: error.message
      }
    })
  }
})

app.post('/git-branch', async (req, res) => {
  try {
    const { branchName, projectName } = req.body

    if (!branchName) {
      return res.send({
        success: false,
        message: '分支名不能为空'
      })
    }

    console.log(`=======开始创建并切换到分支: ${branchName}`)

    // 根据项目名称获取对应的项目路径
    const urlMap = {
      Yoho: '../..',
      Hiyoo: '../../../../activity-h5',
      SoulStar: '../../../../maidocha-activity-h5'
    }

    // 获取项目根目录
    let projectRoot
    if (projectName && urlMap[projectName]) {
      projectRoot = path.resolve(__dirname, urlMap[projectName])
      console.log(`根据项目名称 ${projectName} 获取项目路径: ${projectRoot}`)
    } else {
      // 默认使用当前项目路径
      projectRoot = path.resolve(__dirname, '../../..')
      console.log(`使用默认项目路径: ${projectRoot}`)
    }

    // 创建辅助函数：在指定目录执行 git 命令
    const execGitCommand = async (command) => {
      console.log(`在目录 ${projectRoot} 执行命令: ${command}`)
      const result = await execPromise(command, { cwd: projectRoot })
      console.log(`命令执行结果: ${result.stdout || '无输出'}`)
      return result
    }

    // 检查是否在 git 仓库中
    try {
      await execGitCommand('git status')
      console.log(`成功验证 ${projectRoot} 是 git 仓库`)
    } catch (error) {
      return res.send({
        success: false,
        message: `项目路径 ${projectRoot} 不是 git 仓库`
      })
    }

    // 不检测模式：根据分支名是否包含年份来决定后缀
    try {
      let finalBranchName

      if (hasYearInBranchName(branchName)) {
        // 分支名称已包含年份，直接使用
        finalBranchName = branchName
        console.log(`分支包含年份，直接使用: ${finalBranchName}`)
      } else {
        // 分支名称不包含年份，添加年份和月份
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear().toString().slice(-2) // 获取当前年份的后两位，如 '25'
        const currentMonth = currentDate.getMonth() + 1 // 获取当前月份（1-12）
        const monthStr = currentMonth.toString().padStart(2, '0') // 格式化为两位数，如 '01', '02'
        finalBranchName = `${branchName}${currentYear}${monthStr}`
        console.log(`分支不包含年份，创建带年份月份的分支: ${finalBranchName}`)
      }

      finalBranchName = 'public/' + finalBranchName
      // 优化：使用更快的分支创建方式
      // 1. 先创建分支（不切换）
      await execGitCommand(`git branch ${finalBranchName}`)
      // 2. 再切换到该分支
      await execGitCommand(`git switch ${finalBranchName}`)

      res.send({
        success: true,
        message: `成功创建并切换到分支: ${finalBranchName}`,
        currentBranch: finalBranchName
      })
    } catch (error) {
      console.error('Git 操作失败:', error)
      res.send({
        success: false,
        message: `Git 操作失败: ${error.message}`
      })
    }
  } catch (error) {
    console.error('处理 git-branch 请求时出错:', error)
    res.send({
      success: false,
      message: `服务器错误: ${error.message}`
    })
  }
})

app.get('/checkServerStatus', (req, res) => {
  res.send('ready')
})

// http://localhost:5001/server/node_serve/create_page/index.html
app.listen(3000, () => {
  console.log(colors.green('> node version ----------------------------'))
  console.log(colors.green(`> ${process.version}`))
  console.log(colors.green('> node 服务开启 端口 3000 -------------------'))
  console.log(colors.green('> http://localhost:3000/create_page/index.html'))
  tool.open('http://localhost:3000/create_page/index.html')
})
