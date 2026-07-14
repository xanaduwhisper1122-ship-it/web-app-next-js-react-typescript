import { levelRules, rewardRules, xpRules } from "../data/config.ts";
import { badgeDefinitions } from "../data/rewards/badges.ts";
import type { Badge } from "../data/rewards/badges.ts";
import { companionRewards, encouragementRules } from "../data/rewards/rewardRules.ts";

export type AnswerRecord = {
  id: string;
  questionId: string;
  type: string;
  lessonId?: string;
  chinese: string;
  input: string;
  correct: boolean;
  answeredAt: string;
};

export type WrongRecord = AnswerRecord & {
  answer: string;
  explanation: string;
};

export type DayProgress = {
  date: string;
  lessonDone: boolean;
  charDoneIds: string[];
  wordDoneIds: string[];
  chatDoneIds: string[];
  choiceDoneIds: string[];
  answeredCount: number;
  correctCount: number;
  completed: boolean;
};

export type RewardRecord = {
  id: string;
  type: string;
  title: string;
  amount: number;
  createdAt: string;
  reason: string;
  earnedAt?: string;
};

export type CompanionRewardRecord = RewardRecord & {
  rewardId: string;
  cost: number;
  content: string;
};

export type BadgeRecord = Badge & {
  unlockedAt: string;
};

export type ProgressState = {
  xp: number;
  completedLessons: string[];
  answerRecords: AnswerRecord[];
  wrongRecords: WrongRecord[];
  dailyProgress: Record<string, DayProgress>;
  checkinDates: string[];
  currentStreak: number;
  longestStreak: number;
  rewardTotal: number;
  rewardRecords: RewardRecord[];
  rewardKeys: string[];
  encouragementValue: number;
  encouragementRecords: RewardRecord[];
  encouragementKeys: string[];
  companionRewardRecords: CompanionRewardRecord[];
  badgeRecords: BadgeRecord[];
  totalAnsweredCount: number;
  correctCharCount: number;
  workLogisticsCorrectCount: number;
  warmChatCorrectCount: number;
};

export function createInitialProgress(): ProgressState {
  return {
    xp: 0,
    completedLessons: [],
    answerRecords: [],
    wrongRecords: [],
    dailyProgress: {},
    checkinDates: [],
    currentStreak: 0,
    longestStreak: 0,
    rewardTotal: 0,
    rewardRecords: [],
    rewardKeys: [],
    encouragementValue: 0,
    encouragementRecords: [],
    encouragementKeys: [],
    companionRewardRecords: [],
    badgeRecords: [],
    totalAnsweredCount: 0,
    correctCharCount: 0,
    workLogisticsCorrectCount: 0,
    warmChatCorrectCount: 0
  };
}

export function formatDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayLabel(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(date);
}

export function getDayProgress(progress: ProgressState, dateKey: string): DayProgress {
  return (
    progress.dailyProgress[dateKey] ?? {
      date: dateKey,
      lessonDone: false,
      charDoneIds: [],
      wordDoneIds: [],
      chatDoneIds: [],
      choiceDoneIds: [],
      answeredCount: 0,
      correctCount: 0,
      completed: false
    }
  );
}

export function normalizeInput(value: string, removeSpaces = false) {
  const normalized = value.trim().toLowerCase();
  return removeSpaces ? normalized.replace(/\s+/g, "") : normalized;
}

export function getCurrentLevel(xp: number) {
  return [...levelRules].reverse().find((level) => xp >= level.minXp) ?? levelRules[0];
}

export function getNextLevel(xp: number) {
  return levelRules.find((level) => level.minXp > xp) ?? null;
}

export function getLevelPercent(xp: number) {
  const current = getCurrentLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.minXp - current.minXp;
  return Math.min(100, Math.round(((xp - current.minXp) / range) * 100));
}

export function addReward(
  progress: ProgressState,
  key: string,
  amount: number,
  reason: string
) {
  if (progress.rewardKeys.includes(key)) return progress;

  const now = new Date().toISOString();
  const record: RewardRecord = {
    id: key,
    type: "momotou",
    title: "温老师的摸摸头",
    amount,
    createdAt: now,
    earnedAt: now,
    reason
  };

  return {
    ...progress,
    rewardTotal: progress.rewardTotal + amount,
    rewardRecords: [record, ...progress.rewardRecords],
    rewardKeys: [...progress.rewardKeys, key]
  };
}

