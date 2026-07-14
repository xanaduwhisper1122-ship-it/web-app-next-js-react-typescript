export type QuestionType = "char" | "word" | "choice" | "chat";
import {
  expandedCharQuestions,
  expandedChoiceQuestions,
  expandedDailyPhraseQuestions,
  expandedLifeWordQuestions,
  expandedOrdinaryChatQuestions,
  expandedWarmChatQuestions,
  expandedWorkPhraseQuestions,
  expandedWorkWordQuestions
} from "./expandedQuestions.ts";

export type Difficulty = "入门" | "基础" | "进阶" | "easy" | "medium" | "hard";

export type BaseQuestion = {
  id: string;
  type: QuestionType;
  chinese: string;
  answer: string;
  difficulty: Difficulty;
  lessonId: string;
  hints: string[];
  explanation: string;
};

export type ChoiceQuestion = BaseQuestion & {
  type: "choice";
  options: string[];
};

export type ChatQuestion = BaseQuestion & {
  type: "chat";
  speaker: string;
  scene: string;
  prompt: string;
};

const baseCharQuestions: BaseQuestion[] = [
  { id: "char-lu", type: "char", chinese: "卢", answer: "lu", difficulty: "入门", lessonId: "intro-single", hints: ["第一个字母是 l。", "声母是 l，韵母是 u。"], explanation: "‘卢’使用拼音输入时输入 lu。" },
  { id: "char-da", type: "char", chinese: "大", answer: "da", difficulty: "入门", lessonId: "intro-single", hints: ["第一个字母是 d。", "声母是 d，韵母是 a。"], explanation: "‘大’常用拼音输入 da。" },
  { id: "char-wo", type: "char", chinese: "我", answer: "wo", difficulty: "入门", lessonId: "intro-single", hints: ["第一个字母是 w。", "整体输入 wo。"], explanation: "‘我’输入 wo，不需要声调。" },
  { id: "char-ni", type: "char", chinese: "你", answer: "ni", difficulty: "入门", lessonId: "shengmu-nl", hints: ["第一个字母是 n。", "声母是 n，韵母是 i。"], explanation: "‘你’是 ni，注意不是 li。" },
  { id: "char-ta", type: "char", chinese: "她", answer: "ta", difficulty: "入门", lessonId: "intro-single", hints: ["第一个字母是 t。", "声母是 t，韵母是 a。"], explanation: "‘她’输入 ta。" },
  { id: "char-hao", type: "char", chinese: "好", answer: "hao", difficulty: "基础", lessonId: "yunmu-ao", hints: ["第一个字母是 h。", "声母是 h，韵母是 ao。"], explanation: "‘好’输入 hao，韵母是 ao。" },
  { id: "char-shi", type: "char", chinese: "是", answer: "shi", difficulty: "基础", lessonId: "shengmu-zhchsh", hints: ["第一个字母是 s。", "声母是 sh。"], explanation: "‘是’输入 shi，注意 sh 是翘舌音。" },
  { id: "char-chi", type: "char", chinese: "吃", answer: "chi", difficulty: "基础", lessonId: "shengmu-zhchsh", hints: ["第一个字母是 c。", "声母是 ch。"], explanation: "‘吃’输入 chi，声母 ch 连在一起输入。" },
  { id: "char-fan", type: "char", chinese: "饭", answer: "fan", difficulty: "基础", lessonId: "shengmu-fh", hints: ["第一个字母是 f。", "声母 f，韵母 an。"], explanation: "‘饭’输入 fan，不是 han。" },
  { id: "char-ban", type: "char", chinese: "班", answer: "ban", difficulty: "基础", lessonId: "yunmu-anang", hints: ["第一个字母是 b。", "声母 b，韵母 an。"], explanation: "‘班’输入 ban，注意 an 不是 ang。" },
  { id: "char-hui", type: "char", chinese: "回", answer: "hui", difficulty: "基础", lessonId: "yunmu-ui", hints: ["第一个字母是 h。", "声母 h，韵母 ui。"], explanation: "‘回’输入 hui。" },
  { id: "char-jia", type: "char", chinese: "家", answer: "jia", difficulty: "基础", lessonId: "shengmu-jqx", hints: ["第一个字母是 j。", "声母 j，韵母 ia。"], explanation: "‘家’输入 jia。" },
  { id: "char-shui", type: "char", chinese: "睡", answer: "shui", difficulty: "基础", lessonId: "shengmu-zhchsh", hints: ["第一个字母是 s。", "声母 sh，后面是 ui。"], explanation: "‘睡’输入 shui。" },
  { id: "char-jue", type: "char", chinese: "觉", answer: "jue", difficulty: "进阶", lessonId: "keyboard-v", hints: ["第一个字母是 j。", "j 后面常写 ue。"], explanation: "‘觉’输入 jue；键盘里遇到 ü，很多时候写作 u 或 v，按输入法规则即可。" },
  { id: "char-ming", type: "char", chinese: "明", answer: "ming", difficulty: "基础", lessonId: "yunmu-ining", hints: ["第一个字母是 m。", "韵母是 ing。"], explanation: "‘明’输入 ming，注意 ing。" },
  { id: "char-tian", type: "char", chinese: "天", answer: "tian", difficulty: "基础", lessonId: "yunmu-an", hints: ["第一个字母是 t。", "声母 t，后面 ian。"], explanation: "‘天’输入 tian。" },
  { id: "char-kai", type: "char", chinese: "开", answer: "kai", difficulty: "基础", lessonId: "yunmu-ai", hints: ["第一个字母是 k。", "声母 k，韵母 ai。"], explanation: "‘开’输入 kai。" },
  { id: "char-xin", type: "char", chinese: "心", answer: "xin", difficulty: "基础", lessonId: "yunmu-ining", hints: ["第一个字母是 x。", "声母 x，韵母 in。"], explanation: "‘心’输入 xin，不是 xing。" },
  { id: "char-xiang", type: "char", chinese: "想", answer: "xiang", difficulty: "进阶", lessonId: "yunmu-anang", hints: ["第一个字母是 x。", "韵母是 iang。"], explanation: "‘想’输入 xiang，末尾是 ang。" },
  { id: "char-niang", type: "char", chinese: "娘", answer: "niang", difficulty: "进阶", lessonId: "shengmu-nl", hints: ["第一个字母是 n。", "声母 n，韵母 iang。"], explanation: "‘娘’输入 niang，注意 n 和 l 的区别。" },
  { id: "char-lao", type: "char", chinese: "老", answer: "lao", difficulty: "基础", lessonId: "shengmu-nl", hints: ["第一个字母是 l。", "声母 l，韵母 ao。"], explanation: "‘老’输入 lao。" },
  { id: "char-shi-teacher", type: "char", chinese: "师", answer: "shi", difficulty: "基础", lessonId: "shengmu-zhchsh", hints: ["第一个字母是 s。", "声母是 sh。"], explanation: "‘师’输入 shi，和‘是’同音。" },
  { id: "char-xi", type: "char", chinese: "喜", answer: "xi", difficulty: "基础", lessonId: "shengmu-jqx", hints: ["第一个字母是 x。", "整体输入 xi。"], explanation: "‘喜’输入 xi。" },
  { id: "char-huan", type: "char", chinese: "欢", answer: "huan", difficulty: "基础", lessonId: "yunmu-an", hints: ["第一个字母是 h。", "声母 h，韵母 uan。"], explanation: "‘欢’输入 huan。" },
  { id: "char-ku", type: "char", chinese: "苦", answer: "ku", difficulty: "入门", lessonId: "shengmu-gkh", hints: ["第一个字母是 k。", "声母 k，韵母 u。"], explanation: "‘苦’输入 ku。" },
  { id: "char-le", type: "char", chinese: "了", answer: "le", difficulty: "入门", lessonId: "shengmu-nl", hints: ["第一个字母是 l。", "声母 l，韵母 e。"], explanation: "‘了’常见读音输入 le。" },
  { id: "char-zao", type: "char", chinese: "早", answer: "zao", difficulty: "基础", lessonId: "shengmu-zzh", hints: ["第一个字母是 z。", "声母 z，韵母 ao。"], explanation: "‘早’输入 zao，不是 zhao。" },
  { id: "char-wan", type: "char", chinese: "晚", answer: "wan", difficulty: "基础", lessonId: "yunmu-anang", hints: ["第一个字母是 w。", "韵母 an。"], explanation: "‘晚’输入 wan。" },
  { id: "char-ji", type: "char", chinese: "记", answer: "ji", difficulty: "基础", lessonId: "shengmu-jqx", hints: ["第一个字母是 j。", "整体输入 ji。"], explanation: "‘记’输入 ji。" },
  { id: "char-de", type: "char", chinese: "得", answer: "de", difficulty: "入门", lessonId: "intro-single", hints: ["第一个字母是 d。", "声母 d，韵母 e。"], explanation: "‘得’在‘记得’里读 de，输入 de。" }
];

