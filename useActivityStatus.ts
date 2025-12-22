import { onMounted } from 'vue'
import injectTool from '@publicComponents/injectTool'

/**
 * 活动状态 hook - 检查活动是否下线
 * @param activityId 活动ID
 * @param appInfo 响应式的 appInfo 对象，包含 activityDownStatus 属性
 */
export default function useActivityStatus(
  activityId: number,
  appInfo: { activityDownStatus: number }
) {
  const { TOOL_httpClient } = injectTool()

  const getActivityStatus = async () => {
    // 参数验证
    if (!activityId || typeof activityId !== 'number' || isNaN(activityId)) {
      console.warn('活动ID无效，跳过状态检查：', activityId)
      return
    }

    try {
      const response = await TOOL_httpClient({
        url: `/api/activity/common/activity/down/status?activityId=${encodeURIComponent(
          activityId
        )}`,
        method: 'get'
      })

      // 安全解构响应数据
      if (!response?.data) {
        console.warn('接口响应数据格式异常：', response)
        return
      }

      const { data, errorCode } = response.data

      // 错误码检查
      if (errorCode !== undefined && errorCode !== 0) {
        console.warn('接口返回错误码：', errorCode, response)
        return
      }

      // 数据类型和值检查
      if (data !== undefined && data !== null) {
        const statusValue = Number(data)
        // 响应式更新 activityDownStatus
        appInfo.activityDownStatus = statusValue
        if (statusValue === 0) {
          console.info('活动已下线')
        }
      } else {
        console.warn('接口返回数据为空：', response.data)
      }
    } catch (err) {
      console.error('接口请求失败：', err)
      // 发生错误时保持默认状态
    }
  }

  onMounted(() => {
    getActivityStatus()
  })
}
