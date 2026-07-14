export type Lesson = {
  id: string;
  stage: string;
  title: string;
  summary: string;
  commonChars: string[];
  commonWords: string[];
  keyboardExamples: string[];
};

export const lessons: Lesson[] = [
  {
    id: "intro-keyboard",
    stage: "第一阶段：拼音输入入门",
    title: "认识拼音键盘输入",
    summary: "拼音输入就是把汉字的读音用英文字母打出来，再从候选词里选正确的字。第一版先练无声调拼音。",
    commonChars: ["我", "你", "好"],
    commonWords: ["你好", "谢谢", "没事"],
    keyboardExamples: ["你好 -> nihao", "谢谢 -> xiexie"]
  },
  {
    id: "intro-single",
    stage: "第一阶段：拼音输入入门",
    title: "单个汉字如何转成拼音",
    summary: "看到一个字，先在心里读出来，再把读音拆成声母和韵母。输入时不用打声调。",
    commonChars: ["大", "卢", "我", "她"],
    commonWords: ["大大", "我好", "到了"],
    keyboardExamples: ["卢 -> lu", "大 -> da", "我 -> wo"]
  },
  {
    id: "keyboard-v",
    stage: "第一阶段：拼音输入入门",
    title: "ü 在键盘里常用 v",
    summary: "键盘上没有 ü。很多输入法里，遇到需要单独输入 ü 的地方，可以用 v，例如 lv、nv。",
    commonChars: ["女", "绿", "觉"],
    commonWords: ["女儿", "绿色", "睡觉"],
    keyboardExamples: ["女 -> nv", "绿 -> lv", "觉 -> jue"]
  },
  {
    id: "shengmu-basic",
    stage: "第二阶段：声母",
    title: "常见声母总览",
    summary: "声母像拼音开头的小按钮。先熟悉 b、p、m、f、d、t、n、l、g、k、h、j、q、x、zh、ch、sh、r、z、c、s、y、w。",
    commonChars: ["爸", "妈", "他", "你"],
    commonWords: ["不忙", "开心", "下班"],
    keyboardExamples: ["妈 -> ma", "他 -> ta", "你 -> ni"]
  },
  {
    id: "shengmu-nl",
    stage: "第五阶段：易混拼音专项",
    title: "n 和 l：你、老、来",
    summary: "n 和 l 很容易混。练输入时可以先记常用词：你 ni，老 lao，来 lai。",
    commonChars: ["你", "老", "来", "了"],
    commonWords: ["老师", "想你", "慢慢来"],
    keyboardExamples: ["你 -> ni", "老师 -> laoshi", "想你 -> xiangni"]
  },
  {
    id: "shengmu-fh",
    stage: "第五阶段：易混拼音专项",
    title: "f 和 h：饭、回、欢",
    summary: "f 和 h 在生活词里很常见。饭 fan，回 hui，欢 huan，多看几次会越来越稳。",
    commonChars: ["饭", "回", "欢"],
    commonWords: ["吃饭", "回家", "喜欢"],
    keyboardExamples: ["饭 -> fan", "回家 -> huijia"]
  },
  {
    id: "shengmu-zhchsh",
    stage: "第二阶段：声母",
    title: "zh、ch、sh 连在一起输入",
    summary: "zh、ch、sh 是两个字母组成的声母，输入时不要拆开选字，直接连着打。",
    commonChars: ["吃", "是", "睡", "上"],
    commonWords: ["吃饭", "睡觉", "上班"],
    keyboardExamples: ["吃 -> chi", "是 -> shi", "上班 -> shangban"]
  },
  {
    id: "shengmu-zzh",
    stage: "第五阶段：易混拼音专项",
    title: "z 和 zh：早不是找",
    summary: "z 是平舌，zh 是翘舌。输入时一个字母差别就会让候选词变化。",
    commonChars: ["早", "在", "找"],
    commonWords: ["早安", "现在", "认真"],
    keyboardExamples: ["早安 -> zaoan", "找 -> zhao"]
  },
  {
    id: "yunmu-basic",
    stage: "第三阶段：韵母",
    title: "常见韵母总览",
    summary: "韵母像拼音后半段。先熟悉 a、o、e、i、u、ü、ai、ei、ui、ao、ou、iu、ie、üe、er、an、en、in、un、ün、ang、eng、ing、ong。",
    commonChars: ["好", "回", "心", "明"],
    commonWords: ["开心", "明天", "有空"],
    keyboardExamples: ["好 -> hao", "心 -> xin", "明 -> ming"]
  },
  {
    id: "yunmu-anang",
    stage: "第五阶段：易混拼音专项",
    title: "an 和 ang：晚、上、忙",
    summary: "an 和 ang 只差一个 g，但候选词可能完全不同。晚 wan，上 shang，忙 mang。",
    commonChars: ["晚", "班", "上", "忙"],
    commonWords: ["晚安", "上班", "不忙"],
    keyboardExamples: ["晚安 -> wanan", "上班 -> shangban"]
  },
  {
    id: "yunmu-eneng",
    stage: "第五阶段：易混拼音专项",
    title: "en 和 eng：真、等",
    summary: "en 和 eng 也很常见。认真 renzhen，等你 dengni，先从生活句子里练。",
    commonChars: ["真", "等"],
    commonWords: ["认真", "等你"],
    keyboardExamples: ["认真 -> renzhen", "等你 -> dengni"]
  },
  {
    id: "yunmu-ining",
    stage: "第五阶段：易混拼音专项",
    title: "in 和 ing：心、明",
    summary: "心 xin，明 ming。输入时别把 in 多加 g，也别把 ing 漏掉 g。",
    commonChars: ["心", "辛", "明"],
    commonWords: ["开心", "辛苦", "明天"],
    keyboardExamples: ["开心 -> kaixin", "明天 -> mingtian"]
  },
  {
    id: "shengmu-jqx",
    stage: "第二阶段：声母",
    title: "j、q、x：家、起、喜",
    summary: "j、q、x 在生活词里很常见，先用家 jia、起 qi、喜 xi 这些熟词建立手感。",
    commonChars: ["家", "起", "喜", "见"],
    commonWords: ["回家", "起床", "喜欢", "见面"],
    keyboardExamples: ["家 -> jia", "起床 -> qichuang", "喜欢 -> xihuan"]
  },
  {
    id: "shengmu-gkh",
    stage: "第二阶段：声母",
    title: "g、k、h：刚、开、回",
    summary: "g、k、h 都是高频声母。练习时把刚 gang、开 kai、回 hui 放在真实句子里更容易记住。",
    commonChars: ["刚", "开", "回", "好"],
    commonWords: ["刚到", "开心", "回家", "好好休息"],
    keyboardExamples: ["刚 -> gang", "开心 -> kaixin", "回家 -> huijia"]
  },
  {
    id: "yunmu-ao",
    stage: "第三阶段：韵母",
    title: "ao：好、到、早",
    summary: "ao 是生活聊天里很常用的韵母，好 hao、到 dao、早 zao 都可以反复练。",
    commonChars: ["好", "到", "早", "抱"],
    commonWords: ["早安", "到了", "好好休息"],
    keyboardExamples: ["好 -> hao", "到了 -> daole", "早安 -> zaoan"]
  },
  {
    id: "yunmu-ui",
    stage: "第三阶段：韵母",
    title: "ui：回、睡、会",
    summary: "ui 常出现在回 hui、睡 shui、会 hui 这些字里，输入时按字母顺序连着打即可。",
    commonChars: ["回", "睡", "会", "追"],
    commonWords: ["回家", "睡觉", "会议"],
    keyboardExamples: ["回家 -> huijia", "睡觉 -> shuijiao", "会议 -> huiyi"]
  },
  {
    id: "yunmu-an",
    stage: "第三阶段：韵母",
    title: "an：安、班、欢",
    summary: "an 是非常基础的韵母，晚安 wanan、下班 xiaban、喜欢 xihuan 都会用到。",
    commonChars: ["安", "班", "欢", "看"],
    commonWords: ["晚安", "下班", "喜欢", "看看"],
    keyboardExamples: ["晚安 -> wanan", "下班 -> xiaban", "喜欢 -> xihuan"]
  },
  {
    id: "yunmu-ai",
    stage: "第三阶段：韵母",
    title: "ai：来、开、爱",
    summary: "ai 的输入很直接，来 lai、开 kai、爱 ai 都适合做日常输入练习。",
    commonChars: ["来", "开", "爱", "在"],
    commonWords: ["慢慢来", "开心", "在路上"],
    keyboardExamples: ["来 -> lai", "开心 -> kaixin", "在路上 -> zailushang"]
  },
  {
    id: "common-life",
    stage: "第四阶段：常见拼音组合",
    title: "高频生活词语",
    summary: "练拼音输入最有效的方法，是先练每天真的会用到的话。吃饭、下班、回家、晚安，都值得先练熟。",
    commonChars: ["吃", "回", "睡", "想"],
    commonWords: ["吃饭", "下班", "回家", "晚安", "想你"],
    keyboardExamples: ["记得吃饭 -> jidechifan", "我想你了 -> woxiangnile"]
  },
  {
    id: "work-logistics",
    stage: "第四阶段：常见拼音组合",
    title: "运输外贸工作词语",
    summary: "把工作里常用的物流、外贸、报关、运输词语先练熟，日常沟通时输入会更顺手。",
    commonChars: ["货", "港", "箱", "费"],
    commonWords: ["运输", "物流", "报关", "清关", "船期"],
    keyboardExamples: ["运输 -> yunshu", "清关资料 -> qingguanziliao", "请确认订单 -> qingquerendingdan"]
  },
  {
    id: "warm-chat",
    stage: "第四阶段：常见拼音组合",
    title: "暖心聊天输入",
    summary: "练习自然、温柔、有边界感的聊天表达，让拼音输入更贴近日常关系和陪伴感。",
    commonChars: ["爱", "安", "心", "想"],
    commonWords: ["温老师", "摸摸头", "陪伴", "想你"],
    keyboardExamples: ["温老师 -> wenlaoshi", "摸摸头 -> momotou", "我有一点想你了 -> woyouyidianxiangnile"]
  }
];