export function addEncouragement(
  progress: ProgressState,
  key: string,
  amount: number,
  reason: string
) {
  if (progress.encouragementKeys.includes(key)) return progress;

  const record: RewardRecord = {
    id: key,
    type: "encouragement",
    title: "温老师的鼓励值",
    amount,
    createdAt: new Date().toISOString(),
    reason
  };

  return {
    ...progress,
    encouragementValue: progress.encouragementValue + amount,
    encouragementRecords: [record, ...progress.encouragementRecords],
    encouragementKeys: [...progress.encouragementKeys, key]
  };
}

export function redeemCompanionReward(
  progress: ProgressState,
  rewardId: string,
  content: string
): { progress: ProgressState; record?: CompanionRewardRecord; rewardRecord?: RewardRecord } {
  const reward = companionRewards.find((item) => item.id === rewardId);
  if (!reward || progress.encouragementValue < reward.cost) {
    return { progress };
  }

  const now = new Date().toISOString();
  const id = `redeem:${reward.id}:${Date.now()}`;
  const record: CompanionRewardRecord = {
    id,
    type: `redeem:${reward.id}`,
    title: reward.title,
    amount: -reward.cost,
    createdAt: now,
    reason: reward.feedback,
    rewardId: reward.id,
    cost: reward.cost,
    content
  };

  let next: ProgressState = {
    ...progress,
    encouragementValue: progress.encouragementValue - reward.cost,
    companionRewardRecords: [record, ...progress.companionRewardRecords]
  };

  if (reward.id === "momotou") {
    const rewardRecord: RewardRecord = {
      id: `${id}:momotou`,
      type: "momotou",
      title: "温老师的摸摸头",
      amount: 1,
      createdAt: now,
      earnedAt: now,
      reason: reward.feedback
    };
    next = {
      ...next,
      rewardTotal: next.rewardTotal + 1,
      rewardRecords: [rewardRecord, ...next.rewardRecords]
    };
    return { progress: next, record, rewardRecord };
  }

  return { progress: next, record };
}

export function unlockBadges(progress: ProgressState) {
  const unlockedIds = new Set(progress.badgeRecords.map((badge) => badge.id));
  const newBadges = badgeDefinitions
    .filter((badge) => !unlockedIds.has(badge.id))
    .filter((badge) => {
      if (badge.id === "pinyin-sprout") return progress.completedLessons.length >= 1;
      if (badge.id === "keyboard-warrior") return progress.correctCharCount >= 10;
      if (badge.id === "seven-day-streak") return progress.longestStreak >= 7 || progress.currentStreak >= 7;
      if (badge.id === "trade-helper") return progress.workLogisticsCorrectCount >= 100;
      if (badge.id === "warm-expression") return progress.warmChatCorrectCount >= 30;
      if (badge.id === "pinyin-expert") return progress.totalAnsweredCount >= 1000;
      return false;
    })
    .map((badge) => ({ ...badge, unlockedAt: new Date().toISOString() }));

  if (newBadges.length === 0) return progress;
  return {
    ...progress,
    badgeRecords: [...newBadges, ...progress.badgeRecords]
  };
}

export function normalizeProgress(raw: Partial<ProgressState> | null | undefined): ProgressState {
  const initial = createInitialProgress();
  const merged = { ...initial, ...(raw ?? {}) };
  const answerRecords = merged.answerRecords ?? [];
  const dailyAnsweredCount = Object.values(merged.dailyProgress ?? {}).reduce(
    (sum, day) => sum + (day?.answeredCount ?? 0),
    0
  );

  return {
    ...merged,
    rewardRecords: (merged.rewardRecords ?? []).map((record) => ({
      ...record,
      type: "momotou",
      title: "温老师的摸摸头",
      createdAt: record.createdAt ?? record.earnedAt ?? new Date().toISOString()
    })),
    encouragementRecords: merged.encouragementRecords ?? [],
    encouragementKeys: merged.encouragementKeys ?? [],
    companionRewardRecords: merged.companionRewardRecords ?? [],
    badgeRecords: merged.badgeRecords ?? [],
    totalAnsweredCount: merged.totalAnsweredCount || Math.max(dailyAnsweredCount, answerRecords.length),
    correctCharCount:
      merged.correctCharCount ||
      answerRecords.filter((record) => record.correct && record.type === "char").length,
    workLogisticsCorrectCount:
      merged.workLogisticsCorrectCount ||
      answerRecords.filter((record) => record.correct && record.lessonId === "work-logistics").length,
    warmChatCorrectCount:
      merged.warmChatCorrectCount ||
      answerRecords.filter((record) => record.correct && record.type === "chat" && record.lessonId === "warm-chat").length
  };
}

