《give you a color see see》需求文档（PRD）
一、产品定位
名称：give you a color see see
风格：web3、赛博、冷幽默、扎心、色彩丰富、动效酷炫
目标用户：喜欢新奇、色彩、占卜、解压小游戏的年轻人、互联网用户
核心卖点：输入名字和随机词，生成专属颜色占卜结果和塔罗角色，配合2大解压互动小游戏，提升趣味性和分享欲。
二、主要功能
1. 颜色占卜（主线功能）
用户在首页输入“名字”和“随机词”，点击“开始占卜”。
系统根据输入内容生成hash
展示内容包括：颜色名称、配色方案、塔罗角色、冷幽默扎心文案（中英文）、主色块和配色可视化。
支持一键复制/分享结果。
2. 解压泡泡小游戏
进入后随机生成20个异形泡泡（三角、星形、云朵等），每个泡泡颜色、表情不同。
用户点击泡泡，泡泡爆炸并出现表情包彩蛋。
全部戳爆后触发全屏撒花动画，5秒后自动重置。
提供“返回首页”“重置游戏”按钮。
3. 敲木鱼
用户点击木鱼，每敲击生成1个彩色泡泡，泡泡内随机显示词汇（如“功德+1”、“humor+100”、“内耗-99”等）。
支持连续快速敲击，泡泡可堆叠。
提供“返回首页”按钮。
三、页面结构
1. 首页
网站LOGO/名称
简要介绍/标语
输入区（名字+随机词）
“开始占卜”按钮
占卜结果展示区（颜色名、配色、塔罗角色、文案、主色块、配色方案色块）
三个小游戏入口按钮（解压泡泡、许愿池、敲木鱼）
2. 解压泡泡页
20个异形泡泡（SVG/Canvas绘制）
戳破动画、表情包
全部爆炸后撒花动画
“返回首页”“重置游戏”按钮
3. 敲木鱼页
木鱼动画/按钮
每敲击生成彩色泡泡，随机词汇
连击支持
“返回首页”按钮
四、交互与动效
整体深色+高饱和度霓虹色渐变背景，web3氛围。
输入区、按钮、结果区均有发光、阴影、圆角、动效。
占卜结果区主色块大面积展示，配色方案用色块可视化。
小游戏入口按钮悬浮发光、点击缩放反馈。
支持移动端响应式布局。
五、数据与算法
颜色文案分为三组（冷幽默扎心组、自然科技融合组、能量珍宝组），每组包含：中文名、英文名、RGB、描述、配色方案、塔罗角色。
用户输入内容生成hash，优先匹配冷幽默扎心组，若无则降级。
颜色文案以JSON文件存储，便于维护和扩展。
六、技术建议
前端框架：React + Vite
动画库：Framer Motion
路由：react-router-dom
截图分享：html2canvas
移动端适配：CSS Flexbox/Media Query
七、后续可扩展
用户自定义配色/文案
占卜结果生成图片分享
小游戏排行榜/成就系统
web3钱包/链上互动（如NFT色卡，开发中）



语料库：
自然科技融合组

星尘青｜Stardust Cyan #80F3F3
承载星云诞生的淡青粒子
Nebula-born cyan particles drifting through cosmic dust
▫️黑色 / Black #000000
▫️白色 / White #FFFFFF
▫️浅褐 / Light Brown #D2B48C
塔罗角色：星星牌 / The Star（宇宙信使·星尘罗盘）

岩浆洋红｜Magma Magenta #FF00A6
地心涌动时喷溅的炽热印记
Molten imprint erupting from Earth's intense core
▫️深灰 / Dark Gray #696969
▫️米白 / Beige #F5F5DC
▫️金色 / Gold #FFD700
塔罗角色：权杖骑士 / Knight of Wands（地核能量驾驭者·熔岩战马）

极光青柠｜Aurora Lime #B4FF5A
电离层与氧原子碰撞的酸绿弧光
Acid-green lightning birthed by solar wind & atmosphere
▫️深蓝 / Navy Blue #00008B
▫️炭黑 / Charcoal Black #333333
▫️奶油白 / Cream White #FFFDD0
塔罗角色：愚人牌 / The Fool（电离层旅人·青柠闪电）

