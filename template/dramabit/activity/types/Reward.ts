export type TReward = {
    goodsType: number
    goodsId: number
    count: number | null
    rewardCount?: number | null
    sendCount?: number | null
    days: number
    empty: boolean
    type: null,
    staticImage: string
    dynamicImage: string
}

export type TEventGift = {
    giftId: number,
    giftImage: string,
    giftPrice: number,
    giftName: string
}