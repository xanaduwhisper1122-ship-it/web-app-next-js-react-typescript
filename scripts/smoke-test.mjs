import { dailyPlans, lessons } from "../src/data/lessons.ts";
import { REWARD_NAME, levelRules, rewardRules, xpRules } from "../src/data/config.ts";
import { badgeDefinitions } from "../src/data/rewards/badges.ts";
import { companionRewards, encouragementRules } from "../src/data/rewards/rewardRules.ts";
import {
  allQuestions,
  charQuestions,
  chatQuestions,
  choiceQuestions,
  wordQuestions
} from "../src/data/questions.ts";
import { expansionSummary } from "../src/data/expandedQuestions.ts";
import {
  addEncouragement,
  calculateStreak,
  createInitialProgress,
  finalizeDailyIfReady,
  formatDateKey,
  getCurrentLevel,
  normalizeProgress,
  normalizeInput,
  redeemCompanionReward,
  unlockBadges
} from "../src/lib/progress.ts";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const REQUIRED_EXPANSION = {
  chars: 80,
  lifeWords: 120,
  dailyPhrases: 80,
  choices: 60,
  ordinaryChats: 40,
  workWords: 100,
  workPhrases: 80,
  warmChats: 50
};

const questionIds = new Set(allQuestions.map((question) => question.id));
const lessonIds = new Set(lessons.map((lesson) => lesson.id));

assert(charQuestions.length >= 110, "单字题总数应不少于 110 道");
assert(wordQuestions.length >= 410, "词语/短句题总数应不少于 410 道");
assert(choiceQuestions.length >= 75, "选择题总数应不少于 75 道");
assert(chatQuestions.length >= 100, "聊天题总数应不少于 100 道");
assert(allQuestions.length >= 695, "题库总数应不少于 695 道");
assert(dailyPlans.length >= 5, "每日学习内容至少需要 5 天");

for (const [key, requiredCount] of Object.entries(REQUIRED_EXPANSION)) {
  assert(
    expansionSummary[key] >= requiredCount,
    `新增题库 ${key} 至少需要 ${requiredCount} 道，当前为 ${expansionSummary[key]} 道`
  );
}

assert(questionIds.size === allQuestions.length, "题目 id 不能重复");

for (const question of allQuestions) {
  assert(question.id, "每道题必须有 id");
  assert(question.type, `${question.id} 缺少类型`);
  assert(question.chinese, `${question.id} 缺少中文内容`);
  assert(question.answer, `${question.id} 缺少标准拼音答案`);
  assert(/^[a-z]+$/.test(question.answer), `${question.id} 的答案应为无声调小写拼音`);
  assert(question.difficulty, `${question.id} 缺少难度`);
  assert(question.lessonId, `${question.id} 缺少所属知识点`);
  assert(lessonIds.has(question.lessonId), `${question.id} 引用了不存在的知识点 ${question.lessonId}`);
  assert(question.hints.length >= 2, `${question.id} 至少需要两个提示`);
  assert(question.explanation, `${question.id} 缺少错误解释`);

  if (question.type === "choice") {
    assert(question.options.length === 3, `${question.id} 需要正好 3 个选项`);
    assert(question.options.includes(question.answer), `${question.id} 选项必须包含正确答案`);
    assert(new Set(question.options).size === question.options.length, `${question.id} 选项不能重复`);
    assert(
      question.options.every((option) => /^[a-z]+$/.test(option)),
      `${question.id} 的选项应为无声调小写拼音`
    );
  }

  if (question.type === "chat") {
    assert(question.speaker, `${question.id} 缺少聊天说话人`);
    assert(question.scene, `${question.id} 缺少聊天场景`);
    assert(question.prompt, `${question.id} 缺少聊天任务说明`);
  }
}

for (const plan of dailyPlans) {
  assert(lessonIds.has(plan.lessonId), `第 ${plan.day} 天引用了不存在的课程`);
  assert(plan.charIds.length === 5, `第 ${plan.day} 天需要 5 道单字题`);
  assert(plan.wordIds.length === 5, `第 ${plan.day} 天需要 5 道词语题`);
  assert(questionIds.has(plan.chatId), `第 ${plan.day} 天引用了不存在的聊天题 ${plan.chatId}`);

  for (const id of [...plan.charIds, ...plan.wordIds]) {
    assert(questionIds.has(id), `第 ${plan.day} 天引用了不存在的题目 ${id}`);
  }

  const dailyQuestionIds = [...plan.charIds, ...plan.wordIds, plan.chatId];
  assert(
    dailyQuestionIds.some((id) => id.startsWith("word-life") || id.startsWith("phrase-daily")),
    `第 ${plan.day} 天应混入基础生活题`
  );
  assert(
    dailyQuestionIds.some((id) => id.startsWith("word-work") || id.startsWith("phrase-work")),
    `第 ${plan.day} 天应混入运输外贸题`
  );
  assert(dailyQuestionIds.some((id) => id.startsWith("chat-warm")), `第 ${plan.day} 天应混入暖心聊天题`);
}