冻湖蓝绿｜Frozen-Lake Teal #008080
封存千年冰川的透冷呼吸
Millennia of glacial breath sealed in turquoise ice
▫️雪白 / Snow White #FFFAFA
▫️橄榄绿 / Olive Green #6B8E23
▫️水泥灰 / Concrete Gray #808080
塔罗角色：隐士牌 / The Hermit（冰川智者·冰晶权杖）

暗物质靛蓝｜Dark-Matter Indigo #2E004F
宇宙沉默本源的深邃印记
Profound imprint of the cosmos' silent essence
▫️银灰 / Silver Gray #C0C0C0
▫️橙红 / Orange Red #FF4500
▫️纯黑 / Pure Black #000000
塔罗角色：世界牌 / The World（宇宙观测者·暗物质斗篷）

量子紫罗兰｜Quantum Violet #7E4ECF
纠缠态下的概率波花瓣
Probability wave petals in quantum superposition
▫️纯白 / Pure White #FFFFFF
▫️草绿 / Grass Green #7CFC00
▫️中灰 / Medium Gray #708090
塔罗角色：魔术师 / The Magician（概率波操纵者·紫罗兰权杖）

呼吸珊瑚｜Breathing Coral #FF7F6B
共生藻与碳酸钙的粉橘潮汐
Symbiotic algae painting coral reefs in sunset hues
▫️天蓝 / Sky Blue #87CEEB
▫️藏青 / Dark Blue #000080
▫️沙棕 / Sand Brown #F4A460
塔罗角色：恋人牌 / The Lovers（共生守护者·珊瑚心锁）

溯溪鲑鱼｜Upstream Salmon #FF6B6B
逆流剖开瀑布的橙红勇气
Orange-red defiance splitting waterfalls upstream
▫️水蓝 / Water Blue #1E90FF
▫️苔绿 / Moss Green #8FBC8F
▫️卵石灰 / Pebble Gray #DCDCDC
塔罗角色：力量牌 / Strength（逆流勇者·鲑鱼鳞甲）

静电场薰衣草｜Static-Lavender #E6CCFF
摩擦起电的蓬松离子云
Fluffy ion clouds sparked by sweater friction
▫️石墨黑 / Graphite Black #000000
▫️蜂蜡黄 / Beeswax Yellow #FFD700
▫️雾白 / Mist White #F8F8FF
塔罗角色：女祭司 / The High Priestess（静电磁场先知·离子经文）

陨石薄荷｜Meteorite Mint #00FFC0
镍铁陨石坠入薄荷田的星痕
Cosmic scar where meteorite kissed mint fields
▫️铁锈棕 / Rust Brown #8B4513
▫️星银 / Star Silver #E5E4E2
▫️夜空黑 / Night Black #0C0C0C
塔罗角色：战车牌 / The Chariot（星际旅人·陨铁车轮）

地核桃｜Earth-Core Peach #FFAA80
熔岩流包裹橄榄石的核心结晶
Olivine crystallization in honeyed lava streams
▫️橄榄绿 / Olive Green #6B8E23
▫️熔岩红 / Lava Red #CF1020
▫️岩灰 / Rock Gray #808080
塔罗角色：皇后牌 / The Empress（大地之母·熔岩王座）

蛋白石奶油｜Opal Cream #FFF8E6
欧泊变彩晕染的晨雾奶霜
Opal's fire diffused in morning mist cream
▫️晨蓝 / Dawn Blue #B0E0E6
▫️虹彩紫 / Iridescent Purple #DA70D6
▫️沙褐 / Sand Brown #D2B48C
塔罗角色：太阳牌 / The Sun（晨光使者·蛋白石冠冕）

古卷象牙｜Ancient-Scroll Ivory #FFFFF0
羊皮纸沁入时光的温润钝色
Time-softened parchment drinking centuries of light
▫️羊皮黄 / Parchment Yellow #F5DEB3
▫️墨黑 / Ink Black #000000
▫️铜绿 / Verdigris #43B3AE
塔罗角色：教皇牌 / The Hierophant（古老智慧守护者·象牙经卷）

沙暴米色｜Sandstorm Beige #D2B48C
风蚀岩壁剥落的旷野诗篇
Desert poetry peeled off wind-scoured cliffs
▫️沙漠橙 / Desert Orange #ED9121
▫️风暴灰 / Storm Gray #4D4D4D
▫️绿洲蓝 / Oasis Blue #008080
塔罗角色：命运之轮 / Wheel of Fortune（流沙预言者·时沙罗盘）

