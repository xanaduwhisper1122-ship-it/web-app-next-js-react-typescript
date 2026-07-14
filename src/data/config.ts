export const APP_NAME = "大大阿卢的拼音修炼手册";
export const APP_SUBTITLE = "从笔画输入到拼音输入，每天进步一点点。";
export const STORAGE_KEY = "dada-alu-pinyin-progress-v1";
export const REWARD_NAME = "温老师的摸摸头(,,´•ω•)ノ\"(´っω•｀。)";

export const userProfile = {
  nickname: "大大阿卢",
  avatarLabel: "阿卢",
  initialLevel: "拼音萌新",
  goal: "熟练使用拼音输入法"
};

export const xpRules = {
  correctAnswer: 8,
  completeLesson: 18,
  completeDailyTasks: 35,
  perfectPracticeGroup: 20
};

export const levelRules = [
  { name: "拼音萌新", minXp: 0 },
  { name: "拼音学徒", minXp: 120 },
  { name: "拼音进阶者", minXp: 300 },
  { name: "拼音输入能手", minXp: 620 },
  { name: "拼音大师", minXp: 1000 }
];

export const rewardRules = {
  dailyComplete: 1,
  streak3: 1,
  streak7: 3,
  perfectPracticeGroup: 1
};