export function calculateStreak(checkinDates: string[]) {
  const sorted = [...new Set(checkinDates)].sort();
  if (sorted.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longest = 1;
  let run = 1;
  for (let index = 1; index < sorted.length; index += 1) {
    const prev = new Date(`${sorted[index - 1]}T00:00:00`);
    const current = new Date(`${sorted[index]}T00:00:00`);
    const diff = Math.round((current.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }

  const today = formatDateKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDateKey(yesterdayDate);
  const includesTodayOrYesterday = sorted.includes(today) || sorted.includes(yesterday);

  let currentStreak = includesTodayOrYesterday ? 1 : 0;
  if (includesTodayOrYesterday) {
    for (let index = sorted.length - 1; index > 0; index -= 1) {
      const prev = new Date(`${sorted[index - 1]}T00:00:00`);
      const current = new Date(`${sorted[index]}T00:00:00`);
      const diff = Math.round((current.getTime() - prev.getTime()) / 86400000);
      if (diff === 1) currentStreak += 1;
      else break;
    }
  }

  return { currentStreak, longestStreak: longest };
}

export function finalizeDailyIfReady(
  progress: ProgressState,
  dateKey: string,
  required: { lessonId: string; charIds: string[]; wordIds: string[]; chatId: string }
) {
  const day = getDayProgress(progress, dateKey);
  const hasAllChars = required.charIds.every((id) => day.charDoneIds.includes(id));
  const hasAllWords = required.wordIds.every((id) => day.wordDoneIds.includes(id));
  const hasChat = day.chatDoneIds.includes(required.chatId);
  const completed = day.lessonDone && hasAllChars && hasAllWords && hasChat;
  if (!completed || day.completed) {
    return {
      ...progress,
      dailyProgress: {
        ...progress.dailyProgress,
        [dateKey]: { ...day, completed: day.completed || completed }
      }
    };
  }

  let next: ProgressState = {
    ...progress,
    xp: progress.xp + xpRules.completeDailyTasks,
    dailyProgress: {
      ...progress.dailyProgress,
      [dateKey]: { ...day, completed: true }
    },
    checkinDates: [...new Set([...progress.checkinDates, dateKey])]
  };

  const streak = calculateStreak(next.checkinDates);
  next = { ...next, ...streak };
  next = addReward(next, `daily:${dateKey}`, rewardRules.dailyComplete, "完成今日全部任务");
  next = addEncouragement(next, `encourage:daily:${dateKey}`, encouragementRules.dailyComplete, "完成今日全部任务");

  if (next.currentStreak === 3) {
    next = addReward(next, `streak3:${dateKey}`, rewardRules.streak3, "连续打卡3天");
    next = addEncouragement(next, `encourage:streak3:${dateKey}`, encouragementRules.streak3, "连续打卡3天");
  }
  if (next.currentStreak === 7) {
    next = addReward(next, `streak7:${dateKey}`, rewardRules.streak7, "连续打卡7天");
    next = addEncouragement(next, `encourage:streak7:${dateKey}`, encouragementRules.streak7, "连续打卡7天");
  }
  if (next.currentStreak === 30) {
    next = addEncouragement(next, `encourage:streak30:${dateKey}`, encouragementRules.streak30, "连续打卡30天");
  }

  return next;
}

export function getRecent7Days(reference = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(reference);
    date.setDate(reference.getDate() - (6 - index));
    return formatDateKey(date);
  });
}

export function getWeekRewardTotal(rewards: RewardRecord[]) {
  const recent = new Set(getRecent7Days());
  return rewards
    .filter((reward) => recent.has(formatDateKey(new Date(reward.createdAt ?? reward.earnedAt))))
    .reduce((sum, reward) => sum + reward.amount, 0);
}
