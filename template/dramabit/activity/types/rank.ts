export interface InfoType {
  name?: string
  stamp?: boolean
  score?: string | number
  idx?: string | number
  selDate?: number | string
  status?: number
  timeLeft?: number
  liveStatus?: number
  uid?: number
  isFollowed?: boolean
  isMe?: boolean
  rank?: number | string
  diffPreviousScore?: number
  isOnTheRank?: boolean
}

export type TRankListItem = {
  name: string
  avatar: string
  liveStatus?: number
  rank?: number | string
  score?: number
  isOnTheRank?: false
  other?: string
}

export type TRank = {
  dailyStatus: number
  status: number
  timeLeft: number
  pageIndex: number
  pageSize: number
  loading?: boolean
  isEndPage: boolean
  list: TRankListItem[]
  newUserInfo?: {
    name?: string
    avatar?: string
    liveStatus?: number
    rank?: number | string
    score?: number
    isOnTheRank?: false
    other1?: number
  }
  userInfo?: {
    name?: string
    avatar?: string
    liveStatus?: number
    rank?: number | string
    score?: number
    isOnTheRank?: false
    other1?: number
  }
  reward?: TRankListItem | any
}
