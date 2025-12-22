import type { TReward } from './Reward'
export type TLotteryGameInfo = {
    isHighLevel: boolean, // 是否是高等级
    lotteryTimeLeft: number,
    count: number, // 抽奖次数
    doubleTimeLeft: number | null, // 双倍经验卡剩余时间，为 null表示无
    lotteryStatus: number,
    timeLeft: number,
    status: number,
    dailyTasks: {
        prevProgress: number
        prevRequired: number
        progress: number
        required: number
        status: number // status 任务按钮的状态 -1未开始、0已结束 、1未领取（完成了但没有手动领取） 、 2已领取 、3未完成（去完成）、4已完成
        reward: TReward,
        finished: boolean
    }[],
    lotteryRewards: TReward[]
}