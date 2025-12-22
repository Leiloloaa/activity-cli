// /////////////////////////////////////////////////////////////// 用户
export interface IUser {
	uid: number;
	avatar: string;
	name: string;
	gender?: number;
	score: number;
	micStatus: boolean;		// 是否在麦
	stamp: boolean;
	createTime?: number;
	location?: string;		// 国家/地区 如："EG"
	lang?: string;			// 语言 如："en"、"ar"、"zh_TW"
	// 魅力等级
	charmLevel: number;
	charmLevelImage: string;
	// 财富等级
	richLevel: number;
	richImage: string;
	// vip 信息
	// vipLevel?: number;
	// vipLevelImage?: string;
	
	inRoomStatus?: boolean;	// 是否在房间中
	roomOwnerStatus?: boolean;	// 是否是房主

	// 开播时才有
	roomId?: number;		// 房间 id
	roomOwnerId?: number;	// 房主 id
    // 距离上一名分数
	distinctScore?: number;

	/**
	 * 榜单隐身
	 * 榜单隐身：拥有榜单隐身功能的用户，榜单上展示神秘人默认头像，分数、昵称为神秘人，点击头像不支持跳转房间或个人主页，不展示富豪等级和魅力等级
	 */
	hiddenRankStatus?: boolean;
	/**
	 * 在线隐身
	 * 在线隐身：拥有在线隐身权益的用户，榜单中不显示该用户在麦状态，正常展示用户头像、昵称、分数、富豪等级和魅力等级，点击头像可进入个人主页，个人主页头像不展示绿点在线状态
	 */
	hiddenOnlineStatus?: boolean;

	// 同时拥有榜单隐身和在线隐身权限的用户，榜单中展示神秘人默认头像、分数、昵称为神秘人，点击头像不支持跳转房间或个人主页，不展示富豪等级和魅力等级
}
export type UserList = Array<IUser>;
// 吸底信息
export interface IFooterInfo extends IUser {
	// 吸底才有的字段
	display: boolean;
	rank: number;
	distinctScore: number;
}

// /////////////////////////////////////////////////////////////// 奖励
export interface IReward {
	uid: number;

	rewardType?: number;	// 礼物类型
	giftType?: number;		// 礼物类型

	duration?: number;		// 礼物天数
	expireDays?: number;	// 礼物天数
	
	count: number;

	image?: string;			// 礼物图片
	md5OfImage?: string;	// 礼物图片
	rewardImage?: string;	// 礼物图片
	
	createTime?: string;
	index: number;
	diagramMd5?: string;
	resourceFilePath?: string;
}
export type RewardList = Array<IReward>;