陶土棕褐｜Terracotta Tan #E2725B
被窑火定格的陶轮指纹
Potter's fingerprints fired eternal in kiln flames
▫️窑红 / Kiln Red #B22222
▫️陶灰 / Clay Gray #A9A9A9
▫️釉蓝 / Glaze Blue #1E90FF
塔罗角色：工匠牌 / The Artisan（手作灵魂·旋转陶轮）

火山栗｜Volcanic Maroon #800020
玄武岩孔洞渗出的矿物结晶
Mineral crystallization weeping from basalt's pores
▫️玄武黑 / Basalt Black #1C1C1C
▫️火山灰 / Volcanic Ash #BEBEBE
▫️地热橙 / Geothermal Orange #FF4500
塔罗角色：蜕变牌 / Transformation（地火重塑者·玄武岩刻刀）

能量珍宝组

深潜海军蓝｜Deep-Dive Navy #000080
马里亚纳海沟的压强具象化
Pressure of Mariana Trench distilled into dark blue ink
▫️浪花白 / Foam White #F5FFFA
▫️珊瑚金 / Coral Gold #FF7F50
▫️月光银 / Moon Silver #C0C0C0
塔罗角色：皇帝牌 / The Emperor（深海统治者·三叉戟权杖）

锈蚀橄榄｜Rust-Olive #4A5D23
铜绿与苔藓共生的工业记忆
Moss and patina coexisting on derelict oil drums
▫️铁锈红 / Rust Red #8B4513
▫️苔藓绿 / Moss Green #8A9A5B
▫️水泥灰 / Concrete Gray #808080
塔罗角色：隐者牌 / The Hermit（时光观察者·铜绿罗盘）

脉冲绿松石｜Pulsar Turquoise #40E0D0
中子星每秒642次的宇宙脉动
642-beats-per-minute cosmic pulse of a stellar remnant
▫️深空黑 / Space Black #000000
▫️荧光紫 / Neon Purple #9400D3
▫️铂金白 / Platinum White #E5E4E2
塔罗角色：命运之轮 / Wheel of Fortune（星轨捕手·脉冲指针）

蛇眼祖母绿｜Serpent-Eye Emerald #50C878
宝石内部游动的生命丝纹
Silky life-veins slithering in gemstone depths
▫️墨黑 / Jet Black #000000
▫️鳞光金 / Scale Gold #D4AF37
▫️翡翠白 / Jade White #F8F6F0
塔罗角色：月亮牌 / The Moon（秘宝守护者·晶瞳幻影）

裂变红宝石｜Fission Ruby #E0115F
粒子对撞机内的能量绽放
Energy bloom in a particle collider's heart
▫️纯黑 / Pure Black #000000
▫️鎏金 / Liquid Gold #FFD700
▫️珍珠贝 / Pearl Shell #F8F6F0
塔罗角色：战车牌 / The Chariot（量子骑士·红宝石甲胄）

引力蓝宝石｜Gravitational Sapphire #0F52BA
扭曲时空的曲率之蓝
Blue curvature of light-bending spacetime
▫️日光黄 / Sun Yellow #FFFF00
▫️星云白 / Nebula White #F5F5DC
▫️暗物质灰 / Dark Matter Gray #2F4F4F
塔罗角色：正义牌 / Justice（维度裁决者·蓝宝石天平）

幻光紫晶｜Phantom-Light Amethyst #9966CC
神经末梢的萤火微光
Neural-firefly glow in sensory pathways
▫️神经白 / Nerve White #FFFFF0
▫️幽灵灰 / Phantom Gray #708090
▫️霓虹粉 / Neon Pink #FF6EC7
塔罗角色：吊人牌 / The Hanged Man（灵觉先知·紫晶锁链）

星爆黄玉｜Star-Burst Topaz #FFC87C
超新星遗骸中的柠檬晶核
Lemon-hued stellar core forged in supernova debris
▫️深空蓝 / Cosmic Blue #001F3F
▫️星尘银 / Stardust Silver #E5E4E2
▫️熔岩橙 / Lava Orange #FF4500
塔罗角色：太阳牌 / The Sun（星核携带者·黄玉光冕）

