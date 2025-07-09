import React from 'react';

const books = [
  {
    id: 'cognitive_awakening',
    series: '自我成长系列',
    title: '《认知觉醒》',
    description: '开启自我改变的原动力，探索大脑的底层操作系统。',
    progress: '1/7 章节已解锁',
    stars: 1,
    reward: 150,
    color: 'neon-blue',
    icon: 'fa-sun-o',
    locked: false,
    chapters: [
      { 
        id: 'chap_1', title: '一、认知基础', description: '了解你的大脑是如何工作的。', status: 'unlocked', reward: 20,
        scenes: [
          { id: 'scene_1_1', title: '三重大脑结构', content: '周五晚上，你刚打开电脑想赶完周报（理智脑："下周一会议要用"），手机突然弹出闺蜜发来的火锅探店视频 -- 红油翻滚的锅底、冒热气的毛肚，配文 "就等你了！"（本能脑："火锅真香"，情绪脑："错过会被说扫兴"）。键盘上的光标还在闪烁，你会：', options: [ { text: '"冲！周报半夜赶"', feedback: '今晚你的本能脑和情绪脑赢了火锅局，却输了周报质量 -- 就像《认知觉醒》说的，原始大脑总爱选"当下爽"，但理智脑知道"延迟满足更稳"～' }, { text: '"约明天，先搞定正事"', feedback: '理智脑在线控场！你发现拒绝诱惑后，不仅没失去朋友，还收获了踏实的睡眠～' }, { text: '"边吃边写"', feedback: '你把"反思"和"冥想"组合成了元认知训练包！就像《认知觉醒》说的，增强理智脑不用硬拼意志力，找对方法就能让三脑协同～' } ], correctIndex: 1 },
          { id: 'scene_1_2', title: '焦虑根源', content: '刷朋友圈时，你看到：大学室友晒出 "年入 50 万" 的工资条，发小官宣 "首付买了学区房"，连前同事都跳槽去了大厂。你盯着自己 3 年没涨的工资，胸口发闷，手指在屏幕上划来划去停不下来，你会：', options: [ { text: '"连夜报班，卷起来"', feedback: '你的"急于求成"被朋友圈放大啦！《认知觉醒》说焦虑的根源是"想一步到位"，不如像选 B 那样，先找个"跳一跳够得着"的小目标～' }, { text: '"关掉手机，列个小目标"', feedback: '你躲开了"避难趋易"的陷阱！其实别人的"高光"背后也有难处，专注自己的小进步更实在～' }, { text: '"躺平，反正比不过"', feedback: '《认知觉醒》提醒你，无行动的焦虑是双倍的消耗哦。' } ], correctIndex: 1 },
          { id: 'scene_1_3', title: '破局关键', content: '你发现自己总在 "减肥" 和 "暴食" 间反复：周一发誓 "只吃沙拉"，周三就忍不住炫了整个蛋糕，事后又自责 "没毅力"。你决定试试书中的方法，会选：', options: [ { text: '"每晚睡前写"饮食日记"', feedback: '反思是元认知的第一步，你做得很棒！' }, { text: '"每天冥想 10 分钟"', feedback: '冥想是锻炼理智脑的绝佳方式，坚持下去！' }, { text: '"A 和 B 都试试"', feedback: '你把"反思"和"冥想"组合成了元认知训练包！就像《认知觉醒》说的，增强理智脑不用硬拼意志力，找对方法就能让三脑协同～' } ], correctIndex: 2 },
        ]
      },
      { 
        id: 'chap_2', title: '二、核心能力', description: '学会思考你的思考方式。', status: 'locked', reward: 20,
        scenes: [
          { id: 'scene_2_1', title: '元认知本质', content: '你在部门会议上汇报方案，老板突然打断："这个预算太离谱了，你有没有算过成本？" 你瞬间脸发烫，耳朵里嗡嗡响，这时候脑子里的小人在吵架，你会站哪边？', options: [ { text: '"委屈小人"', feedback: '让情绪掌控汇报，可能会错过解决问题的最佳时机哦。' }, { text: '"观察小人"', feedback: '你的元认知像个冷静的旁观者！《认知觉醒》说元认知就是"跳出来看自己"—— 不是没情绪，而是不让情绪抢了话语权～' }, { text: '"逃跑小人"', feedback: '逃避虽然可耻但有用，但这次可能让你错过了一次宝贵的成长机会。' } ], correctIndex: 1 },
          { id: 'scene_2_2', title: '专注力训练', content: '你打算晚上 7 点到 9 点写一篇公众号文章，刚打开文档就遇到各种干扰：快递短信、室友喊、新闻推送。你会怎么处理？', options: [ { text: '"先处理完再写"', feedback: '注意力被切换太多次，再回到写作任务上会消耗更多能量。' }, { text: '"给干扰"安个家"', feedback: '你给专注力搭了个"防护盾"！就像《认知觉醒》说的，"身心合一"不是没干扰，而是懂得给干扰"排个队"～' }, { text: '"边写边应付"', feedback: '一心二用往往导致两件事都做不好，专注力是稀缺资源。' } ], correctIndex: 1 },
          { id: 'scene_2_3', title: '元认知应用', content: '双 11 凌晨，你在购物车加了件 1200 元的羽绒服，付款时发现 "满 2000 减 300"，只要再买 800 元就能凑单。你其实不缺东西，但 "不凑就亏了" 的念头挥之不去，你会：', options: [ { text: '"凑！不能亏"', feedback: '你可能掉进了"损失厌恶"的陷阱。' }, { text: '"停！算笔账"', feedback: '你在"元时间"（决策瞬间）按下了暂停键！《认知觉醒》说元认知的终极作用，就是让你在"被欲望推着走"前，先问一句"这真的是我需要的吗"～' }, { text: '"纠结到超时"', feedback: '决策瘫痪也是一种消耗，下次可以给自己设定一个思考时限。' } ], correctIndex: 1 },
        ]
      },
      { 
        id: 'chap_3', title: '三、学习成长', description: '构建真正属于你的知识网络。', status: 'locked', reward: 25,
        scenes: [
          { id: 'scene_3_1', title: '深度学习方法论', content: '你想学习 "短视频剪辑"，网上教程太多，你会选哪种方式？', options: [ { text: '"刷 100 个"30 秒速成"视频"', feedback: '碎片化学习很难形成体系，你可能收藏了很多，但真正掌握的很少。' }, { text: '"啃透 1 本教材，边学边练"', feedback: '你摸到了深度学习的精髓！《认知觉醒》说"知识不是看过就会，而是能用出来" -- 就像学游泳，光看教程不下水，永远学不会换气～' }, { text: '"只看不动手"', feedback: '输入而不输出，知识很难内化成自己的能力。' } ], correctIndex: 1 },
          { id: 'scene_3_2', title: '知识体系构建', content: '你在学 "时间管理" 时，看到书中说 "四象限法"（紧急重要 / 重要不紧急），突然想起之前学过 "番茄工作法""精力管理"，你会：', options: [ { text: '"分开记，各用各的"', feedback: '孤立的知识点很难发挥威力，试着把它们连接起来。' }, { text: '"找联系，串成网"', feedback: '你把知识"织成了网"！《认知觉醒》说真正的认知体系，是让不同知识像拼图一样咬合 -- 就像你现在，让时间管理方法"各司其职"～' }, { text: '"觉得太复杂，只用一个"', feedback: '有时候一个简单工具就够了，但组合工具箱能让你应对更复杂的问题。' } ], correctIndex: 1 },
          { id: 'scene_3_3', title: '反低效学习', content: '你参加了一个 "21 天读书打卡营"，每天的任务是 "读 50 页书 + 发朋友圈打卡"。第 10 天你发现，虽然打卡从没断过，但书里讲了什么根本记不清，你会：', options: [ { text: '"为了全勤，继续打卡"', feedback: '形式主义的学习带来的只是虚假的满足感。' }, { text: '"停打卡，慢下来啃"', feedback: '你躲开了"打卡式学习"的坑！《认知觉醒》说"少即是多" -- 与其用 50 页的量感动自己，不如用 10 页的质改变行为～' }, { text: '"换成听书，更省力"', feedback: '被动输入的效果远不如主动学习，高质量的阅读需要专注。' } ], correctIndex: 1 },
        ]
      },
      { 
        id: 'chap_4', title: '四、行动执行', description: '将想法变为现实的艺术。', status: 'locked', reward: 25,
        scenes: [
          { id: 'scene_4_1', title: '目标拆解', content: '你新年目标是 "提升英语口语"，但 "提升" 太模糊，你会怎么把它变具体？', options: [ { text: '"定个大目标：年底能和老外流利对话"', feedback: '宏大的目标如果没有拆解，很容易因为看不到进度而放弃。' }, { text: '"拆成小任务：每周学 3 个场景对话"', feedback: '你把模糊目标"砍成了小块"！《认知觉醒》说"拉伸区任务"才是成长的关键 -- 不大到吓人，不小到无聊，刚好够你跳一跳～' }, { text: '"跟着 APP 打卡，每天背 50 个单词"', feedback: '背单词不等于会口语，要明确学习目标和应用场景。' } ], correctIndex: 1 },
          { id: 'scene_4_2', title: '启动策略', content: '你想养成 "睡前复盘" 的习惯，但总因为 "太累了""明天再说" 没开始，你会怎么设计启动步骤？', options: [ { text: '"定规矩：每晚写 500 字复盘"', feedback: '过高的启动门槛是大脑的"天敌"。' }, { text: '"从"1 分钟"开始"', feedback: '你用"微小启动"骗过了大脑的"畏难情绪"！《认知觉醒》说"先让身体动起来，大脑会慢慢跟上" -- 就像推秋千，一开始用点力，后面就顺了～' }, { text: '"等有状态了再做"', feedback: '"等有状态"往往是拖延的开始。' } ], correctIndex: 1 },
          { id: 'scene_4_3', title: '反馈机制', content: '你写了一篇关于 "职场沟通" 的文章，想知道写得怎么样，你会：', options: [ { text: '"自己觉得好就行，发出去不管了"', feedback: '没有反馈的输出是"自嗨"，很难进步。' }, { text: '"主动找 3 类人要反馈"', feedback: '你把外界反馈变成了"进步导航"！《认知觉醒》说"输出不是终点，而是获取反馈的起点" -- 就像打游戏看血条，知道哪里掉血，才能及时补血～' }, { text: '"只看点赞数，赞少就删文"', feedback: '把价值判断完全交给外界的即时数据，容易陷入情绪内耗。' } ], correctIndex: 1 },
        ]
      },
      { 
        id: 'chap_5', title: '五、情绪管理', description: '成为情绪的主人，而非奴隶。', status: 'locked', reward: 20,
        scenes: [
          { id: 'scene_5_1', title: '心智带宽消耗', content: '你同时遇到这些事：明天要交季度报告，还没写完；妈妈打电话说"老家房子漏水，需要你寄钱修"；对象发消息"今晚必须聊聊我们的未来"。你感觉脑子像塞了一团乱麻，根本静不下来，你会：', options: [ { text: '"同时处理，硬扛"', feedback: '心智带宽被严重透支，效率和结果都会很差。' }, { text: '"给事情排个序"', feedback: '你给心智带宽"松了绑"！《认知觉醒》说"心智带宽就像手机内存，同时开太多 APP 会卡顿" -- 定期清理、按序打开，才能流畅运行～' }, { text: '"逃避，先刷手机"', feedback: '用娱乐来逃避压力，只会让问题越积越多。' } ], correctIndex: 1 },
          { id: 'scene_5_2', title: '情绪化解策略', content: '你和室友约定 "轮流打扫卫生"，但对方连续 3 周没打扫，客厅堆着她的外卖盒，你一进门就气不打一处来，你会：', options: [ { text: '"当场发火"', feedback: '情绪化的表达往往会激发对方的防御机制，无助于解决问题。' }, { text: '"先换个环境冷静"', feedback: '你用"物理抽离"给情绪降了温！《认知觉醒》说"视角转换的前提是先跳出情绪漩涡" -- 就像站在山顶看路，比在山谷里打转看得清～' }, { text: '"憋在心里，自己打扫"', feedback: '压抑自己的需求和情绪，长期来看会损害关系和自己的心理健康。' } ], correctIndex: 1 },
          { id: 'scene_5_3', title: '反内耗思维', content: '你在公司竞聘主管失败了，对手是你以前带过的实习生。你脑子里反复想："是不是我能力太差？""他们肯定觉得我年纪大了""当时要是多说一句就好了"，越想越失眠，你会：', options: [ { text: '"陷在自责里，反复复盘细节"', feedback: '沉浸在模糊的负面情绪中，是内耗的主要原因。' }, { text: '"把"模糊痛苦"拆成"具体问题""', feedback: '你用"拆解"打败了内耗！《认知觉醒》说"痛苦的根源是认知模糊" -- 就像揉皱的纸，铺平了才能看清上面的字～' }, { text: '"假装不在乎，逃避想这件事"', feedback: '逃避问题并不会让问题消失，反而会持续消耗你的心理能量。' } ], correctIndex: 1 },
        ]
      },
      { 
        id: 'chap_6', title: '六、实践工具', description: '重塑日常习惯的强大武器。', status: 'locked', reward: 20,
        scenes: [
          { id: 'scene_6_1', title: '早起', content: '你想养成早起的习惯，但冬天早上被窝太暖和，闹钟响了总想着 "再睡 5 分钟"，你会怎么调整？', options: [ { text: '"定 5 个闹钟，放在床尾"', feedback: '用暴力对抗懒惰，往往会激起更强的逆反心理。' }, { text: '"用"睡前准备"倒逼早起"', feedback: '你用"环境设计"帮自己克服了惰性！《认知觉醒》说"早起的关键不是意志力，而是让身体形成条件反射" -- 就像听到下课铃就想站起来，习惯成自然～' }, { text: '"等天暖和了再早起"', feedback: '将行动的决定权交给外部条件，是拖延的温床。' } ], correctIndex: 1 },
          { id: 'scene_6_2', title: '冥想', content: '你第一次尝试冥想，按照教程 "专注呼吸 10 分钟"，但脑子里全是 "早上没打卡""中午吃什么"，根本静不下来，你会：', options: [ { text: '"觉得自己不适合，放弃"', feedback: '有杂念是正常的，冥想的重点不是没有杂念，而是察觉到杂念并拉回来。' }, { text: '"允许杂念存在，轻轻拉回来"', feedback: "你摸到了冥想的精髓！《认知觉醒》说'冥想不是清空大脑，而是锻炼'杂念出现时不被带走'的能力' -- 就像训练小狗，它跑远了，轻轻喊回来就好～" }, { text: '"逼自己"必须放空"，反而更烦躁"', feedback: '越是对抗，杂念越是挥之不去。' } ], correctIndex: 1 },
          { id: 'scene_6_3', title: '阅读与写作', content: '你读《认知觉醒》时，看到 "元认知" 这个概念，有点难懂，你会怎么学透它？', options: [ { text: '"把定义抄 10 遍，背下来"', feedback: '死记硬背的知识是脆弱的，无法应用。' }, { text: '"用自己的话讲给猫听"', feedback: '你用"费曼技巧"把知识嚼碎了！《认知觉醒》说"检验是否学会的标准，是能否用简单的话讲明白" -- 就像老师备课，能给小学生讲懂，才是真懂～' }, { text: '"标记出来，等以后再看"', feedback: '学习上的畏难情绪，需要用微小的行动去克服。' } ], correctIndex: 1 },
          { id: 'scene_6_4', title: '运动', content: '你想通过运动提升状态，但平时没时间去健身房，你会选哪种方式？', options: [ { text: '"每天在家做 50 个俯卧撑"', feedback: '不切实际的目标是行动的杀手。' }, { text: '"有氧 + 复杂运动"组合"', feedback: '你选对了"大脑喜欢的运动"！《认知觉醒》说"复杂运动比单纯的力气活更能激活大脑" -- 就像玩魔方比举哑铃更练脑子，身体和大脑一起动才高效～' }, { text: '"周末去爬山，平时不动"', feedback: '低频高强度的运动，对身体和习惯养成可能弊大于利。' } ], correctIndex: 1 },
        ]
      },
      { 
        id: 'chap_7', title: '七、输出价值', description: '让你的能力产生复利效应。', status: 'locked', reward: 20,
        scenes: [
          { id: 'scene_7_1', title: '输出驱动学习', content: '你学了 "非暴力沟通"（观察、感受、需求、请求），想真正掌握这个方法，你会：', options: [ { text: '"把方法记在笔记本上，偶尔翻一翻"', feedback: '不以输出为目的的学习，效果会大打折扣。' }, { text: '"写篇"吵架指南"发在家庭群"', feedback: '你用"输出"逼自己真的学会了！《认知觉醒》说"写下来、讲出去的过程，会逼着你把知识嚼碎了再重组" -- 就像做饭，看菜谱和真的做一盘菜，完全是两回事～' }, { text: '"等遇到冲突时再试"', feedback: '知识需要刻意练习才能在关键时刻被调用。' } ], correctIndex: 1 },
          { id: 'scene_7_2', title: '跨界迁移', content: '你在学 "植物浇水" 时，知道 "不能一次浇太多，要少量多次，让根慢慢吸收"，突然想到这和 "学习新知识" 很像，你会：', options: [ { text: '"觉得好玩，但没多想"', feedback: '洞察力需要刻意培养，试着多问一句"这个道理还能用在哪？"' }, { text: '"把"浇水逻辑"用到背单词上"', feedback: '你玩明白了"跨界迁移"！《认知觉醒》说"知识的力量在于迁移" -- 就像把 A 地的桥拆了，在 B 地重新搭起来，只要结构对，就能用～' }, { text: '"强行套用，反而混乱"', feedback: '迁移和类比需要找到事物的底层逻辑，而不是生搬硬套表面形式。' } ], correctIndex: 1 },
          { id: 'scene_7_3', title: '价值创造逻辑', content: '你擅长做 PPT，朋友总夸你 "排版特别清楚"，你想让这个技能产生更多价值，你会：', options: [ { text: '"接高价 PPT 代做，只看钱"', feedback: '单纯的技能变现，天花板很低。' }, { text: '"帮"需要的人"解决问题"', feedback: '你摸到了价值创造的密码！《认知觉醒》说"从 "我能得到什么" 到 "我能给什么"，反而会收获更多" -- 就像种果树，先浇水施肥，才会结果子～' }, { text: '"藏着掖着，怕别人学走"', feedback: '分享和教授是更高阶的学习，也能为你带来更多机会。' } ], correctIndex: 1 },
        ]
      }
    ]
  },
  {
    id: 'hao_hao_si_kao',
    series: '思维策略系列',
    title: '《好好思考》',
    description: '玩转"思维策略实验室"，用多元思维解决复杂问题。',
    progress: '0/5 章节已解锁',
    stars: 0,
    reward: 200,
    color: 'neon-green',
    icon: 'fa-sitemap',
    locked: false,
    chapters: [
      { 
        id: 'chap_1', title: '一、思维模型的底层逻辑', description: '什么是「解决问题的万能钥匙」', status: 'unlocked', reward: 40,
        scenes: [
          { id: 'scene_1_1', title: '思维模型 vs 经验主义', content: '你是奶茶店店长，最近顾客投诉 "等待时间太长"。你记得去年夏天也遇到过类似问题，当时加了 2 个临时工就解决了（经验）。但这次是秋冬，顾客量其实没夏天多，你会：', options: [ { text: '"照经验来，再招临时工"', feedback: '紧急招了 2 个兼职，人力成本增加了 30%，但顾客等待时间只减少了 5 分钟 -- 因为这次问题出在 "点单系统卡顿"，不是人手不够。' }, { text: '"用\'流程拆解模型\'分析"', feedback: '你用思维模型抓到了问题本质！《好好思考》说\'经验是具体场景的总结，模型是抽象规律的提炼\'-- 就像这次，经验只看到\'人少\'，模型却看到了\'流程堵\'～' }, { text: '"问同行怎么做"', feedback: '打电话问隔壁咖啡店店长，对方说 "我们是多开了一个窗口"，你也跟着开了新窗口，结果员工两头跑更混乱了。' } ], correctIndex: 1 },
          { id: 'scene_1_2', title: '思维模型的筛选标准', content: '你想提升沟通能力，在网上搜 "沟通技巧"，出来一堆方法："73855 定律""非暴力沟通四步法""金字塔原理""共情式倾听"…… 你会优先学哪个？', options: [ { text: '"全学！多总比少好"', feedback: '买了 5 本书，每天学 2 小时，结果记混了 "非暴力沟通" 和 "共情倾听" 的步骤，实际和同事吵架时还是说不出话。' }, { text: '"选\'跨领域通用\'的模型"', feedback: '你掌握了模型筛选的精髓！《好好思考》说\'好的模型像瑞士军刀，能解决多种问题\'-- 与其贪多嚼不烂，不如先磨利一把万能刀～' }, { text: '"选看起来\'高级\'的"', feedback: '觉得 "73855 定律"（7% 语言 + 38% 语调 + 55% 表情）很专业，花一周背熟了，但实际沟通时总在数 "自己的语调占比多少"，反而更紧张。' } ], correctIndex: 1 },
          { id: 'scene_1_3', title: '模型的 "适用边界" 意识', content: '你用 "SWOT 分析法"（优势 / 劣势 / 机会 / 威胁）帮朋友分析是否该辞职创业，得出 "适合创业" 的结论。但朋友实际辞职后 3 个月就亏光了积蓄，你会：', options: [ { text: '"觉得是朋友执行得不好"', feedback: '心里想 "SWOT 分析明明显示可行，肯定是他没按计划做"，从此更相信模型，不再关注实际情况。' }, { text: '"反思模型的边界"', feedback: '你摸到了高手的思维秘诀！《好好思考》说\'没有万能模型，只有适合场景的模型\'-- 就像雨伞能挡雨，但在沙漠里反而累赘～' }, { text: '"再也不信模型了"', feedback: '觉得 "都是理论骗人的"，以后做决策全凭 "直觉"，结果自己投资基金时因为 "看着涨就买" 亏了钱。' } ], correctIndex: 1 },
        ]
      },
      { 
        id: 'chap_2', title: '二、多元思维模型', description: '如何用 "跨领域知识" 破解复杂问题', status: 'locked', reward: 40,
        scenes: [
          { id: 'scene_2_1', title: '打破 "专业壁垒" 的思维迁移', content: '你负责的产品上线后用户增长停滞，团队用 "互联网运营模型"（拉新 / 留存 / 转化）优化了 3 个月，效果仍不好。你会：', options: [ { text: '"继续优化运营细节"', feedback: '每天研究 "如何写更吸引人的推送文案"，把转化率从 2% 提到 2.5%，但总体增长还是很慢。' }, { text: '"借\'生物学模型\'分析"', feedback: '你玩明白了\'跨界迁移\'！《好好思考》说\'复杂问题需要跨领域视角\'-- 就像用生物学看商业，突然发现\'用户增长\'本质是\'找到未被满足的生存空间\'～' }, { text: '"照搬其他行业的成功案例"', feedback: '听说 "直播带货" 火，不管自己的产品是办公软件，硬要团队每天直播，结果观看人数不足 100，还浪费了大量精力。' } ], correctIndex: 1 },
          { id: 'scene_2_2', title: '思维模型的 "组合攻击"', content: '你带团队做一个重要项目，成员们总因为 "分工不均" 吵架：有人觉得 "自己干得多"，有人抱怨 "别人拖后腿"，你会：', options: [ { text: '"用\'管理学模型\'定 KPI"', feedback: '给每个人设定 "量化指标"，但有人擅长 "无法量化的创意工作"，反而更抵触，吵架变本加厉。' }, { text: '"组合 3 个领域的模型"', feedback: '你打出了模型的\'组合拳\'！《好好思考》说\'高手解决问题像医生开药方，多种药配合才能治病\'-- 单一模型治不了复杂的\'团队病\'～' }, { text: '"当\'老好人\'调解"', feedback: '每次吵架就说 "大家互相体谅"，但没解决根本问题，项目进度落后了半个月。' } ], correctIndex: 1 },
          { id: 'scene_2_3', title: '从 "碎片知识" 到 "思维网格"', content: '你手机备忘录里记了很多 "金句"："复利效应""临界质量""反馈循环""最小阻力路径"…… 但遇到问题时总想不起来用，你会：', options: [ { text: '"每天花 10 分钟背诵"', feedback: '把金句抄在卡片上，通勤时背，但实际策划活动时，还是只会用 "以前成功的老办法"。' }, { text: '"用\'问题分类法\'串联"', feedback: '你把碎片知识\'织成了网\'！《好好思考》说\'知识的价值不在多少，而在连接强度\'-- 就像渔网，单个网眼没用，连起来才能捕鱼～' }, { text: '"删掉算了，没用"', feedback: '觉得 "记了也用不上"，清空备忘录，从此只看 "手把手教程"，能力停留在 "照做" 层面。' } ], correctIndex: 1 },
        ]
      },
      { 
        id: 'chap_3', title: '三、深度思考方法', description: '如何穿透问题的 "表象迷雾"', status: 'locked', reward: 40,
        scenes: [
          { id: 'scene_3_1', title: '5Why 追问法：穿透问题表层', content: '你发现公司年轻员工离职率很高，HR 说是 "工资太低"，你会：', options: [ { text: '"信 HR 的结论，申请涨薪"', feedback: '给年轻员工每月涨了 500 元，但离职率只降了 10%-- 因为有人说 "涨了也不够在市区租房"。' }, { text: '"多问几个\'为什么\'"', feedback: '你用追问挖到了问题的根！《好好思考》说\'表面原因像浮冰，水下的才是真问题\'-- 工资只是冰山一角，通勤不便才是藏在水下的巨石～' }, { text: '"觉得是\'年轻人吃不了苦\'"', feedback: '在会上说 "现在的年轻人太娇气"，然后要求 HR "招能吃苦的"，结果招进来的人还是干不久。' } ], correctIndex: 1 },
          { id: 'scene_3_2', title: '溯因推理：从结果反推 "可能的原因"', content: '你运营的公众号阅读量突然从 1 万跌到 3 千，同期没有改内容风格，也没有平台规则变化，你会：', options: [ { text: '"试各种\'常见办法\'"', feedback: '换标题风格、改发布时间、增加互动话题，折腾了两周，阅读量还是在 3 千左右波动。' }, { text: '"列\'可能的原因清单\'排除"', feedback: '你掌握了\'侦探式思考\'！《好好思考》说\'复杂问题没有唯一答案，只有概率最高的解释\'-- 像侦探查案一样列嫌疑人，才能抓到真凶～' }, { text: '"归因于\'大环境不好\'"', feedback: '看到同行也有阅读量下降的，就觉得 "是整个行业不行"，放松了内容质量，3 个月后阅读量跌到 1 千。' } ], correctIndex: 1 },
          { id: 'scene_3_3', title: '第一性原理：回到 "最根本的起点"', content: '你想做一个 "帮助职场人提升效率" 的 APP，竞品都在做 "日程管理""待办清单"，你会：', options: [ { text: '"做得比竞品更好"', feedback: '开发了 "智能提醒""跨设备同步" 功能，比竞品多 10 个亮点，但因为 "用户已经习惯用竞品"，下载量很少。' }, { text: '"追问\'效率的本质\'"', feedback: '你摸到了\'创新的源头\'！《好好思考》说\'第一性原理就像树木的根，扎得越深，长得越高\'-- 别人在枝叶上做优化，你直接从根上找突破～' }, { text: '"加个\'创新功能\'"', feedback: '觉得 "别人都做清单，我加个\'冥想减压\'模块吧"，结果用户觉得 "不伦不类"，用了一次就卸载了。' } ], correctIndex: 1 },
        ]
      },
      { 
        id: 'chap_4', title: '四、思维训练的实践工具', description: '如何把 "知识" 变成 "思维肌肉"', status: 'locked', reward: 40,
        scenes: [
          { id: 'scene_4_1', title: '思维日记：记录 "思考过程" 而非 "结果"', content: '你每天写日记，但都是 "今天做了什么""明天要做什么"，想改用 "思维日记" 提升思考能力，你会：', options: [ { text: '“记录‘今天的决策思路’”', feedback: '写下："今天决定拒绝朋友的聚会，因为\'下周要交报告（原因），担心去了会熬夜（后果），可以周末再约（替代方案）\'。" 两周后发现自己做决策时更有条理了。' }, { text: '“分析‘今天的错误思考’”', feedback: '记下："早上因为\'同事没回复消息\'生气，后来发现是\'我假设他故意不理我\'（错误前提），其实他在开会（事实）。" 慢慢减少了 "想当然" 的判断。' }, { text: '“A 和 B 都记”', feedback: '你把日记变成了\'思维健身房\'！《好好思考》说\'思维能力像肌肉，需要刻意记录和锻炼\'-- 就像运动员复盘动作视频，你在复盘自己的思考过程～' } ], correctIndex: 2 },
          { id: 'scene_4_2', title: '模型卡片：让知识 "可调用"', content: '你读《经济学原理》时看到 "边际成本"（每多生产一个产品的额外成本），觉得有用但怕忘了，你会：', options: [ { text: '“抄在笔记本上，标重点”', feedback: '笔记本上抄满了定义，但半年后帮家里选 "是否要开分店" 时，完全没想起来用这个模型分析 "多开一家的额外成本"。' }, { text: '“做\'场景化卡片\'”', feedback: '你让知识\'站起来了\'！《好好思考》说\'知识要和场景绑定才能被调用\'-- 就像把钥匙挂在对应的门锁旁，需要时一眼就能看到～' }, { text: '“存在手机备忘录，搜关键词”', feedback: '存了很多模型，但需要用时总不知道该搜什么关键词，比如想分析 "要不要多报一个班"，没想起来搜 "边际成本"。' } ], correctIndex: 1 },
          { id: 'scene_4_3', title: '跨界练习：刻意 "移植" 模型', content: '你学了 "生物学的生态位分离"（物种通过差异化避免竞争），想刻意练习迁移能力，你会：', options: [ { text: '"用它分析其他领域"', feedback: '发现 "小区里的两家超市"：一家主打 "便宜"，一家主打 "24 小时营业"，也是 "生态位分离"；还发现 "同事们"：有人擅长 "对外沟通"，有人擅长 "内部协调"，才不会互相替代。' }, { text: '"用它解决一个问题"', feedback: '帮朋友的花店做定位："周边都是\'卖玫瑰百合的常规花店\'，你可以主打\'办公室小盆栽 + 每周换花服务\'，占据不同生态位"，朋友的生意果然好了起来。' }, { text: '"A 和 B 都做"', feedback: '你练成了\'跨界思维肌肉\'！《好好思考》说\'迁移能力不是天生的，而是练出来的\'-- 就像学外语，先背单词再对话，才能熟练运用～' } ], correctIndex: 2 },
        ]
      },
      { 
        id: 'chap_5', title: '五、复杂问题解决', description: '在 "不确定性" 中找到 "确定的解法"', status: 'locked', reward: 40,
        scenes: [
          { id: 'scene_5_1', title: '用 "多层模型" 应对 "信息模糊"', content: '你收到两个工作 offer：A 公司是大平台，薪资高但岗位重复度高；B 公司是创业公司，薪资低但能接触核心业务。你搜集了很多信息，但还是拿不定主意，你会：', options: [ { text: '"列\'优缺点清单\'对比"', feedback: '写下 A 的优点（稳定、钱多）和缺点（成长慢），B 则相反，越列越纠结，最后凭 "感觉" 选了 A，半年后又觉得 "没成长" 后悔了。' }, { text: '"用\'三层决策模型\'分析"', feedback: '你用\'多层模型\'穿透了信息迷雾！《好好思考》说\'复杂决策像剥洋葱，需要一层一层看\'-- 生存、发展、风险，少一层都可能选错～' }, { text: '"问\'有经验的人\'"', feedback: '学长说 "A 好，稳定"，表姐说 "B 好，能锻炼人"，你更纠结了，拖到截止日期才随便选了一个。' } ], correctIndex: 1 },
          { id: 'scene_5_2', title: '用 "动态模型" 应对 "变化中的问题"', content: '你开了家社区书店，刚盈利 3 个月，旁边突然开了家连锁书店，你的客流量掉了 40%，你会：', options: [ { text: '"用\'静态模型\'降价竞争"', feedback: '跟着连锁书店打 "8 折促销"，结果利润变薄，撑了 2 个月还是关店了。' }, { text: '"用\'系统动力学模型\'看变化"', feedback: '你看到了问题的\'动态变化\'！《好好思考》说\'商业像生态系统，不是静态对抗，而是找到动态平衡\'-- 就像草原上，狮子和羚羊不是你死我活，而是共同进化～' }, { text: '"转型做\'网红打卡店\'"', feedback: '花大价钱装修，主打 "拍照好看"，吸引了一波新客，但没人真的买书，3 个月后热度过去，还是没生意。' } ], correctIndex: 1 },
          { id: 'scene_5_3', title: '用 "概率思维" 应对 "不确定性"', content: '你有 10 万元想投资，朋友推荐了三个方向：A 是 "稳赚 5%" 的国债，B 是 "有 60% 概率赚 20%、40% 概率亏 10%" 的基金，C 是 "有 30% 概率翻倍、70% 概率亏 50%" 的股票，你会：', options: [ { text: '"求稳，全买国债"', feedback: '一年后赚了 5000 元，但通胀率有 3%，实际只多了 2000 元，心里有点不甘心。' }, { text: '"用\'概率组合\'分散风险"', feedback: '你学会了和\'不确定性\'做朋友！《好好思考》说\'世界本质是概率的，高手不是赌运气，而是计算概率并做好组合\'-- 就像下雨带伞，不是知道一定会下雨，而是为\'可能下雨\'做准备～' }, { text: '"赌一把，全买股票"', feedback: '想着 "万一翻倍了呢"，结果半年后亏了 40%，赶紧割肉，剩下的钱再也不敢投资了。' } ], correctIndex: 1 },
        ]
      }
    ]
  },
  {
    id: 'game_theory',
    series: '策略互动系列',
    title: '《博弈论》',
    description: '掌握"多方互动"逻辑，理解纳什均衡与囚徒困境',
    progress: '0/3关卡已解锁',
    stars: 0,
    reward: 5,
    color: 'neon-purple',
    icon: 'fa-chess',
    locked: false,
    levels: [
        { id: 'game_1', title: '囚徒困境：合作与背叛', description: '与同伴同时被捕，你们会选择合作还是互相出卖？', status: 'unlocked', reward: 5 },
        { id: 'game_2', title: '纳什均衡：职场竞价', description: '面对公司内部的岗位竞拍，你如何出价才能获得最大收益？', status: 'locked', reward: 7 },
        { id: 'game_3', title: '信息不对称：二手车交易', description: '作为买家，你如何判断一辆二手车的真实状况并给出合理报价？', status: 'locked', reward: 7 },
    ]
  },
  {
    id: 'scarcity',
    series: '资源管理系列',
    title: '《稀缺》',
    description: '理解稀缺心态如何扭曲决策，学会创造"余闲"',
    progress: '解锁条件: 完成3个认知关卡',
    stars: 0,
    reward: 20,
    color: 'gray',
    icon: 'fa-hourglass',
    locked: true,
    levels: []
  },
];

