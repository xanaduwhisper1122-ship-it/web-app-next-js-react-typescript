"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  APP_NAME,
  APP_SUBTITLE,
  REWARD_NAME,
  levelRules,
  userProfile,
  xpRules
} from "@/data/config";
import { badgeDefinitions } from "@/data/rewards/badges";
import { encouragementMessages, FeedbackCategory } from "@/data/rewards/encouragementMessages";
import {
  companionRewards,
  ENCOURAGEMENT_NAME,
  encouragementRules,
  praiseCardMessages
} from "@/data/rewards/rewardRules";
import { dailyPlans, lessons } from "@/data/lessons";
import {
  allQuestions,
  BaseQuestion,
  charQuestions,
  chatQuestions,
  ChatQuestion,
  choiceQuestions,
  ChoiceQuestion,
  QuestionType,
  wordQuestions
} from "@/data/questions";
import { loadProgress, resetProgressStorage, saveProgress } from "@/lib/storage";
import {
  addEncouragement,
  addReward,
  AnswerRecord,
  BadgeRecord,
  calculateStreak,
  CompanionRewardRecord,
  finalizeDailyIfReady,
  formatDateKey,
  getCurrentLevel,
  getDayProgress,
  getLevelPercent,
  getNextLevel,
  getRecent7Days,
  getTodayLabel,
  getWeekRewardTotal,
  normalizeInput,
  ProgressState,
  redeemCompanionReward,
  RewardRecord,
  unlockBadges
} from "@/lib/progress";

type TabKey = "today" | "study" | "practice" | "checkin" | "rewards" | "profile";
type PracticeMode = "char" | "word" | "choice" | "chat";
type PracticeScope = "today" | "all";

const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: "today", label: "今日", icon: "今" },
  { key: "study", label: "学习", icon: "学" },
  { key: "practice", label: "练习", icon: "练" },
  { key: "checkin", label: "打卡", icon: "卡" },
  { key: "rewards", label: "奖励", icon: "奖" },
  { key: "profile", label: "我的", icon: "我" }
];

const questionMap = new Map(allQuestions.map((question) => [question.id, question]));

function getDailyPlan(dateKey: string) {
  const base = new Date("2026-07-14T00:00:00");
  const current = new Date(`${dateKey}T00:00:00`);
  const diff = Math.floor((current.getTime() - base.getTime()) / 86400000);
  const index = ((diff % dailyPlans.length) + dailyPlans.length) % dailyPlans.length;
  return dailyPlans[index];
}