深海珍珠｜Abyssal Pearl #F8F6F0
砗磲凝炼的月光胶囊
Moonlight capsules forged by giant clam's essence
▫️海沫蓝 / Sea Foam Blue #87CEEB
▫️珊瑚粉 / Coral Pink #FF6B6B
▫️沉船褐 / Shipwreck Brown #8B4513
塔罗角色：女祭司 / The High Priestess（深渊歌者·珍珠光茧）

龙息翡翠｜Dragon-Breath Jade #00A86B
火山淬炼的玻陨石绿焰
Volcanic glass forged in dragonfire eruption
▫️熔岩红 / Lava Red #CF1020
▫️龙鳞黑 / Dragon Scale Black #1C1C1C
▫️硫磺黄 / Sulfur Yellow #FFD700
塔罗角色：力量牌 / Strength（龙焰驾驭者·翡翠鳞爪）

虫珀｜Amber-Encased-Insect  
#FFBF00
树脂封存的白垩纪暮光
Cretaceous twilight preserved in golden tree resin
▫️树皮褐 / Bark Brown #654321
▫️古铜绿 / Patina Green #43B3AE
▫️萤火黄 / Firefly Yellow #FFFF00
塔罗角色：蜕变牌 / Transformation（时空凝滞者·琥珀晶匣）

冥王玛瑙｜Pluto-Onyx #353839
柯伊伯带冰岩的星际密语
Interstellar coded message from Kuiper Belt's ice dwarf
▫️冰原白 / Icefield White #F0FFFF
▫️星环银 / Ring Silver #C0C0C0
▫️彗尾蓝 / Comet Blue #1E90FF
塔罗角色：审判牌 / Judgment（深空信使·玛瑙星碑）

碳晶钻石｜Carbon-Crystal Diamond #FFFFFF
地幔高压缔造的绝对纯粹
Absolute purity crafted under mantle's force
▫️矿层黑 / Ore Black #1A1A1A
▫️岩浆橙 / Magma Orange #FF4500
▫️冰蓝 / Ice Blue #99FFFF
塔罗角色：世界牌 / The World（永恒切割者·钻石棱镜）



冷幽默扎心组
1. 通灵WiFi青｜Medium-WiFi Cyan #00FFFF)
信号波动连接异次元
Dimensional signal fluctuation (1 bar = 1 glitch)
配色方案
▫️ 深红 / Dark Red #8B0000
▫️ 中灰 / Medium Gray #696969
▫️ 米白 / Beige #F8F8FF
塔罗角色：逆位祭司 / The Hierophant Reversed（信号旅人·波动法杖）

