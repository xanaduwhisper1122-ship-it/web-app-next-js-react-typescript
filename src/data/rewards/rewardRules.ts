export const ENCOURAGEMENT_NAME = "温老师的鼓励值";

export const encouragementRules = {
  dailyComplete: 10,
  streak3: 20,
  streak7: 50,
  streak30: 100,
  perfectPracticeGroup: 10,
  firstLessonMastered: 10,
  workTopicTraining: 5,
  warmChatTraining: 5
};

export type CompanionRewardKind = "momotou" | "praise-card" | "note";

export type CompanionReward = {
  id: CompanionRewardKind;
  title: string;
  cost: number;
  displayTitle: string;
  description: string;
  feedback: string;
};

export const companionRewards: CompanionReward[] = [
  {
    id: "momotou",
    title: "温老师的摸摸头",
    cost: 10,
    displayTitle: "温老师摸摸头",
    description: "(,,´•ω•)ノ\"(´っω•｀。)",
    feedback: "大大阿卢今天也认真学习啦。"
  },
  {
    id: "praise-card",
    title: "温老师的夸夸卡",
    cost: 30,
    displayTitle: "温老师的夸夸卡",
    description: "随机收到一句温柔鼓励，适合练完以后慢慢看。",
    feedback: "这张夸夸卡，是温老师认真写给大大阿卢的。"
  },
  {
    id: "note",
    title: "温老师的小纸条",
    cost: 50,
    displayTitle: "温老师的小纸条",
    description: "生成一张记录坚持和进步的小纸条。",
    feedback: "这张小纸条，留给今天继续努力的大大阿卢。"
  }
];

export const praiseCardMessages = [
  "大大阿卢今天真的很认真。",
  "以前不会拼音，现在已经进步很多啦。",
  "坚持下来就是最厉害的事情。",
  "今天也辛苦啦，要记得照顾自己。",
  "认真努力的大大阿卢，很棒。"
];