function classNames(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function pickBySeed<T>(items: T[], seed: string) {
  const total = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return items[total % items.length];
}

function getLastCheckinGap(checkinDates: string[]) {
  if (checkinDates.length === 0) return 0;
  const last = [...checkinDates].sort().at(-1);
  if (!last) return 0;
  const today = new Date(`${formatDateKey()}T00:00:00`);
  const lastDate = new Date(`${last}T00:00:00`);
  return Math.floor((today.getTime() - lastDate.getTime()) / 86400000);
}

function getFeedbackCategory(progress: ProgressState, dayProgress: ReturnType<typeof getDayProgress>): FeedbackCategory {
  const accuracy = dayProgress.answeredCount ? dayProgress.correctCount / dayProgress.answeredCount : 1;
  if (getLastCheckinGap(progress.checkinDates) >= 5) return "longAway";
  if (dayProgress.answeredCount >= 5 && accuracy === 1) return "perfect";
  if (dayProgress.answeredCount >= 5 && accuracy < 0.6) return "manyWrong";
  if (dayProgress.completed) return "dailyComplete";
  if (progress.currentStreak >= 7) return "streak";
  return "default";
}

function getWarmFeedback(progress: ProgressState, dayProgress: ReturnType<typeof getDayProgress>) {
  const category = getFeedbackCategory(progress, dayProgress);
  return pickBySeed(encouragementMessages[category], `${formatDateKey()}:${category}:${dayProgress.answeredCount}:${progress.currentStreak}`);
}

function makeRewardContent(rewardId: string, progress: ProgressState) {
  if (rewardId === "momotou") return "(,,´•ω•)ノ\"(´っω•｀。)";
  if (rewardId === "praise-card") {
    return pickBySeed(praiseCardMessages, `${Date.now()}:${progress.encouragementValue}:${progress.totalAnsweredCount}`);
  }
  return [
    "大大阿卢：",
    "",
    `你已经坚持学习${Math.max(progress.checkinDates.length, progress.currentStreak)}天啦。`,
    "",
    "每天进步一点点，",
    "慢慢就会变得越来越厉害。",
    "",
    "继续加油呀。"
  ].join("\n");
}

export function PinyinApp() {
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<TabKey>("today");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("char");
  const [practiceScope, setPracticeScope] = useState<PracticeScope>("today");
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [rewardPopup, setRewardPopup] = useState<RewardRecord | null>(null);
  const [companionPopup, setCompanionPopup] = useState<CompanionRewardRecord | null>(null);
  const [badgePopup, setBadgePopup] = useState<BadgeRecord | null>(null);
  const rewardWatcherReady = useRef(false);
  const lastRewardId = useRef<string | undefined>(undefined);
  const badgeWatcherReady = useRef(false);
  const lastBadgeId = useRef<string | undefined>(undefined);
  const skipNextRewardPopup = useRef(false);

  const todayKey = formatDateKey();
  const todayPlan = getDailyPlan(todayKey);
  const todayLesson = lessons.find((lesson) => lesson.id === todayPlan.lessonId) ?? lessons[0];
  const dayProgress = getDayProgress(progress, todayKey);
  const level = getCurrentLevel(progress.xp);
  const nextLevel = getNextLevel(progress.xp);
  const levelPercent = getLevelPercent(progress.xp);

  useEffect(() => {
    setHydrated(true);
    const loaded = loadProgress();
    const streak = calculateStreak(loaded.checkinDates);
    setProgress(unlockBadges({ ...loaded, ...streak }));
  }, []);

  useEffect(() => {
    if (hydrated) saveProgress(progress);
  }, [hydrated, progress]);

  useEffect(() => {
    if (!hydrated) return;
    const latest = progress.rewardRecords[0];
    if (!rewardWatcherReady.current) {
      rewardWatcherReady.current = true;
      lastRewardId.current = latest?.id;
      return;
    }
    if (latest && latest.id !== lastRewardId.current) {
      lastRewardId.current = latest.id;
      if (skipNextRewardPopup.current) {
        skipNextRewardPopup.current = false;
        return;
      }
      setRewardPopup(latest);
    }
  }, [hydrated, progress.rewardRecords]);

  useEffect(() => {
    if (!hydrated) return;
    const latest = progress.badgeRecords[0];
    if (!badgeWatcherReady.current) {
      badgeWatcherReady.current = true;
      lastBadgeId.current = latest?.id;
      return;
    }
    if (latest && latest.id !== lastBadgeId.current) {
      lastBadgeId.current = latest.id;
      setBadgePopup(latest);
    }
  }, [hydrated, progress.badgeRecords]);

  function updateProgress(updater: (current: ProgressState) => ProgressState) {
    setProgress((current) => unlockBadges(updater(current)));
  }

  function markLessonDone(lessonId: string) {
    updateProgress((current) => {
      const today = getDayProgress(current, todayKey);
      const alreadyCompleted = current.completedLessons.includes(lessonId);
      let next: ProgressState = {
        ...current,
        xp: alreadyCompleted ? current.xp : current.xp + xpRules.completeLesson,
        completedLessons: alreadyCompleted
          ? current.completedLessons
          : [...current.completedLessons, lessonId],
        dailyProgress: {
          ...current.dailyProgress,
          [todayKey]: {
            ...today,
            lessonDone: today.lessonDone || lessonId === todayPlan.lessonId
          }
        }
      };
      if (!alreadyCompleted) {
        next = addEncouragement(
          next,
          `encourage:lesson:${lessonId}`,
          encouragementRules.firstLessonMastered,
          "第一次掌握一个新的拼音知识点"
        );
      }
      return finalizeDailyIfReady(next, todayKey, {
        lessonId: todayPlan.lessonId,
        charIds: todayPlan.charIds,
        wordIds: todayPlan.wordIds,
        chatId: todayPlan.chatId
      });
    });
  }

  function recordAnswer(question: BaseQuestion, input: string, correct: boolean) {
    updateProgress((current) => {
      const day = getDayProgress(current, todayKey);
      const record: AnswerRecord = {
        id: `${question.id}:${Date.now()}`,
        questionId: question.id,
        type: question.type,
        lessonId: question.lessonId,
        chinese: question.chinese,
        input,
        correct,
        answeredAt: new Date().toISOString()
      };

      const nextDay = { ...day };
      nextDay.answeredCount += 1;
      if (correct) {
        nextDay.correctCount += 1;
        if (question.type === "char" && todayPlan.charIds.includes(question.id)) {
          nextDay.charDoneIds = [...new Set([...nextDay.charDoneIds, question.id])];
        }
        if (question.type === "word" && todayPlan.wordIds.includes(question.id)) {
          nextDay.wordDoneIds = [...new Set([...nextDay.wordDoneIds, question.id])];
        }
        if (question.type === "chat" && todayPlan.chatId === question.id) {
          nextDay.chatDoneIds = [...new Set([...nextDay.chatDoneIds, question.id])];
        }
        if (question.type === "choice") {
          nextDay.choiceDoneIds = [...new Set([...nextDay.choiceDoneIds, question.id])];
        }
      }

      let next: ProgressState = {
        ...current,
        xp: correct ? current.xp + xpRules.correctAnswer : current.xp,
        totalAnsweredCount: current.totalAnsweredCount + 1,
        correctCharCount: correct && question.type === "char" ? current.correctCharCount + 1 : current.correctCharCount,
        workLogisticsCorrectCount:
          correct && question.lessonId === "work-logistics"
            ? current.workLogisticsCorrectCount + 1
            : current.workLogisticsCorrectCount,
        warmChatCorrectCount:
          correct && question.type === "chat" && question.lessonId === "warm-chat"
            ? current.warmChatCorrectCount + 1
            : current.warmChatCorrectCount,
        answerRecords: [record, ...current.answerRecords].slice(0, 400),
        wrongRecords: correct
          ? current.wrongRecords
          : [
              {
                ...record,
                answer: question.answer,
                explanation: question.explanation
              },
              ...current.wrongRecords
            ].slice(0, 120),
        dailyProgress: {
          ...current.dailyProgress,
          [todayKey]: nextDay
        }
      };

      if (correct && question.lessonId === "work-logistics") {
        next = addEncouragement(
          next,
          `encourage:work:${todayKey}:${question.id}`,
          encouragementRules.workTopicTraining,
          "完成运输外贸专题训练"
        );
      }
      if (correct && question.type === "chat" && question.lessonId === "warm-chat") {
        next = addEncouragement(
          next,
          `encourage:warm-chat:${todayKey}:${question.id}`,
          encouragementRules.warmChatTraining,
          "完成温老师聊天训练"
        );
      }

      next = finalizeDailyIfReady(next, todayKey, {
        lessonId: todayPlan.lessonId,
        charIds: todayPlan.charIds,
        wordIds: todayPlan.wordIds,
        chatId: todayPlan.chatId
      });
      return next;
    });
  }

  function awardPerfectGroup(mode: PracticeMode, scope: PracticeScope, ids: string[]) {
    updateProgress((current) => {
      const key = `perfect:${todayKey}:${mode}:${scope}:${ids.join(".")}`;
      let next = addReward(current, key, 1, "一组练习全部答对");
      if (next === current) return current;
      next = addEncouragement(
        next,
        `encourage:${key}`,
        encouragementRules.perfectPracticeGroup,
        "单次练习全部正确"
      );
      return { ...next, xp: next.xp + xpRules.perfectPracticeGroup };
    });
  }

  function openPractice(mode: PracticeMode, scope: PracticeScope = "today") {
    setPracticeMode(mode);
    setPracticeScope(scope);
    setTab("practice");
  }

  function resetAllData() {
    resetProgressStorage();
    const fresh = loadProgress();
    setProgress(fresh);
    setRewardPopup(null);
    setCompanionPopup(null);
    setBadgePopup(null);
    rewardWatcherReady.current = false;
    lastRewardId.current = undefined;
    badgeWatcherReady.current = false;
    lastBadgeId.current = undefined;
    skipNextRewardPopup.current = false;
  }

  function redeemReward(rewardId: string) {
    const content = makeRewardContent(rewardId, progress);
    const result = redeemCompanionReward(progress, rewardId, content);
    if (!result.record) return;
    if (result.rewardRecord) {
      skipNextRewardPopup.current = true;
    }
    setProgress(unlockBadges(result.progress));
    setCompanionPopup(result.record);
  }

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-cocoa">
        正在整理大大阿卢的练习册...
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 md:pb-0">
      <div className="mx-auto flex w-full max-w-7xl gap-5 px-4 py-4 md:px-6 md:py-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-48px)] w-56 shrink-0 rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-soft backdrop-blur md:block">
          <ProfileMini progress={progress} levelName={level.name} />
          <nav className="mt-6 space-y-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={classNames(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition",
                  tab === item.key
                    ? "bg-ink text-white shadow-soft"
                    : "text-cocoa hover:bg-cream"
                )}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/25 text-xs">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <Header progress={progress} levelName={level.name} />
          {tab === "today" && (
            <TodayView
              progress={progress}
              dayProgress={dayProgress}
              todayLesson={todayLesson}
              todayPlan={todayPlan}
              levelName={level.name}
              nextLevelName={nextLevel?.name}
              levelPercent={levelPercent}
              onStart={() => setTab("study")}
              onOpenPractice={openPractice}
            />
          )}
          {tab === "study" && (
            <StudyView
              progress={progress}
              todayLessonId={todayPlan.lessonId}
              onComplete={markLessonDone}
              onOpenPractice={openPractice}
            />
          )}
          {tab === "practice" && (
            <PracticeView
              mode={practiceMode}
              scope={practiceScope}
              setMode={setPracticeMode}
              setScope={setPracticeScope}
              todayPlan={todayPlan}
              dayProgress={dayProgress}
              onAnswer={recordAnswer}
              onPerfect={awardPerfectGroup}
            />
          )}
          {tab === "checkin" && <CheckinView progress={progress} dayProgress={dayProgress} />}
          {tab === "rewards" && (
            <RewardsView
              progress={progress}
              dayProgress={dayProgress}
              onShowReward={() => setRewardPopup(progress.rewardRecords[0] ?? null)}
              onRedeem={redeemReward}
            />
          )}
          {tab === "profile" && (
            <ProfileView
              progress={progress}
              levelName={level.name}
              nextLevelName={nextLevel?.name}
              levelPercent={levelPercent}
              onReset={resetAllData}
            />
          )}
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/90 px-2 py-2 shadow-soft backdrop-blur md:hidden">
        <div className="grid grid-cols-6 gap-1">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={classNames(
                "rounded-2xl px-1 py-2 text-xs font-semibold",
                tab === item.key ? "bg-ink text-white" : "text-cocoa"
              )}
            >
              <span className="mx-auto mb-1 grid h-7 w-7 place-items-center rounded-full bg-white/20 text-[11px]">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {rewardPopup && <RewardModal reward={rewardPopup} onClose={() => setRewardPopup(null)} />}
      {companionPopup && <CompanionRewardModal reward={companionPopup} onClose={() => setCompanionPopup(null)} />}
      {badgePopup && <BadgeModal badge={badgePopup} onClose={() => setBadgePopup(null)} />}
    </main>
  );
}

