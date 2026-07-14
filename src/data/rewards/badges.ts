export type BadgeId =
  | "pinyin-sprout"
  | "keyboard-warrior"
  | "seven-day-streak"
  | "trade-helper"
  | "warm-expression"
  | "pinyin-expert";

export type Badge = {
  id: BadgeId;
  name: string;
  description: string;
  requirement: string;
  icon: string;
  encouragement: string;
  unlockedAt?: string;
};

export const badgeDefinitions: Badge[] = [
  {
    id: "pinyin-sprout",
    name: "拼音小萌芽",
    description: "完成第一次拼音学习",
    requirement: "完成任意一个拼音知识点",
    icon: "芽",
    encouragement: "第一步已经迈出来啦，新的输入习惯正在发芽。"
  },
  {
    id: "keyboard-warrior",
    name: "键盘小勇士",
    description: "第一次成功输入10个汉字",
    requirement: "累计答对10道汉字转拼音题",
    icon: "键",
    encouragement: "手指和拼音开始熟悉彼此了，很勇敢。"
  },
  {
    id: "seven-day-streak",
    name: "坚持7天",
    description: "连续学习7天",
    requirement: "连续打卡达到7天",
    icon: "七",
    encouragement: "七天不是小事，大大阿卢真的有在坚持。"
  },
  {
    id: "trade-helper",
    name: "外贸小达人",
    description: "完成100个运输外贸词汇训练",
    requirement: "累计答对100道运输外贸专题题目",
    icon: "贸",
    encouragement: "工作场景里的拼音输入，已经越来越顺手了。"
  },
  {
    id: "warm-expression",
    name: "温柔表达家",
    description: "完成30组温老师聊天训练",
    requirement: "累计答对30道温老师聊天题",
    icon: "温",
    encouragement: "温柔的话也能被稳稳输入出来，这很珍贵。"
  },
  {
    id: "pinyin-expert",
    name: "拼音高手",
    description: "累计完成1000道题",
    requirement: "累计完成1000道练习题",
    icon: "高",
    encouragement: "这么多题都是一步步走出来的，拼音高手实至名归。"
  }
];