const baseWordQuestions: BaseQuestion[] = [
  { id: "word-laoshi", type: "word", chinese: "老师", answer: "laoshi", difficulty: "基础", lessonId: "shengmu-nl", hints: ["第一个字母是 l。", "拆成 lao + shi。"], explanation: "老师输入 laoshi，注意 sh。" },
  { id: "word-chifan", type: "word", chinese: "吃饭", answer: "chifan", difficulty: "基础", lessonId: "shengmu-zhchsh", hints: ["第一个字母是 c。", "拆成 chi + fan。"], explanation: "吃饭输入 chifan。" },
  { id: "word-shangban", type: "word", chinese: "上班", answer: "shangban", difficulty: "进阶", lessonId: "yunmu-anang", hints: ["第一个字母是 s。", "拆成 shang + ban。"], explanation: "上班输入 shangban，一个是 ang，一个是 an。" },
  { id: "word-xiaban", type: "word", chinese: "下班", answer: "xiaban", difficulty: "基础", lessonId: "shengmu-jqx", hints: ["第一个字母是 x。", "拆成 xia + ban。"], explanation: "下班输入 xiaban。" },
  { id: "word-huijia", type: "word", chinese: "回家", answer: "huijia", difficulty: "基础", lessonId: "common-life", hints: ["第一个字母是 h。", "拆成 hui + jia。"], explanation: "回家输入 huijia。" },
  { id: "word-shuijiao", type: "word", chinese: "睡觉", answer: "shuijiao", difficulty: "进阶", lessonId: "shengmu-zhchsh", hints: ["第一个字母是 s。", "拆成 shui + jiao。"], explanation: "睡觉输入 shuijiao。" },
  { id: "word-qichuang", type: "word", chinese: "起床", answer: "qichuang", difficulty: "进阶", lessonId: "yunmu-anang", hints: ["第一个字母是 q。", "拆成 qi + chuang。"], explanation: "起床输入 qichuang，床是 chuang。" },
  { id: "word-wanan", type: "word", chinese: "晚安", answer: "wanan", difficulty: "基础", lessonId: "common-life", hints: ["第一个字母是 w。", "拆成 wan + an。"], explanation: "晚安输入 wanan，中间不用空格也可以。" },
  { id: "word-zaoan", type: "word", chinese: "早安", answer: "zaoan", difficulty: "基础", lessonId: "shengmu-zzh", hints: ["第一个字母是 z。", "拆成 zao + an。"], explanation: "早安输入 zaoan。" },
  { id: "word-jintian", type: "word", chinese: "今天", answer: "jintian", difficulty: "基础", lessonId: "yunmu-ining", hints: ["第一个字母是 j。", "拆成 jin + tian。"], explanation: "今天输入 jintian，今是 jin。" },
  { id: "word-mingtian", type: "word", chinese: "明天", answer: "mingtian", difficulty: "基础", lessonId: "yunmu-ining", hints: ["第一个字母是 m。", "拆成 ming + tian。"], explanation: "明天输入 mingtian，明是 ming。" },
  { id: "word-kaixin", type: "word", chinese: "开心", answer: "kaixin", difficulty: "基础", lessonId: "common-life", hints: ["第一个字母是 k。", "拆成 kai + xin。"], explanation: "开心输入 kaixin。" },
  { id: "word-xihuan", type: "word", chinese: "喜欢", answer: "xihuan", difficulty: "基础", lessonId: "common-life", hints: ["第一个字母是 x。", "拆成 xi + huan。"], explanation: "喜欢输入 xihuan。" },
  { id: "word-xinku", type: "word", chinese: "辛苦", answer: "xinku", difficulty: "基础", lessonId: "common-life", hints: ["第一个字母是 x。", "拆成 xin + ku。"], explanation: "辛苦输入 xinku。" },
  { id: "word-xiangni", type: "word", chinese: "想你", answer: "xiangni", difficulty: "进阶", lessonId: "shengmu-nl", hints: ["第一个字母是 x。", "拆成 xiang + ni。"], explanation: "想你输入 xiangni。" },
  { id: "word-woaini", type: "word", chinese: "我爱你", answer: "woaini", difficulty: "基础", lessonId: "common-life", hints: ["第一个字母是 w。", "拆成 wo + ai + ni。"], explanation: "我爱你输入 woaini。" },
  { id: "word-zaodianxiuxi", type: "word", chinese: "早点休息", answer: "zaodianxiuxi", difficulty: "进阶", lessonId: "common-life", hints: ["第一个字母是 z。", "拆成 zao + dian + xiu + xi。"], explanation: "早点休息输入 zaodianxiuxi。" },
  { id: "word-jidechifan", type: "word", chinese: "记得吃饭", answer: "jidechifan", difficulty: "进阶", lessonId: "common-life", hints: ["第一个字母是 j。", "拆成 ji + de + chi + fan。"], explanation: "记得吃饭输入 jidechifan。" },
  { id: "word-jintianhenkaixin", type: "word", chinese: "今天很开心", answer: "jintianhenkaixin", difficulty: "进阶", lessonId: "common-life", hints: ["第一个字母是 j。", "拆成 jin + tian + hen + kai + xin。"], explanation: "今天很开心输入 jintianhenkaixin。" },
  { id: "word-meishi", type: "word", chinese: "没事", answer: "meishi", difficulty: "基础", lessonId: "common-life", hints: ["第一个字母是 m。", "拆成 mei + shi。"], explanation: "没事输入 meishi。" },
  { id: "word-bumang", type: "word", chinese: "不忙", answer: "bumang", difficulty: "基础", lessonId: "yunmu-anang", hints: ["第一个字母是 b。", "拆成 bu + mang。"], explanation: "不忙输入 bumang，忙是 mang。" },
  { id: "word-youkong", type: "word", chinese: "有空", answer: "youkong", difficulty: "基础", lessonId: "common-life", hints: ["第一个字母是 y。", "拆成 you + kong。"], explanation: "有空输入 youkong。" },
  { id: "word-dengni", type: "word", chinese: "等你", answer: "dengni", difficulty: "基础", lessonId: "yunmu-eneng", hints: ["第一个字母是 d。", "拆成 deng + ni。"], explanation: "等你输入 dengni，等是 deng。" },
  { id: "word-mashang", type: "word", chinese: "马上", answer: "mashang", difficulty: "进阶", lessonId: "yunmu-anang", hints: ["第一个字母是 m。", "拆成 ma + shang。"], explanation: "马上输入 mashang。" },
  { id: "word-daole", type: "word", chinese: "到了", answer: "daole", difficulty: "基础", lessonId: "common-life", hints: ["第一个字母是 d。", "拆成 dao + le。"], explanation: "到了输入 daole。" },
  { id: "word-lushang", type: "word", chinese: "路上", answer: "lushang", difficulty: "进阶", lessonId: "shengmu-zhchsh", hints: ["第一个字母是 l。", "拆成 lu + shang。"], explanation: "路上输入 lushang。" },
  { id: "word-xiexie", type: "word", chinese: "谢谢", answer: "xiexie", difficulty: "基础", lessonId: "common-life", hints: ["第一个字母是 x。", "拆成 xie + xie。"], explanation: "谢谢输入 xiexie。" },
  { id: "word-bukeqi", type: "word", chinese: "不客气", answer: "bukeqi", difficulty: "基础", lessonId: "common-life", hints: ["第一个字母是 b。", "拆成 bu + ke + qi。"], explanation: "不客气输入 bukeqi。" },
  { id: "word-manmanlai", type: "word", chinese: "慢慢来", answer: "manmanlai", difficulty: "进阶", lessonId: "shengmu-nl", hints: ["第一个字母是 m。", "拆成 man + man + lai。"], explanation: "慢慢来输入 manmanlai。" },
  { id: "word-lianxi", type: "word", chinese: "练习", answer: "lianxi", difficulty: "基础", lessonId: "common-life", hints: ["第一个字母是 l。", "拆成 lian + xi。"], explanation: "练习输入 lianxi。" }
];