function Header({ progress, levelName }: { progress: ProgressState; levelName: string }) {
  return (
    <header className="mb-4 rounded-[2rem] border border-white/75 bg-white/70 p-4 shadow-soft backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-berry">{APP_SUBTITLE}</p>
          <h1 className="mt-1 text-2xl font-black tracking-normal text-ink md:text-3xl">{APP_NAME}</h1>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <StatPill label="等级" value={levelName} />
          <StatPill label="经验" value={`${progress.xp}`} />
          <StatPill label="连续" value={`${progress.currentStreak}天`} />
        </div>
      </div>
    </header>
  );
}

function ProfileMini({ progress, levelName }: { progress: ProgressState; levelName: string }) {
  return (
    <div className="rounded-[1.75rem] bg-cream p-4">
      <div className="flex items-center gap-3">
        <Avatar />
        <div>
          <p className="font-black text-ink">{userProfile.nickname}</p>
          <p className="text-sm text-cocoa">{levelName}</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-cocoa">目标：{userProfile.goal}</p>
      <p className="mt-2 text-xs text-cocoa">摸摸头：{progress.rewardTotal} 次</p>
      <p className="mt-1 text-xs text-cocoa">鼓励值：{progress.encouragementValue}</p>
    </div>
  );
}

function Avatar() {
  return (
    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blush via-cream to-mint shadow-inner">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-black text-berry">
        {userProfile.avatarLabel}
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream px-3 py-2">
      <p className="text-xs text-cocoa">{label}</p>
      <p className="mt-1 font-black text-ink">{value}</p>
    </div>
  );
}

function Card({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={classNames("rounded-[2rem] border border-white/75 bg-white/78 p-5 shadow-soft backdrop-blur", className)}>
      {children}
    </section>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-4">
      {eyebrow && <p className="text-sm font-semibold text-berry">{eyebrow}</p>}
      <h2 className="text-xl font-black text-ink">{title}</h2>
    </div>
  );
}