2. 多巴胺戒断洋红｜Dopamine-Crash Magenta (RGB: #FF0090)
刷爆信息流后的认知过载
Cognitive overload after endless scrolling
配色方案
▫️ 灰色 / Gray #808080
▫️ 粉红 / Pink #FFC0CB
▫️ 深灰 / Dark Gray #0A0A0A
塔罗角色：逆位女皇 / The Empress Reversed（能量透支者·破碎能量石）

3. 电子木鱼青柠｜E-Monkfish Lime (RGB: #80FF00)
赛博禅意系统（专注+1/干扰+100）
Cyber zen system (focus↑ / distractions↑↑)
配色方案
▫️ 黄色 / Yellow #FFD700
▫️ 黑色 / Black #000000
▫️ 紫色 / Purple #800080
塔罗角色：逆位教皇 / The Hierophant Reversed（数字修行者·数据木鱼）

4. 工牌勒痕蓝绿｜ID-Lanyard-Strangle Teal (RGB: #008080)
职场身份牌的时光印记
Timeless imprint of corporate identity
配色方案
▫️ 浅褐 / Light Brown #D2B48C
▫️ 红色 / Red #FF0000
▫️ 深灰 / Dark Gray #1C1C1C
塔罗角色：逆位战车 / The Chariot Reversed（职场漫游者·工牌指南针）

5. 赛博风湿紫罗兰｜Cyber-Rheumatism Violet (RGB: #8A2BE2)
数字生活催化的关节早熟
Digitally accelerated joint maturity
配色方案
▫️ 白色 / White #FFFFF0
▫️ 棕色 / Brown #8B4513
▫️ 灰色 / Gray #A9A9A9
塔罗角色：逆位力量 / Strength Reversed（青年智者·智能护膝）

6. 胰岛素警戒珊瑚｜Insulin-Alert Coral #FF7F50
甜蜜陷阱的生理警报
Physiological alert from sweet indulgence
配色方案
▫️ 棕色 / Brown #B5651D
▫️ 红色 / Red #DC143C
▫️ 银色 / Silver #C0C0C0
塔罗角色：逆位节制 / Temperance Reversed（能量管理者·糖分检测仪）

7. PPT夺魂薰衣草｜Soul-Sucking-PPT Lavender (RGB: #E6E6FA)
深夜荧幕的思维虹吸
Mind-draining glow of late-night screens
配色方案
▫️ 红色 / Red #FF6B6B
▫️ 黑色 / Black #000000
▫️ 深棕 / Dark Brown #4B3621
塔罗角色：逆位恶魔 / The Devil Reversed（创意囚徒·荧光笔锁链）

8. 胶原蛋白桃｜Collagen-Loss Peach #FFE5B4
时光加速仪的面部显影
Facial imprint of accelerated timelines
配色方案
▫️ 米白 / Beige #FFF5EE
▫️ 紫色 / Purple #800080
▫️ 金色 / Gold #FFD700
塔罗角色：逆位星星 / The Star Reversed（焕新使者·活力权杖）

9. 元宇宙吃土｜MetaVerse Dirt-Eating #556B2F
数字资产缩水的像素化显影
Pixelated manifestation of digital asset shrinkage
配色方案
▫️ 绿色 / Green #556B2F
▫️ 灰色 / Gray #808080
▫️ 黄色 / Yellow #ADFF2F
塔罗角色：逆位世界 / The World Reversed（虚拟拓荒者·数据沙漏）

10. 乙里乙气紫｜Customer-Service Purple #A020F0
服务话术结晶的情绪化石
Fossilized emotions from service scripts
配色方案
▫️ 黄色 / Yellow #FFD700
▫️ 灰蓝 / Gray Blue #778899
▫️ 深红 / Dark Red #8B0000
塔罗角色：逆位正义 / Justice Reversed（沟通艺术家·微笑面具）

11. 摸鱼奶油｜Loafing Cream (RGB: #FFFDD0)
带薪沉思的奶油色结界
Buttery dimension of paid contemplation
配色方案
▫️ 米白 / Beige #F8F8FF
▫️ 浅黄 / Light Yellow #FFFFE0
▫️ 暖白 / Warm White #FFFAF0
塔罗角色：逆位愚人 / The Fool Reversed（时间管理师·摸鱼计时器）

12. 工位真菌蓝｜Cubicle Fungus Blue (RGB: #1F75FE)
电子生态培育的共生微光
Symbiotic glow in digital ecosystems
配色方案
▫️ 深蓝 / Deep Blue #00008B
▫️ 浅蓝 / Light Blue #ADD8E6
▫️ 中灰 / Medium Gray #696969
塔罗角色：正位魔术师 / The Magician（数据培育者·代码魔杖）

13. AirDrop社死薄荷｜AirDrop-Fail Mint (RGB: #98FF98)
误触传输的瞬间凝滞
Frozen moment of accidental sharing
配色方案
▫️ 草绿 / Grass Green #7CFC00
▫️ 浅绿 / Light Green #90EE90
▫️ 雪白 / Snow White #FFFAFA
塔罗角色：逆位恋人 / The Lovers Reversed（信息信使·撤回箭矢）


14. 调休鲑鱼｜Shift-Swap Salmon (RGB: #FA8072)
假期拼图人的橙红征程
Orange-red journey of holiday puzzlers
配色方案
▫️ 鲑鱼红 / Salmon Red #FA8072
▫️ 深红 / Dark Red #8B0000
▫️ 米褐 / Beige Brown #F5DEB3
塔罗角色：逆位战车 / The Chariot Reversed（假期工程师·调休拼图）

15. 量子波动靛蓝｜Quantum-Fluctuation Indigo (RGB: #4B0082)
金融玄学的可视化界面
Visual interface of financial metaphysics
配色方案
▫️ 靛蓝 / Indigo #4B0082
▫️ 深紫 / Deep Purple #4A148C
▫️ 银灰 / Silver Gray #C0C0C0
塔罗角色：正位星星 / The Star（财富导航员·K线水晶球）