assert(REWARD_NAME === "温老师的摸摸头(,,´•ω•)ノ\"(´っω•｀。)", "奖励名称必须保持完整");
assert(rewardRules.dailyComplete === 1, "完成今日全部任务应获得 1 次摸摸头");
assert(rewardRules.streak3 === 1, "连续打卡 3 天应额外获得 1 次摸摸头");
assert(rewardRules.streak7 === 3, "连续打卡 7 天应额外获得 3 次摸摸头");
assert(rewardRules.perfectPracticeGroup === 1, "一组练习全对应额外获得 1 次摸摸头");
assert(encouragementRules.dailyComplete === 10, "完成今日全部任务应获得 10 鼓励值");
assert(encouragementRules.streak3 === 20, "连续 3 天应获得 20 鼓励值");
assert(encouragementRules.streak7 === 50, "连续 7 天应获得 50 鼓励值");
assert(encouragementRules.streak30 === 100, "连续 30 天应获得 100 鼓励值");
assert(encouragementRules.perfectPracticeGroup === 10, "单次练习全对应获得 10 鼓励值");
assert(companionRewards.find((reward) => reward.id === "momotou")?.cost === 10, "摸摸头兑换应消耗 10 鼓励值");
assert(companionRewards.find((reward) => reward.id === "praise-card")?.cost === 30, "夸夸卡兑换应消耗 30 鼓励值");
assert(companionRewards.find((reward) => reward.id === "note")?.cost === 50, "小纸条兑换应消耗 50 鼓励值");
assert(badgeDefinitions.length === 6, "应包含 6 个成就徽章");
assert(levelRules[0].name === "拼音萌新", "第一个等级必须是拼音萌新");
assert(levelRules.length === 5, "当前版本应包含 5 个等级");
assert(Object.values(xpRules).every((value) => Number.isInteger(value) && value > 0), "经验规则必须是正整数");
assert(normalizeInput("  LU  ") === "lu", "单字输入应忽略大小写和首尾空白");
assert(normalizeInput(" L U ", true) === "lu", "拼音判断应忽略输入中的空格");
assert(normalizeInput("lao shi", true) === "laoshi", "词语输入应允许空格");
assert(getCurrentLevel(0).name === "拼音萌新", "0 经验应为拼音萌新");
assert(getCurrentLevel(1000).name === "拼音大师", "高经验应进入拼音大师");

const todayKey = formatDateKey();
const firstPlan = dailyPlans[0];
const readyProgress = createInitialProgress();
readyProgress.dailyProgress[todayKey] = {
  date: todayKey,
  lessonDone: true,
  charDoneIds: [...firstPlan.charIds],
  wordDoneIds: [...firstPlan.wordIds],
  chatDoneIds: [firstPlan.chatId],
  choiceDoneIds: [],
  answeredCount: 11,
  correctCount: 11,
  completed: false
};

const completedOnce = finalizeDailyIfReady(readyProgress, todayKey, {
  lessonId: firstPlan.lessonId,
  charIds: firstPlan.charIds,
  wordIds: firstPlan.wordIds,
  chatId: firstPlan.chatId
});
assert(completedOnce.dailyProgress[todayKey].completed, "完成全部今日任务后应自动打卡");
assert(completedOnce.checkinDates.includes(todayKey), "打卡日期应记录今天");
assert(completedOnce.rewardTotal === rewardRules.dailyComplete, "完成今日任务应发放一次奖励");
assert(completedOnce.encouragementValue === encouragementRules.dailyComplete, "完成今日任务应发放 10 鼓励值");

const completedTwice = finalizeDailyIfReady(completedOnce, todayKey, {
  lessonId: firstPlan.lessonId,
  charIds: firstPlan.charIds,
  wordIds: firstPlan.wordIds,
  chatId: firstPlan.chatId
});
assert(completedTwice.checkinDates.length === 1, "同一天重复完成不能重复打卡");
assert(completedTwice.rewardTotal === completedOnce.rewardTotal, "刷新或重复完成不能重复发放每日奖励");
assert(completedTwice.encouragementValue === completedOnce.encouragementValue, "刷新或重复完成不能重复发放鼓励值");

const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const streak = calculateStreak([formatDateKey(twoDaysAgo), formatDateKey(yesterday), todayKey]);
assert(streak.currentStreak === 3, "连续三天应计算为 3 天连续打卡");
assert(streak.longestStreak === 3, "最长连续打卡应正确计算");

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