function TodayView({
  progress,
  dayProgress,
  todayLesson,
  todayPlan,
  levelName,
  nextLevelName,
  levelPercent,
  onStart,
  onOpenPractice
}: {
  progress: ProgressState;
  dayProgress: ReturnType<typeof getDayProgress>;
  todayLesson: (typeof lessons)[number];
  todayPlan: (typeof dailyPlans)[number];
  levelName: string;
  nextLevelName?: string;
  levelPercent: number;
  onStart: () => void;
  onOpenPractice: (mode: PracticeMode, scope?: PracticeScope) => void;
}) {
  const charDone = todayPlan.charIds.filter((id) => dayProgress.charDoneIds.includes(id)).length;
  const wordDone = todayPlan.wordIds.filter((id) => dayProgress.wordDoneIds.includes(id)).length;
  const chatDone = dayProgress.chatDoneIds.includes(todayPlan.chatId) ? 1 : 0;
  const totalDone = (dayProgress.lessonDone ? 1 : 0) + charDone + wordDone + chatDone;
  const total = 12;
  const recentReward = progress.rewardRecords[0];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-cocoa">{getTodayLabel()}</p>
            <h2 className="mt-2 text-2xl font-black text-ink md:text-4xl">大大阿卢，今天也来练习一下吧</h2>
            <p className="mt-3 max-w-2xl leading-7 text-cocoa">
              今天安排 5 到 10 分钟：一个小知识点、五个单字、五个生活词，再练一句聊天回复。
            </p>
          </div>
          <button
            onClick={onStart}
            className="rounded-3xl bg-ink px-6 py-4 text-base font-black text-white shadow-soft transition hover:-translate-y-0.5"
          >
            开始今日学习
          </button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionTitle eyebrow="今日任务" title={dayProgress.completed ? "今天已经完成啦" : "按这个顺序慢慢来"} />
          <div className="space-y-3">
            <TaskRow
              done={dayProgress.lessonDone}
              title={`知识点：${todayLesson.title}`}
              detail="短说明 + 输入示例"
              actionLabel="去学习"
              onClick={onStart}
            />
            <TaskRow
              done={charDone === 5}
              title="五道汉字转拼音题"
              detail={`${charDone}/5 已完成`}
              actionLabel="练单字"
              onClick={() => onOpenPractice("char", "today")}
            />
            <TaskRow
              done={wordDone === 5}
              title="五道词语拼音输入题"
              detail={`${wordDone}/5 已完成`}
              actionLabel="练词语"
              onClick={() => onOpenPractice("word", "today")}
            />
            <TaskRow
              done={chatDone === 1}
              title="一组聊天短句输入题"
              detail={`${chatDone}/1 已完成`}
              actionLabel="练聊天"
              onClick={() => onOpenPractice("chat", "today")}
            />
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="今日状态" title={`${totalDone}/${total} 小步完成`} />
          <ProgressBar percent={Math.round((totalDone / total) * 100)} />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatPill label="连续打卡" value={`${progress.currentStreak}天`} />
            <StatPill label="当前等级" value={levelName} />
            <StatPill label="今日题数" value={`${dayProgress.answeredCount}`} />
            <StatPill label="正确率" value={dayProgress.answeredCount ? `${Math.round((dayProgress.correctCount / dayProgress.answeredCount) * 100)}%` : "0%"} />
          </div>
          <div className="mt-5 rounded-3xl bg-mint/70 p-4">
            <p className="text-sm font-semibold text-cocoa">等级进度</p>
            <p className="mt-1 text-sm text-cocoa">{nextLevelName ? `距离 ${nextLevelName} 又近了一点。` : "已经到达当前版本最高等级。"}</p>
            <div className="mt-3">
              <ProgressBar percent={levelPercent} />
            </div>
          </div>
          <div className="mt-5 rounded-3xl bg-blush/70 p-4">
            <p className="text-sm font-semibold text-cocoa">最近获得的奖励</p>
            <p className="mt-1 text-sm font-bold text-ink">{recentReward ? `${recentReward.reason}，+${recentReward.amount} 次` : "还没有领取，今天完成后就会有。"}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function TaskRow({
  done,
  title,
  detail,
  actionLabel,
  onClick
}: {
  done: boolean;
  title: string;
  detail: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-cream p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className={classNames("mt-1 grid h-7 w-7 place-items-center rounded-full text-sm font-black", done ? "bg-mint text-ink" : "bg-white text-cocoa")}>
          {done ? "✓" : "·"}
        </span>
        <div>
          <p className="font-black text-ink">{title}</p>
          <p className="mt-1 text-sm text-cocoa">{detail}</p>
        </div>
      </div>
      <button onClick={onClick} className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-berry transition hover:bg-blush">
        {actionLabel}
      </button>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-white">
      <div className="h-full rounded-full bg-gradient-to-r from-berry via-sun to-mint transition-all" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
    </div>
  );
}

function LevelJourney({ progress }: { progress: ProgressState }) {
  const current = getCurrentLevel(progress.xp);
  const next = getNextLevel(progress.xp);
  const percent = getLevelPercent(progress.xp);
  const remaining = next ? Math.max(0, next.minXp - progress.xp) : 0;

  return (
    <div className="mt-5 rounded-[1.75rem] bg-cream p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-berry">成长等级</p>
          <p className="mt-1 text-lg font-black text-ink">{current.name}</p>
        </div>
        <p className="text-sm font-bold text-cocoa">
          {next ? `距离 ${next.name} 还需要 ${remaining} 经验` : "已经到达当前版本最高等级"}
        </p>
      </div>
      <div className="mt-3">
        <ProgressBar percent={percent} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {levelRules.map((level, index) => {
          const active = level.name === current.name;
          const passed = progress.xp >= level.minXp;
          return (
            <div key={level.name} className={classNames("rounded-2xl p-3 text-center text-xs font-black", active ? "bg-ink text-white" : passed ? "bg-mint text-ink" : "bg-white text-cocoa")}>
              <p>{level.name}</p>
              {index < levelRules.length - 1 && <p className="mt-1 opacity-70">↓</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudyView({
  progress,
  todayLessonId,
  onComplete,
  onOpenPractice
}: {
  progress: ProgressState;
  todayLessonId: string;
  onComplete: (lessonId: string) => void;
  onOpenPractice: (mode: PracticeMode, scope?: PracticeScope) => void;
}) {
  const stages = [...new Set(lessons.map((lesson) => lesson.stage))];

  return (
    <div className="space-y-4">
      {stages.map((stage) => (
        <Card key={stage}>
          <SectionTitle eyebrow="拼音学习" title={stage} />
          <div className="grid gap-4 lg:grid-cols-2">
            {lessons
              .filter((lesson) => lesson.stage === stage)
              .map((lesson) => {
                const done = progress.completedLessons.includes(lesson.id);
                const isToday = lesson.id === todayLessonId;
                return (
                  <article key={lesson.id} className={classNames("rounded-[1.75rem] p-4", isToday ? "bg-blush/80" : "bg-cream")}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-berry">{isToday ? "今日知识点" : done ? "已学过" : "可学习"}</p>
                        <h3 className="mt-1 text-lg font-black text-ink">{lesson.title}</h3>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-cocoa">{done ? "完成" : "未完成"}</span>
                    </div>
                    <p className="mt-3 leading-7 text-cocoa">{lesson.summary}</p>
                    <InfoLine label="常用汉字" value={lesson.commonChars.join("、")} />
                    <InfoLine label="常用词语" value={lesson.commonWords.join("、")} />
                    <div className="mt-3 rounded-2xl bg-white/80 p-3">
                      <p className="text-sm font-black text-ink">键盘输入示例</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {lesson.keyboardExamples.map((example) => (
                          <span key={example} className="rounded-full bg-mint px-3 py-1 text-sm font-semibold text-cocoa">
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => onComplete(lesson.id)} className="rounded-2xl bg-ink px-4 py-2 text-sm font-black text-white">
                        {done ? "再看一遍并确认" : "学完这个知识点"}
                      </button>
                      <button onClick={() => onOpenPractice("word", "all")} className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-berry">
                        立即练习
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>
        </Card>
      ))}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="mt-3 text-sm leading-6 text-cocoa">
      <span className="font-black text-ink">{label}：</span>
      {value}
    </p>
  );
}

function PracticeView({
  mode,
  scope,
  setMode,
  setScope,
  todayPlan,
  dayProgress,
  onAnswer,
  onPerfect
}: {
  mode: PracticeMode;
  scope: PracticeScope;
  setMode: (mode: PracticeMode) => void;
  setScope: (scope: PracticeScope) => void;
  todayPlan: (typeof dailyPlans)[number];
  dayProgress: ReturnType<typeof getDayProgress>;
  onAnswer: (question: BaseQuestion, input: string, correct: boolean) => void;
  onPerfect: (mode: PracticeMode, scope: PracticeScope, ids: string[]) => void;
}) {
  const questions = useMemo(() => {
    if (scope === "today") {
      if (mode === "char") return todayPlan.charIds.map((id) => questionMap.get(id)).filter(Boolean) as BaseQuestion[];
      if (mode === "word") return todayPlan.wordIds.map((id) => questionMap.get(id)).filter(Boolean) as BaseQuestion[];
      if (mode === "chat") return [questionMap.get(todayPlan.chatId)].filter(Boolean) as ChatQuestion[];
    }
    if (mode === "char") return charQuestions;
    if (mode === "word") return wordQuestions;
    if (mode === "choice") return choiceQuestions;
    return chatQuestions;
  }, [mode, scope, todayPlan]);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [hadWrongInGroup, setHadWrongInGroup] = useState(false);
  const [groupDone, setGroupDone] = useState(false);

  useEffect(() => {
    setIndex(0);
    setInput("");
    setFeedback("");
    setWrongAttempts(0);
    setAnswered(false);
    setHadWrongInGroup(false);
    setGroupDone(false);
  }, [mode, scope]);

  const question = questions[index] ?? questions[0];
  const modeLabel = mode === "char" ? "汉字转拼音" : mode === "word" ? "词语拼音输入" : mode === "choice" ? "选择正确拼音" : "模拟聊天输入";
  const isDailyAvailable = mode !== "choice";

  function submitTextAnswer() {
    if (!question || answered) return;
    const correct = normalizeInput(input, true) === normalizeInput(question.answer, true);
    onAnswer(question, input, correct);

    if (correct) {
      if (index >= questions.length - 1 && !hadWrongInGroup) {
        onPerfect(mode, scope, questions.map((item) => item.id));
      }
      setAnswered(true);
      setFeedback(`正确！“${question.chinese}”使用拼音输入时输入 ${question.answer}。`);
      return;
    }

    const nextAttempt = wrongAttempts + 1;
    setWrongAttempts(nextAttempt);
    setHadWrongInGroup(true);
    if (nextAttempt === 1) setFeedback(question.hints[0] ?? `先看第一个字母：${question.answer[0]}。`);
    else if (nextAttempt === 2) setFeedback(question.hints[1] ?? "再想想声母和韵母怎么拆。");
    else setFeedback(`答案是 ${question.answer}。${question.explanation}`);
  }

  function submitChoice(option: string) {
    if (!question || answered) return;
    const correct = option === question.answer;
    onAnswer(question, option, correct);
    if (correct) {
      if (index >= questions.length - 1 && !hadWrongInGroup) {
        onPerfect(mode, scope, questions.map((item) => item.id));
      }
      setAnswered(true);
      setFeedback(`选对了！${question.explanation}`);
    } else {
      setHadWrongInGroup(true);
      setFeedback(`这个选项容易混。${question.explanation}`);
    }
  }

  function goNext() {
    const last = index >= questions.length - 1;
    if (last) {
      setGroupDone(true);
      if (!hadWrongInGroup && questions.length > 0) {
        onPerfect(mode, scope, questions.map((item) => item.id));
      }
      return;
    }
    setIndex(index + 1);
    setInput("");
    setFeedback("");
    setWrongAttempts(0);
    setAnswered(false);
  }

  const todayDetail =
    mode === "char"
      ? `${todayPlan.charIds.filter((id) => dayProgress.charDoneIds.includes(id)).length}/5`
      : mode === "word"
        ? `${todayPlan.wordIds.filter((id) => dayProgress.wordDoneIds.includes(id)).length}/5`
        : mode === "chat"
          ? `${dayProgress.chatDoneIds.includes(todayPlan.chatId) ? 1 : 0}/1`
          : "全部";

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle eyebrow="练习模块" title="看到汉字，慢慢变成会输入的拼音" />
        <div className="flex flex-wrap gap-2">
          {([
            ["char", "汉字转拼音"],
            ["word", "词语输入"],
            ["choice", "选择拼音"],
            ["chat", "聊天输入"]
          ] as Array<[PracticeMode, string]>).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setMode(key);
                if (key === "choice") setScope("all");
              }}
              className={classNames("rounded-2xl px-4 py-2 text-sm font-black", mode === key ? "bg-ink text-white" : "bg-cream text-cocoa")}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setScope("today")}
            disabled={!isDailyAvailable}
            className={classNames("rounded-2xl px-4 py-2 text-sm font-black", scope === "today" && isDailyAvailable ? "bg-berry text-white" : "bg-cream text-cocoa", !isDailyAvailable && "opacity-50")}
          >
            今日任务 {isDailyAvailable ? todayDetail : ""}
          </button>
          <button
            onClick={() => setScope("all")}
            className={classNames("rounded-2xl px-4 py-2 text-sm font-black", scope === "all" ? "bg-berry text-white" : "bg-cream text-cocoa")}
          >
            全部题库
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-berry">{modeLabel}</p>
            <h2 className="mt-1 text-2xl font-black text-ink">{groupDone ? "这一组完成啦" : `第 ${index + 1} / ${questions.length} 题`}</h2>
          </div>
          <span className="rounded-full bg-mint px-4 py-2 text-sm font-black text-cocoa">{scope === "today" ? "今日练习" : "自由练习"}</span>
        </div>

        {groupDone ? (
          <div className="mt-6 rounded-[1.75rem] bg-cream p-5">
            <p className="text-xl font-black text-ink">练完这一组了，手感又稳了一点。</p>
            <p className="mt-2 text-cocoa">{hadWrongInGroup ? "刚才错过的题已经记在错题里，可以在“我的”里回看。" : "这一组全对，已经尝试发放额外摸摸头奖励。"}</p>
            <button
              onClick={() => {
                setIndex(0);
                setInput("");
                setFeedback("");
                setWrongAttempts(0);
                setAnswered(false);
                setHadWrongInGroup(false);
                setGroupDone(false);
              }}
              className="mt-4 rounded-2xl bg-ink px-5 py-3 text-sm font-black text-white"
            >
              再练一组
            </button>
          </div>
        ) : (
          question && (
            <div className="mt-6">
              {question.type === "chat" ? (
                <ChatPrompt question={question as ChatQuestion} />
              ) : (
                <QuestionPrompt question={question} />
              )}

              {question.type === "choice" ? (
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {(question as ChoiceQuestion).options.map((option) => (
                    <button
                      key={option}
                      onClick={() => submitChoice(option)}
                      disabled={answered}
                      className="rounded-3xl bg-cream px-4 py-5 text-lg font-black text-ink transition hover:bg-blush disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-5 flex flex-col gap-3 md:flex-row">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") submitTextAnswer();
                    }}
                    placeholder={question.type === "char" ? "输入拼音，例如 lu" : "输入完整拼音，可以带空格"}
                    className="min-h-14 flex-1 rounded-2xl border border-tea bg-white px-4 text-lg font-semibold outline-none transition focus:border-berry"
                  />
                  <button onClick={submitTextAnswer} disabled={answered} className="rounded-2xl bg-ink px-6 py-3 font-black text-white disabled:opacity-60">
                    判断答案
                  </button>
                </div>
              )}

              {feedback && (
                <div className={classNames("mt-5 rounded-3xl p-4 leading-7", answered ? "bg-mint text-ink" : "bg-blush text-cocoa")}>
                  {feedback}
                </div>
              )}

              {answered && (
                <button onClick={goNext} className="mt-5 rounded-2xl bg-berry px-6 py-3 font-black text-white">
                  {index >= questions.length - 1 ? "完成这一组" : "下一题"}
                </button>
              )}
            </div>
          )
        )}
      </Card>
    </div>
  );
}

function QuestionPrompt({ question }: { question: BaseQuestion }) {
  return (
    <div className="rounded-[2rem] bg-cream p-6 text-center">
      <p className="text-sm font-semibold text-cocoa">{question.type === "char" ? "请输入这个汉字的拼音" : "请输入这个词语的完整拼音"}</p>
      <p className="mt-3 text-5xl font-black text-ink">{question.chinese}</p>
      <p className="mt-4 text-sm text-cocoa">不需要输入声调；词语题允许输入空格。</p>
    </div>
  );
}

function ChatPrompt({ question }: { question: ChatQuestion }) {
  return (
    <div className="rounded-[2rem] bg-cream p-4">
      <div className="max-w-xl rounded-3xl bg-white p-4 shadow-sm">
        <p className="text-sm font-black text-berry">{question.speaker}</p>
        <p className="mt-1 leading-7 text-ink">{question.scene.replace(`${question.speaker}：`, "")}</p>
      </div>
      <div className="ml-auto mt-4 max-w-xl rounded-3xl bg-mint p-4">
        <p className="text-sm font-black text-cocoa">任务</p>
        <p className="mt-1 leading-7 text-ink">{question.prompt}</p>
      </div>
      <p className="mt-4 text-center text-sm text-cocoa">正确后会显示转换结果和鼓励反馈。</p>
    </div>
  );
}

function CheckinView({
  progress,
  dayProgress
}: {
  progress: ProgressState;
  dayProgress: ReturnType<typeof getDayProgress>;
}) {
  const recentDays = getRecent7Days();
  const accuracy = dayProgress.answeredCount ? Math.round((dayProgress.correctCount / dayProgress.answeredCount) * 100) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <SectionTitle eyebrow="每日打卡" title={dayProgress.completed ? "今天已经点亮" : "完成今日任务后自动点亮"} />
        <div className="grid grid-cols-2 gap-3">
          <StatPill label="今日状态" value={dayProgress.completed ? "已完成" : "未完成"} />
          <StatPill label="连续打卡" value={`${progress.currentStreak}天`} />
          <StatPill label="最长连续" value={`${progress.longestStreak}天`} />
          <StatPill label="累计学习" value={`${progress.checkinDates.length}天`} />
          <StatPill label="今日题数" value={`${dayProgress.answeredCount}`} />
          <StatPill label="今日正确率" value={`${accuracy}%`} />
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="最近 7 天" title="学习日历" />
        <div className="grid grid-cols-7 gap-2">
          {recentDays.map((date) => {
            const done = progress.checkinDates.includes(date);
            return (
              <div key={date} className={classNames("rounded-3xl p-3 text-center", done ? "bg-mint" : "bg-cream")}>
                <p className="text-xs font-semibold text-cocoa">{date.slice(5)}</p>
                <p className="mt-2 text-lg font-black text-ink">{done ? "✓" : "·"}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-5 space-y-2">
          {recentDays.map((date) => {
            const item = progress.dailyProgress[date];
            return (
              <div key={date} className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 text-sm">
                <span className="font-bold text-ink">{date}</span>
                <span className="text-cocoa">
                  {item ? `${item.correctCount}/${item.answeredCount} 正确，${item.completed ? "已打卡" : "未完成"}` : "暂无练习"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function RewardsView({
  progress,
  dayProgress,
  onShowReward,
  onRedeem
}: {
  progress: ProgressState;
  dayProgress: ReturnType<typeof getDayProgress>;
  onShowReward: () => void;
  onRedeem: (rewardId: string) => void;
}) {
  const unlockedBadgeIds = new Set(progress.badgeRecords.map((badge) => badge.id));
  const warmFeedback = getWarmFeedback(progress, dayProgress);

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle eyebrow="奖励中心" title="温老师陪伴式成长奖励" />
        <div className="grid gap-3 md:grid-cols-4">
          <StatPill label={ENCOURAGEMENT_NAME} value={`${progress.encouragementValue}`} />
          <StatPill label="累计摸摸头" value={`${progress.rewardTotal}次`} />
          <StatPill label="本周获得" value={`${getWeekRewardTotal(progress.rewardRecords)}次`} />
          <StatPill label="已获徽章" value={`${progress.badgeRecords.length}/${badgeDefinitions.length}`} />
        </div>
        <div className="mt-5 rounded-[1.75rem] bg-blush/70 p-4">
          <p className="text-sm font-black text-berry">温老师今天想说</p>
          <p className="mt-2 leading-7 text-ink">{warmFeedback}</p>
        </div>
        <button onClick={onShowReward} className="mt-5 rounded-2xl bg-ink px-5 py-3 font-black text-white">
          展示最近摸摸头
        </button>
      </Card>

      <Card>
        <SectionTitle eyebrow="可获得奖励" title="不是商城，是温老师给进步的小回应" />
        <div className="grid gap-4 lg:grid-cols-3">
          {companionRewards.map((reward) => (
            <CompanionRewardCard
              key={reward.id}
              reward={reward}
              currentValue={progress.encouragementValue}
              onRedeem={() => onRedeem(reward.id)}
            />
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="成就徽章" title="大大阿卢的徽章展示墙" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {badgeDefinitions.map((badge) => {
            const record = progress.badgeRecords.find((item) => item.id === badge.id);
            const unlocked = unlockedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={classNames(
                  "rounded-[1.75rem] border p-4 transition",
                  unlocked ? "border-mint bg-mint/75 shadow-soft" : "border-white/70 bg-cream opacity-75"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-lg font-black text-berry">
                    {badge.icon}
                  </span>
                  <div>
                    <p className="font-black text-ink">{badge.name}</p>
                    <p className="mt-1 text-sm text-cocoa">{badge.requirement}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-cocoa">
                  {unlocked ? record?.encouragement : badge.description}
                </p>
                <p className="mt-3 text-xs font-bold text-berry">
                  {unlocked && record ? `解锁于 ${formatTime(record.unlockedAt)}` : "继续练习后会自动点亮"}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="鼓励值记录" title="每一份鼓励都有来处" />
        <div className="space-y-3">
          {progress.encouragementRecords.length === 0 && <p className="rounded-3xl bg-cream p-4 text-cocoa">完成学习、全对练习或专题训练后，会开始记录鼓励值。</p>}
          {progress.encouragementRecords.slice(0, 12).map((reward) => (
            <HistoryRow key={reward.id} title={reward.reason} time={reward.createdAt} amount={`+${reward.amount}`} />
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="兑换记录" title="温老师给过的小回应" />
        <div className="space-y-3">
          {progress.companionRewardRecords.length === 0 && <p className="rounded-3xl bg-cream p-4 text-cocoa">攒一点鼓励值后，可以在这里兑换夸夸卡、小纸条和摸摸头。</p>}
          {progress.companionRewardRecords.slice(0, 10).map((reward) => (
            <HistoryRow key={reward.id} title={reward.title} detail={reward.content} time={reward.createdAt} amount={`-${reward.cost}`} />
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="原有奖励历史" title={REWARD_NAME} />
        <div className="space-y-3">
          {progress.rewardRecords.length === 0 && <p className="rounded-3xl bg-cream p-4 text-cocoa">今天完成全部任务后，会获得第一笔摸摸头奖励。</p>}
          {progress.rewardRecords.map((reward) => (
            <HistoryRow key={reward.id} title={reward.reason} time={reward.createdAt ?? reward.earnedAt ?? new Date().toISOString()} amount={`+${reward.amount} 次`} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function CompanionRewardCard({
  reward,
  currentValue,
  onRedeem
}: {
  reward: (typeof companionRewards)[number];
  currentValue: number;
  onRedeem: () => void;
}) {
  const disabled = currentValue < reward.cost;
  return (
    <article className="flex min-h-64 flex-col rounded-[1.75rem] bg-cream p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-berry">消耗 {reward.cost} 鼓励值</p>
          <h3 className="mt-1 text-lg font-black text-ink">{reward.title}</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-cocoa">{reward.displayTitle}</span>
      </div>
      <p className="mt-4 flex-1 whitespace-pre-line rounded-3xl bg-white/75 p-4 text-sm leading-7 text-cocoa">{reward.description}</p>
      <p className="mt-3 text-sm leading-6 text-cocoa">{reward.feedback}</p>
      <button
        onClick={onRedeem}
        disabled={disabled}
        className={classNames(
          "mt-4 rounded-2xl px-4 py-3 text-sm font-black transition",
          disabled ? "bg-white text-cocoa opacity-60" : "bg-ink text-white hover:-translate-y-0.5"
        )}
      >
        {disabled ? "鼓励值还不够" : "领取这份奖励"}
      </button>
    </article>
  );
}

function HistoryRow({
  title,
  detail,
  time,
  amount
}: {
  title: string;
  detail?: string;
  time: string;
  amount: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-cream p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-black text-ink">{title}</p>
        {detail && <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-cocoa">{detail}</p>}
        <p className="mt-1 text-sm text-cocoa">{formatTime(time)}</p>
      </div>
      <span className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-black text-berry">{amount}</span>
    </div>
  );
}

function ProfileView({
  progress,
  levelName,
  nextLevelName,
  levelPercent,
  onReset
}: {
  progress: ProgressState;
  levelName: string;
  nextLevelName?: string;
  levelPercent: number;
  onReset: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <div className="flex items-center gap-4">
          <Avatar />
          <div>
            <h2 className="text-2xl font-black text-ink">{userProfile.nickname}</h2>
            <p className="mt-1 text-cocoa">初始身份：{userProfile.initialLevel}</p>
            <p className="text-cocoa">学习目标：{userProfile.goal}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatPill label="当前等级" value={levelName} />
          <StatPill label="当前经验" value={`${progress.xp}`} />
          <StatPill label="累计学习天数" value={`${progress.checkinDates.length}天`} />
          <StatPill label="连续打卡" value={`${progress.currentStreak}天`} />
          <StatPill label="累计奖励" value={`${progress.rewardTotal}次`} />
          <StatPill label="完成课程" value={`${progress.completedLessons.length}个`} />
        </div>
        <LevelJourney progress={progress} />
        <div className="mt-5 rounded-3xl bg-mint p-4">
          <p className="font-black text-ink">{nextLevelName ? `下一等级：${nextLevelName}` : "已达当前最高等级"}</p>
          <div className="mt-3">
            <ProgressBar percent={levelPercent} />
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="学习记录" title="错题和数据管理" />
        <div className="space-y-3">
          {progress.wrongRecords.slice(0, 6).map((item) => (
            <div key={item.id} className="rounded-3xl bg-cream p-4">
              <p className="font-black text-ink">
                {item.chinese}
                {" -> "}
                {item.answer}
              </p>
              <p className="mt-1 text-sm text-cocoa">{item.explanation}</p>
            </div>
          ))}
          {progress.wrongRecords.length === 0 && <p className="rounded-3xl bg-cream p-4 text-cocoa">还没有错题，很清爽。</p>}
        </div>
        <div className="mt-6 rounded-3xl bg-blush/80 p-4">
          <p className="font-black text-ink">重置学习数据</p>
          <p className="mt-1 text-sm leading-6 text-cocoa">会清空当前浏览器里的经验、打卡、奖励和答题记录。这个操作需要二次确认。</p>
          <button
            onClick={() => {
              if (confirmReset) onReset();
              else setConfirmReset(true);
            }}
            className={classNames("mt-3 rounded-2xl px-4 py-2 text-sm font-black text-white", confirmReset ? "bg-berry" : "bg-ink")}
          >
            {confirmReset ? "确认重置全部数据" : "重置学习数据"}
          </button>
        </div>
      </Card>
    </div>
  );
}

function RewardModal({ reward, onClose }: { reward: RewardRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="reward-pop w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-soft">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blush text-3xl">♡</div>
        <h2 className="mt-4 text-2xl font-black text-ink">大大阿卢今天也有认真进步！</h2>
        <p className="mt-3 text-lg font-bold text-cocoa">温老师奖励你一个摸摸头～</p>
        <p className="mt-3 break-words rounded-3xl bg-cream p-4 text-sm font-black text-berry">{REWARD_NAME}</p>
        <p className="mt-3 text-sm text-cocoa">{reward.reason}，获得 {reward.amount} 次。</p>
        <button onClick={onClose} className="mt-5 rounded-2xl bg-ink px-6 py-3 font-black text-white">
          收下奖励
        </button>
      </div>
    </div>
  );
}

function CompanionRewardModal({ reward, onClose }: { reward: CompanionRewardRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="reward-pop w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-soft">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blush text-2xl font-black text-berry">温</div>
        <p className="mt-4 text-sm font-black text-berry">领取成功</p>
        <h2 className="mt-1 text-2xl font-black text-ink">{reward.title}</h2>
        <p className="mt-3 text-sm leading-6 text-cocoa">{reward.reason}</p>
        <div className="mt-4 whitespace-pre-line rounded-[1.75rem] bg-cream p-4 text-left text-sm leading-7 text-ink">
          {reward.content}
        </div>
        <p className="mt-3 text-sm font-bold text-cocoa">已消耗 {reward.cost} 鼓励值</p>
        <button onClick={onClose} className="mt-5 rounded-2xl bg-ink px-6 py-3 font-black text-white">
          收下这份奖励
        </button>
      </div>
    </div>
  );
}

function BadgeModal({ badge, onClose }: { badge: BadgeRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="reward-pop w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-soft">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-mint text-3xl font-black text-berry">{badge.icon}</div>
        <p className="mt-4 text-sm font-black text-berry">新徽章解锁</p>
        <h2 className="mt-1 text-2xl font-black text-ink">{badge.name}</h2>
        <p className="mt-3 rounded-[1.75rem] bg-cream p-4 text-sm leading-7 text-cocoa">{badge.encouragement}</p>
        <button onClick={onClose} className="mt-5 rounded-2xl bg-ink px-6 py-3 font-black text-white">
          放进徽章墙
        </button>
      </div>
    </div>
  );
}