const baseChoiceQuestions: ChoiceQuestion[] = [
  { id: "choice-laoshi", type: "choice", chinese: "老师", answer: "laoshi", options: ["laoshi", "naoshi", "laosi"], difficulty: "基础", lessonId: "shengmu-nl", hints: ["第一个字母是 l。", "第二个字是 shi。"], explanation: "老师是 laoshi，老用 l，师用 sh。" },
  { id: "choice-chifan", type: "choice", chinese: "吃饭", answer: "chifan", options: ["chifan", "cifan", "chihan"], difficulty: "基础", lessonId: "shengmu-zhchsh", hints: ["吃是 chi。", "饭是 fan。"], explanation: "吃饭是 chifan，吃的声母是 ch，饭的声母是 f。" },
  { id: "choice-zaoan", type: "choice", chinese: "早安", answer: "zaoan", options: ["zaoan", "zhaoan", "saoan"], difficulty: "基础", lessonId: "shengmu-zzh", hints: ["早是 zao。", "不是 zhao。"], explanation: "早安是 zaoan，早是平舌 z。" },
  { id: "choice-shangban", type: "choice", chinese: "上班", answer: "shangban", options: ["shangban", "sangban", "shanban"], difficulty: "进阶", lessonId: "yunmu-anang", hints: ["上是 shang。", "班是 ban。"], explanation: "上班是 shangban，上是 sh + ang。" },
  { id: "choice-kaixin", type: "choice", chinese: "开心", answer: "kaixin", options: ["kaixin", "kaixing", "kainxin"], difficulty: "基础", lessonId: "yunmu-ining", hints: ["心是 xin。", "不是 xing。"], explanation: "开心是 kaixin，心的韵母是 in。" },
  { id: "choice-dengni", type: "choice", chinese: "等你", answer: "dengni", options: ["dengni", "denni", "dengli"], difficulty: "基础", lessonId: "yunmu-eneng", hints: ["等是 deng。", "你是 ni。"], explanation: "等你是 dengni，等用 eng，你用 n。" },
  { id: "choice-xihuan", type: "choice", chinese: "喜欢", answer: "xihuan", options: ["xihuan", "sihuan", "xifan"], difficulty: "基础", lessonId: "shengmu-jqx", hints: ["喜是 xi。", "欢是 huan。"], explanation: "喜欢是 xihuan，喜的声母是 x。" },
  { id: "choice-wanan", type: "choice", chinese: "晚安", answer: "wanan", options: ["wanan", "wangan", "wanang"], difficulty: "基础", lessonId: "yunmu-anang", hints: ["晚是 wan。", "安是 an。"], explanation: "晚安是 wanan，都是 an。" },
  { id: "choice-qichuang", type: "choice", chinese: "起床", answer: "qichuang", options: ["qichuang", "qicuang", "qichuan"], difficulty: "进阶", lessonId: "shengmu-zhchsh", hints: ["床是 chuang。", "ch 和 ang 都要保留。"], explanation: "起床是 qichuang，床是 chuang。" },
  { id: "choice-huijia", type: "choice", chinese: "回家", answer: "huijia", options: ["huijia", "feijia", "huijian"], difficulty: "基础", lessonId: "shengmu-fh", hints: ["回是 hui。", "家是 jia。"], explanation: "回家是 huijia，回的声母是 h。" },
  { id: "choice-xiangni", type: "choice", chinese: "想你", answer: "xiangni", options: ["xiangni", "xianli", "xiangli"], difficulty: "进阶", lessonId: "shengmu-nl", hints: ["想是 xiang。", "你是 ni。"], explanation: "想你是 xiangni，末尾是 ni。" },
  { id: "choice-mingtian", type: "choice", chinese: "明天", answer: "mingtian", options: ["mingtian", "mintian", "mingqian"], difficulty: "基础", lessonId: "yunmu-ining", hints: ["明是 ming。", "天是 tian。"], explanation: "明天是 mingtian，明是 ing。" },
  { id: "choice-xinku", type: "choice", chinese: "辛苦", answer: "xinku", options: ["xinku", "xingku", "hinku"], difficulty: "基础", lessonId: "yunmu-ining", hints: ["辛是 xin。", "苦是 ku。"], explanation: "辛苦是 xinku，辛是 in。" },
  { id: "choice-lushang", type: "choice", chinese: "路上", answer: "lushang", options: ["lushang", "lusan", "nushang"], difficulty: "进阶", lessonId: "shengmu-nl", hints: ["路是 lu。", "上是 shang。"], explanation: "路上是 lushang，路用 l，上用 shang。" },
  { id: "choice-manmanlai", type: "choice", chinese: "慢慢来", answer: "manmanlai", options: ["manmanlai", "mangmangnai", "manmanrai"], difficulty: "进阶", lessonId: "shengmu-nl", hints: ["慢是 man。", "来是 lai。"], explanation: "慢慢来是 manmanlai，来用 l。" }
];