const BookCard = ({ book, onBookSelect, isAuthenticated }) => {
  const handleCardClick = () => {
    // If not authenticated or book is locked, do nothing.
    if (!isAuthenticated || book.locked) {
      return;
    }
    onBookSelect(book);
  };

  const isClickable = !book.locked && isAuthenticated;

  const colorClasses = {
    'neon-blue': 'border-neon-blue/30 text-neon-blue shadow-glow-neon-blue-soft hover:shadow-glow-neon-blue',
    'neon-pink': 'border-neon-pink/30 text-neon-pink shadow-glow-neon-pink-soft hover:shadow-glow-neon-pink',
    'neon-purple': 'border-neon-purple/30 text-neon-purple shadow-glow-neon-purple-soft hover:shadow-glow-neon-purple',
    'neon-green': 'border-neon-green/30 text-neon-green shadow-glow-neon-green-soft hover:shadow-glow-neon-green',
    'neon-yellow': 'border-neon-yellow/30 text-neon-yellow shadow-glow-neon-yellow-soft hover:shadow-glow-neon-yellow',
    'gray': 'border-gray-800 text-gray-500'
  };

  const glowBgClasses = {
      'neon-blue': 'bg-neon-blue/20',
      'neon-green': 'bg-neon-green/20',
      'neon-purple': 'bg-neon-purple/20',
      'neon-pink': 'bg-neon-pink/20',
      'neon-yellow': 'bg-neon-yellow/20',
  };

  const iconBgClasses = {
    'neon-blue': 'bg-neon-blue/10',
    'neon-green': 'bg-neon-green/10',
    'neon-purple': 'bg-neon-purple/10',
    'neon-pink': 'bg-neon-pink/10',
    'neon-yellow': 'bg-neon-yellow/10',
    'gray': 'bg-gray-800'
  };
  
  const iconColorClasses = {
    'neon-blue': 'text-neon-blue',
    'neon-green': 'text-neon-green',
    'neon-purple': 'text-neon-purple',
    'neon-pink': 'text-neon-pink',
    'neon-yellow': 'text-neon-yellow',
    'gray': 'text-gray-600'
  };

  const getStarRating = (stars) => {
    let rating = [];
    for(let i=0; i < 5; i++) {
      rating.push(
        <i key={i} className={`fa fa-star ${i < stars ? 'text-yellow-400' : 'text-gray-600'}`}></i>
        );
    }
    return rating;
  };

  return (
    <div 
      className={`bg-dark-800/70 backdrop-blur-md rounded-lg p-4 transition-all duration-300 relative overflow-hidden group ${colorClasses[book.color]} ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
      onClick={handleCardClick}
    >
      {book.locked && (
        <div className="absolute inset-0 bg-dark-900/40 flex items-center justify-center z-10">
          <div className="text-gray-500 text-center">
            <i className="fa fa-lock text-2xl mb-1"></i>
            <div>{book.progress}</div>
          </div>
        </div>
      )}
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full filter blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowBgClasses[book.color]}`}></div>
        <div className="flex justify-between items-start">
          <div>
            <div className={`font-bold mb-1 ${book.color === 'gray' ? 'text-gray-500' : ''}`}>{book.series}</div>
            <h3 className={`text-xl font-semibold mb-2 ${book.color === 'gray' ? 'text-gray-400' : 'text-white'}`}>{book.title}</h3>
            <p className={`text-sm mb-3 ${book.color === 'gray' ? 'text-gray-600' : 'text-gray-400'}`}>{book.description}</p>
            {!book.locked && (
                <div className="flex items-center text-sm">
                    <div className="flex mr-3">{getStarRating(book.stars)}</div>
                    <span className="text-gray-500">{book.progress}</span>
            </div>
            )}
          </div>
          <div className={`w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgClasses[book.color]}`}>
            <i className={`fa ${book.icon} ${iconColorClasses[book.color]}`}></i>
          </div>
        </div>
        <div className={`mt-3 text-xs px-2 py-1 rounded-full inline-block ${book.locked ? 'bg-gray-800/50 text-gray-500' : 'bg-web3-primary/10 text-web3-primary'}`}>
            <i className="fa fa-diamond mr-1"></i> 
            {book.locked ? `解锁可获${book.reward} MIND` : `累计获得${book.reward} MIND`}
      </div>
    </div>
  );
}

const CampaignContent = ({ onBookSelect, isAuthenticated }) => {
  // onBookSelect can be used inside onClick for each book
  // e.g., onClick={() => onBookSelect(book)}

  return (
    <div id="campaignMode" className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">选择书页关卡</h2>
        <button 
          disabled={!isAuthenticated}
          className={`text-neon-pink hover:text-neon-pink/80 transition-colors ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <i className="fa fa-star"></i> 每日认知挑战
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onBookSelect={onBookSelect} isAuthenticated={isAuthenticated} />
        ))}
      </div>
    </div>
  );
};

export default CampaignContent;