function readyProgressForToday(existingDates) {
  const progress = createInitialProgress();
  progress.checkinDates = existingDates;
  progress.dailyProgress[todayKey] = {
    date: todayKey,
    lessonDone: true,
    charDoneIds: [...firstPlan.charIds],
    wordDoneIds: [...firstPlan.wordIds],
    chatDoneIds: [firstPlan.chatId],
    choiceDoneIds: [],
    answeredCount: 11,
    correctCount: 11,
    completed: false
  };
  return progress;
}

const streak3Progress = finalizeDailyIfReady(readyProgressForToday([dateOffset(-2), dateOffset(-1)]), todayKey, {
  lessonId: firstPlan.lessonId,
  charIds: firstPlan.charIds,
  wordIds: firstPlan.wordIds,
  chatId: firstPlan.chatId
});
assert(streak3Progress.currentStreak === 3, "完成今天后连续打卡应达到 3 天");
assert(streak3Progress.rewardTotal === rewardRules.dailyComplete + rewardRules.streak3, "连续 3 天应额外发放奖励");
assert(
  streak3Progress.encouragementValue === encouragementRules.dailyComplete + encouragementRules.streak3,
  "连续 3 天应额外发放鼓励值"
);

const previousSixDays = [-6, -5, -4, -3, -2, -1].map(dateOffset);
const streak7Progress = finalizeDailyIfReady(readyProgressForToday(previousSixDays), todayKey, {
  lessonId: firstPlan.lessonId,
  charIds: firstPlan.charIds,
  wordIds: firstPlan.wordIds,
  chatId: firstPlan.chatId
});
assert(streak7Progress.currentStreak === 7, "完成今天后连续打卡应达到 7 天");
assert(streak7Progress.rewardTotal === rewardRules.dailyComplete + rewardRules.streak7, "连续 7 天应额外发放 3 次奖励");
assert(
  streak7Progress.encouragementValue === encouragementRules.dailyComplete + encouragementRules.streak7,
  "连续 7 天应额外发放鼓励值"
);

const previousTwentyNineDays = Array.from({ length: 29 }, (_, index) => dateOffset(-(29 - index)));
const streak30Progress = finalizeDailyIfReady(readyProgressForToday(previousTwentyNineDays), todayKey, {
  lessonId: firstPlan.lessonId,
  charIds: firstPlan.charIds,
  wordIds: firstPlan.wordIds,
  chatId: firstPlan.chatId
});
assert(streak30Progress.currentStreak === 30, "完成今天后连续打卡应达到 30 天");
assert(
  streak30Progress.encouragementValue === encouragementRules.dailyComplete + encouragementRules.streak30,
  "连续 30 天应额外发放 100 鼓励值"
);

let encouragementProgress = createInitialProgress();
encouragementProgress = addEncouragement(encouragementProgress, "manual:test", 60, "测试鼓励值");
const redeemPraise = redeemCompanionReward(encouragementProgress, "praise-card", "大大阿卢今天真的很认真。");
assert(redeemPraise.record, "鼓励值足够时应能兑换夸夸卡");
assert(redeemPraise.progress.encouragementValue === 30, "兑换夸夸卡后应扣除 30 鼓励值");
assert(redeemPraise.progress.companionRewardRecords.length === 1, "兑换记录应保存");

const redeemMomotou = redeemCompanionReward(redeemPraise.progress, "momotou", "(,,´•ω•)ノ\"(´っω•｀。)");
assert(redeemMomotou.record, "鼓励值足够时应能兑换摸摸头");
assert(redeemMomotou.progress.encouragementValue === 20, "兑换摸摸头后应扣除 10 鼓励值");
assert(redeemMomotou.progress.rewardTotal === 1, "兑换摸摸头应保留并增加原有摸摸头累计");

const oldProgress = normalizeProgress({
  xp: 88,
  rewardTotal: 2,
  rewardRecords: [{ id: "daily:old", earnedAt: new Date().toISOString(), amount: 1, reason: "旧版摸摸头" }],
  rewardKeys: ["daily:old"]
});
assert(oldProgress.rewardTotal === 2, "旧版摸摸头数量应保留");
assert(Array.isArray(oldProgress.encouragementRecords), "旧版数据应自动补齐鼓励值记录数组");
assert(Array.isArray(oldProgress.badgeRecords), "旧版数据应自动补齐徽章记录数组");

const badgeProgress = unlockBadges({
  ...createInitialProgress(),
  completedLessons: ["intro-single"],
  correctCharCount: 10,
  currentStreak: 7,
  longestStreak: 7,
  workLogisticsCorrectCount: 100,
  warmChatCorrectCount: 30,
  totalAnsweredCount: 1000
});
assert(badgeProgress.badgeRecords.length === 6, "满足条件时应自动解锁 6 个徽章");

console.log(
  `烟测通过：题库 ${allQuestions.length} 道，新增 ${Object.values(expansionSummary).reduce((sum, count) => sum + count, 0)} 道，每日计划、奖励和等级规则正常。`
);