const baseChatQuestions: ChatQuestion[] = [
  { id: "chat-lianxi", type: "chat", chinese: "我今天认真练习了", answer: "wojintianrenzhenlianxile", difficulty: "进阶", lessonId: "common-life", speaker: "温老师", scene: "温老师：今天有没有认真练习拼音？", prompt: "请用拼音输入“我今天认真练习了”。", hints: ["第一个字是 wo。", "可以拆成 wo + jintian + renzhen + lianxi + le。"], explanation: "这句话输入 wojintianrenzhenlianxile。" },
  { id: "chat-chifan", type: "chat", chinese: "我记得吃饭了", answer: "wojidechifanle", difficulty: "基础", lessonId: "common-life", speaker: "温老师", scene: "温老师：今天有没有好好吃饭？", prompt: "请用拼音输入“我记得吃饭了”。", hints: ["第一个字是 wo。", "拆成 wo + jide + chifan + le。"], explanation: "我记得吃饭了输入 wojidechifanle。" },
  { id: "chat-wanan", type: "chat", chinese: "晚安早点休息", answer: "wananzaodianxiuxi", difficulty: "进阶", lessonId: "common-life", speaker: "温老师", scene: "温老师：今天辛苦啦。", prompt: "请用拼音输入“晚安早点休息”。", hints: ["第一个词是 wanan。", "拆成 wanan + zaodian + xiuxi。"], explanation: "晚安早点休息输入 wananzaodianxiuxi。" },
  { id: "chat-kaixin", type: "chat", chinese: "今天很开心", answer: "jintianhenkaixin", difficulty: "基础", lessonId: "common-life", speaker: "朋友", scene: "朋友：今天过得怎么样？", prompt: "请用拼音输入“今天很开心”。", hints: ["第一个词是 jintian。", "拆成 jintian + hen + kaixin。"], explanation: "今天很开心输入 jintianhenkaixin。" },
  { id: "chat-huijia", type: "chat", chinese: "我下班回家了", answer: "woxiabanhuijiale", difficulty: "进阶", lessonId: "common-life", speaker: "家人", scene: "家人：到哪里啦？", prompt: "请用拼音输入“我下班回家了”。", hints: ["第一个字是 wo。", "拆成 wo + xiaban + huijia + le。"], explanation: "我下班回家了输入 woxiabanhuijiale。" },
  { id: "chat-xiangni", type: "chat", chinese: "我想你了", answer: "woxiangnile", difficulty: "基础", lessonId: "shengmu-nl", speaker: "温老师", scene: "温老师：今天有什么想说的吗？", prompt: "请用拼音输入“我想你了”。", hints: ["第一个字是 wo。", "拆成 wo + xiang + ni + le。"], explanation: "我想你了输入 woxiangnile。" },
  { id: "chat-bumang", type: "chat", chinese: "我现在不忙", answer: "woxianzaibumang", difficulty: "进阶", lessonId: "yunmu-anang", speaker: "同事", scene: "同事：现在方便说话吗？", prompt: "请用拼音输入“我现在不忙”。", hints: ["第一个字是 wo。", "拆成 wo + xianzai + bumang。"], explanation: "我现在不忙输入 woxianzaibumang。" },
  { id: "chat-mingtian", type: "chat", chinese: "明天见", answer: "mingtianjian", difficulty: "基础", lessonId: "yunmu-ining", speaker: "朋友", scene: "朋友：那我们明天再聊。", prompt: "请用拼音输入“明天见”。", hints: ["第一个词是 mingtian。", "见是 jian。"], explanation: "明天见输入 mingtianjian。" },
  { id: "chat-xiexie", type: "chat", chinese: "谢谢你辛苦了", answer: "xiexienixinkule", difficulty: "进阶", lessonId: "common-life", speaker: "温老师", scene: "温老师：你今天练得很稳。", prompt: "请用拼音输入“谢谢你辛苦了”。", hints: ["第一个词是 xiexie。", "拆成 xiexie + ni + xinku + le。"], explanation: "谢谢你辛苦了输入 xiexienixinkule。" },
  { id: "chat-manmanlai", type: "chat", chinese: "没事慢慢来", answer: "meishimanmanlai", difficulty: "进阶", lessonId: "shengmu-nl", speaker: "温老师", scene: "温老师：拼音一开始慢一点也没关系。", prompt: "请用拼音输入“没事慢慢来”。", hints: ["第一个词是 meishi。", "拆成 meishi + manman + lai。"], explanation: "没事慢慢来输入 meishimanmanlai。" }
];

export const charQuestions: BaseQuestion[] = [
  ...baseCharQuestions,
  ...expandedCharQuestions
];

export const wordQuestions: BaseQuestion[] = [
  ...baseWordQuestions,
  ...expandedLifeWordQuestions,
  ...expandedDailyPhraseQuestions,
  ...expandedWorkWordQuestions,
  ...expandedWorkPhraseQuestions
];

export const choiceQuestions: ChoiceQuestion[] = [
  ...baseChoiceQuestions,
  ...expandedChoiceQuestions
];

export const chatQuestions: ChatQuestion[] = [
  ...baseChatQuestions,
  ...expandedOrdinaryChatQuestions,
  ...expandedWarmChatQuestions
];

export const allQuestions = [
  ...charQuestions,
  ...wordQuestions,
  ...choiceQuestions,
  ...chatQuestions
];