export type DailyPlan = {
  day: number;
  lessonId: string;
  charIds: string[];
  wordIds: string[];
  chatId: string;
};

export const dailyPlans: DailyPlan[] = [
  { day: 1, lessonId: "intro-single", charIds: ["char-lu", "char-da", "char-extra-001", "char-extra-075", "char-extra-079"], wordIds: ["word-laoshi", "word-life-001", "word-work-001", "phrase-work-001", "phrase-daily-001"], chatId: "chat-warm-001" },
  { day: 2, lessonId: "shengmu-zhchsh", charIds: ["char-shi", "char-chi", "char-extra-076", "char-extra-077", "char-extra-078"], wordIds: ["word-chifan", "word-life-032", "word-work-013", "phrase-work-004", "phrase-daily-005"], chatId: "chat-warm-002" },
  { day: 3, lessonId: "work-logistics", charIds: ["char-ban", "char-extra-014", "char-extra-031", "char-extra-076", "char-extra-080"], wordIds: ["word-xiaban", "word-life-050", "word-work-042", "phrase-work-008", "phrase-daily-009"], chatId: "chat-warm-005" },
  { day: 4, lessonId: "warm-chat", charIds: ["char-ni", "char-extra-002", "char-extra-035", "char-extra-064", "char-lu"], wordIds: ["word-xiangni", "word-life-069", "word-work-076", "phrase-work-025", "phrase-daily-029"], chatId: "chat-warm-015" },
  { day: 5, lessonId: "common-life", charIds: ["char-hui", "char-jia", "char-extra-017", "char-extra-018", "char-ji"], wordIds: ["word-huijia", "word-life-040", "word-work-098", "phrase-work-054", "phrase-daily-055"], chatId: "chat-warm-030" }
];
