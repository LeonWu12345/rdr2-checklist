
function mainApp(initialState){
  "use strict";

  /* ---------------------------------------------------------------- */
  /* DATA HELPERS                                                       */
  /* ---------------------------------------------------------------- */
  function I(id, t, l, c, tg, n, en){
    return { id:id, t:t, en:en||'', l:l||'', c:c||'', tg:tg?tg.split(','):[], n:n||'' };
  }

  // Total Completion (official in-game checklist) item helper.
  // link: informational/linkage note shown under the row (calmer styling than row-note).
  // computed: true for auto-computed (read-only) rows driven by THRESHOLD_LINKS.
  function T(id, t, en, link, computed){
    var it = I(id, t, '', '', '', '', en);
    if (link) it.link = link;
    if (computed) it.computed = true;
    return it;
  }

  var TAG_META = {
    missable: { cls:'chip-missable', label:'⚠️ 绝版预警', labelEn:'⚠️ Missable' },
    honor:    { cls:'chip-honor',    label:'♦ 荣誉关联', labelEn:'♦ Honor-Linked' },
    special:  { cls:'chip-honor',    label:'⚠️ 特殊 · 无法正常捕获', labelEn:'⚠️ Special · Non-catchable' }
  };

  /* ---------------------------------------------------------------- */
  /* CATEGORY A — 支线任务与营地请求                                     */
  /* ---------------------------------------------------------------- */
  var A_ITEMS = [
    I('a1','历史的罪孽','罗德斯火车站外 · Jeremiah Compson','','','前置:主线《一个诚实的错误》','The Iniquities of History'),
    I('a2','渔夫的收获','Flat Iron Lake · Jeremy Gill 钓鱼小屋','','','3条传说鱼需尾声才能钓','A Fisher of Fish'),
    I('a3','借贷与其他罪过(I-VII)','营地 · 找 Leopold Strauss','','honor','收债时的选择影响荣誉值,建议走温和路线','Money Lending and Other Sins'),
    I('a4','公爵夫人与其他动物','圣丹尼斯 · Algernon 的温室','','','共6部分,奖励稀有帽子与左轮手枪','Duchesses and other Animals'),
    I('a5','艺术家之道','圣丹尼斯 · Doyle\'s Tavern','','','解锁东部传说套装藏宝链前置',"The Artist's Way"),
    I('a30','粉墨登场','范霍恩贸易站酒馆 · Miss Marjorie','','','2段正文+1个圣丹尼斯剧院彩蛋(额外$40)','The Smell of the Grease Paint'),
    I('a31','业余爱好者的世外桃源','草莓镇东南 · Albert Mason','','','共5部分;尾声用约翰做时第3部分(赶马)可能被跳过','Arcadia for Amateurs'),
    I('a32','募捐者','圣丹尼斯西北,裁缝店附近 · 募捐女士','','missable','⚠️仅第六章结束前可完成,尾声不再提供','Fundraiser'),
    I('a33','美国梦(连环杀手)','终点:瓦伦丁西南 Lucky\'s Cabin · Edmund Lowry Jr','','','需先在3处案发现场拾取线索拼图拼成地图才会触发','American Dreams'),
    I('a34','一个美好的夜晚','拉格拉斯西北沼泽 · 神秘"卡真人"','','','⚠️需先触发4个夜间偶遇之一(火把队伍/游荡暗影/受惊的马/诡异人声)才会解锁,仅22:00-5:00','A Fine Night For It'),
    I('a35','他当然是英国人','祖母绿牧场以南,新汉诺威 · Margaret(马戏团)','','','共5部分,奖励狮爪饰品','He\'s British, of Course'),
    I('a36','好心没好报','罗德斯东北,斯嘉丽草甸 · Alphonse Renaud 医生','完成第三章《美国式蒸馏》后','','仅6:00-18:00可触发','No Good Deed'),
    I('a37','噢,兄弟','瓦伦丁杂货店 · Proetus & Acrisius 兄弟','','','共3部分,跨约3个游戏日才能推进完','Oh, Brother'),
    I('a38','聪明的天才男孩','圣丹尼斯西南公园 · Marko Dragic','完成第四章《文明的乐趣》后','','共3部分,第2部分需雷雨天气,第3部分需等48小时','A Bright Bouncing Boy'),
    I('a39','知识的仁慈','圣丹尼斯东北,巴约努瓦 · Andrew Bell III','完成第四章《文明的乐趣》后','','共7部分,长线任务','The Mercies of Knowledge'),
    I('a40','深深的羁绊','罗德斯外,斯嘉丽草甸 · Wendell White & Sampson Black','完成第四章《文明的乐趣》后','honor','共5部分;⚠️若选择把逃犯抓去领赏而非帮助,任务线会提前中断','The Ties That Bind Us'),
    I('a41','帮助兄弟(教派系列)','圣丹尼斯东部 · Brother Dorkins,后续接 Sister Calderón','','','后续两段剧情(万事皆兄弟姐妹→人与天使之间)会在营地转移到熊瀑营地后继续','Help a Brother Out'),
    I('a42','新手入门:理想与实用主义','圣丹尼斯西北,市长官邸 · Henri Lemieux','完成第四章《镀金的牢笼》后','honor','共3部分,仅22:00-5:00;第3部分是否杀死 Jean Marc 是荣誉分支(杀=商店95折但失荣誉)','Idealism and Pragmatism for Beginners'),
    I('a43','Willard\'s Rest 的寡妇','罗诺克岭 Willard\'s Rest 农场 · Charlotte Balfour','完成第五章《岔路口》后','','共3部分,可多次返回推进','The Widow of Willard\'s Rest'),
    I('a44','老人的智慧','范霍恩贸易站以西,罗诺克岭 · Obediah Hinton','完成第五章《瞬间的欢愉》后','','共5部分;经核实与关瓜(Guarma)/新奥斯汀无关,全程在新汉诺威完成','The Wisdom of the Elders'),
    I('a45','老兵','O\'Creagh\'s Run 附近,新汉诺威 · Hamish Sinclair','','','共4部分,全部发生在新汉诺威/西伊丽莎白境内,第4部分 Hamish 会牺牲','The Veteran'),
    I('a46','燃烧的美国炼狱','草莓镇西南山岬 · Evelyn Miller','完成尾声第一部分《绅士之家》后','epilogue','共5部分,仅6:00-18:00可触发','The American Inferno, Burnt Out'),
    I('a47','找遍天涯海角','新汉诺威 · 哈特兰油田南侧营地 · 威廉','第二章起','','首次交付4株西洋蓍草即可完成任务线；后续草药请求属于随机遭遇','To the Ends of the Earth'),
    I('a48','真爱易逝（I–III）','马掌望台 · 亚瑟帐篷内的玛丽来信','第二章，阅读玛丽来信后','missable,honor','需答应帮助玛丽；本任务是《曾经的梦想》的前置','We Loved Once and True (I–III)'),
    I('a49','火上浇油（I–II）','马掌望台 · 约翰','第二章，接受约翰的运油马车计划后','missable,honor','','Pouring Forth Oil (I–II)'),
    I('a50','真爱之路（IV–V）','布莱斯韦特庄园 · 佩内洛普','第六章，完成第三章《真爱之路 I–III》后','missable,honor','阅读佩内洛普的来信后触发','The Course of True Love (IV–V)'),
    I('a51','曾经的梦想（I–II）','圣丹尼斯 · 亚瑟住处内的玛丽来信','第四章，完成《真爱易逝》后','missable,honor','','Fatherhood and Other Dreams (I–II)'),
    I('a52','毋须宽恕（I–II）','安尼斯堡 · 伊迪丝·唐斯','第六章，完成《岔路口》且荣誉等级达到4级','missable,honor','必须在《我们最美好的自己》前完成','Do Not Seek Absolution (I–II)'),
    I('a53','考古学入门','瓦匹缇印第安保留地 · 落雨','第六章，完成《愤怒释放》并答应查尔斯去帮助落雨','missable,honor','全程不杀人可获得猫头鹰羽毛饰品','Archeology for Beginners'),
    I('a54','盗亦有道','瓦匹缇印第安保留地 · 门罗上尉','第六章，在《考古学入门》中答应帮助门罗','missable,honor','','Honor, Amongst Thieves'),
    I('a55','寡妇莎迪·阿德勒（I–II）','河狸岩洞营地 · 莎迪','第六章，完成《再见，亲爱的朋友》后','missable,honor','','Mrs. Sadie Adler, Widow (I–II)'),
    I('a6','Abigail 的营地请求','营地','','missable','需 $5'),
    I('a8','Javier 的营地请求','营地','','missable','需夹竹桃(Oleander)'),
    I('a9','Mary Beth 的营地请求','营地','','missable','需钢笔'),
    I('a10','Jack 的营地请求(惊悚小说)','营地,《渔夫之人》任务后','','missable','需 Penny Dreadful 小说'),
    I('a11','Jack 的营地请求(顶针)','营地','第二章','missable','完成上一条后随机掉落获得'),
    I('a12','Pearson 的营地请求(兔子)','营地','','missable','奖励蓝色牛仔布侦察夹克'),
    I('a13','Pearson 的营地请求(罗盘)','营地,和他打扑克','','missable','需航海罗盘'),
    I('a14','Bill 的营地请求','营地','','missable','需发油'),
    I('a15','Charles 的营地请求(夹竹桃)','营地','','missable','需夹竹桃'),
    I('a16','Charles 的营地请求(私酿酒)','营地','','missable','需私酿酒'),
    I('a17','Charles 的营地请求(鹰羽毛)','营地','','epilogue',''),
    I('a18','Dutch 的营地请求','营地','','missable','需烟斗'),
    I('a19','Hosea 的营地请求(人参)','营地 · 多米诺骨牌桌旁','','missable','需 2× 美国人参'),
    I('a20','Hosea 的营地请求(书)','营地','','missable','《迷雾中的鼩鼱》一书'),
    I('a21','Lenny 的营地请求','营地','','missable','需怀表'),
    I('a22','Molly 的营地请求','营地内随机搭话','','missable','需口袋镜(Martha\'s Swain 附近)'),
    I('a23','Kieran 的营地请求','营地 · 马厩区域','','missable','需 2× 牛蒡根'),
    I('a24','Sadie 的营地请求','营地,《进一步的问题》任务后','','missable','需口琴'),
    I('a25','Sean 的营地请求','营地内直接找 Sean','','missable','需肯塔基波旁威士忌 —— Sean 会在第三章早期剧情牺牲'),
    I('a26','Susan 的营地请求','营地','','missable','需 2× 牛至'),
    I('a27','Tilly 的营地请求','营地 · 多米诺骨牌桌','','missable','需项链'),
    I('a28','Uncle 的营地请求(尾声)','营地','','epilogue','需5种材料:波旁/乳草/薄荷/发油/死臭鼬,奖励服装+荣誉'),
    I('a29','和 Sean 一起入室抢劫','克莱蒙斯岬营地 · Sean 主动邀请','第三章','','随 Sean 离队永久消失','Home Robbery with Sean'),
    I('ca_lenny_fff','和蓝尼玩快刀戳指缝','马掌望台营地 · 等待蓝尼邀请','第二章','missable','','Five Finger Fillet with Lenny'),
    I('ca_charles_hunt','和查尔斯打猎','马掌望台营地 · 等待查尔斯邀请','完成第二章《在前的，将要在后了》后','missable','','Hunting with Charles'),
    I('ca_javier_home','和哈维尔一起入室抢劫','马掌望台营地 · 等待哈维尔邀请','第二章','missable','','Home Robbery with Javier'),
    I('ca_tilly_dominoes','和蒂莉玩多米诺骨牌','克莱蒙斯岬营地 · 等待蒂莉邀请','第三章','missable','','Dominoes with Tilly'),
    I('ca_micah_fff','和迈卡玩快刀戳指缝','克莱蒙斯岬营地 · 等待迈卡邀请','第三章','missable','','Five Finger Fillet with Micah'),
    I('ca_kieran_fish','和基兰钓鱼','克莱蒙斯岬营地 · 等待基兰邀请','第三章','missable','','Fishing with Kieran'),
    I('ca_javier_fish','和哈维尔钓鱼','克莱蒙斯岬营地 · 等待哈维尔邀请','第三章','missable','','Fishing with Javier'),
    I('ca_bill_coach','和比尔抢劫马车','克莱蒙斯岬营地 · 等待比尔邀请','完成第三章《草根朋友》后','missable','','Coach Robbery with Bill'),
    I('ca_sean_coach','和西恩抢劫马车','克莱蒙斯岬营地 · 等待西恩邀请','完成第三章《草根朋友》后','missable','','Coach Robbery with Sean'),
    I('ca_charles_bank','和查尔斯抢劫银行','谢迪贝莱营地 · 等待查尔斯邀请','第四章，仅特别版/终极版','missable','','Bank Robbery with Charles'),
    I('ca_lenny_coach','和蓝尼抢劫马车','谢迪贝莱营地 · 等待蓝尼邀请','第四章','missable','','Coach Robbery with Lenny'),
    I('ca_pearson_hunt','和皮尔逊打猎','谢迪贝莱营地 · 等待皮尔逊邀请','第四章','missable','','Hunting with Pearson'),
    I('ca_uncle_rustling','和大叔偷牛','谢迪贝莱营地 · 等待大叔邀请','第四章','missable','','Rustling with Uncle'),
    I('ca_micah_coach','和迈卡抢劫马车','谢迪贝莱营地 · 等待迈卡邀请','第四章','missable','','Coach Robbery with Micah')
  ];

  // A Better World, A New Friend shares tc16 with the Total Completion board,
  // so checking either copy updates the same saved task state.
  var HUNTING_REQUEST_DETAILS = [
    { id:'hr1', t:'狩猎请求 1', en:'Hunting Request 1', stage:'第二章起', stageEn:'From Chapter 2', reward:'$50', items:[
      I('hr1_rabbit','完美兔子尸体','','','','','Perfect Rabbit Carcass'),
      I('hr1_squirrel','完美松鼠尸体','','','','','Perfect Squirrel Carcass')
    ]},
    { id:'hr2', t:'狩猎请求 2', en:'Hunting Request 2', stage:'完成上一轮后', stageEn:'After the previous request', reward:'$70', items:[
      I('hr2_cardinal','完美北美红雀尸体','','','','','Perfect Cardinal Carcass'),
      I('hr2_rat','完美老鼠尸体','','','','','Perfect Rat Carcass'),
      I('hr2_woodpecker','完美啄木鸟尸体','','','','','Perfect Woodpecker Carcass')
    ]},
    { id:'hr3', t:'狩猎请求 3', en:'Hunting Request 3', stage:'完成上一轮后', stageEn:'After the previous request', reward:'$120', items:[
      I('hr3_chipmunk','完美花栗鼠尸体','','','','','Perfect Chipmunk Carcass'),
      I('hr3_opossum','完美负鼠尸体','','','','','Perfect Opossum Carcass'),
      I('hr3_oriole','完美黄鹂尸体','','','','','Perfect Oriole Carcass'),
      I('hr3_robin','完美知更鸟尸体','','','','','Perfect Robin Carcass')
    ]},
    { id:'hr4', t:'狩猎请求 4', en:'Hunting Request 4', stage:'完成上一轮后', stageEn:'After the previous request', reward:'$120', items:[
      I('hr4_songbird','完美鸣鸟尸体','','','','','Perfect Songbird Carcass'),
      I('hr4_sparrow','完美麻雀尸体','','','','','Perfect Sparrow Carcass'),
      I('hr4_toad','完美蟾蜍尸体','','','','','Perfect Toad Carcass'),
      I('hr4_skunk','完美臭鼬尸体','','','','','Perfect Skunk Carcass'),
      I('hr4_bullfrog','完美牛蛙尸体','','','','','Perfect Bullfrog Carcass')
    ]},
    { id:'hr5', t:'狩猎请求 5', en:'Hunting Request 5', stage:'尾声', stageEn:'Epilogue', reward:'$150', items:[
      I('hr5_waxwing','完美雪松太平鸟尸体','','','','','Perfect Cedar Waxwing Carcass'),
      I('hr5_bat','完美蝙蝠尸体','','','','','Perfect Bat Carcass'),
      I('hr5_bluejay','完美蓝松鸦尸体','','','','','Perfect Blue Jay Carcass'),
      I('hr5_crow','完美乌鸦尸体','','','','','Perfect Crow Carcass'),
      I('hr5_beaver','完美河狸尸体','','','','','Perfect Beaver Carcass')
    ]}
  ];
  var BETTER_WORLD_ITEM = I(
    'tc16',
    '一个更好的世界，一个新朋友',
    '各地邮局与火车站的狩猎请求海报',
    '',
    '',
    '第五轮于尾声开放。',
    'A Better World, A New Friend'
  );
  BETTER_WORLD_ITEM.details = HUNTING_REQUEST_DETAILS;
  A_ITEMS.splice(5, 0, BETTER_WORLD_ITEM);

  var DUCHESS_ITEM = A_ITEMS.find(function (it) { return it.id === 'a4'; });
  DUCHESS_ITEM.detailsLabel = '5 轮异宝需求';
  DUCHESS_ITEM.detailsLabelEn = '5 exotic requests';
  DUCHESS_ITEM.details = [
    { id:'du1', t:'异宝请求 1', en:'Exotic Request 1', items:[
      I('du1_little_egret','小白鹭羽毛 ×5','','','','','Little Egret Plume ×5'),
      I('du1_reddish_egret','棕颈鹭羽毛 ×5','','','','','Reddish Egret Plume ×5'),
      I('du1_snowy_egret','雪鹭羽毛 ×5','','','','','Snowy Egret Plume ×5'),
      I('du1_lady_night','夜女兰 ×15','','','','','Lady of the Night Orchid ×15')
    ]},
    { id:'du2', t:'异宝请求 2', en:'Exotic Request 2', items:[
      I('du2_heron','鹭羽毛 ×20','','','','','Heron Plume ×20'),
      I('du2_lady_slipper','仙履兰 ×7','','','','','Lady Slipper Orchid ×7'),
      I('du2_moccasin','杓兰 ×10','','','','','Moccasin Flower Orchid ×10')
    ]},
    { id:'du3', t:'异宝请求 3', en:'Exotic Request 3', items:[
      I('du3_gator_eggs','鳄鱼蛋 ×25','','','','','Alligator Eggs ×25'),
      I('du3_acuna','阿库那星兰 ×3','','','','','Acuna’s Star Orchid ×3'),
      I('du3_cigar','雪茄兰 ×7','','','','','Cigar Orchid ×7'),
      I('du3_ghost','幽灵兰 ×5','','','','','Ghost Orchid ×5')
    ]},
    { id:'du4', t:'异宝请求 4', en:'Exotic Request 4', items:[
      I('du4_spoonbill','琵鹭羽毛 ×30','','','','','Spoonbill Plume ×30'),
      I('du4_night_scented','夜香兰 ×5','','','','','Night Scented Orchid ×5'),
      I('du4_rat_tail','鼠尾兰 ×10','','','','','Rat Tail Orchid ×10'),
      I('du4_spider','蜘蛛兰 ×5','','','','','Spider Orchid ×5')
    ]},
    { id:'du5', t:'异宝请求 5', en:'Exotic Request 5', items:[
      I('du5_clamshell','章鱼兰 ×5','','','','','Clamshell Orchid ×5'),
      I('du5_dragons_mouth','龙嘴兰 ×5','','','','','Dragon’s Mouth Orchid ×5'),
      I('du5_queen','皇后兰 ×5','','','','','Queen’s Orchid ×5'),
      I('du5_sparrows_egg','雀子兰 ×10','','','','','Sparrow’s Egg Orchid ×10')
    ]}
  ];

  var CAMP_REQUEST_IDS = {
    a6:true,a8:true,a9:true,a10:true,a11:true,a12:true,a13:true,a14:true,a15:true,a16:true,
    a17:true,a18:true,a19:true,a20:true,a21:true,a22:true,a23:true,a24:true,a25:true,a26:true,
    a27:true,a28:true,a29:true,
    ca_lenny_fff:true,ca_charles_hunt:true,ca_javier_home:true,ca_tilly_dominoes:true,
    ca_micah_fff:true,ca_kieran_fish:true,ca_javier_fish:true,ca_bill_coach:true,
    ca_sean_coach:true,ca_charles_bank:true,ca_lenny_coach:true,ca_pearson_hunt:true,
    ca_uncle_rustling:true,ca_micah_coach:true
  };
  var A_GROUPS = [
    { id:'side', name:'支线任务', items:A_ITEMS.filter(function (it) { return !CAMP_REQUEST_IDS[it.id]; }) },
    { id:'camp', name:'营地请求&活动', items:A_ITEMS.filter(function (it) { return !!CAMP_REQUEST_IDS[it.id]; }) }
  ];

  /* ---------------------------------------------------------------- */
  /* CATEGORY CH — 九大挑战 (90 sub-目标)                                  */
  /* ---------------------------------------------------------------- */
  var WE = [
    I('we1','第1级','','','','击杀3名敌人,使用小刀'),
    I('we2','第2级','','','','10秒内用飞刀击杀3名敌人'),
    I('we3','第3级','','','','只用战斧击杀3只猛禽'),
    I('we4','第4级','','','','用手工弹药的霰弹枪击杀10名敌人'),
    I('we5','第5级','','','','击杀5名骑马敌人,每次击杀用1把飞刀'),
    I('we6','第6级','','','','用一根炸药同时炸死4名敌人'),
    I('we7','第7级','','','','连续用同一把战斧投掷回收击杀4名敌人'),
    I('we8','第8级','','','','用长管副武器击杀15名敌人'),
    I('we9','第9级','','','','用弓箭从背后偷袭击杀9名未察觉的敌人'),
    I('we10','第10级','','','','只用飞刀且不受伤击杀一只灰熊')
  ];
  var HE = [
    I('he1','第1级','','','','采集6株西洋蓍草','Herbalist'),
    I('he2','第2级','','','','采摘并食用4种浆果'),
    I('he3','第3级','','','','用鼠尾草作为原料制作7件物品'),
    I('he4','第4级','','','','采摘5朵蘑菇并喂给马'),
    I('he5','第5级','','','','用印第安烟草作为原料制作9件物品'),
    I('he6','第6级','','','','采摘15种不同的药草'),
    I('he7','第7级','','','','制作并使用5瓶特制神奇补药'),
    I('he8','第8级','','','','用夹竹桃制作6件毒药武器'),
    I('he9','第9级','','','','每种药草都采摘一次（共43种植物）'),
    I('he10','第10级','','','','调味并烹饪所有11种肉类')
  ];
  var GA = [
    I('ga1','第1级','','','','赢得5局德州扑克'),
    I('ga2','第2级','','','','21点游戏中加倍下注并赢下5次'),
    I('ga3','第3级','','','','赢得3场快刀戳指缝比赛'),
    I('ga4','第4级','弗拉特尼克车站/圣丹尼斯/瓦伦丁','','','在3个地点各让一名玩家输光筹码'),
    I('ga5','第5级','','','','不摸牌堆的情况下,在2人或更少对手时赢3局多米诺'),
    I('ga6','第6级','罗兹 · 范霍恩贸易站','','','在这2个地点各击败一次21点庄家'),
    I('ga7','第7级','草莓镇/瓦伦丁/范霍恩贸易站','','','在这3个地点都击败快刀戳指缝玩家'),
    I('ga8','第8级','','','','拿3次或更多牌的情况下赢3局21点'),
    I('ga9','第9级','','','','连续赢3局多米诺'),
    I('ga10','第10级','','','','连续赢3局扑克')
  ];
  var HO = [
    I('ho1','第1级','','','','骑马击杀5只兔子'),
    I('ho2','第2级','','','','15秒内骑马跨越3个障碍'),
    I('ho3','第3级','瓦伦丁→罗兹','','','5分钟内骑马跑完全程'),
    I('ho4','第4级','','','','骑马用套索拖拽一人3300英尺'),
    I('ho5','第5级','','','','骑马踩踏5只动物'),
    I('ho6','第6级','草莓→圣丹尼斯','','','9分钟内且全程不下水跑完'),
    I('ho7','第7级','','','','骑马不下马连续击杀7名敌人'),
    I('ho8','第8级','','','','骑马杀死9只食肉动物'),
    I('ho9','第9级','范霍恩→黑水镇','','','17分钟内且不下水跑完'),
    I('ho10','第10级','','','','驯服每一种野马品种')
  ];
  var SH = [
    I('sh1','第1级','','','','击杀3只飞鸟'),
    I('sh2','第2级','','','','同一次死亡之眼中击杀2种不同物种'),
    I('sh3','第3级','','','','在行驶中的火车上击杀5只飞鸟'),
    I('sh4','第4级','','','','投掷战斧在80英尺外击杀敌人'),
    I('sh5','第5级','','','','不换弹不换武器击杀6只动物'),
    I('sh6','第6级','','','','用带有高倍瞄具的狙击步枪击杀660英尺外的人'),
    I('sh7','第7级','','','','连续爆头7次'),
    I('sh8','第8级','','','','不换弹不换武器缴械3名敌人'),
    I('sh9','第9级','','','','同一次死亡之眼中射掉3个人的帽子'),
    I('sh10','第10级','','','','用长距瞄准镜步枪连续3枪击落3只飞鸟')
  ];
  var SU = [
    I('su1','第1级','','','','捕获3条蓝鳃太阳鱼'),
    I('su2','第2级','营地或捕兽人','','','将5只动物送进营地或交给捕兽人'),
    I('su3','第3级','','','','使用捕猎步枪击杀5只动物'),
    I('su4','第4级','','','','分别制作1支炸裂箭、火焰箭、改良箭、毒箭和小型猎物箭'),
    I('su5','第5级','拉格拉斯沼泽与任意铁轨','','','在沼泽中的船上钓到1条鱼，并站在铁轨上钓到1条鱼'),
    I('su6','第6级','','','','击杀5只正在啃食动物尸体的食腐动物'),
    I('su7','第7级','','','','使用小型猎物箭连续射击并击杀8只小型猎物'),
    I('su8','第8级','','','','分别制作1把回旋手斧、改良手斧、烈性炸药和烈性燃烧瓶'),
    I('su9','第9级','','','','捕获一条重量至少19磅的鱼'),
    I('su10','第10级','','','','捕获世界中的每一种鱼')
  ];
  var MH = [
    I('mh1','第1级','','','','剥下3只鹿的皮'),
    I('mh2','第2级','','','','获得3张完美品质兔皮'),
    I('mh3','第3级','','','','用双筒望远镜追踪10种不同动物'),
    I('mh4','第4级','','','','用动物叫声引诱并干净击杀5次'),
    I('mh5','第5级','','','','剥3只黑熊或灰熊的皮'),
    I('mh6','第6级','','','','用弓箭击杀5只美洲狮并剥皮'),
    I('mh7','第7级','','','','使用诱饵连续捕杀1只草食动物和1只肉食动物'),
    I('mh8','第8级','','','','不用鱼竿徒手抓3条小鱼'),
    I('mh9','第9级','','','','击杀一只正在装死的负鼠'),
    I('mh10','第10级 · 传说黑豹','布莱斯韦特庄园正东 · 靠近水边','需先完成1-9级解锁','','击杀并剥皮传说黑豹 Giaguaro')
  ];
  var BH = [
    I('bh1','第1级','','','','抢劫5名城镇居民'),
    I('bh2','第2级','','','','抢劫2辆马车(或将2辆偷来的马车交给销赃商)'),
    I('bh3','第3级','','','','1个游戏日内抢劫4家商店的收银台'),
    I('bh4','第4级','','','','1个游戏日内抢劫/偷走3辆马车并处理掉'),
    I('bh5','第5级','','','','在某一地区被悬赏$250'),
    I('bh6','第6级','克莱门斯湾','','','偷5匹马并卖给克莱门斯湾的马匹销赃商'),
    I('bh7','第7级','','','','从市民和游客处抢到$50现金和贵重物品'),
    I('bh8','第8级','翡翠牧场','','','偷7辆货运马车,卖给翡翠牧场的马车销赃商'),
    I('bh9','第9级','','','','将某人捆起来并放在铁路轨道上3次'),
    I('bh10','第10级','','','','完成5次火车抢劫,且不能死亡或被抓')
  ];
  var EX = [
    I('ex1','第1级 · 找到一张藏宝图','Flatneck Station 西北山脊 · Maximo','','','杰克霍尔帮藏宝图第一张'),
    I('ex2','第2级 · 找到一件宝藏','','','',''),
    I('ex3','第3级 · 找到一件宝藏','','','',''),
    I('ex4','第4级 · 找到一件宝藏','','','',''),
    I('ex5','第5级 · 找到一件宝藏','','','',''),
    I('ex6','第6级 · 找到一件宝藏','','','',''),
    I('ex7','第7级 · 找到一件宝藏','','','',''),
    I('ex8','第8级 · 找到一件宝藏','','','',''),
    I('ex9','第9级 · 找到一件宝藏','','','','找到第8件宝藏'),
    I('ex10','第10级 · 找到一件宝藏','','','','找到第9件宝藏，完成任意藏宝图链中的中间地图或最终宝藏均可计数','Rank 10 · Find a Treasure')
  ];
  var CH_GROUPS = [
    { id:'we', name:'武器专家', desc:'', items: WE },
    { id:'he', name:'草药大师', desc:'', items: HE },
    { id:'ga', name:'赌徒', desc:'', items: GA },
    { id:'ho', name:'骑手', desc:'', items: HO },
    { id:'sh', name:'神射手', desc:'', items: SH },
    { id:'su', name:'生存大师', desc:'', items: SU },
    { id:'mh', name:'捕猎大师', desc:'', items: MH },
    { id:'bh', name:'土匪', desc:'', items: BH },
    { id:'ex', name:'探险家', desc:'', items: EX }
  ];

  var HERBALIST_10_MEATS = [
    ['珍禽肉','Exotic Bird Meat'],['猪肉','Tender Pork Loin'],['肥鸟肉','Plump Bird Meat'],
    ['大型猎物肉','Big Game Meat'],['上等牛肉','Prime Beef Joint'],['细嫩鱼肉','Succulent Fish Meat'],
    ['猎物肉','Game Meat'],['碎鱼肉','Flaky Fish Meat'],['甲壳动物肉','Crustacean Meat'],
    ['羊肉','Gristly Mutton'],['成年鹿肉','Mature Venison']
  ];
  var herbalistTen = HE.find(function (it) { return it.id === 'he10'; });
  herbalistTen.detailsLabel='11种肉类明细'; herbalistTen.detailsLabelEn='11 meat types'; herbalistTen.syncDetails=true;
  herbalistTen.details=[{id:'he10_meats',t:'每种肉调味并烹饪一次',en:'Season and cook each meat once',items:HERBALIST_10_MEATS.map(function(p,i){
    return I('he10_meat_'+(i+1),p[0],'','','','',p[1]);
  })}];

  var HORSEMAN_10_BREEDS = [
    ['摩根马','Morgan'],['美国标准种马','American Standardbred'],['田纳西走马','Tennessee Walker'],
    ['美洲野马','Mustang'],['肯塔基骑乘马','Kentucky Saddler'],['匈牙利混种马','Hungarian Halfbred'],
    ['阿帕卢萨马','Appaloosa'],['美国花马','American Paint'],['北达科他马','Nokota']
  ];
  var horsemanTen = HO.find(function (it) { return it.id === 'ho10'; });
  horsemanTen.detailsLabel='9种野马明细'; horsemanTen.detailsLabelEn='9 wild horse breeds'; horsemanTen.syncDetails=true;
  horsemanTen.details=[{id:'ho10_breeds',t:'驯服全部9种指定野马',en:'Break all 9 required wild breeds',items:HORSEMAN_10_BREEDS.map(function(p,i){
    return I('ho10_breed_'+(i+1),p[0],'','','','',p[1]);
  })}];

  /* ---------------------------------------------------------------- */
  /* CATEGORY COL — 全收集                                              */
  /* ---------------------------------------------------------------- */
  var RC = [
    I('rc1','一号石雕','地图“MOUNT HAGEN”字母 O 附近，上山道路尽头前的右侧岩壁','','','', 'Rock Carving #1'),
    I('rc2','二号石雕','地图“AMBARINO”第二个 A 正南，温亚德海峡西岸桥北侧的窄岩台尽头','','','', 'Rock Carving #2'),
    I('rc3','三号石雕','华莱士堡东北最近的山体背面，由堡垒南侧道路向北登上山脊','','','', 'Rock Carving #3'),
    I('rc4','四号石雕','地图“CUMBERLAND FOREST”字母 C 旁的虚线小径向北，西侧悬崖岩壁','','','', 'Rock Carving #4'),
    I('rc5','五号石雕','地图“OWANJILA”字母 O 西南，欧万吉拉湖西南岸岩壁','','','', 'Rock Carving #5'),
    I('rc6','六号石雕','地图“WEST ELIZABETH”字母 T 正东，穿过 T 的山顶虚线小径西侧','','','', 'Rock Carving #6'),
    I('rc7','七号石雕','弗拉特尼克车站西北的岩丘，由南侧上山后沿北侧岩壁下行','','','', 'Rock Carving #7'),
    I('rc8','八号石雕','月光石池正南、安巴里诺与新汉诺威州界北侧，东面山丘岩壁','','','', 'Rock Carving #8'),
    I('rc9','九号石雕','地图“ROANOKE RIDGE”字母 N 正西，道路南侧山脊岩壁','','','', 'Rock Carving #9'),
    I('rc10','十号石雕','地图“NEW HANOVER”第二个 E 东北，极乐池东岸过路处正北的岩脊','','','', 'Rock Carving #10')
  ];
  var DC = [
    I('dc1','新汉诺威区域','14个捕梦网','','','展开查看逐一位置'),
    I('dc2','莱莫因区域','2个捕梦网','','','展开查看逐一位置'),
    I('dc3','安巴里诺区域','4个捕梦网','','','展开查看逐一位置')
  ];
  DC[0].detailsLabel='14个精确位置'; DC[0].detailsLabelEn='14 exact locations'; DC[0].syncDetails=true;
  DC[0].details=[{id:'dc_nh_locations',t:'新汉诺威',en:'New Hanover',items:[
    I('dc_nh01','罗诺克岭河边三岔路口西北','地图“ROANOKE RIDGE”第二个 O 正西、河边三岔路口西北','','','','Roanoke Ridge, northwest of the riverside three-way junction'),
    I('dc_nh02','河狸洞窟以东路边','地图“ANNESBURG”第二个 N 右上角，南北道路东侧','','','','East of Beaver Hollow, beside the road'),
    I('dc_nh03','安尼斯堡南部树林','地图“ANNESBURG”字母 U 正南，越过道路后的树林内','','','','Woods south of Annesburg'),
    I('dc_nh04','罗诺克岭南北道路东侧','地图“ANNESBURG”字母 S 正南，罗诺克岭道路东侧','','','','East side of the north-south road in Roanoke Ridge'),
    I('dc_nh05','极乐池西南山坡','地图“NEW HANOVER”第二个 E 右上方、极乐池字母 P 正南','','','','Hillside southwest of Elysian Pool'),
    I('dc_nh06','新汉诺威地图字样中央','地图“NEW HANOVER”字母 O 中央附近的树林内','','','','In the O of NEW HANOVER on the map'),
    I('dc_nh07','瓦伦丁西南小径旁','地图“VALENTINE”第一个 E 正南，小径向西凸出处的西侧','','','','Southwest of Valentine, west of the dotted path'),
    I('dc_nh08','卡利班之座西南三岔路口','Caliban’s Seat 西南三角路口以西、道路北侧','','','','West of the junction southwest of Caliban’s Seat'),
    I('dc_nh09','达科塔河东岸高地','地图“DAKOTA RIVER”字母 O 正东，第一条道路东侧的山脊上','','','','High ground east of the Dakota River'),
    I('dc_nh10','城堡岩北侧铁路与道路之间','Citadel Rock 第二个 C 正北，铁路北侧与道路南侧之间','','','','North of Citadel Rock, between the railway and road'),
    I('dc_nh11','新汉诺威中部铁路西侧','地图“NEW HANOVER”第一个 E 正西、铁路西侧树林','','','','Central New Hanover, west of the railway'),
    I('dc_nh12','大地之心东部孤树','地图“THE HEARTLANDS”字母 N 右上角附近的孤树','','','','Lone tree in eastern The Heartlands'),
    I('dc_nh13','大地之心溢流南岸','Heartland Overflow 南端中央的一组树中','','','','South bank of Heartland Overflow'),
    I('dc_nh14','蓝水沼泽北部州界附近','地图“BLUEWATER MARSH”字母 B 正北，跨河和第一条路后、第二条路南缘','','','','Near the New Hanover–Lemoyne border north of Bluewater Marsh')
  ]}];
  DC[1].detailsLabel='2个精确位置'; DC[1].detailsLabelEn='2 exact locations'; DC[1].syncDetails=true;
  DC[1].details=[{id:'dc_le_locations',t:'莱莫因',en:'Lemoyne',items:[
    I('dc_le01','翡翠牧场东南、亚伯丁养猪场西北','地图“LEMOYNE”字母 M 与 O 的北侧、两字母之间','','','','Southeast of Emerald Ranch, northwest of Aberdeen Pig Farm'),
    I('dc_le02','朗尼棚屋与普莱森斯西北','地图“LEMOYNE”字母 M 与 O 北侧，位于上一处捕梦网以南','','','','Northwest of Lonnie’s Shack and Pleasance')
  ]}];
  DC[2].detailsLabel='4个精确位置'; DC[2].detailsLabelEn='4 exact locations'; DC[2].syncDetails=true;
  DC[2].details=[{id:'dc_am_locations',t:'安巴里诺',en:'Ambarino',items:[
    I('dc_am01','灰熊山西部山丘','地图“GRIZZLIES WEST”中 WEST 的 S 正南，山丘上最大的一棵枯树','','','','Grizzlies West, south of the S in WEST'),
    I('dc_am02','达科塔河源头北侧道路旁','1号东北方，铁路旁弯曲道路中短暂南北直线路段的西侧','','','','Northeast of the first, west of the road beside the railway'),
    I('dc_am03','科托拉泉东侧','科托拉泉正东、铁路北侧，白树间醒目的棕色大树','','','','East of Cotorra Springs, north of the railway'),
    I('dc_am04','阁楼西侧','The Loft 小屋正西、穿过安巴里诺的铁路北侧','','','','West of The Loft, north of the railway')
  ]}];
  var DB = [
    I('db1','一号骨','安巴里诺 · 查德威克农场正西，紧邻达科塔河的小径上方岩壁','','','', 'Dinosaur Bone #1'),
    I('db2','二号骨','地图“COTORRA SPRINGS”字母 G 正南，达科塔河北侧悬崖下层岩台','','','', 'Dinosaur Bone #2'),
    I('db3','三号骨','地图“AMBARINO”字母 O 正北，最北侧铁路与道路之间的小山顶部','','','', 'Dinosaur Bone #3'),
    I('db4','四号骨','地图“AMBARINO”字母 I 底部左侧，唐纳瀑布东侧道路旁岩壁','','','', 'Dinosaur Bone #4'),
    I('db5','五号骨','地图“GRIZZLIES EAST”中 EAST 的 S 底部偏西，山峰顶部','','','', 'Dinosaur Bone #5'),
    I('db6','六号骨','奥克里夫潭东北，最北侧铁路与州界交点向南、道路下方山顶','','','', 'Dinosaur Bone #6'),
    I('db7','七号骨','地图“BACCHUS STATION”第二个 S 左下角西南侧，华莱士堡东北山顶','','','', 'Dinosaur Bone #7'),
    I('db8','八号骨','地图“CUMBERLAND FOREST”字母 C 正南，虚线小径上方山脊边缘','','','', 'Dinosaur Bone #8'),
    I('db9','九号骨','地图“VALENTINE”字母 A 右端正北，达科塔河东岸高地边缘','','','', 'Dinosaur Bone #9'),
    I('db10','十号骨','地图“DAKOTA RIVER”字母 O 正东、“CUMBERLAND FALLS”第一个 A 正南的岩壁','','','', 'Dinosaur Bone #10'),
    I('db11','十一号骨','地图“THE HEARTLANDS”字母 A 与 R 之间正南，废弃采油井井底','','','', 'Dinosaur Bone #11'),
    I('db12','十二号骨','地图“THE HEARTLANDS”字母 R 与 T 之间正南，岩脊相接处前方','','','', 'Dinosaur Bone #12'),
    I('db13','十三号骨','地图“THE HEARTLANDS”第一个 A 正南，最南侧铁路北面的草地','','','', 'Dinosaur Bone #13'),
    I('db14','十四号骨','地图“ROANOKE RIDGE”第一个 O 与 A 中点正东，第一条道路东侧山脊','','','', 'Dinosaur Bone #14'),
    I('db15','十五号骨','范霍恩贸易站西北，马厩西南并越过铁路与两条道路后的林地','','','', 'Dinosaur Bone #15'),
    I('db16','十六号骨','地图“KAMASSA RIVER”字母 I 正东，极乐池北侧河流西岸高崖','','','', 'Dinosaur Bone #16'),
    I('db17','十七号骨','地图“NEW HANOVER”字母 O 正北、安巴里诺州界附近，小屋南侧裸地','','','', 'Dinosaur Bone #17'),
    I('db18','十八号骨','地图“LEMOYNE”字母 L 正南，露莓溪西端尽头南侧','','','', 'Dinosaur Bone #18'),
    I('db19','十九号骨','地图“DEWBERRY CREEK”字母 D 正北，新汉诺威州界南侧','','','', 'Dinosaur Bone #19'),
    I('db20','二十号骨','地图“GRIZZLIES WEST”第一个 L 正南，华莱士车站西北虚线小径西侧洞穴','','','', 'Dinosaur Bone #20'),
    I('db21','二十一号骨','地图“WEST ELIZABETH”字母 W 与 E 之间，穿过两字母的虚线小径中央','','','', 'Dinosaur Bone #21'),
    I('db22','二十二号骨','地图“BERYL’S DREAM”中 DREAM 的 M 正南，虚线小径旁悬崖边缘','','','', 'Dinosaur Bone #22'),
    I('db23','二十三号骨','地图“HENNIGAN’S STEAD”第一个 N 正南，与字母底部相连的峡谷虚线小径内侧','','','', 'Dinosaur Bone #23'),
    I('db24','二十四号骨','地图“SAN LUIS RIVER”字母 A 与 N 之间正北，正对离岸小岛的河岸','','','', 'Dinosaur Bone #24'),
    I('db25','二十五号骨','地图“RIO DEL LOBO ROCK”字母 K 底部偏东，山崖中段平台','','','', 'Dinosaur Bone #25'),
    I('db26','二十六号骨','地图“RIO BRAVO”字母 B 正南，临崖小山顶部','','','', 'Dinosaur Bone #26'),
    I('db27','二十七号骨','地图“NEW AUSTIN”字母 A 与 U 之间、A 底部正东，豪尔赫峡谷西侧','','','', 'Dinosaur Bone #27'),
    I('db28','二十八号骨','地图“CHOLLA SPRINGS”第一个 S 远北、“RATTLESNAKE HOLLOW”字母 H 正西的岩壁','','','', 'Dinosaur Bone #28'),
    I('db29','二十九号骨','地图“GAPTOOTH RIDGE”中 RIDGE 的 D 与 G 之间山顶，由 G 附近北侧上山','','','', 'Dinosaur Bone #29'),
    I('db30','三十号骨','地图“TUMBLEWEED”字母 L 正南的山顶，由 L 上方小路登上悬崖','','','', 'Dinosaur Bone #30')
  ];
  var CC = [
    I('cc1','著名神枪手 Famous Gunslingers','','',''),
    I('cc2','艺术家、作家与诗人','','',''),
    I('cc3','美国风光 Vistas of America','','',''),
    I('cc4','美丽珍品 Gems of Beauty','','',''),
    I('cc5','美国植物 Flora of America','','',''),
    I('cc6','舞台明星 Stars of the Stage','','',''),
    I('cc7','美国动物 Fauna of America','','',''),
    I('cc8','旅行奇观 Marvels of Travel','','',''),
    I('cc9','世界冠军 World Champions','','',''),
    I('cc10','惊人发明 Amazing Inventions','','',''),
    I('cc11','马匹 Horses','','',''),
    I('cc12','杰出美国人 Prominent Americans','','','','')
  ];
  CC.forEach(function (it) {
    it.computed = true;
    it.link = '🔗 集齐图鉴中对应的12张香烟卡后自动完成';
  });
  var COL_GROUPS = [
    { id:'rc', name:'石雕(Rock Carvings)', desc:'交给隐士 Francis Sinclair,范霍恩附近小屋触发《地质学入门》', items: RC },
    { id:'dc', name:'捕梦网(Dreamcatchers)', desc:'集满20个后去极乐池瀑布后洞穴查看壁画领永久加成', items: DC },
    { id:'db', name:'恐龙骨(Dinosaur Bones)', desc:'交给古生物学家 Deborah MacGuinness,Firwood Rise 谷仓触发陌生人任务《信心的考验》(A Test of Faith)', items: DB },
    { id:'cc', name:'香烟卡(Cigarette Cards)', desc:'集满任意一套后寄给 Phineas T. Ramsbottom(陌生人任务《抽烟和其他嗜好》,第二章解锁)可获得奖励', items: CC }
  ];

  /* ---------------------------------------------------------------- */
  /* CATEGORY HUNT — 捕猎                                               */
  /* ---------------------------------------------------------------- */
  var LA = [
    I('la1','传说海狸 Malia','新汉诺威 · 布彻溪','',''),
    I('la2','传说灰熊 Bharati','安巴里诺 · 灰熊山东部','',''),
    I('la3','传说大角羊','西伊丽莎白 · 猫尾塘','',''),
    I('la4','传说野猪 Oryx','莱莫因 · 蓝水沼泽','',''),
    I('la5','传说公鹿 Obie','西伊丽莎白 · 黑骨森林','',''),
    I('la6','传说郊狼 Suki','新汉诺威 · 斯嘉丽草甸','',''),
    I('la7','传说麋鹿 Enyeto','新汉诺威 · 巴克斯站','',''),
    I('la8','传说狐狸 Layla','莱莫因 · 罗德斯以北','',''),
    I('la9','传说驼鹿 Anoki','新汉诺威 · 罗诺克岭','',''),
    I('la10','传说白野牛','安巴里诺 · 伊莎贝拉湖','',''),
    I('la11','传说狼 Hotah','安巴里诺 · 科托拉泉','',''),
    I('la12','传说黑豹 Giaguaro','莱莫因 · 布莱斯韦特庄园正东','需先完成狩猎大师挑战1-9级','',''),
    I('la13','传说短吻鳄 Lacartus','莱莫因 · 巴约努瓦沼泽','','','需完成第六章主线《那是墨菲家族的地盘》后才会出现'),
    I('la14','传说美洲狮(新奥斯汀)','新奥斯汀 · 加普图斯岭','','epilogue'),
    I('la15','传说叉角羚 Ira','新奥斯汀 · 德尔洛沃岩','','epilogue'),
    I('la16','传说野牛 Tatanka','新奥斯汀 · 亨尼根牧场','','epilogue')
  ];
  var LF = [
    I('lf1','传说硬头鳟','罗诺克岭 · 布兰迪怀恩瀑布东北','',''),
    I('lf2','传说河鲈','安巴里诺 · 极乐池','',''),
    I('lf3','传说长吻雀鳝','莱莫因 · 拉格拉斯/蓝水沼泽','',''),
    I('lf4','传说北美狗鱼','范霍恩贸易站附近','',''),
    I('lf5','传说大头鲶鱼','莱莫因 · 西西卡监狱东岸','',''),
    I('lf6','传说湖鲟','莱莫因 · 圣丹尼斯附近铁轨以南','',''),
    I('lf7','传说蓝鳃太阳鱼','莱莫因 · 罗德斯与布莱斯韦特庄园之间','',''),
    I('lf8','传说暗色狗鱼','新汉诺威 · 达科塔河','',''),
    I('lf9','传说红鲑鱼','安巴里诺 · 伊莎贝拉湖南岸','',''),
    I('lf10','传说小口黑鲈','西伊丽莎白 · 欧瓦尼拉湖','',''),
    I('lf11','传说岩钝鲈','西伊丽莎白 · 极光盆地','','epilogue','正常流程需在尾声区域开放后捕获'),
    I('lf12','传说红鳍带纹鱼','西伊丽莎白 · 盗贼领地以西的静水溪','','epilogue','正常流程需在尾声区域开放后捕获'),
    I('lf13','传说大口黑鲈','新奥斯汀 · 圣路易斯河','','epilogue'),
    I('lf14','传说鲶鱼','新奥斯汀 · 圣路易斯河','','epilogue,special','寄出前13条传说鱼后解锁')
  ];
  function craftItem(id, zh, en, zhMaterials, enMaterials) {
    var item = I(id, zh, '', '', '', zhMaterials, en);
    item.nEn = enMaterials;
    return item;
  }

  function trapperClothingMenu(id, zh, en, items) {
    var parent = I(id, zh, '', '', '', '', en);
    parent.detailsLabel = '查看服装与材料';
    parent.detailsLabelEn = 'View garments and materials';
    parent.details = [{ id:id + '_items', t:zh, en:en, items:items }];
    parent.syncDetails = true;
    return parent;
  }

  var TRAPPER_CLOTHING = [
    trapperClothingMenu('trc1','猎熊人','The Bear Hunter',[
      craftItem('trc1_1','传说熊头帽','Legendary Bear Head Hat','传说熊皮 × 1','Legendary Bear Pelt × 1'),
      craftItem('trc1_2','传说熊皮外套','Legendary Bear Coat','传说熊皮 × 1、完美的野牛皮 × 1','Legendary Bear Pelt × 1; Perfect Bison Pelt × 1'),
      craftItem('trc1_3','传说熊皮牛仔靴','Legendary Bear Roper','传说熊皮 × 1、完美的公牛皮 × 1','Legendary Bear Pelt × 1; Perfect Bull Hide × 1'),
      craftItem('trc1_4','野猪皮骑行手套','Boar Riding Gloves','完美的野猪皮 × 1、完美的兔皮 × 2','Perfect Boar Pelt × 1; Perfect Rabbit Pelt × 2')
    ]),
    trapperClothingMenu('trc2','猎鹿人','The Trophy Buck',[
      craftItem('trc2_1','浣熊皮山帽','Raccoon Mountain Hat','完美的浣熊皮 × 1、完美的河狸皮 × 1、鹰羽毛 × 2','Perfect Raccoon Pelt × 1; Perfect Beaver Pelt × 1; Hawk Feather × 2'),
      craftItem('trc2_2','传说公鹿皮马甲','Legendary Buck Vest','传说公鹿皮 × 1、完美的公羊皮 × 1','Legendary Buck Pelt × 1; Perfect Ram Hide × 1'),
      craftItem('trc2_3','传说狐皮莫卡辛鞋','Legendary Fox Moccasins','完美的麋鹿皮 × 1、传说狐皮 × 1','Perfect Elk Pelt × 1; Legendary Fox Pelt × 1'),
      craftItem('trc2_4','传说公鹿狐狸皮射击手套','Legendary Buck & Fox Range Gloves','传说公鹿皮 × 1、传说狐皮 × 1','Legendary Buck Pelt × 1; Legendary Fox Pelt × 1')
    ]),
    trapperClothingMenu('trc3','追梦人','The Dreamcatcher',[
      craftItem('trc3_1','传说河狸皮宽檐帽','Legendary Beaver Flop Hat','传说河狸皮 × 1、传说野猪皮 × 1、北美红雀羽毛 × 1','Legendary Beaver Pelt × 1; Legendary Boar Pelt × 1; Cardinal Feather × 1'),
      craftItem('trc3_2','传说野牛皮马甲','Legendary Bison Vest','传说塔坦卡野牛皮 × 1','Legendary Tatanka Bison Pelt × 1'),
      craftItem('trc3_3','传说野牛皮蝙蝠翼套裤','Legendary Bison Batwing Chaps','传说塔坦卡野牛皮 × 1','Legendary Tatanka Bison Pelt × 1'),
      craftItem('trc3_4','传说野猪野牛皮猎鸟靴','Legendary Boar & Bison Fowlers','传说野猪皮 × 1、传说塔坦卡野牛皮 × 1','Legendary Boar Pelt × 1; Legendary Tatanka Bison Pelt × 1'),
      craftItem('trc3_5','传说河狸皮骑兵手套','Legendary Beaver Cavalry Gloves','传说河狸皮 × 1','Legendary Beaver Pelt × 1')
    ]),
    trapperClothingMenu('trc4','掠食兽','The Beast of Prey',[
      craftItem('trc4_1','传说美洲狮皮宽檐帽','Legendary Cougar Flop Hat','传说美洲狮皮 × 1、火鸡羽毛 × 2','Legendary Cougar Pelt × 1; Turkey Feather × 2'),
      craftItem('trc4_2','传说美洲狮与狼皮马甲','Legendary Cougar/Wolf Vest','传说美洲狮皮 × 1、传说狼皮 × 1','Legendary Cougar Pelt × 1; Legendary Wolf Pelt × 1'),
      craftItem('trc4_3','传说狼皮蝙蝠翼套裤','Legendary Wolf Batwing Chaps','传说狼皮 × 1、完美的山羊皮 × 1','Legendary Wolf Pelt × 1; Perfect Goat Hide × 1'),
      craftItem('trc4_4','公牛皮猎鸟靴','Bull Fowler Boots','完美的野猪皮 × 1、完美的公牛皮 × 1','Perfect Boar Pelt × 1; Perfect Bull Hide × 1'),
      craftItem('trc4_5','传说美洲狮皮骑手手套','Legendary Cougar Riding Gloves','传说美洲狮皮 × 1、完美的野猪皮 × 1','Legendary Cougar Pelt × 1; Perfect Boar Pelt × 1')
    ]),
    trapperClothingMenu('trc5','狩猎者','The Huntsman',[
      craftItem('trc5_1','传说郊狼山帽','Legendary Coyote Mountain Hat','传说郊狼皮 × 1、雕羽毛 × 2','Legendary Coyote Pelt × 1; Eagle Feather × 2'),
      craftItem('trc5_2','传说叉角羚皮外套','Legendary Pronghorn Coat','传说叉角羚皮 × 1、完美的驼鹿皮 × 1','Legendary Pronghorn Hide × 1; Perfect Moose Pelt × 1'),
      craftItem('trc5_3','传说郊狼皮护腿','Legendary Coyote Half Chaps','传说郊狼皮 × 1、完美的狐皮 × 2','Legendary Coyote Pelt × 1; Perfect Fox Pelt × 2'),
      craftItem('trc5_4','工人骄傲靴','Workman’s Pride Boots','完美的母牛皮 × 1、完美的山羊皮 × 1','Perfect Cow Hide × 1; Perfect Goat Hide × 1'),
      craftItem('trc5_5','传说叉角羚皮射击手套','Legendary Pronghorn Range Gloves','传说叉角羚皮 × 1、完美的麝鼠皮 × 1','Legendary Pronghorn Hide × 1; Perfect Muskrat Pelt × 1')
    ]),
    trapperClothingMenu('trc6','丧钟','The Death Roll',[
      craftItem('trc6_1','传说短吻鳄赌徒帽','Legendary Alligator Gambler’s Hat','传说短吻鳄皮 × 1、完美的蛇皮 × 2','Legendary Alligator Skin × 1; Perfect Snake Skin × 2'),
      craftItem('trc6_2','传说山狮皮披风','Legendary Panther Cloak','传说山狮皮 × 1','Legendary Panther Pelt × 1'),
      craftItem('trc6_3','传说短吻鳄皮马甲','Legendary Alligator Vest','传说短吻鳄皮 × 1','Legendary Alligator Skin × 1'),
      craftItem('trc6_4','传说短吻鳄皮猎鸟靴','Legendary Alligator Fowlers','传说短吻鳄皮 × 1','Legendary Alligator Skin × 1'),
      craftItem('trc6_5','传说山狮皮射击手套','Legendary Panther Range Gloves','传说山狮皮 × 1、完美的吉拉毒蜥皮 × 1','Legendary Panther Pelt × 1; Perfect Gila Monster Skin × 1')
    ]),
    trapperClothingMenu('trc7','追踪者','The Stalker',[
      craftItem('trc7_1','传说公羊皮帽','Legendary Ram Hat','传说公羊皮 × 1','Legendary Ram Hide × 1'),
      craftItem('trc7_2','传说驼鹿皮狩猎夹克','Legendary Moose Hunting Jacket','传说驼鹿皮 × 1、完美的狼皮 × 1','Legendary Moose Pelt × 1; Perfect Wolf Pelt × 1'),
      craftItem('trc7_3','传说公羊皮蝙蝠翼套裤','Legendary Ram Batwing Chaps','传说公羊皮 × 1','Legendary Ram Hide × 1'),
      craftItem('trc7_4','传说驼鹿皮莫卡辛鞋','Legendary Moose Moccasins','传说驼鹿皮 × 1、完美的母牛皮 × 1','Legendary Moose Pelt × 1; Perfect Cow Hide × 1'),
      craftItem('trc7_5','传说公羊步枪手手套','Legendary Ram Rifleman Gloves','传说公羊皮 × 1、完美的野猪皮 × 1','Legendary Ram Hide × 1; Perfect Boar Pelt × 1')
    ]),
    trapperClothingMenu('trc8','牛鬼','The Ghost Bison',[
      craftItem('trc8_1','传说白野牛帽','Legendary White Bison Hat','传说白色野牛皮 × 1','Legendary White Bison Pelt × 1'),
      craftItem('trc8_2','传说白色野牛皮外套','Legendary White Bison Coat','传说白色野牛皮 × 1','Legendary White Bison Pelt × 1'),
      craftItem('trc8_3','传说麋鹿皮护腿','Legendary Elk Half Chaps','传说麋鹿皮 × 1、完美的绵羊皮 × 1','Legendary Elk Pelt × 1; Perfect Sheep Hide × 1'),
      craftItem('trc8_4','传说麋鹿皮莫卡辛鞋','Legendary Elk Moccasins','传说麋鹿皮 × 1、完美的山羊皮 × 1','Legendary Elk Pelt × 1; Perfect Goat Hide × 1'),
      craftItem('trc8_5','传说麋鹿皮射击手套','Legendary Elk Range Gloves','传说麋鹿皮 × 1','Legendary Elk Pelt × 1')
    ]),
    trapperClothingMenu('trc9','响尾蛇','The Rattler',[
      craftItem('trc9_1','公羊皮宽边帽子','Ram Sombrero','完美的公羊皮 × 1','Perfect Ram Hide × 1'),
      craftItem('trc9_2','户外马甲','Outdoorsmen Vest','完美的叉角羚皮 × 1','Perfect Pronghorn Hide × 1'),
      craftItem('trc9_3','西猯皮护腿','Javelina Half Chaps','完美的西猯皮 × 1、完美的蛇皮 × 1','Perfect Collared Peccary Pelt × 1; Perfect Snake Skin × 1'),
      craftItem('trc9_4','鬣蜥皮射击手套','Iguana Range Gloves','完美的西猯皮 × 1、完美的鬣蜥皮 × 2','Perfect Collared Peccary Pelt × 1; Perfect Iguana Skin × 2')
    ]),
    trapperClothingMenu('trc10','游牧者','The Drifter',[
      craftItem('trc10_1','山羊皮宽檐帽','Goat Flop Hat','完美的叉角羚皮 × 1、完美的山羊皮 × 1','Perfect Pronghorn Hide × 1; Perfect Goat Hide × 1'),
      craftItem('trc10_2','捕兽人披风','Trapper’s Cloak','完美的绵羊皮 × 1','Perfect Sheep Hide × 1'),
      craftItem('trc10_3','无主马甲','No-Man’s Vest','完美的山狮皮 × 1、完美的山羊皮 × 1','Perfect Panther Pelt × 1; Perfect Goat Hide × 1'),
      craftItem('trc10_4','双色莫卡辛鞋','Two Toned Moccasins','完美的公鹿皮 × 1','Perfect Buck Pelt × 1'),
      craftItem('trc10_5','驼鹿皮射击手套','Moose Range Gloves','完美的驼鹿皮 × 1','Perfect Moose Pelt × 1')
    ]),
    trapperClothingMenu('trc11','烈马克星','The Desperado',[
      craftItem('trc11_1','麋鹿皮宽檐帽','Elk Flop Hat','完美的麋鹿皮 × 1','Perfect Elk Pelt × 1'),
      craftItem('trc11_2','郊狼皮侦查夹克','Coyote Scout Jacket','完美的阉牛皮 × 1、完美的郊狼皮 × 1','Perfect Ox Hide × 1; Perfect Coyote Pelt × 1'),
      craftItem('trc11_3','猎人马甲','Huntsman Vest','完美的绵羊皮 × 1、完美的鹿皮 × 1','Perfect Sheep Hide × 1; Perfect Deer Pelt × 1'),
      craftItem('trc11_4','野猪皮流苏霰弹枪套裤','Boar-Fringed Shotgun Chaps','完美的野猪皮 × 2','Perfect Boar Pelt × 2'),
      craftItem('trc11_5','猪皮步枪手套','Pigskin Rifleman Gloves','完美的猪皮 × 1','Perfect Pig Hide × 1')
    ]),
    trapperClothingMenu('trc12','劫掠者','The Marauder',[
      craftItem('trc12_1','麝鼠皮骑兵帽','Muskrat Cavalry Hat','完美的兔皮 × 4、完美的麝鼠皮 × 1','Perfect Rabbit Pelt × 4; Perfect Muskrat Pelt × 1'),
      craftItem('trc12_2','首长马甲','Principal Vest','完美的母牛皮 × 1、完美的鹿皮 × 1','Perfect Cow Hide × 1; Perfect Deer Pelt × 1'),
      craftItem('trc12_3','公牛皮流苏霰弹枪套裤','Bull-Fringed Shotgun Chaps','完美的公牛皮 × 1','Perfect Bull Hide × 1'),
      craftItem('trc12_4','蛇皮骑兵手套','Snake Skin Cavalry Gloves','完美的野猪皮 × 1、完美的蛇皮 × 1','Perfect Boar Pelt × 1; Perfect Snake Skin × 1')
    ]),
    trapperClothingMenu('trc13','赏金猎人','The Bounty Hunter',[
      craftItem('trc13_1','种植园软帽','Plantation Slouch Hat','完美的野牛皮 × 1','Perfect Bison Pelt × 1'),
      craftItem('trc13_2','河狸皮狩猎夹克','Beaver Hunting Jacket','完美的母牛皮 × 1、完美的河狸皮 × 2','Perfect Cow Hide × 1; Perfect Beaver Pelt × 2'),
      craftItem('trc13_3','绵羊皮马甲','Sheepskin Vest','完美的绵羊皮 × 2','Perfect Sheep Hide × 2'),
      craftItem('trc13_4','叉角羚皮护腿','Pronghorn Half Chaps','完美的叉角羚皮 × 1','Perfect Pronghorn Hide × 1'),
      craftItem('trc13_5','公鹿皮骑行手套','Buck Riding Gloves','完美的公鹿皮 × 1','Perfect Buck Pelt × 1')
    ]),
    trapperClothingMenu('trc14','亡命之徒','The Bronco Buster',[
      craftItem('trc14_1','河狸皮流浪者帽','Beaver Drifter Hat','完美的河狸皮 × 2','Perfect Beaver Pelt × 2'),
      craftItem('trc14_2','狼皮外套','Wolf Coat','完美的公羊皮 × 1、完美的狼皮 × 1','Perfect Ram Hide × 1; Perfect Wolf Pelt × 1'),
      craftItem('trc14_3','比利马甲','Billy Vest','完美的犰狳皮 × 2、完美的山羊皮 × 1','Perfect Armadillo Skin × 2; Perfect Goat Hide × 1'),
      craftItem('trc14_4','野猪公牛皮猎鸟靴','Boar & Bull Fowler Boots','完美的阉牛皮 × 1、完美的野猪皮 × 1','Perfect Ox Hide × 1; Perfect Boar Pelt × 1'),
      craftItem('trc14_5','冬季骑兵手套','Winter Cavalry Gloves','完美的兔皮 × 1、完美的麝鼠皮 × 2','Perfect Rabbit Pelt × 1; Perfect Muskrat Pelt × 2')
    ]),
    trapperClothingMenu('trc15','午夜牧马人','The Night Wrangler',[
      craftItem('trc15_1','郊狼皮赌徒帽','Coyote Gambler’s Hat','完美的郊狼皮 × 2','Perfect Coyote Pelt × 2'),
      craftItem('trc15_2','美洲狮皮圆角外套','Cougar Cutaway Coat','完美的美洲狮皮 × 2、完美的黑熊皮 × 1','Perfect Cougar Pelt × 2; Perfect Black Bear Pelt × 1'),
      craftItem('trc15_3','荒野马甲','Wilderness Vest','完美的狼皮 × 1、完美的山狮皮 × 1','Perfect Wolf Pelt × 1; Perfect Panther Pelt × 1'),
      craftItem('trc15_4','驼鹿皮护腿','Moose Half Chaps','完美的驼鹿皮 × 1','Perfect Moose Pelt × 1'),
      craftItem('trc15_5','獾皮步枪手套','Badger Rifleman Gloves','完美的獾皮 × 1','Perfect Badger Pelt × 1')
    ]),
    trapperClothingMenu('trc16','山地野人','The Mountain Man',[
      craftItem('trc16_1','掷弹兵帽','Grenadier Hat','完美的麝鼠皮 × 1、完美的河狸皮 × 1','Perfect Muskrat Pelt × 1; Perfect Beaver Pelt × 1'),
      craftItem('trc16_2','公羊皮霰弹枪外套','Ram Shotgun Coat','完美的公羊皮 × 2','Perfect Ram Hide × 2'),
      craftItem('trc16_3','乡下马甲','Country Vest','完美的公鹿皮 × 1、完美的河狸皮 × 1','Perfect Buck Pelt × 1; Perfect Beaver Pelt × 1'),
      craftItem('trc16_4','麋鹿骑行手套','Elk Riding Gloves','完美的麋鹿皮 × 1','Perfect Elk Pelt × 1')
    ]),
    trapperClothingMenu('trc17','单件服装','Individual Clothing',[
      craftItem('trc17_1','獾皮山帽','Badger Mountain Hat','完美的獾皮 × 1','Perfect Badger Pelt × 1'),
      craftItem('trc17_2','河狸皮山帽','Beaver Mountain Hat','完美的河狸皮 × 1','Perfect Beaver Pelt × 1'),
      craftItem('trc17_3','狐狸皮山帽','Fox Mountain Hat','完美的狐狸皮 × 1','Perfect Fox Pelt × 1'),
      craftItem('trc17_4','臭鼬皮山帽','Skunk Mountain Hat','完美的臭鼬皮 × 1','Perfect Skunk Pelt × 1'),
      craftItem('trc17_5','熊皮掷弹兵山帽','Bear Grenadier Hat','完美的黑熊皮 × 1','Perfect Black Bear Pelt × 1'),
      craftItem('trc17_6','松鼠皮鸭舌帽','Squirrel Flat Cap','完美的松鼠皮 × 6','Perfect Squirrel Pelt × 6'),
      craftItem('trc17_7','鼠皮鸭舌帽','Rat Flat Cap','完美的老鼠皮 × 10','Perfect Rat Pelt × 10'),
      craftItem('trc17_8','蛇皮斗牛士帽','Snake Bulldogger Hat','完美的绵羊皮 × 1、完美的蛇皮 × 1','Perfect Sheep Hide × 1; Perfect Snake Skin × 1'),
      craftItem('trc17_9','鬣蜥皮大山谷帽','Iguana Big Valley Hat','完美的母牛皮 × 1、完美的鬣蜥皮 × 1','Perfect Cow Hide × 1; Perfect Iguana Skin × 1'),
      craftItem('trc17_10','吉拉毒蜥赌徒帽','Gila Monster Gambler’s Hat','完美的麋鹿皮 × 1、完美的吉拉毒蜥皮 × 1','Perfect Elk Pelt × 1; Perfect Gila Monster Skin × 1'),
      craftItem('trc17_11','叉角羚皮宽檐帽','Pronghorn Flop Hat','完美的叉角羚皮 × 1、完美的负鼠皮 × 4','Perfect Pronghorn Hide × 1; Perfect Opossum Pelt × 4'),
      craftItem('trc17_12','鹿皮骑兵帽','Deer Cavalry Hat','完美的鹿皮 × 1、渡鸦羽毛 × 10','Perfect Deer Pelt × 1; Raven Feather × 10'),
      craftItem('trc17_13','野牛皮赌徒帽','Bison Gambler’s Hat','完美的野牛皮 × 1、知更鸟羽毛 × 4、黄鹂羽毛 × 4','Perfect Bison Pelt × 1; Robin Feather × 4; Oriole Feather × 4'),
      craftItem('trc17_14','鼠皮步兵哈迪帽','Rat Infantry Hardee Hat','完美的山羊皮 × 1、完美的老鼠皮 × 6','Perfect Goat Hide × 1; Perfect Rat Pelt × 6'),
      craftItem('trc17_15','追踪者配饰','Stalker Accessory','潜鸟羽毛 × 2、神鹫羽毛 × 1、渡鸦羽毛 × 3','Loon Feather × 2; Condor Feather × 1; Raven Feather × 3'),
      craftItem('trc17_16','拾荒者配饰','Scavenger Accessory','秃鹫羽毛 × 1、海鸥羽毛 × 1','Vulture Feather × 1; Seagull Feather × 1'),
      craftItem('trc17_17','印第安配饰','Native Accessory','雉鸡羽毛 × 1、麻雀羽毛 × 4、知更鸟羽毛 × 3','Pheasant Feather × 1; Sparrow Feather × 4; Robin Feather × 3'),
      craftItem('trc17_18','朝圣配饰','Pilgrim Accessory','火鸡羽毛 × 1、雪松太平鸟羽毛 × 2、蓝松鸦羽毛 × 3','Turkey Feather × 1; Cedar Waxwing Feather × 2; Blue Jay Feather × 3'),
      craftItem('trc17_19','猎人配饰','Huntsman Accessory','完美的野猪皮 × 1、鹰羽毛 × 1、鹌鹑羽毛 × 2','Perfect Boar Pelt × 1; Hawk Feather × 1; Quail Feather × 2'),
      craftItem('trc17_20','先驱者配饰','Pioneer Accessory','火鸡羽毛 × 3、鸭羽毛 × 3、鸡羽毛 × 3','Turkey Feather × 3; Duck Feather × 3; Chicken Feather × 3'),
      craftItem('trc17_21','洛可可配饰','Rococo Accessory','乌鸦羽毛 × 2、北美红雀羽毛 × 2','Crow Feather × 2; Cardinal Feather × 2'),
      craftItem('trc17_22','华美配饰','Glorious Accessory','黄鹂羽毛 × 1、啄木鸟羽毛 × 4','Oriole Feather × 1; Woodpecker Feather × 4'),
      craftItem('trc17_23','追捕者配饰','Pursuer Accessory','雕羽毛 × 2、鸽子羽毛 × 2','Eagle Feather × 2; Pigeon Feather × 2'),
      craftItem('trc17_24','绚丽配饰','Majestic Accessory','公鸡羽毛 × 4、啄木鸟羽毛 × 2、鸣鸟羽毛 × 2','Rooster Feather × 4; Woodpecker Feather × 2; Songbird Feather × 2'),
      craftItem('trc17_25','家园配饰','Homestead Accessory','鸡羽毛 × 1、大雁羽毛 × 2','Chicken Feather × 1; Goose Feather × 2'),
      craftItem('trc17_26','睿智配饰','Judicious Accessory','雉鸡羽毛 × 1、猫头鹰羽毛 × 1','Pheasant Feather × 1; Owl Feather × 1'),
      craftItem('trc17_27','破旧游牧马甲','Rugged Wrangler Vest','完美的猪皮 × 1','Perfect Pig Hide × 1'),
      craftItem('trc17_28','内陆马甲','Hinterland Vest','完美的公羊皮 × 1','Perfect Ram Hide × 1'),
      craftItem('trc17_29','简朴马甲','Rustic Vest','完美的美洲狮皮 × 1','Perfect Cougar Pelt × 1'),
      craftItem('trc17_30','熊皮蝙蝠翼套裤','Bear Batwing Chaps','完美的熊皮 × 1','Perfect Bear Pelt × 1'),
      craftItem('trc17_31','阉牛皮流苏霰弹枪套裤','Ox-Fringed Shotgun Chaps','完美的阉牛皮 × 1','Perfect Ox Hide × 1'),
      craftItem('trc17_32','麋鹿皮流苏霰弹枪套裤','Elk-Fringed Shotgun Chaps','完美的麋鹿皮 × 1','Perfect Elk Pelt × 1'),
      craftItem('trc17_33','驼鹿皮蝙蝠翼套裤','Moose Batwing Chaps','完美的驼鹿皮 × 1','Perfect Moose Pelt × 1'),
      craftItem('trc17_34','蝙蝠翼套裤','Batwing Chaps','完美的鹿皮 × 1','Perfect Deer Pelt × 1'),
      craftItem('trc17_35','熊皮流苏霰弹枪套裤','Bear-Fringed Shotgun Chaps','完美的黑熊皮 × 1','Perfect Black Bear Pelt × 1'),
      craftItem('trc17_36','绵羊皮蝙蝠翼套裤','Sheep Batwing Chaps','完美的绵羊皮 × 2','Perfect Sheep Hide × 2'),
      craftItem('trc17_37','麝鼠皮护腿','Muskrat Half Chaps','完美的麝鼠皮 × 2','Perfect Muskrat Pelt × 2'),
      craftItem('trc17_38','鹿皮护腿','Deer Pelt Half Chaps','完美的鹿皮 × 1','Perfect Deer Pelt × 1'),
      craftItem('trc17_39','西猯皮莫卡辛鞋','Javelina Moccasins','完美的西猯皮 × 2','Perfect Collared Peccary Pelt × 2'),
      craftItem('trc17_40','臭鼬皮捕兽人靴','Skunk Trapper Boots','完美的臭鼬皮 × 2','Perfect Skunk Pelt × 2'),
      craftItem('trc17_41','莫卡辛鞋','Moccasins','完美的公鹿皮 × 1','Perfect Buck Pelt × 1')
    ])
  ];
  var TK = [
    I('tk1','海狸牙 饰品','布彻溪西,范霍恩附近','','','材料:传说海狸部位 · 效果:武器损耗速度-10%'),
    I('tk2','雄鹿角 饰品','大峡谷,草莓西北','','','材料:传说公鹿部位 · 效果:提高剥皮获得高品质部件概率'),
    I('tk3','美洲狮獠牙 饰品','加普图斯岭,新奥斯汀','','epilogue','材料:传说美洲狮部位 · 效果:体力经验+10%'),
    I('tk4','郊狼獠牙 饰品','斯嘉丽草甸,罗德斯西北','','','材料:传说郊狼部位 · 效果:死亡之眼经验+10%'),
    I('tk5','麋鹿角 饰品','巴克斯站以东','','','材料:传说麋鹿部位 · 效果:搜刮到的钱增加10%'),
    I('tk6','狐狸爪 饰品','Mattock Pond,罗德斯以北','','','材料:传说狐狸部位 · 效果:鹰眼持续时间+5秒'),
    I('tk7','驼鹿角 饰品','罗诺克岭东北','','','材料:传说驼鹿部位 · 效果:体力经验+10%'),
    I('tk8','黑豹之眼 饰品','夏迪贝尔以西','需先完成狩猎大师10级','','材料:传说黑豹部位 · 效果:死亡之眼消耗减缓10%,持续3秒'),
    I('tk9','叉角羚角 饰品','里奥布拉沃,新奥斯汀','','epilogue','材料:传说叉角羚部位 · 效果:马背驮载的动物尸体不会腐烂'),
    I('tk10','公羊角 饰品','猫尾塘','','','材料:传说大角羊部位 · 效果:爬地百里香/牛至/野薄荷采集量翻倍'),
    I('tk11','野牛角 饰品(Tatanka)','Manteca Falls 附近,新奥斯汀','','epilogue','材料:传说野牛部位 · 效果:近战伤害减免10%'),
    I('tk12','狼之心 饰品','科托拉泉','','','材料:传说狼部位 · 效果:可承受双倍酒精而不产生完全负面效果'),
    I('tk13','短吻鳄牙护身符','材料:短吻鳄牙+金关节手镯+复古内战手铐','手铐来自集齐任意香烟卡套','','效果:死亡之眼核心消耗减缓10%'),
    I('tk14','熊爪护身符','材料:熊爪+银链手镯+石英碎块','石英碎块来自邮寄第1处恐龙骨获得','','效果:生命核心消耗减缓10%'),
    I('tk15','野猪獠牙护身符','材料:野猪獠牙+金耳环+钴化木','钴化木在伊莎贝拉湖洞穴附近木箱','','效果:马匹生命/体力核心消耗减缓10%'),
    I('tk16','野牛角护身符','材料:白野牛角+银耳环+鲍鱼壳碎片','碎片在罗德斯当铺以北的老宅内','','效果:体力核心消耗减缓10%'),
    I('tk17','渡鸦爪护身符','材料:渡鸦爪+旧黄铜指南针+银链手镯','指南针来自集齐10块石雕交给Sinclair','','效果:武器损耗速度减缓20%'),
    I('tk18','鹰爪饰品','Deadboot Creek 营地遗址','','','效果:拉弓时体力消耗减少30%'),
    I('tk19','猫眼饰品','布莱斯韦特庄园以西小岛的锁箱','','','效果:强化药水效果时长延长20%'),
    I('tk20','鲨鱼牙饰品','安纳斯堡以北沉船附近锁箱','','','效果:马匹好感度经验+10%'),
    I('tk21','龟壳饰品','加普图斯山口最大建筑楼梯下','','','效果:生命值恢复速度+10%'),
    I('tk22','乌鸦喙饰品','元素之路藏宝任务最终奖励','','','效果:搜刮到的弹药增加10%'),
    I('tk23','狮爪饰品','任务奖励:《他当然是英国人》','','','效果:体力经验+10%'),
    I('tk24','猫头鹰羽毛饰品','任务奖励:《入门考古学》(非致命方式完成)','','','效果:三条核心槽消耗速度均-15%'),
    I('tk25','鬣蜥鳞片饰品','特别版/终极版预购奖励','','','效果:骑马时受到的伤害-10%'),
    I('tk26','鹰爪护身符(预购)','特别版/终极版预购奖励,第二章可换','','','效果:鹰眼持续时间+5秒')
  ];
  function reinforcedItem(id, zhName, enName, zhChallenge, enChallenge, rank) {
    var item = I(id, zhName, '', '', '', '解锁：完成“' + zhChallenge + '”挑战第' + rank + '级', enName);
    item.nEn = 'Unlock: complete ' + enChallenge + ' Challenge ' + rank;
    return item;
  }
  var REINFORCED_EQUIPMENT = [
    reinforcedItem('re1','强盗子弹带','Bandit Bandolier','强盗','Bandit',1),
    reinforcedItem('re2','强盗枪带','Bandit Gun Belt','强盗','Bandit',10),
    reinforcedItem('re3','强盗手枪套','Bandit Holster','强盗','Bandit',3),
    reinforcedItem('re4','强盗副手枪套','Bandit Off-Hand Holster','强盗','Bandit',7),
    reinforcedItem('re5','探险家子弹带','Explorer Bandolier','探险家','Explorer',3),
    reinforcedItem('re6','探险家枪带','Explorer Gun Belt','探险家','Explorer',7),
    reinforcedItem('re7','探险家手枪套','Explorer Holster','探险家','Explorer',1),
    reinforcedItem('re8','探险家副手枪套','Explorer Off-Hand Holster','探险家','Explorer',10),
    reinforcedItem('re9','赌徒子弹带','Gambler Bandolier','赌徒','Gambler',3),
    reinforcedItem('re10','赌徒枪带','Gambler Gun Belt','赌徒','Gambler',7),
    reinforcedItem('re11','赌徒手枪套','Gambler Holster','赌徒','Gambler',1),
    reinforcedItem('re12','赌徒副手枪套','Gambler Off-Hand Holster','赌徒','Gambler',10),
    reinforcedItem('re13','草药大师子弹带','Herbalist Bandolier','草药大师','Herbalist',10),
    reinforcedItem('re14','草药大师枪带','Herbalist Gun Belt','草药大师','Herbalist',3),
    reinforcedItem('re15','草药大师手枪套','Herbalist Holster','草药大师','Herbalist',7),
    reinforcedItem('re16','草药大师副手枪套','Herbalist Off-Hand Holster','草药大师','Herbalist',1),
    reinforcedItem('re17','骑手子弹带','Horseman Bandolier','骑手','Horseman',7),
    reinforcedItem('re18','骑手枪带','Horseman Gun Belt','骑手','Horseman',1),
    reinforcedItem('re19','骑手手枪套','Horseman Holster','骑手','Horseman',3),
    reinforcedItem('re20','骑手副手枪套','Horseman Off-Hand Holster','骑手','Horseman',10),
    reinforcedItem('re21','捕猎大师子弹带','Master Hunter Bandolier','捕猎大师','Master Hunter',3),
    reinforcedItem('re22','捕猎大师枪带','Master Hunter Gun Belt','捕猎大师','Master Hunter',7),
    reinforcedItem('re23','捕猎大师手枪套','Master Hunter Holster','捕猎大师','Master Hunter',10),
    reinforcedItem('re24','捕猎大师副手枪套','Master Hunter Off-Hand Holster','捕猎大师','Master Hunter',1),
    reinforcedItem('re25','神射手子弹带','Sharpshooter Bandolier','神射手','Sharpshooter',1),
    reinforcedItem('re26','神射手枪带','Sharpshooter Gun Belt','神射手','Sharpshooter',10),
    reinforcedItem('re27','神射手手枪套','Sharpshooter Holster','神射手','Sharpshooter',3),
    reinforcedItem('re28','神射手副手枪套','Sharpshooter Off-Hand Holster','神射手','Sharpshooter',7),
    reinforcedItem('re29','生存大师子弹带','Survivalist Bandolier','生存大师','Survivalist',7),
    reinforcedItem('re30','生存大师枪带','Survivalist Gun Belt','生存大师','Survivalist',1),
    reinforcedItem('re31','生存大师手枪套','Survivalist Holster','生存大师','Survivalist',10),
    reinforcedItem('re32','生存大师副手枪套','Survivalist Off-Hand Holster','生存大师','Survivalist',3),
    reinforcedItem('re33','武器专家子弹带','Weapons Expert Bandolier','武器专家','Weapons Expert',10),
    reinforcedItem('re34','武器专家枪带','Weapons Expert Gun Belt','武器专家','Weapons Expert',3),
    reinforcedItem('re35','武器专家手枪套','Weapons Expert Holster','武器专家','Weapons Expert',1),
    reinforcedItem('re36','武器专家副手枪套','Weapons Expert Off-Hand Holster','武器专家','Weapons Expert',7)
  ];
  /* ---------------------------------------------------------------- */
  /* CATEGORY SAT — 背包升级(现为"捕猎"下属子板块)                       */
  /* ---------------------------------------------------------------- */
  var SAT_ITEMS = [
    I('st1','药水背包','材料:完美鹿皮+完美公鹿皮+完美麋鹿皮','解锁:升级药品马车两次','',''),
    I('st2','原料背包','材料:完美鹿皮+完美獾皮+完美松鼠皮','解锁:向 Pearson 捐赠5具动物尸体','',''),
    I('st3','工具包背包','材料:完美鹿皮+完美麋鹿皮+完美黑豹皮','解锁:向营地捐赠箱捐赠3件贵重物品','',''),
    I('st4','食材背包','材料:完美鹿皮+完美野牛皮+完美浣熊皮','解锁:升级补给马车两次','',''),
    I('st5','材料背包','材料:完美鹿皮+完美野猪皮+完美鬣蜥皮','解锁:在营火处制作3个配方','',''),
    I('st6','贵重物品背包','材料:完美鹿皮+完美海狸皮+完美兔皮','解锁:向营地捐赠箱捐赠$50','',''),
    I('st7','东部传说套装','材料:完美鹿皮+完美美洲狮皮+完美狼皮','解锁:先做出以上全部6种背包','','')
  ];

  var HUNT_GROUPS = [
    { id:'la', name:'传说动物', desc:'', items: LA },
    { id:'lf', name:'传说鱼', desc:'', items: LF },
    { id:'trc', name:'捕兽人服装', desc:'', items: TRAPPER_CLOTHING },
    { id:'re', name:'强化装备', desc:'', items: REINFORCED_EQUIPMENT },
    { id:'tk', name:'小饰品与护身符', desc:'', items: TK },
    { id:'st', name:'背包升级', desc:'', items: SAT_ITEMS }
  ];

  /* ---------------------------------------------------------------- */
  /* CATEGORY BOUNTY — 悬赏令                                           */
  /* ---------------------------------------------------------------- */
  var BOUNTY_ITEMS = [
    I('bo1','Benedict Allbright','范葛伦警长办公室 · 达科塔河以北','','','必须活捉'),
    I('bo2','Ellie Anne Swan','圣丹尼斯警局 · Wallace Station 附近','','','必须活捉'),
    I('bo3','Joshua Brown','草莓监狱 · 西北矿洞','完成《怜悯即弱?》后','','必须活捉'),
    I('bo4','Bart Cavanaugh(PC限定)','草莓监狱 · 帮派营地','',''),
    I('bo5','Mark Johnson','罗德斯车站','完成第四章《文明的乐趣》后','','必须活捉,不会反抗'),
    I('bo6','Robbie Laidlaw','罗德斯车站 · 布莱斯韦特庄园东南','','','必须活捉,先去 Old Harry Fen'),
    I('bo7','Lindsay Woffard','圣丹尼斯警局 · Emerald Ranch 东,卡马萨河附近','','honor','可死可活,死活赏金不同'),
    I('bo8','Anthony Foreman','圣丹尼斯警局 · Doyle\'s Tavern','尾声《稳定收入》后','epilogue','必须活捉'),
    I('bo9','Elias Green','黑水镇警局','尾声《稳定收入》后','epilogue','可死可活'),
    I('bo10','Otis Skinner','黑水镇警局','尾声《稳定收入》后','epilogue','建议活捉,奖励更好'),
    I('bo11','Herman Zizendorf(PC限定)','黑水镇警局','','epilogue','必须活捉'),
    I('bo12','Esteban Cortez','干草堆镇监狱','需先目击德尔洛沃处决事件','','可死可活'),
    I('bo13','Joaquin Arroyo','干草堆镇监狱 · Benedict Point 西南谷仓线索','需先目击德尔洛沃处决事件','','必须活捉')
  ];

  /* ---------------------------------------------------------------- */
  /* CATEGORY D — 趣味探索                                              */
  /* ---------------------------------------------------------------- */
  var D_ITEMS = [
    I('d1','稀有滚轮式步枪','《为了体育的魔术师》任务尾声 · 布莱斯韦特庄园附近谷仓','','missable','务必在任务中搜刮尸体,过后大概率永久错过','Rare Rolling Block Rifle'),
    I('d2','神枪手系列武器搜刮','范葛伦 Keane\'s Saloon · Theodore Levin','','','跨多章,击败每名枪手后记得搜身拿走专属武器','The Noblest of Men, and a Woman'),
    I('d5','藏宝图 · 杰克霍尔帮(3张)','Flatneck Station 附近 · Maximo','','','','All That Glitters'),
    I('d6','藏宝图 · 毒药小径(3张)','Cairn Lake 小屋床底','',''),
    I('d7','藏宝图 · 隐士撕裂地图(2张)','Manito Glade & Little Creek River','',''),
    I('d8','藏宝图 · 高额赌注(3张)','随机路人/流动商人处购得','',''),
    I('d9','藏宝图 · 东部传说套装链','前置:艺术家之道','',''),
    I('d15','藏宝图 · 元素踪迹(3张)','新奥斯汀 · 图博威德西南,科罗纳多海边尸体','','','需尾声第一部分才能进入新奥斯汀;终点奖励含乌鸦嘴徽章饰品(见下方"捕猎→饰品"tk22)','Treasure Map · The Elemental Trail (3 maps)'),
    I('d16','藏宝图 · 亡者之财(3张,预购/特别版专属)','大地之心 · 林普尼监狱牢房(弗拉特内克站附近)','','','仅预购或特别版/终极版拥有者可获得,奖励6条金条','Treasure Map · Le Trésor Des Morts (3 maps, pre-order/Special Edition exclusive)'),
    I('d17','隐藏武器 · 鹿角猎刀','西伊丽莎白 · 大谷地,吊狗牧场西北','','','纯外观武器,剥皮/分裂子弹动画会自动切换回猎刀','Unique Weapon · Antler Knife'),
    I('d18','隐藏武器 · 破损海盗剑','莱莫因 · 巴约努瓦,圣丹尼斯南桥外小岛沉船','','','岛屿周边有鳄鱼出没,注意安全','Unique Weapon · Broken Pirate Sword'),
    I('d19','隐藏武器 · 南北战争猎刀','罗诺克岭 · 布伦南德堡地下室(范霍恩贸易站西南)','','','无法自定义外观','Unique Weapon · Civil War Knife'),
    I('d20','隐藏武器 · 维京战斧','罗诺克岭 · "古墓"遗迹(海狸谷东北)','','','投掷后须去捡回,不会像其他投掷武器一样自动回到武器轮盘;仅剧情模式可获取','Unique Weapon · Viking Hatchet'),
    I('d21','隐藏武器 · 宽刃猎刀','西伊丽莎白 · 沙恩山西侧"贝丽尔的梦"矿洞','','','需先用炸药炸开洞口;纯外观武器,剥皮动画自动切换回猎刀','Unique Weapon · Wide-Blade Knife')
  ];

  /* ---------------------------------------------------------------- */
  /* CATEGORY TC — 总完成度(官方游戏内"进度→完成度"菜单,39项)          */
  /* ---------------------------------------------------------------- */
  var TC_ITEMS = [
    T('tc1','完成107个主线任务','107 main story missions'),
    T('tc2','完成10个陌生人任务','10 stranger missions'),
    T('th_bounty5','完成5个悬赏','Complete 5 bounties','🧮 自动统计:根据下方"悬赏令"已完成数量计算',true),
    T('tc3','触发25次偶遇事件','25 chance encounters'),
    T('tc4','参与1次帮派伏击','1 gang ambush'),
    T('tc5','清剿6个帮派老巢','6 gang hideouts'),
    T('tc6','洗一次澡','Have a bath'),
    T('tc7','观看一次演出','Watch one show'),
    T('tc30','造访一次圣丹尼斯剧院','Visit the theater in Saint Denis'),
    T('tc31','找到并与5名特殊路人互动','Find and interact with 5 special characters'),
    T('tc8','玩一局21点','Play blackjack'),
    T('tc9','玩一局多米诺','Play dominoes'),
    T('tc10','玩一局五指刀','Play five finger fillet'),
    T('tc11','玩一局扑克','Play poker'),
    T('tc12','到访至少1个兴趣点(POI)','At least 1 point of interest'),
    T('tc13','找到地图上的每一座坟墓','Visit every grave'),
    T('tc14','挖出1处埋藏的宝藏','One buried treasure'),
    T('th_cc1','集齐至少1套香烟卡','At least 1 set of cigarette cards','🧮 自动统计:根据下方"全收集→香烟卡"已集齐套数计算',true),
    T('a2','完成《渔夫的收获》','A Fisher of Fish','🔗 与下方"支线任务与营地请求"联动,勾任意一处会同步'),
    T('tc15','完成《信心的考验》','A Test of Faith','触发条件:交给古生物学家全部恐龙骨(见下方"全收集→恐龙骨")'),
    T('a4','完成《公爵夫人与其他动物》','Duchesses and Other Animals','🔗 与下方"支线任务与营地请求"联动,勾任意一处会同步'),
    T('tc16','完成《一个更好的世界,一个新朋友》','A Better World, A New Friend'),
    T('tc17','完成《地质学入门》','Geology for Beginners','触发条件:交给隐士 Francis Sinclair 全部10块石雕(见下方"全收集→石雕")'),
    T('gc_rc','找齐全部10块石雕','Find 10 rock carvings','🔗 与下方"全收集→石雕"完全联动,可在这里一键勾选/取消全部'),
    T('gc_dc','找到全部20个捕梦网','Find all 20 dreamcatchers','🔗 与下方"全收集→捕梦网"完全联动'),
    T('tc18','获得10件装备(Equipment)收藏品','Get 10 equipment items','🔗 根据图鉴中的装备完成数自动统计',true),
    T('tc19','研究50种动物(图鉴)','Study 50 animals','🔗 根据图鉴中的动物完成数自动统计',true),
    T('th_la5','猎杀5只传说动物','Hunt 5 legendary animals','🧮 自动统计:根据下方"捕猎→传说动物"已猎杀数量计算',true),
    T('tc20','钓到10种不同的鱼','Fish 10 different types of fish','🔗 根据图鉴中的鱼类完成数自动统计',true),
    T('tc21','发现6个帮派','Discover 6 gangs','🔗 根据图鉴中的帮派完成数自动统计',true),
    T('tc22','发现20种植物','Discover 20 plants','🔗 根据图鉴中的植物完成数自动统计',true),
    T('tc23','发现10个马匹品种','Discover 10 horse breeds','🔗 根据图鉴中的马匹完成数自动统计',true),
    T('tc24','与自己的马达到最高羁绊','Max bond with your horse'),
    T('tc25','获得48种不同武器','Obtain 48 different weapons','🔗 根据图鉴中的武器完成数自动统计',true),
    T('tc26','每个类别至少制作1个配方','Craft 1 recipe from each category'),
    T('tc27','点满全部核心属性','Max all your stats'),
    T('tc28','找到5处棚屋(Shacks)','Find 5 shacks'),
    T('tc29','完成每一种类型的抢劫','Perform every type of robbery'),
    T('gc_ch','完成全部九大挑战','Complete every challenge','🔗 与下方"九大挑战"全部内容完全联动,点这里会一并勾选/取消全部(请谨慎点击)')
  ];

  function addTotalCompletionDetails(id, label, labelEn, request, spoiler) {
    var item = TC_ITEMS.find(function (entry) { return entry.id === id; });
    if (!item) return;
    item.detailsLabel = label;
    item.detailsLabelEn = labelEn;
    item.details = [request];
    item.detailsWarning = !!spoiler;
    item.syncDetails = true;
  }

  addTotalCompletionDetails('tc5', '帮派老巢明细', 'Gang hideout details', {
    id:'tc5_hideouts',
    t:'6个帮派老巢',
    en:'6 gang hideouts',
    note:'前4个随主线完成，后2个于尾声开放',
    noteEn:'The first 4 are completed during the story; the final 2 open in the Epilogue',
    items:[
      I('tc5_six_point','六点小屋','','','','','Six Point Cabin'),
      I('tc5_shady_belle','谢迪贝莱','','','','','Shady Belle'),
      I('tc5_beaver_hollow','河狸洞窟','','','','','Beaver Hollow'),
      I('tc5_hanging_dog','吊狗牧场','','','','','Hanging Dog Ranch'),
      I('tc5_thieves_landing','盗贼领地','','','','','Thieves Landing'),
      I('tc5_fort_mercer','默瑟堡','','','','','Fort Mercer')
    ]
  }, false);

  addTotalCompletionDetails('tc13', '⚠️ 剧透警告 · 9座坟墓', '⚠️ Spoiler warning · 9 graves', {
    id:'tc13_graves',
    t:'需要祭拜的坟墓',
    en:'Graves to pay respects at',
    note:'仅在完成主线后开放',
    noteEn:'Available only after completing the story',
    items:[
      I('tc13_jenny','珍妮·柯克','','','','','Jenny Kirk'),
      I('tc13_davey','戴维·卡兰德','','','','','Davey Callander'),
      I('tc13_eagle_flies','飞鹰','','','','','Eagle Flies'),
      I('tc13_arthur','亚瑟·摩根','','','','','Arthur Morgan'),
      I('tc13_susan','苏珊·格里姆肖','','','','','Susan Grimshaw'),
      I('tc13_hosea','何西阿·马修斯','','','','','Hosea Matthews'),
      I('tc13_lenny','蓝尼·萨默斯','','','','','Lenny Summers'),
      I('tc13_kieran','基兰·达菲','','','','','Kieran Duffy'),
      I('tc13_sean','西恩·麦奎尔','','','','','Sean MacGuire')
    ]
  }, true);

  addTotalCompletionDetails('tc26', '6类配方明细', '6 recipe categories', {
    id:'tc26_recipes',
    t:'每类至少制作1项',
    en:'Craft at least 1 item in each category',
    items:[
      I('tc26_cooking','烹饪配方','','','','','Cooking recipe'),
      I('tc26_tonic','补剂','','','','','Tonic'),
      I('tc26_ammunition','弹药','','','','','Ammunition'),
      I('tc26_hunting','狩猎用品','','','','','Hunting item'),
      I('tc26_horse_care','马匹护理用品','','','','','Horse care item'),
      I('tc26_weapon','武器','','','','','Weapon')
    ]
  }, false);

  addTotalCompletionDetails('tc29', '4类抢劫明细', '4 robbery types', {
    id:'tc29_robberies',
    t:'每种类型各完成1次',
    en:'Complete each type once',
    items:[
      I('tc29_coach','马车抢劫','','','','','Coach robbery'),
      I('tc29_home','民宅抢劫','','','','','Home robbery'),
      I('tc29_shop','商店抢劫','','','','','Shop robbery'),
      I('tc29_train','火车抢劫','','','','','Train robbery')
    ]
  }, false);

  // GROUP_LINKS: 官方清单里的"聚合"条目 —— 勾选/取消会级联到 ids 里的每一项,反之全部勾满时它才会自动打勾。
  var GROUP_LINKS = {
    gc_rc: RC.map(function (it) { return it.id; }),
    gc_dc: DC.map(function (it) { return it.id; }),
    gc_ch: CH_GROUPS.reduce(function (acc, g) { return acc.concat(g.items.map(function (it) { return it.id; })); }, [])
  };

  // THRESHOLD_LINKS: 官方清单里的"自动计数"条目 —— 只读,当 ids 中已勾选数量达到 count 时自动打勾。
  var THRESHOLD_LINKS = {
    th_bounty5: { ids: BOUNTY_ITEMS.map(function (it) { return it.id; }), count: 5 },
    th_cc1:     { ids: CC.map(function (it) { return it.id; }), count: 1 },
    th_la5:     { ids: LA.map(function (it) { return it.id; }), count: 5 }
  };

  // The Compendium is the single source of truth for these aggregate goals.
  function readCompendiumState(){
    try { return JSON.parse(localStorage.getItem('rdr2-compendium-v1') || '{}') || {}; }
    catch (e) { return {}; }
  }

  function compendiumCount(saved, prefix, first, last, excluded){
    var count = 0;
    excluded = excluded || {};
    for (var i = first; i <= last; i++) {
      var id = prefix + i;
      if (!excluded[id] && saved[id]) count++;
    }
    return count;
  }

  var COMPENDIUM_ITEM_LINKS = {
    la1:'animals-165', la2:'animals-164', la3:'animals-177', la4:'animals-168',
    la5:'animals-169', la6:'animals-171', la7:'animals-173', la8:'animals-172',
    la9:'animals-174', la10:'animals-166', la11:'animals-178', la12:'animals-175',
    la13:'animals-163', la14:'animals-170', la15:'animals-176', la16:'animals-167',
    lf1:'fish-25', lf2:'fish-22', lf3:'fish-27', lf4:'fish-28',
    lf5:'fish-18', lf6:'fish-23', lf7:'fish-16', lf8:'fish-17',
    lf9:'fish-30', lf10:'fish-21', lf11:'fish-20', lf12:'fish-19',
    lf13:'fish-24', lf14:'fish-26',
    tk1:'equipment-23', tk2:'equipment-24', tk3:'equipment-25', tk4:'equipment-26',
    tk5:'equipment-27', tk6:'equipment-28', tk7:'equipment-29', tk8:'equipment-38',
    tk9:'equipment-31', tk10:'equipment-32', tk11:'equipment-22', tk12:'equipment-36',
    tk13:'equipment-18', tk14:'equipment-21', tk15:'equipment-19', tk16:'equipment-20',
    tk17:'equipment-34', tk18:'equipment-40', tk19:'equipment-41', tk20:'equipment-43',
    tk21:'equipment-39', tk22:'equipment-42', tk23:'equipment-37', tk24:'equipment-30',
    tk25:'equipment-35', tk26:'equipment-33',
    re1:'equipment-44', re2:'equipment-45', re3:'equipment-46', re4:'equipment-47',
    re5:'equipment-48', re6:'equipment-49', re7:'equipment-50', re8:'equipment-51',
    re9:'equipment-52', re10:'equipment-53', re11:'equipment-54', re12:'equipment-55',
    re13:'equipment-56', re14:'equipment-57', re15:'equipment-58', re16:'equipment-59',
    re17:'equipment-60', re18:'equipment-61', re19:'equipment-62', re20:'equipment-63',
    re21:'equipment-64', re22:'equipment-65', re23:'equipment-66', re24:'equipment-67',
    re25:'equipment-68', re26:'equipment-69', re27:'equipment-70', re28:'equipment-71',
    re29:'equipment-72', re30:'equipment-73', re31:'equipment-74', re32:'equipment-75',
    re33:'equipment-76', re34:'equipment-77', re35:'equipment-78', re36:'equipment-79'
  };

  function saveCompendiumLinkedItem(mainId, checked){
    var compendiumId = COMPENDIUM_ITEM_LINKS[mainId];
    if (!compendiumId) return;
    var saved = readCompendiumState();
    if (checked) saved[compendiumId] = true;
    else delete saved[compendiumId];
    try { localStorage.setItem('rdr2-compendium-v1', JSON.stringify(saved)); }
    catch (e) {}
  }

  function syncCompendiumItems(){
    var saved = readCompendiumState();
    var equipmentExcluded = {'equipment-33':true, 'equipment-35':true};
    st('tc18').c = compendiumCount(saved, 'equipment-', 1, 79, equipmentExcluded) >= 10;
    st('tc19').c = compendiumCount(saved, 'animals-', 1, 178) >= 50;
    st('tc20').c = compendiumCount(saved, 'fish-', 1, 30) >= 10;
    st('tc21').c = compendiumCount(saved, 'gangs-', 1, 6) >= 6;
    st('tc22').c = compendiumCount(saved, 'plants-', 1, 43) >= 20;
    st('tc23').c = compendiumCount(saved, 'horses-', 1, 19) >= 10;
    st('tc25').c = compendiumCount(saved, 'weapons-', 1, 63) >= 48;
    for (var set = 0; set < 12; set++) {
      var first = set * 12 + 1;
      st('cc' + (set + 1)).c = compendiumCount(saved, 'cards-', first, first + 11) === 12;
    }
    Object.keys(COMPENDIUM_ITEM_LINKS).forEach(function (mainId) {
      st(mainId).c = !!saved[COMPENDIUM_ITEM_LINKS[mainId]];
    });
  }

  function syncComputedItems(){
    for (var gid in GROUP_LINKS) {
      var ids = GROUP_LINKS[gid];
      st(gid).c = ids.length > 0 && ids.every(function (id) { return st(id).c; });
    }
    for (var tid in THRESHOLD_LINKS) {
      var cfg = THRESHOLD_LINKS[tid];
      var doneCount = cfg.ids.reduce(function (n, id) { return n + (st(id).c ? 1 : 0); }, 0);
      st(tid).c = doneCount >= cfg.count;
    }
  }

  /* ---------------------------------------------------------------- */
  /* CATEGORIES ROOT                                                    */
  /* ---------------------------------------------------------------- */
  var CATS = [
    { id:'TC', name:'总完成度', kind:'flat', desc:'', items:TC_ITEMS },
    { id:'A', name:'支线任务与营地请求&活动', kind:'grouped', desc:'', groups:A_GROUPS },
    { id:'CH', name:'九大挑战', kind:'grouped', desc:'', groups:CH_GROUPS },
    { id:'COL', name:'全收集', kind:'grouped', desc:'', groups:COL_GROUPS },
    { id:'HUNT', name:'捕猎', kind:'grouped', desc:'', groups:HUNT_GROUPS },
    { id:'BOUNTY', name:'悬赏令', kind:'flat', desc:'', items:BOUNTY_ITEMS },
    { id:'D', name:'趣味探索', kind:'flat', desc:'', items:D_ITEMS }
  ];

  /* ---------------------------------------------------------------- */
  /* CHAPTER TAGGING — replaces the old 绝版预警/需尾声/荣誉关联 filter set   */
  /* with a per-item "which chapter(s) does this appear in" tag.        */
  /* 'full' is a wildcard tag for 全流程/随时可做 items: it matches every   */
  /* chapter filter (not just 全部), since these are always doable.      */
  /* ---------------------------------------------------------------- */
  var CHAPTER_META = [
    { id:'ch1',  label:'第一章', badge:'Ch1', labelEn:'Chapter 1', badgeEn:'Ch1' },
    { id:'ch2',  label:'第二章', badge:'Ch2', labelEn:'Chapter 2', badgeEn:'Ch2' },
    { id:'ch3',  label:'第三章', badge:'Ch3', labelEn:'Chapter 3', badgeEn:'Ch3' },
    { id:'ch4',  label:'第四章', badge:'Ch4', labelEn:'Chapter 4', badgeEn:'Ch4' },
    { id:'ch5',  label:'第五章', badge:'Ch5', labelEn:'Chapter 5', badgeEn:'Ch5' },
    { id:'ch6',  label:'第六章', badge:'Ch6', labelEn:'Chapter 6', badgeEn:'Ch6' },
    { id:'epi1', label:'尾声1', badge:'尾声1', labelEn:'Epilogue 1', badgeEn:'Epi1' },
    { id:'epi2', label:'尾声2', badge:'尾声2', labelEn:'Epilogue 2', badgeEn:'Epi2' }
  ];
  var CHAPTER_META_BY_ID = {};
  CHAPTER_META.forEach(function (c) { CHAPTER_META_BY_ID[c.id] = c; });

  // chLabel/chBadge: language-aware accessors for the chapter metadata above.
  function chLabel(meta){ return lang === 'en' ? meta.labelEn : meta.label; }
  function chBadge(meta){ return lang === 'en' ? meta.badgeEn : meta.badge; }

  /* ---------------------------------------------------------------- */
  /* ENGLISH TRANSLATIONS — researched from official RDR2 sources where   */
  /* possible (challenge ranks, legendary animals/fish, trapper outfits,  */
  /* trinkets/talismans, cigarette-card sets, treasure-map chains); place  */
  /* names and free-text notes translated directly. See the chat summary  */
  /* for the handful of lower-confidence items flagged to the user.       */
  /* ---------------------------------------------------------------- */
  var TITLE_EN = {"a6":"Abigail's Camp Request","a8":"Javier's Camp Request","a9":"Mary Beth's Camp Request","a10":"Jack's Camp Request (Penny Dreadful)","a11":"Jack's Camp Request (Thimble)","a12":"Pearson's Camp Request (Rabbit)","a13":"Pearson's Camp Request (Compass)","a14":"Bill's Camp Request","a15":"Charles's Camp Request (Oleander)","a16":"Charles's Camp Request (Moonshine)","a17":"Charles's Camp Request (Eagle Feather)","a18":"Dutch's Camp Request","a19":"Hosea's Camp Request (Ginseng)","a20":"Hosea's Camp Request (Book)","a21":"Lenny's Camp Request","a22":"Molly's Camp Request","a23":"Kieran's Camp Request","a24":"Sadie's Camp Request","a25":"Sean's Camp Request","a26":"Susan's Camp Request","a27":"Tilly's Camp Request","a28":"Uncle's Camp Request (Epilogue)","we1":"Rank 1","we2":"Rank 2","we3":"Rank 3","we4":"Rank 4","we5":"Rank 5","we6":"Rank 6","we7":"Rank 7","we8":"Rank 8","we9":"Rank 9","we10":"Rank 10","he2":"Rank 2","he3":"Rank 3","he4":"Rank 4","he5":"Rank 5","he6":"Rank 6","he7":"Rank 7","he8":"Rank 8","he9":"Rank 9","he10":"Rank 10","ga1":"Rank 1","ga2":"Rank 2","ga3":"Rank 3","ga4":"Rank 4","ga5":"Rank 5","ga6":"Rank 6","ga7":"Rank 7","ga8":"Rank 8","ga9":"Rank 9","ga10":"Rank 10","ho1":"Rank 1","ho2":"Rank 2","ho3":"Rank 3","ho4":"Rank 4","ho5":"Rank 5","ho6":"Rank 6","ho7":"Rank 7","ho8":"Rank 8","ho9":"Rank 9","ho10":"Rank 10","sh1":"Rank 1","sh2":"Rank 2","sh3":"Rank 3","sh4":"Rank 4","sh5":"Rank 5","sh6":"Rank 6","sh7":"Rank 7","sh8":"Rank 8","sh9":"Rank 9","sh10":"Rank 10","su1":"Rank 1","su2":"Rank 2","su3":"Rank 3","su4":"Rank 4","su5":"Rank 5","su6":"Rank 6","su7":"Rank 7","su8":"Rank 8","su9":"Rank 9","su10":"Rank 10","bh1":"Rank 1","bh2":"Rank 2","bh3":"Rank 3","bh4":"Rank 4","bh5":"Rank 5","bh6":"Rank 6","bh7":"Rank 7","bh8":"Rank 8","bh9":"Rank 9","bh10":"Rank 10","mh1":"Rank 1","mh2":"Rank 2","mh3":"Rank 3","mh4":"Rank 4","mh5":"Rank 5","mh6":"Rank 6","mh7":"Rank 7","mh8":"Rank 8","mh9":"Rank 9","mh10":"Rank 10 · Legendary Panther","ex1":"Rank 1 · Find a Treasure Map","ex2":"Rank 2 · Find a Buried Treasure","ex3":"Rank 3 · Find a Buried Treasure","ex4":"Rank 4 · Find a Buried Treasure","ex5":"Rank 5 · Find a Buried Treasure","ex6":"Rank 6 · Find a Buried Treasure","ex7":"Rank 7 · Find a Buried Treasure","ex8":"Rank 8 · Find a Buried Treasure","ex9":"Rank 9 · Find a Buried Treasure","rc1":"West of Grizzlies","rc2":"Cumberland Forest","rc3":"Bacchus Station","rc4":"Moonstone Pond","rc5":"Roanoke Ridge","rc6":"Elysian Pool","rc7":"Near Flatneck Station","rc8":"Strawberry","rc9":"Owanjila Lake","dc1":"New Hanover Region (14 total)","dc2":"Lemoyne Region (2 total)","dc3":"Ambarino Region (4 total)","db1":"South bank of Dewberry Creek","db2":"North bank of Dewberry Creek (north of Bone #1)","db3":"East of Flatneck Station","db4":"Northeast of Flatneck Station","db5":"Bottom of the Heartlands prospector pit","db6":"Northeast of Heartland Overflow","db7":"Bank of the Kamassa River (climb down)","db8":"Woods east of Butcher Creek","db9":"South of Brandywine Drop","db10":"Railway bridge, west side of Roanoke Valley","db11":"High ground, east Grizzlies East, Ambarino","db12":"Cliff west of O'Creagh's Run","db13":"Northeast rock face of Donner Falls","db14":"Bacchus Station","db15":"Cliff west of Fort Wallace","db16":"Cliff in Cumberland Forest","db17":"Northwest rock face near Valentine","db18":"Cliff across from Bone #17","db19":"Rock face downstream of Bone #17","db20":"Cave northwest of Wallace Station (needs a lantern)","db21":"Gentle slope in Big Valley","db22":"Cliff east of Black Bone Forest","db23":"Pike's Basin, Hennigan's Stead","db24":"Hilltop on the bank of the San Luis River","db25":"Edge of Del Lobo Rock","db26":"Scrub on the hills of Rio Bravo","db27":"Cactus patch northeast of Fort Mercer","db28":"Rock face in Rattlesnake Hollow","db29":"Among desert cacti at Gaptooth Ridge","db30":"Cliff edge near Tumbleweed","cc1":"Famous Gunslingers","cc2":"Artists, Writers and Poets","cc3":"Vistas of America","cc4":"Gems of Beauty","cc5":"Flora of North America","cc6":"Stars of the Stage","cc7":"Fauna of North America","cc8":"Marvels of Travel","cc9":"The World's Champion","cc10":"Amazing Inventions","cc11":"Breeds of Horses","cc12":"Prominent Americans","la1":"Legendary Beaver \"Malia\"","la2":"Legendary Grizzly Bear \"Bharati\"","la3":"Legendary Bighorn Ram","la4":"Legendary Boar \"Oryx\"","la5":"Legendary Buck \"Obie\"","la6":"Legendary Coyote \"Suki\"","la7":"Legendary Elk \"Enyeto\"","la8":"Legendary Fox \"Layla\"","la9":"Legendary Moose \"Anoki\"","la10":"Legendary White Bison","la11":"Legendary Wolf \"Hotah\"","la12":"Legendary Panther \"Giaguaro\"","la13":"Legendary Alligator \"Lacartus\"","la14":"Legendary Cougar (New Austin)","la15":"Legendary Pronghorn \"Ira\"","la16":"Legendary Tatanka Bison","lf1":"Legendary Steelhead Trout","lf2":"Legendary Perch","lf3":"Legendary Longnose Gar","lf4":"Legendary Muskie","lf5":"Legendary Bullhead Catfish","lf6":"Legendary Lake Sturgeon","lf7":"Legendary Bluegill","lf8":"Legendary Chain Pickerel","lf9":"Legendary Sockeye Salmon","lf10":"Legendary Smallmouth Bass","lf11":"Legendary Rock Bass","lf12":"Legendary Redfin Pickerel","lf13":"Legendary Largemouth Bass","lf14":"Legendary Channel Catfish","ou1":"The Bear Hunter","ou2":"The Trophy Buck","ou3":"The Dreamcatcher","ou4":"The Beast of Prey","ou5":"The Huntsman","ou6":"The Death Roll","ou7":"The Stalker","ou8":"The Ghost Bison","tk1":"Beaver Tooth Trinket","tk2":"Buck Antler Trinket","tk3":"Cougar Fang Trinket","tk4":"Coyote Fang Trinket","tk5":"Elk Antler Trinket","tk6":"Fox Claw Trinket","tk7":"Moose Antler Trinket","tk8":"Panther's Eye Trinket","tk9":"Pronghorn Horn Trinket","tk10":"Ram Horn Trinket","tk11":"Tatanka Bison Horn Trinket","tk12":"Wolf Heart Trinket","tk13":"Alligator Tooth Talisman","tk14":"Bear Claw Talisman","tk15":"Boar Tusk Talisman","tk16":"Bison Horn Talisman","tk17":"Raven Claw Talisman","tk18":"Hawk Talon Trinket","tk19":"Cat Eye Trinket","tk20":"Shark Tooth Trinket","tk21":"Turtle Shell Trinket","tk22":"Crow Beak Trinket","tk23":"Lion's Paw Trinket","tk24":"Owl Feather Trinket","tk25":"Iguana Scale Trinket","tk26":"Eagle Talon Talisman","bo1":"Benedict Allbright","bo2":"Ellie Anne Swan","bo3":"Joshua Brown","bo4":"Bart Cavanaugh (PC exclusive)","bo5":"Mark Johnson","bo6":"Robbie Laidlaw","bo7":"Lindsay Woffard","bo8":"Anthony Foreman","bo9":"Elias Green","bo10":"Otis Skinner","bo11":"Herman Zizendorf (PC exclusive)","bo12":"Esteban Cortez","bo13":"Joaquin Arroyo","st1":"Potion Satchel","st2":"Provisions Satchel","st3":"Kit Satchel","st4":"Ingredients Satchel","st5":"Materials Satchel","st6":"Valuables Satchel","st7":"Legend of the East (Ultimate Satchel)","d6":"Treasure Map · Poisonous Trail (3 maps)","d7":"Treasure Map · The Hermit's Torn Map (2 pieces)","d8":"Treasure Map · High Stakes Treasure (3 maps)","d9":"Treasure Maps · Legend of the East Outfit Chain"};
  var LOC_EN = {"罗德斯火车站外 · Jeremiah Compson":"Outside Rhodes train station · Jeremiah Compson","Flat Iron Lake · Jeremy Gill 钓鱼小屋":"Flat Iron Lake · Jeremy Gill's fishing cabin","营地 · 找 Leopold Strauss":"Camp · find Leopold Strauss","圣丹尼斯 · Algernon 的温室":"Saint Denis · Algernon's greenhouse","圣丹尼斯 · Doyle's Tavern":"Saint Denis · Doyle's Tavern","范霍恩贸易站酒馆 · Miss Marjorie":"Van Horn Trading Post saloon · Miss Marjorie","草莓镇东南 · Albert Mason":"Southeast of Strawberry · Albert Mason","圣丹尼斯西北,裁缝店附近 · 募捐女士":"Northwest Saint Denis, near the tailor · Fundraiser lady","终点:瓦伦丁西南 Lucky's Cabin · Edmund Lowry Jr":"Ends at: Lucky's Cabin, southwest of Valentine · Edmund Lowry Jr","拉格拉斯西北沼泽 · 神秘\"卡真人\"":"Swamp northwest of Lagras · mysterious \"Cajun\"","祖母绿牧场以南,新汉诺威 · Margaret(马戏团)":"South of Emerald Ranch, New Hanover · Margaret (circus)","罗德斯东北,斯嘉丽草甸 · Alphonse Renaud 医生":"Northeast of Rhodes, Scarlett Meadows · Dr. Alphonse Renaud","瓦伦丁杂货店 · Proetus & Acrisius 兄弟":"Valentine general store · the Proetus & Acrisius brothers","圣丹尼斯西南公园 · Marko Dragic":"Southwest Saint Denis park · Marko Dragic","圣丹尼斯东北,巴约努瓦 · Andrew Bell III":"Northeast Saint Denis, Bayou Nwa · Andrew Bell III","罗德斯外,斯嘉丽草甸 · Wendell White & Sampson Black":"Outside Rhodes, Scarlett Meadows · Wendell White & Sampson Black","圣丹尼斯东部 · Brother Dorkins,后续接 Sister Calderón":"East Saint Denis · Brother Dorkins, continues with Sister Calderón","圣丹尼斯西北,市长官邸 · Henri Lemieux":"Northwest Saint Denis, Mayor's mansion · Henri Lemieux","罗诺克岭 Willard's Rest 农场 · Charlotte Balfour":"Willard's Rest farm, Roanoke Ridge · Charlotte Balfour","范霍恩贸易站以西,罗诺克岭 · Obediah Hinton":"West of Van Horn Trading Post, Roanoke Ridge · Obediah Hinton","O'Creagh's Run 附近,新汉诺威 · Hamish Sinclair":"Near O'Creagh's Run, New Hanover · Hamish Sinclair","草莓镇西南山岬 · Evelyn Miller":"Headland southwest of Strawberry · Evelyn Miller","营地":"Camp","营地,《渔夫之人》任务后":"Camp, after \"A Fisher of Fish\"","营地,和他打扑克":"Camp, play poker with him","营地 · 多米诺骨牌桌旁":"Camp · by the dominoes table","营地内随机搭话":"Camp, random chat trigger","营地 · 马厩区域":"Camp · stable area","营地,《进一步的问题》任务后":"Camp, after \"Further Questions\"","营地内直接找 Sean":"Camp, go find Sean directly","营地 · 多米诺骨牌桌":"Camp · dominoes table","营地,Sean 主动邀请":"Camp, Sean invites you","新奥斯汀":"New Austin","圣丹尼斯/范葛伦/Flatneck Station":"Saint Denis / Valentine / Flatneck Station","罗德斯 · 范霍恩贸易站":"Rhodes · Van Horn Trading Post","草莓/范葛伦/范霍恩贸易站":"Strawberry / Valentine / Van Horn Trading Post","范葛伦→罗德斯":"Valentine → Rhodes","草莓→圣丹尼斯":"Strawberry → Saint Denis","范霍恩→黑水镇":"Van Horn Trading Post → Blackwater","新奥斯汀特产":"New Austin specialty","布莱斯韦特庄园正东 · 靠近水边":"Due east of Braithwaite Manor · near the water","克莱门斯角附近":"Near Clemens Point","翡翠牧场":"Emerald Ranch","Flatneck Station 西北山脊 · Maximo":"Ridge northwest of Flatneck Station · Maximo","安巴里诺":"Ambarino","新汉诺威":"New Hanover","西伊丽莎白":"West Elizabeth","散布于新汉诺威各处树上":"Scattered in trees across New Hanover","散布于莱莫因":"Scattered across Lemoyne","散布于安巴里诺":"Scattered across Ambarino","莱莫因":"Lemoyne","新汉诺威 · 布彻溪":"New Hanover · Butcher Creek","安巴里诺 · 灰熊山东部":"Ambarino · Grizzlies East","西伊丽莎白 · 猫尾塘":"West Elizabeth · Cattail Pond","莱莫因 · 蓝水沼泽":"Lemoyne · Bluewater Marsh","西伊丽莎白 · 黑骨森林":"West Elizabeth · Black Bone Forest","新汉诺威 · 斯嘉丽草甸":"New Hanover · Scarlett Meadows","新汉诺威 · 巴克斯站":"New Hanover · Bacchus Station","莱莫因 · 罗德斯以北":"Lemoyne · North of Rhodes","新汉诺威 · 罗诺克岭":"New Hanover · Roanoke Ridge","安巴里诺 · 伊莎贝拉湖":"Ambarino · Lake Isabella","安巴里诺 · 科托拉泉":"Ambarino · Cotorra Springs","莱莫因 · 布莱斯韦特庄园正东":"Lemoyne · Due east of Braithwaite Manor","莱莫因 · 巴约努瓦沼泽":"Lemoyne · Bayou Nwa","新奥斯汀 · 加普图斯岭":"New Austin · Gaptooth Ridge","新奥斯汀 · 德尔洛沃岩":"New Austin · Del Lobo Rock","新奥斯汀 · 亨尼根牧场":"New Austin · Hennigan's Stead","罗诺克岭 · 布兰迪怀恩瀑布东北":"Roanoke Ridge · Northeast of Brandywine Drop","安巴里诺 · 极乐池":"Ambarino · Elysian Pool","莱莫因 · 拉格拉斯/蓝水沼泽":"Lemoyne · Lagras / Bluewater Marsh","范霍恩贸易站附近":"Near Van Horn Trading Post","莱莫因 · 西西卡监狱东岸":"Lemoyne · East bank by Sisika Penitentiary","莱莫因 · 圣丹尼斯附近铁轨以南":"Lemoyne · South of the tracks near Saint Denis","莱莫因 · 罗德斯与布莱斯韦特庄园之间":"Lemoyne · Between Rhodes and Braithwaite Manor","新汉诺威 · 达科塔河":"New Hanover · Dakota River","安巴里诺 · 伊莎贝拉湖南岸":"Ambarino · South shore of Lake Isabella","新汉诺威 · 欧瓦尼拉湖":"New Hanover · Lake Owanjila","西伊丽莎白 · 极光盆地":"West Elizabeth · Aurora Basin","具体坐标以游戏内提示为准":"Exact coordinates: follow the in-game prompt","新奥斯汀 · 圣路易斯河":"New Austin · San Luis River","捕猎人商店":"Trapper's shop","布彻溪西,范霍恩附近":"West of Butcher Creek, near Van Horn","大峡谷,草莓西北":"Big Valley, northwest of Strawberry","加普图斯岭,新奥斯汀":"Gaptooth Ridge, New Austin","斯嘉丽草甸,罗德斯西北":"Scarlett Meadows, northwest of Rhodes","巴克斯站以东":"East of Bacchus Station","Mattock Pond,罗德斯以北":"Mattock Pond, north of Rhodes","罗诺克岭东北":"Northeast Roanoke Ridge","夏迪贝尔以西":"West of Shady Belle","里奥布拉沃,新奥斯汀":"Rio Bravo, New Austin","猫尾塘":"Cattail Pond","Manteca Falls 附近,新奥斯汀":"Near Manteca Falls, New Austin","科托拉泉":"Cotorra Springs","材料:短吻鳄牙+金关节手镯+复古内战手铐":"Materials: Alligator tooth + Gold-jointed bracelet + Antique Civil War handcuffs","材料:熊爪+银链手镯+石英碎块":"Materials: Bear claw + Silver chain bracelet + Quartz shards","材料:野猪獠牙+金耳环+钴化木":"Materials: Boar tusk + Gold earring + Cobalt petrified wood","材料:白野牛角+银耳环+鲍鱼壳碎片":"Materials: White bison horn + Silver earring + Abalone shell fragments","材料:渡鸦爪+旧黄铜指南针+银链手镯":"Materials: Raven claw + Old brass compass + Silver chain bracelet","Deadboot Creek 营地遗址":"Old campsite at Deadboot Creek","布莱斯韦特庄园以西小岛的锁箱":"Locked box on the island west of Braithwaite Manor","安纳斯堡以北沉船附近锁箱":"Locked box near the shipwreck north of Annesburg","加普图斯山口最大建筑楼梯下":"Under the stairs of the largest building at Gaptooth Breach","元素之路藏宝任务最终奖励":"Final reward of the Elemental Trail treasure hunt","任务奖励:《他当然是英国人》":"Mission reward: \"He's British, of Course\"","任务奖励:《入门考古学》(非致命方式完成)":"Mission reward: \"Archaeology for Beginners\" (non-lethal completion)","特别版/终极版预购奖励":"Special/Ultimate Edition pre-order bonus","特别版/终极版预购奖励,第二章可换":"Special/Ultimate Edition pre-order bonus, redeemable from Chapter 2","范葛伦警长办公室 · 达科塔河以北":"Valentine sheriff's office · North of Dakota River","圣丹尼斯警局 · Wallace Station 附近":"Saint Denis police station · Near Wallace Station","草莓监狱 · 西北矿洞":"Strawberry jail · Northwest mine","草莓监狱 · 帮派营地":"Strawberry jail · Gang hideout","罗德斯车站":"Rhodes station","罗德斯车站 · 布莱斯韦特庄园东南":"Rhodes station · Southeast of Braithwaite Manor","圣丹尼斯警局 · Emerald Ranch 东,卡马萨河附近":"Saint Denis police station · East of Emerald Ranch, near the Kamassa River","圣丹尼斯警局 · Doyle's Tavern":"Saint Denis police station · Doyle's Tavern","黑水镇警局":"Blackwater police station","干草堆镇监狱":"Tumbleweed jail","干草堆镇监狱 · Benedict Point 西南谷仓线索":"Tumbleweed jail · Barn clue southwest of Benedict Point","材料:完美鹿皮+完美公鹿皮+完美麋鹿皮":"Materials: Perfect deer pelt + Perfect buck pelt + Perfect elk pelt","材料:完美鹿皮+完美獾皮+完美松鼠皮":"Materials: Perfect deer pelt + Perfect badger pelt + Perfect squirrel pelt","材料:完美鹿皮+完美麋鹿皮+完美黑豹皮":"Materials: Perfect deer pelt + Perfect elk pelt + Perfect panther pelt","材料:完美鹿皮+完美野牛皮+完美浣熊皮":"Materials: Perfect deer pelt + Perfect bison pelt + Perfect raccoon pelt","材料:完美鹿皮+完美野猪皮+完美鬣蜥皮":"Materials: Perfect deer pelt + Perfect boar pelt + Perfect iguana skin","材料:完美鹿皮+完美海狸皮+完美兔皮":"Materials: Perfect deer pelt + Perfect beaver pelt + Perfect rabbit pelt","材料:完美鹿皮+完美美洲狮皮+完美狼皮":"Materials: Perfect deer pelt + Perfect cougar pelt + Perfect wolf pelt","《为了体育的魔术师》任务尾声 · 布莱斯韦特庄园附近谷仓":"End of \"A Bright Bouncing Boy\" · Barn near Braithwaite Manor","范葛伦 Keane's Saloon · Theodore Levin":"Keane's Saloon, Valentine · Theodore Levin","Flatneck Station 附近 · Maximo":"Near Flatneck Station · Maximo","Cairn Lake 小屋床底":"Under the bed in the cabin at Cairn Lake","Manito Glade & Little Creek River":"Manito Glade & Little Creek River","随机路人/流动商人处购得":"Bought from random passersby / travelling merchants","前置:艺术家之道":"Prerequisite: \"The Artist's Way\"","新奥斯汀 · 图博威德西南,科罗纳多海边尸体":"New Austin · Southwest of Tumbleweed, corpse on the Sea of Coronado shore","大地之心 · 林普尼监狱牢房(弗拉特内克站附近)":"Heartlands · Limpany jail cell (near Flatneck Station)","西伊丽莎白 · 大谷地,吊狗牧场西北":"West Elizabeth · Big Valley, northwest of Hanging Dog Ranch","莱莫因 · 巴约努瓦,圣丹尼斯南桥外小岛沉船":"Lemoyne · Bayou Nwa, wrecked boat on a small island outside Saint Denis's southern bridge","罗诺克岭 · 布伦南德堡地下室(范霍恩贸易站西南)":"Roanoke Ridge · Fort Brennand basement (southwest of Van Horn Trading Post)","罗诺克岭 · \"古墓\"遗迹(海狸谷东北)":"Roanoke Ridge · \"Old Tomb\" ruins (northeast of Beaver Hollow)","西伊丽莎白 · 沙恩山西侧\"贝丽尔的梦\"矿洞":"West Elizabeth · \"Beryl's Dream\" mine, west of Mount Shann"};
  var NOTE_EN = {"前置:主线《一个诚实的错误》":"Prerequisite: main mission \"An Honest Mistake\"","3条传说鱼需尾声才能钓":"3 legendary fish can only be caught in the Epilogue","收债时的选择影响荣誉值,建议走温和路线":"Choices while collecting debts affect Honor — a gentler approach is recommended","共6部分,奖励稀有帽子与左轮手枪":"6 parts total; rewards a rare hat and revolver","解锁东部传说套装藏宝链前置":"Prerequisite to unlock the Legend of the East treasure chain","2段正文+1个圣丹尼斯剧院彩蛋(额外$40)":"2 main parts + 1 Saint Denis theatre easter egg (extra $40)","共5部分;尾声用约翰做时第3部分(赶马)可能被跳过":"5 parts total; part 3 (herding horses) may be skipped if done as John in the Epilogue","⚠️仅第六章结束前可完成,尾声不再提供":"⚠️ Only completable before the end of Chapter 6 — no longer available in the Epilogue","需先在3处案发现场拾取线索拼图拼成地图才会触发":"Requires collecting clue pieces at 3 crime scenes to assemble the map before it triggers","⚠️需先触发4个夜间偶遇之一(火把队伍/游荡暗影/受惊的马/诡异人声)才会解锁,仅22:00-5:00":"⚠️ Requires triggering one of 4 night encounters first (torch-bearing group / wandering shadow / spooked horse / eerie voices) to unlock, only 22:00-5:00","共5部分,奖励狮爪饰品":"5 parts total; rewards the Lion's Paw Trinket","仅6:00-18:00可触发":"Only triggers 6:00-18:00","共3部分,跨约3个游戏日才能推进完":"3 parts total, spans roughly 3 in-game days to complete","共3部分,第2部分需雷雨天气,第3部分需等48小时":"3 parts total; part 2 needs a thunderstorm, part 3 requires waiting 48 hours","共7部分,长线任务":"7 parts total, a long mission chain","共5部分;⚠️若选择把逃犯抓去领赏而非帮助,任务线会提前中断":"5 parts total; ⚠️ choosing to turn the fugitive in for the bounty instead of helping ends the chain early","后续两段剧情(万事皆兄弟姐妹→人与天使之间)会在营地转移到熊瀑营地后继续":"The following two chapters (\"We Are All Brothers and Sisters Now\" → \"Of Men and Angels\") continue after camp moves to Beaver Hollow","共3部分,仅22:00-5:00;第3部分是否杀死 Jean Marc 是荣誉分支(杀=商店95折但失荣誉)":"3 parts total, only 22:00-5:00; whether to kill Jean Marc in part 3 is an Honor branch (killing him gives a 5% store discount but loses Honor)","共3部分,可多次返回推进":"3 parts total, can be revisited multiple times to progress","共5部分;经核实与关瓜(Guarma)/新奥斯汀无关,全程在新汉诺威完成":"5 parts total; confirmed unrelated to Guarma / New Austin — takes place entirely in New Hanover","共4部分,全部发生在新汉诺威/西伊丽莎白境内,第4部分 Hamish 会牺牲":"4 parts total, all within New Hanover / West Elizabeth; Hamish dies in part 4","共5部分,仅6:00-18:00可触发":"5 parts total, only triggers 6:00-18:00","需 $5":"Requires $5","需夹竹桃(Oleander)":"Requires Oleander","需钢笔":"Requires a fountain pen","需 Penny Dreadful 小说":"Requires a Penny Dreadful novel","完成上一条后随机掉落获得":"Obtained as a random drop after completing the previous one","奖励蓝色牛仔布侦察夹克":"Rewards the blue denim scout jacket","需航海罗盘":"Requires a nautical compass","需发油":"Requires hair oil (pomade)","需夹竹桃":"Requires Oleander","需私酿酒":"Requires moonshine","需烟斗":"Requires a smoking pipe","需 2× 美国人参":"Requires 2x American Ginseng","《迷雾中的鼩鼱》一书":"The book \"The Mysterious Shrew in the Mist\"","需怀表":"Requires a pocket watch","需口袋镜(Martha's Swain 附近)":"Requires a pocket mirror (near Martha's Swain)","需 2× 牛蒡根":"Requires 2x Burdock Root","需口琴":"Requires a harmonica","需肯塔基波旁威士忌 —— Sean 会在第三章早期剧情牺牲":"Requires Kentucky Bourbon — Sean dies early in Chapter 3, so give it before then","需 2× 牛至,无绝版风险,随时可给":"Requires 2x Oregano; not missable, can be given at any time","需项链":"Requires a necklace","需5种材料:波旁/乳草/薄荷/发油/死臭鼬,奖励服装+荣誉":"Requires 5 materials: Bourbon / Milkweed / Mint / Hair oil / Dead skunk; rewards an outfit + Honor","随 Sean 离队永久消失":"Disappears permanently once Sean leaves the gang","击杀3名敌人,使用小刀":"Kill 3 enemies using a knife","10秒内用飞刀击杀3名敌人":"Kill 3 enemies with throwing knives within 10 seconds","只用战斧击杀3只猛禽":"Kill 3 birds of prey using only a tomahawk","用手工弹药的霰弹枪击杀10名敌人":"Kill 10 enemies with a shotgun using homemade ammo","击杀5名骑马敌人,每次击杀用1把飞刀":"Kill 5 mounted enemies, using 1 throwing knife per kill","用一根炸药同时炸死4名敌人":"Kill 4 enemies simultaneously with a single stick of dynamite","连续用同一把战斧投掷回收击杀4名敌人":"Kill 4 enemies in a row by throwing and retrieving the same tomahawk","用长管副武器击杀15名敌人":"Kill 15 enemies with a long-barrel sidearm","用弓箭从背后偷袭击杀9名未察觉的敌人":"Kill 9 unaware enemies from behind with a bow","只用飞刀且不受伤击杀一只灰熊":"Kill a grizzly bear using only throwing knives, without taking damage","采集6株西洋蓍草":"Collect 6 Yarrow","采集并吃掉4种浆果":"Collect and eat 4 different berries","用鼠尾草作为原料制作7件物品":"Craft 7 items using Sage as an ingredient","采集5个蘑菇并喂给马吃":"Collect 5 mushrooms and feed them to a horse","用印第安烟草作为原料制作9件物品":"Craft 9 items using Indian Tobacco as an ingredient","采集15种不同的草药":"Collect 15 different herbs","制作并使用5瓶特效药水":"Craft and use 5 Special Potions","用夹竹桃制作6件毒药武器":"Craft 6 poison weapons using Oleander","集齐每种草药各1株 —— 荒野羽菊/沙漠鼠尾草/红鼠尾草仅产于新奥斯汀,建议留到尾声用约翰做":"Collect 1 of every herb — Wild Feverfew / Desert Sage / Red Sage only grow in New Austin, so it's easiest to save this for John in the Epilogue","用全部11种肉类烹饪调味":"Season food using all 11 kinds of meat","赢得5局扑克":"Win 5 games of poker","21点游戏中加倍下注并赢下5次":"Double down and win 5 times in blackjack","赢得3局五指刀":"Win 3 games of five finger fillet","在3个地点各让一名玩家输光筹码":"Bust a player out of chips at 3 different locations","不摸牌堆的情况下,在2人或更少对手时赢3局多米诺":"Win 3 games of dominoes against 2 or fewer opponents without drawing from the boneyard","在这2个地点各击败一次21点庄家":"Beat the blackjack dealer once at each of these 2 locations","在这3个地点都击败五指刀玩家":"Beat a five finger fillet player at all 3 of these locations","拿3次或更多牌的情况下赢3局21点":"Win 3 games of blackjack while taking 3 or more cards each time","连续赢3局多米诺":"Win 3 games of dominoes in a row","连续赢3局扑克":"Win 3 games of poker in a row","骑马击杀5只兔子":"Kill 5 rabbits on horseback","15秒内骑马跨越3个障碍":"Clear 3 obstacles on horseback within 15 seconds","5分钟内骑马跑完全程":"Ride the full route on horseback within 5 minutes","骑马用套索拖拽一人3300英尺":"Drag someone 3300 feet on horseback with a lasso","骑马踩踏5只动物":"Trample 5 animals while on horseback","9分钟内且全程不下水跑完":"Finish within 9 minutes without going into the water","骑马不下马连续击杀7名敌人":"Kill 7 enemies in a row from horseback without dismounting","骑马击杀9只掠食动物":"Kill 9 predators on horseback","17分钟内且不下水跑完,黑水镇现在是通缉区注意路线":"Finish within 17 minutes without going into the water — Blackwater is now a wanted zone, plan your route","驯服每一种野马品种":"Break every wild horse breed","击杀3只飞鸟":"Kill 3 birds","同一次死亡之眼中击杀2种不同物种":"Kill 2 different species in a single Dead Eye activation","在行驶中的火车上击杀5只飞鸟":"Kill 5 birds from a moving train","投掷战斧在80英尺外击杀敌人":"Kill an enemy with a thrown tomahawk from 80 feet away","不换弹不换武器击杀6只动物":"Kill 6 animals without reloading or switching weapons","用长距瞄准镜步枪在660英尺外击杀目标":"Kill a target from 660 feet away with a long-scope rifle","连续爆头7次":"Land 7 headshots in a row","不换弹不换武器缴械3名敌人":"Disarm 3 enemies without reloading or switching weapons","同一次死亡之眼中射掉3个人的帽子":"Shoot the hats off 3 people in a single Dead Eye activation","用长距瞄准镜步枪连续3枪击落3只飞鸟":"Shoot down 3 birds with 3 consecutive shots from a long-scope rifle","额外采集6株荒野羽菊(Wild Feverfew)":"Additionally collect 6 Wild Feverfew","额外采集6株沙漠鼠尾草(Desert Sage)":"Additionally collect 6 Desert Sage","额外采集4株红鼠尾草(Red Sage)":"Additionally collect 4 Red Sage","额外采集8个仙人梨(Prickly Pear)":"Additionally collect 8 Prickly Pear","额外采集7株绒毛蓝卷耳":"Additionally collect 7 Blue Fuzzy Cupflower","额外采集8株蝶生草":"Additionally collect 8 Butterfly Milkweed","额外采集10株蜂鸟鼠尾草":"Additionally collect 10 Hummingbird Sage","额外采集12株草原罂粟":"Additionally collect 12 Prairie Poppy","额外采集15颗金醋栗":"Additionally collect 15 Golden Currant","额外采集10株紫雪花莲,再额外采集每种其他草药各2株":"Additionally collect 10 Violet Snowdrop, then 2 more of every other herb","剥5只鹿的皮":"Skin 5 deer","获得3张完美品质兔皮":"Obtain 3 perfect-quality rabbit pelts","用双筒望远镜追踪10种不同动物":"Track 10 different animals with binoculars","用动物叫声引诱并干净击杀5次":"Lure and cleanly kill an animal using a call 5 times","剥3只黑熊或灰熊的皮":"Skin 3 black bears or grizzly bears","用弓箭击杀5只美洲狮并剥皮":"Kill and skin 5 cougars with a bow","用诱饵引诱并击杀1只食草动物和1只掠食动物":"Lure and kill 1 herbivore and 1 predator using bait","不用鱼竿徒手抓3条小鱼":"Catch 3 small fish by hand, without a fishing rod","击杀一只正在装死的负鼠":"Kill an opossum while it's playing dead","击杀并剥皮传说黑豹 Giaguaro":"Kill and skin the Legendary Panther \"Giaguaro\"","持枪打劫5名路人(点枪逼其交出财物,可累计完成)":"Rob 5 passersby at gunpoint (can be completed cumulatively)","抢劫2辆马车(或将2辆偷来的马车交给销赃商)":"Rob 2 stagecoaches (or hand 2 stolen wagons to a fence)","1个游戏日内抢劫4家商店的收银台":"Rob the till at 4 stores within a single in-game day","1个游戏日内抢劫/偷走3辆马车并处理掉":"Rob or steal 3 wagons and dispose of them within a single in-game day","持续作案,让通缉赏金累计到$250":"Keep committing crimes until your bounty reaches $250","偷5匹马,卖给附近的马匹销赃商":"Steal 5 horses and sell them to a nearby horse fence","从路人/旅客身上抢到共计$50的现金或财物":"Rob a combined $50 in cash or goods from passersby/travellers","偷7辆货运马车,卖给翡翠牧场的马车销赃商":"Steal 7 freight wagons and sell them to the wagon fence at Emerald Ranch","用套索捆绑3名路人,分别把他们丢到铁轨上":"Lasso 3 passersby and leave each one tied to the train tracks","完成5次火车抢劫,且不能死亡或被抓":"Complete 5 train robberies without dying or getting caught","杰克霍尔帮藏宝图第一张":"First map of the Jack Hall Gang treasure hunt","完成杰克霍尔帮+毒药小径+高额赌注 三条藏宝链(各3件)即可满足2-10级全部要求":"Completing all three of the Jack Hall Gang, Poisonous Trail, and High Stakes Treasure chains (3 maps each) satisfies every Rank 2-10 requirement","共10块石雕分布在这9处landmark附近,部分地点不止1块":"10 rock carvings scattered near these 9 landmarks; some locations have more than 1","未能逐一核实20个精确坐标,按区域打包统计,精确坐标建议配合专门地图":"The 20 exact coordinates weren't individually verified — grouped by region here; use a dedicated map for precise coordinates","12套共144张,搜刮尸体随机获得或直接去杂货店购买缺卡,无绝版风险":"12 sets, 144 cards total; obtained as random loot from bodies, or bought directly from general stores to fill gaps — not missable","需完成第六章主线《那是墨菲家族的地盘》后才会出现":"Only appears after completing the Chapter 6 main mission \"That's Murfree Country\"","区域细节未100%核实":"Regional details not 100% verified","需先寄出前13条传说鱼才会解锁":"Requires mailing in the first 13 legendary fish to unlock","帽子=熊皮;外套=熊皮+完美野牛皮;套索手套=熊皮+完美公牛皮":"Hat = bear pelt; coat = bear pelt + perfect bison pelt; lasso gloves = bear pelt + perfect bull pelt","背心=鹿皮+完美公羊皮;狐狸软鞋=狐狸皮+完美麋鹿皮;手套=鹿皮+狐狸皮":"Vest = deer pelt + perfect ram pelt; fox moccasins = fox pelt + perfect elk pelt; gloves = deer pelt + fox pelt","海狸帽=海狸皮+野猪皮;海狸手套=海狸皮;野牛背心/马裤=Tatanka野牛皮(尾声);野猪野牛手套=野猪皮+Tatanka野牛皮(尾声)":"Beaver hat = beaver pelt + boar pelt; beaver gloves = beaver pelt; bison vest/chaps = Tatanka bison pelt (Epilogue); boar-bison gloves = boar pelt + Tatanka bison pelt (Epilogue)","狼马裤=狼皮+完美山羊皮;美洲狮帽/背心/手套=新奥斯汀美洲狮皮(尾声)":"Wolf chaps = wolf pelt + perfect goat pelt; cougar hat/vest/gloves = New Austin cougar pelt (Epilogue)","郊狼帽/半马裤=郊狼皮+完美狐狸皮;叉角羚外套/手套=叉角羚皮(尾声)":"Coyote hat/half-chaps = coyote pelt + perfect fox pelt; pronghorn coat/gloves = pronghorn pelt (Epilogue)","鳄鱼帽/背心/手套=短吻鳄皮(第六章起);黑豹斗篷/手套=传说黑豹皮":"Alligator hat/vest/gloves = alligator skin (from Chapter 6); panther cape/gloves = Legendary Panther pelt","公羊帽/马裤=公羊皮;驼鹿猎装=驼鹿皮+完美狼皮;驼鹿软鞋=驼鹿皮+完美牛皮":"Ram hat/chaps = ram pelt; moose hunting outfit = moose pelt + perfect wolf pelt; moose moccasins = moose pelt + perfect cattle pelt","白野牛帽/外套=白野牛皮;麋鹿半马裤/软鞋/手套=麋鹿皮+完美羊皮/山羊皮":"White bison hat/coat = white bison pelt; elk half-chaps/moccasins/gloves = elk pelt + perfect sheep/goat pelt","材料:传说海狸部位 · 效果:武器损耗速度-10%":"Material: Legendary Beaver part · Effect: -10% weapon wear rate","材料:传说公鹿部位 · 效果:提高剥皮获得高品质部件概率":"Material: Legendary Buck part · Effect: increases the chance of high-quality parts when skinning","材料:传说美洲狮部位 · 效果:体力经验+10%":"Material: Legendary Cougar part · Effect: +10% Stamina XP","材料:传说郊狼部位 · 效果:死亡之眼经验+10%":"Material: Legendary Coyote part · Effect: +10% Dead Eye XP","材料:传说麋鹿部位 · 效果:搜刮到的钱增加10%":"Material: Legendary Elk part · Effect: +10% money looted","材料:传说狐狸部位 · 效果:鹰眼持续时间+5秒":"Material: Legendary Fox part · Effect: +5 seconds Eagle Eye duration","材料:传说驼鹿部位 · 效果:体力经验+10%":"Material: Legendary Moose part · Effect: +10% Stamina XP","材料:传说黑豹部位 · 效果:死亡之眼消耗减缓10%,持续3秒":"Material: Legendary Panther part · Effect: -10% Dead Eye drain for 3 seconds","材料:传说叉角羚部位 · 效果:马背驮载的动物尸体不会腐烂":"Material: Legendary Pronghorn part · Effect: animal carcasses carried on your horse no longer decay","材料:传说大角羊部位 · 效果:爬地百里香/牛至/野薄荷采集量翻倍":"Material: Legendary Bighorn Ram part · Effect: doubles the yield of Creeping Thyme / Oregano / Wild Mint gathered","材料:传说野牛部位 · 效果:近战伤害减免10%":"Material: Legendary Tatanka Bison part · Effect: -10% melee damage taken","材料:传说狼部位 · 效果:可承受双倍酒精而不产生完全负面效果":"Material: Legendary Wolf part · Effect: can drink twice as much before suffering full drunk effects","效果:死亡之眼核心消耗减缓10%":"Effect: -10% Dead Eye core drain","效果:生命核心消耗减缓10%":"Effect: -10% Health core drain","效果:马匹生命/体力核心消耗减缓10%":"Effect: -10% horse Health/Stamina core drain","效果:体力核心消耗减缓10%":"Effect: -10% Stamina core drain","效果:武器损耗速度减缓20%":"Effect: -20% weapon wear rate","效果:拉弓时体力消耗减少30%":"Effect: -30% Stamina drain while drawing a bow","效果:强化药水效果时长延长20%":"Effect: +20% duration for Special Potions","效果:马匹好感度经验+10%":"Effect: +10% horse bonding XP","效果:生命值恢复速度+10%":"Effect: +10% Health regeneration rate","效果:搜刮到的弹药增加10%":"Effect: +10% ammo looted","效果:体力经验+10%":"Effect: +10% Stamina XP","效果:三条核心槽消耗速度均-15%":"Effect: -15% drain rate on all three core stats","效果:骑马时受到的伤害-10%":"Effect: -10% damage taken while on horseback","效果:鹰眼持续时间+5秒":"Effect: +5 seconds Eagle Eye duration","必须活捉":"Must be captured alive","必须活捉,不会反抗":"Must be captured alive, won't resist","必须活捉,先去 Old Harry Fen":"Must be captured alive; go to Old Harry Fen first","可死可活,死活赏金不同":"Dead or alive; the bounty differs between the two","可死可活":"Dead or alive","建议活捉,奖励更好":"Capturing alive is recommended for a better reward","效果=以上所有背包容量总和":"Effect = the sum of all the satchel capacities above","务必在任务中搜刮尸体,过后大概率永久错过":"Be sure to loot the body during the mission — it's very likely to be missed permanently afterward","跨多章,击败每名枪手后记得搜身拿走专属武器":"Spans multiple chapters — remember to loot each gunslinger's unique weapon after defeating them","需尾声第一部分才能进入新奥斯汀;终点奖励含乌鸦嘴徽章饰品(见下方\"捕猎→饰品\"tk22)":"New Austin only opens up from Epilogue Part I onward; the final reward includes the Crow Beak Trinket (see \"Hunting → Trinkets\" tk22 below)","仅预购或特别版/终极版拥有者可获得,奖励6条金条":"Only available to players who pre-ordered or bought the Special/Ultimate Edition; rewards 6 Gold Bars","纯外观武器,剥皮/分裂子弹动画会自动切换回猎刀":"Purely cosmetic — automatically swaps back to the Hunting Knife during skinning/bullet-splitting animations","岛屿周边有鳄鱼出没,注意安全":"Alligators lurk around the island — be careful","无法自定义外观":"Cannot be customized","投掷后须去捡回,不会像其他投掷武器一样自动回到武器轮盘;仅剧情模式可获取":"Must be retrieved after throwing — unlike other throwables it will not auto-return to the weapon wheel; Story Mode only","需先用炸药炸开洞口;纯外观武器,剥皮动画自动切换回猎刀":"Requires a dynamite charge to blast open the entrance; purely cosmetic — swaps back to the Hunting Knife during skinning animations"};
  var CAT_EN = {"TC":{"name":"Total Completion","desc":""},"A":{"name":"Side Missions, Camp Requests & Activities","desc":""},"CH":{"name":"Challenges","desc":""},"COL":{"name":"Collections","desc":""},"HUNT":{"name":"Hunting","desc":""},"BOUNTY":{"name":"Bounties","desc":""},"D":{"name":"Miscellaneous","desc":""}};
  var GROUP_EN = {"A:side":"Side Missions","A:camp":"Camp Requests & Activities","CH:we":"Weapons Expert","CH:he":"Herbalist","CH:ga":"Gambler","CH:ho":"Horseman","CH:sh":"Sharpshooter","CH:su":"Survivalist","CH:mh":"Master Hunter","CH:bh":"Bandit","CH:ex":"Explorer","COL:rc":"Rock Carvings","COL:dc":"Dreamcatchers","COL:db":"Dinosaur Bones","COL:cc":"Cigarette Cards","HUNT:la":"Legendary Animals","HUNT:lf":"Legendary Fish","HUNT:trc":"Trapper Clothing","HUNT:re":"Reinforced Equipment","HUNT:tk":"Trinkets & Talismans","HUNT:st":"Satchel Upgrades"};
  var GROUP_DESC_EN = {"COL:rc":"Give them to the hermit Francis Sinclair — his cabin near Van Horn triggers \"Geology for Beginners\"","COL:dc":"After collecting all 20, visit the cave paintings behind the Elysian Pool waterfall for a permanent bonus","COL:db":"Give them to paleontologist Deborah MacGuinness — her barn at Firwood Rise triggers the stranger mission \"A Test of Faith\"","COL:cc":"Complete any one set and mail it to Phineas T. Ramsbottom (stranger mission \"Smoking and Other Hobbies\", unlocks in Chapter 2) for a reward"};

  Object.assign(LOC_EN, {'弗拉特尼克车站/圣丹尼斯/瓦伦丁':'Flatneck Station / Saint Denis / Valentine','罗兹 · 范霍恩贸易站':'Rhodes · Van Horn Trading Post','草莓镇/瓦伦丁/范霍恩贸易站':'Strawberry / Valentine / Van Horn Trading Post','瓦伦丁→罗兹':'Valentine → Rhodes','营地或捕兽人':'Camp or Trapper','14个捕梦网':'14 dreamcatchers','2个捕梦网':'2 dreamcatchers','4个捕梦网':'4 dreamcatchers'});
  Object.assign(LOC_EN, {'克莱门斯湾':'Clemens Cove'});
  Object.assign(NOTE_EN, {'制作并使用5瓶特制神奇补药':'Craft and use 5 Special Miracle Tonics','每种药草都采摘一次（共43种植物）':'Pick one of every herb species (43 plants)','剥下3只鹿的皮':'Skin 3 deer','将5只动物送进营地或交给捕兽人':'Deliver 5 animals to camp or the Trapper','分别制作1把回旋手斧、改良手斧、烈性炸药和烈性燃烧瓶':'Craft a Homing Tomahawk, Improved Tomahawk, Volatile Dynamite and Volatile Fire Bottle','用带有高倍瞄具的狙击步枪击杀660英尺外的人':'Kill a person at least 660 feet away with a long-scoped rifle','展开查看逐一位置':'Expand to view every exact location'});
  Object.assign(NOTE_EN, {'采摘并食用4种浆果':'Pick and eat 4 species of berry','采摘5朵蘑菇并喂给马':'Pick 5 mushrooms and feed them to your horse','采摘15种不同的药草':'Pick 15 different herb species','赢得5局德州扑克':'Win 5 hands of poker','赢得3场快刀戳指缝比赛':'Win 3 games of Five Finger Fillet','骑马杀死9只食肉动物':'Kill 9 predators from horseback','使用诱饵连续捕杀1只草食动物和1只肉食动物':'Use bait to catch and kill a herbivore and a predator consecutively','抢劫5名城镇居民':'Rob 5 townsfolk','在某一地区被悬赏$250':'Amass a $250 bounty in one state','偷5匹马并卖给克莱门斯湾的马匹销赃商':'Steal 5 horses and sell them to the horse fence at Clemens Cove','从市民和游客处抢到$50现金和贵重物品':'Rob $50 worth of cash and valuables from townsfolk and travellers','将某人捆起来并放在铁路轨道上3次':'Hogtie someone and leave them on the railroad tracks 3 times'});
  Object.assign(NOTE_EN, {'调味并烹饪所有11种肉类':'Season and cook all 11 types of meat'});
  Object.assign(NOTE_EN, {'17分钟内且不下水跑完':'Finish within 17 minutes without going into the water'});

  // English translations for the handful of it.c (chapter/condition field) strings that carry
  // real content rather than pure chapter-timing info — chiefly 背包升级/SAT's "解锁:…" unlock
  // conditions. Keyed by the exact zh string; see the render logic in renderRow() for how it's used.
  var COND_EN = {
    "解锁:升级药品马车两次":"Unlock: Upgrade the Medicine Wagon twice",
    "解锁:向 Pearson 捐赠5具动物尸体":"Unlock: Donate 5 animal carcasses to Pearson",
    "解锁:向营地捐赠箱捐赠3件贵重物品":"Unlock: Donate 3 valuables to the camp donation box",
    "解锁:升级补给马车两次":"Unlock: Upgrade the Provisions Wagon twice",
    "解锁:在营火处制作3个配方":"Unlock: Craft 3 recipes at the campfire",
    "解锁:向营地捐赠箱捐赠$50":"Unlock: Donate $50 to the camp donation box",
    "解锁:先做出以上全部6种背包":"Unlock: Craft all 6 satchels above first"
  };

  Object.assign(LOC_EN, {
    '新汉诺威 · 哈特兰油田南侧营地 · 威廉':'New Hanover · Camp south of Heartland Oil Fields · William',
    '马掌望台 · 亚瑟帐篷内的玛丽来信':'Horseshoe Overlook · Mary’s letter in Arthur’s tent',
    '马掌望台 · 约翰':'Horseshoe Overlook · John',
    '第三章从卡利加庄园开始':'Starts at Caliga Hall in Chapter 3',
    '布莱斯韦特庄园 · 佩内洛普':'Braithwaite Manor · Penelope',
    '圣丹尼斯 · 亚瑟住处内的玛丽来信':'Saint Denis · Mary’s letter in Arthur’s room',
    '安尼斯堡 · 伊迪丝·唐斯':'Annesburg · Edith Downes',
    '瓦匹缇印第安保留地 · 落雨':'Wapiti Indian Reservation · Rains Fall',
    '瓦匹缇印第安保留地 · 门罗上尉':'Wapiti Indian Reservation · Captain Monroe',
    '河狸岩洞营地 · 莎迪':'Beaver Hollow camp · Sadie',
    '克莱蒙斯岬营地 · Sean 主动邀请':'Clemens Point camp · Sean invites you',
    '马掌望台营地 · 等待蓝尼邀请':'Horseshoe Overlook camp · Wait for Lenny’s invitation',
    '马掌望台营地 · 等待查尔斯邀请':'Horseshoe Overlook camp · Wait for Charles’s invitation',
    '马掌望台营地 · 等待哈维尔邀请':'Horseshoe Overlook camp · Wait for Javier’s invitation',
    '克莱蒙斯岬营地 · 等待蒂莉邀请':'Clemens Point camp · Wait for Tilly’s invitation',
    '克莱蒙斯岬营地 · 等待迈卡邀请':'Clemens Point camp · Wait for Micah’s invitation',
    '克莱蒙斯岬营地 · 等待基兰邀请':'Clemens Point camp · Wait for Kieran’s invitation',
    '克莱蒙斯岬营地 · 等待哈维尔邀请':'Clemens Point camp · Wait for Javier’s invitation',
    '克莱蒙斯岬营地 · 等待比尔邀请':'Clemens Point camp · Wait for Bill’s invitation',
    '克莱蒙斯岬营地 · 等待西恩邀请':'Clemens Point camp · Wait for Sean’s invitation',
    '谢迪贝莱营地 · 等待查尔斯邀请':'Shady Belle camp · Wait for Charles’s invitation',
    '谢迪贝莱营地 · 等待蓝尼邀请':'Shady Belle camp · Wait for Lenny’s invitation',
    '谢迪贝莱营地 · 等待皮尔逊邀请':'Shady Belle camp · Wait for Pearson’s invitation',
    '谢迪贝莱营地 · 等待大叔邀请':'Shady Belle camp · Wait for Uncle’s invitation',
    '谢迪贝莱营地 · 等待迈卡邀请':'Shady Belle camp · Wait for Micah’s invitation'
  });
  Object.assign(NOTE_EN, {
    '首次交付4株西洋蓍草即可完成任务线；后续草药请求属于随机遭遇':'Hand in 4 Yarrow to complete the mission strand; later herb requests are random encounters',
    '需答应帮助玛丽；本任务是《曾经的梦想》的前置':'Agree to help Mary; required to unlock Fatherhood and Other Dreams',
    '第六章需阅读佩内洛普的来信并返回布莱斯韦特庄园':'In Chapter 6, read Penelope’s letter and return to Braithwaite Manor',
    '阅读佩内洛普的来信后触发':'Triggered after reading Penelope’s letter',
    '必须在《我们最美好的自己》前完成':'Must be completed before Our Best Selves',
    '全程不杀人可获得猫头鹰羽毛饰品':'Complete the mission without killing anyone to receive the Owl Feather Trinket',
    '随 Sean 离队永久消失':'Permanently unavailable after Sean leaves the gang'
  });
  Object.assign(COND_EN, {
    '第二章起':'From Chapter 2',
    '第二章，阅读玛丽来信后':'Chapter 2 · Read Mary’s letter',
    '第二章，接受约翰的运油马车计划后':'Chapter 2 · Accept John’s oil-wagon plan',
    '第三章完成I–III后，第六章才能继续IV–V':'Complete I–III in Chapter 3; IV–V continue in Chapter 6',
    '第六章，完成第三章《真爱之路 I–III》后':'Chapter 6 · Complete The Course of True Love I–III in Chapter 3 first',
    '第四章，完成《真爱易逝》后':'Chapter 4 · Complete We Loved Once and True',
    '第六章，完成《岔路口》且荣誉等级达到4级':'Chapter 6 · Complete A Fork in the Road and reach Honor rank 4',
    '第六章，完成《愤怒释放》并答应查尔斯去帮助落雨':'Chapter 6 · Complete A Rage Unleashed and agree to help Rains Fall',
    '第六章，在《考古学入门》中答应帮助门罗':'Chapter 6 · Agree to help Monroe during Archeology for Beginners',
    '第六章，完成《再见，亲爱的朋友》后':'Chapter 6 · Complete Goodbye, Dear Friend',
    '第三章':'Chapter 3',
    '第二章':'Chapter 2',
    '第四章':'Chapter 4',
    '完成第二章《在前的，将要在后了》后':'Complete The First Shall Be Last in Chapter 2',
    '完成第三章《草根朋友》后':'Complete Friends in Very Low Places in Chapter 3',
    '第四章，仅特别版/终极版':'Chapter 4 · Special/Ultimate Edition only'
  });

  // Sourced from each item's original chapter-info text (交叉核对多个攻略站点), cross-checked
  // against location fields for New Austin content (only reachable from 尾声2 onward). A handful
  // of bare "尾声" mentions with no location tying them to a specific half are conservatively
  // tagged with both epi1+epi2 — see chapterReviewFlags below for the exact list to double check.
  var CHAPTER_TAGS = {
    // TC
    tc1: ['full'],
    tc2: ['full'],
    th_bounty5: ['full'],
    tc3: ['full'],
    tc4: ['full'],
    tc5: ['full'],
    tc6: ['full'],
    tc7: ['full'],
    tc30: ['full'],
    tc8: ['full'],
    tc9: ['full'],
    tc10: ['full'],
    tc11: ['full'],
    tc12: ['full'],
    tc13: ['full'],
    tc14: ['full'],
    th_cc1: ['full'],
    a2: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    tc15: ['full'],
    a4: ['ch4','ch5','ch6','epi1','epi2'],
    tc16: ['full'],
    tc17: ['full'],
    gc_rc: ['full'],
    gc_dc: ['full'],
    tc18: ['full'],
    tc19: ['full'],
    th_la5: ['full'],
    tc20: ['full'],
    tc21: ['full'],
    tc22: ['full'],
    tc23: ['full'],
    tc24: ['full'],
    tc25: ['full'],
    tc26: ['full'],
    tc27: ['full'],
    tc28: ['full'],
    tc29: ['full'],
    gc_ch: ['full'],
    // A
    a1: ['ch3','ch4','ch5','ch6','epi1','epi2'],
    a3: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    a5: ['ch4','ch5','ch6','epi1','epi2'],
    a30: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    a31: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    a32: ['ch2','ch3','ch4','ch5','ch6'], // 仅第六章结束前可完成,尾声不再提供 (per user correction)
    a33: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    a34: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    a35: ['ch3','ch4','ch5','ch6','epi1','epi2'],
    a36: ['ch3','ch4','ch5','ch6','epi1','epi2'],
    a37: ['ch4','ch5','ch6','epi1','epi2'],
    a38: ['ch4','ch5','ch6','epi1','epi2'],
    a39: ['ch4','ch5','ch6','epi1','epi2'],
    a40: ['ch4','ch5','ch6','epi1','epi2'],
    a41: ['ch4','ch5','ch6','epi1','epi2'],
    a42: ['ch4','ch5','ch6','epi1','epi2'],
    a43: ['ch5','ch6','epi1','epi2'],
    a44: ['ch5','ch6','epi1','epi2'],
    a45: ['ch6','epi1','epi2'],
    a46: ['epi1','epi2'],
    a47: ['ch2','ch3','ch4','ch6','epi1','epi2'],
    a48: ['ch2'],
    a49: ['ch2'],
    a50: ['ch6'],
    a51: ['ch4'],
    a52: ['ch6'],
    a53: ['ch6'],
    a54: ['ch6'],
    a55: ['ch6'],
    a6: ['ch2'],
    a8: ['ch2'],
    a9: ['ch2'],
    a10: ['ch2'],
    a11: ['ch2'],
    a12: ['ch2'],
    a13: ['ch2'],
    a14: ['ch2','ch3','ch4'],
    a15: ['ch2','ch3','ch4'],
    a16: ['ch2','ch3','ch4'],
    a17: ['epi1','epi2'],
    a18: ['ch2','ch3','ch4'],
    a19: ['ch3'],
    a20: ['ch2','ch3','ch4'],
    a21: ['ch2','ch3','ch4'],
    a22: ['ch3'],
    a23: ['ch3'],
    a24: ['ch3','ch4'],
    a25: ['ch2','ch3'],
    a26: ['ch2','ch3','ch4'],
    a27: ['ch3'],
    a28: ['epi2'],
    a29: ['ch3'],
    ca_lenny_fff: ['ch2'],
    ca_charles_hunt: ['ch2','ch3'],
    ca_javier_home: ['ch2','ch3'],
    ca_tilly_dominoes: ['ch3'],
    ca_micah_fff: ['ch3'],
    ca_kieran_fish: ['ch3'],
    ca_javier_fish: ['ch3'],
    ca_bill_coach: ['ch3'],
    ca_sean_coach: ['ch3'],
    ca_charles_bank: ['ch4'],
    ca_lenny_coach: ['ch4'],
    ca_pearson_hunt: ['ch4'],
    ca_uncle_rustling: ['ch4'],
    ca_micah_coach: ['ch4'],
    // CH:we
    we1: ['full'],
    we2: ['full'],
    we3: ['full'],
    we4: ['full'],
    we5: ['full'],
    we6: ['full'],
    we7: ['full'],
    we8: ['full'],
    we9: ['full'],
    we10: ['full'],
    // CH:he
    he1: ['full'],
    he2: ['full'],
    he3: ['full'],
    he4: ['full'],
    he5: ['full'],
    he6: ['full'],
    he7: ['full'],
    he8: ['full'],
    he9: ['full'],
    he10: ['full'],
    // CH:ga
    ga1: ['full'],
    ga2: ['full'],
    ga3: ['full'],
    ga4: ['full'],
    ga5: ['full'],
    ga6: ['full'],
    ga7: ['full'],
    ga8: ['full'],
    ga9: ['full'],
    ga10: ['full'],
    // CH:ho
    ho1: ['full'],
    ho2: ['full'],
    ho3: ['full'],
    ho4: ['full'],
    ho5: ['full'],
    ho6: ['full'],
    ho7: ['full'],
    ho8: ['full'],
    ho9: ['full'],
    ho10: ['full'],
    // CH:sh
    sh1: ['full'],
    sh2: ['full'],
    sh3: ['full'],
    sh4: ['full'],
    sh5: ['full'],
    sh6: ['full'],
    sh7: ['full'],
    sh8: ['full'],
    sh9: ['full'],
    sh10: ['full'],
    // CH:su
    su1: ['full'],
    su2: ['full'],
    su3: ['full'],
    su4: ['full'],
    su5: ['full'],
    su6: ['full'],
    su7: ['full'],
    su8: ['full'],
    su9: ['full'],
    su10: ['full'],
    // CH:mh
    mh1: ['full'],
    mh2: ['full'],
    mh3: ['full'],
    mh4: ['full'],
    mh5: ['full'],
    mh6: ['full'],
    mh7: ['full'],
    mh8: ['full'],
    mh9: ['full'],
    mh10: ['full'],
    // CH:bh
    bh1: ['full'],
    bh2: ['full'],
    bh3: ['full'],
    bh4: ['full'],
    bh5: ['full'],
    bh6: ['full'],
    bh7: ['full'],
    bh8: ['full'],
    bh9: ['full'],
    bh10: ['full'],
    // CH:ex
    ex1: ['full'],
    ex2: ['full'],
    ex3: ['full'],
    ex4: ['full'],
    ex5: ['full'],
    ex6: ['full'],
    ex7: ['full'],
    ex8: ['full'],
    ex9: ['full'],
    ex10: ['full'],
    // COL:rc
    rc1: ['full'],
    rc2: ['full'],
    rc3: ['full'],
    rc4: ['full'],
    rc5: ['full'],
    rc6: ['full'],
    rc7: ['full'],
    rc8: ['full'],
    rc9: ['full'],
    rc10: ['full'],
    // COL:dc
    dc1: ['full'],
    dc2: ['full'],
    dc3: ['full'],
    // COL:db
    db1: ['full'],
    db2: ['full'],
    db3: ['full'],
    db4: ['full'],
    db5: ['full'],
    db6: ['full'],
    db7: ['full'],
    db8: ['full'],
    db9: ['full'],
    db10: ['full'],
    db11: ['full'],
    db12: ['full'],
    db13: ['full'],
    db14: ['full'],
    db15: ['full'],
    db16: ['full'],
    db17: ['full'],
    db18: ['full'],
    db19: ['full'],
    db20: ['full'],
    db21: ['full'],
    db22: ['full'],
    db23: ['full'],
    db24: ['full'],
    db25: ['full'],
    db26: ['full'],
    db27: ['full'],
    db28: ['full'],
    db29: ['full'],
    db30: ['full'],
    // COL:cc
    cc1: ['full'],
    cc2: ['full'],
    cc3: ['full'],
    cc4: ['full'],
    cc5: ['full'],
    cc6: ['full'],
    cc7: ['full'],
    cc8: ['full'],
    cc9: ['full'],
    cc10: ['full'],
    cc11: ['full'],
    cc12: ['full'],
    // HUNT:la
    la1: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    la2: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    la3: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    la4: ['ch3','ch4','ch5','ch6','epi1','epi2'],
    la5: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    la6: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    la7: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    la8: ['ch3','ch4','ch5','ch6','epi1','epi2'],
    la9: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    la10: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    la11: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    la12: ['full'],
    la13: ['ch6','epi1','epi2'],
    la14: ['epi2'],
    la15: ['epi2'],
    la16: ['epi2'],
    // HUNT:lf
    lf1: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    lf2: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    lf3: ['ch3','ch4','ch5','ch6','epi1','epi2'],
    lf4: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    lf5: ['ch3','ch4','ch5','ch6','epi1','epi2'],
    lf6: ['ch3','ch4','ch5','ch6','epi1','epi2'],
    lf7: ['ch3','ch4','ch5','ch6','epi1','epi2'],
    lf8: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    lf9: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    lf10: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    lf11: ['epi2'],
    lf12: ['epi2'],
    lf13: ['epi2'],
    lf14: ['epi2'],
    // HUNT:ou
    ou1: ['full'],
    ou2: ['full'],
    ou3: ['epi2'],
    ou4: ['epi2'],
    ou5: ['epi2'],
    ou6: ['ch6','epi1','epi2'],
    ou7: ['full'],
    ou8: ['full'],
    // HUNT:tk
    tk1: ['full'],
    tk2: ['full'],
    tk3: ['epi2'],
    tk4: ['full'],
    tk5: ['full'],
    tk6: ['full'],
    tk7: ['full'],
    tk8: ['full'],
    tk9: ['epi2'],
    tk10: ['full'],
    tk11: ['epi2'],
    tk12: ['full'],
    tk13: ['ch6','epi1','epi2'],
    tk14: ['full'],
    tk15: ['full'],
    tk16: ['full'],
    tk17: ['full'],
    tk18: ['full'],
    tk19: ['full'],
    tk20: ['full'],
    tk21: ['full'],
    tk22: ['full'],
    tk23: ['full'],
    tk24: ['full'],
    tk25: ['full'],
    tk26: ['full'],
    // BOUNTY
    bo1: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    bo2: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    bo3: ['full'],
    bo4: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    bo5: ['ch4','ch5','ch6','epi1','epi2'],
    bo6: ['ch4','ch5','ch6','epi1','epi2'],
    bo7: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    bo8: ['epi1','epi2'],
    bo9: ['epi1','epi2'],
    bo10: ['epi1','epi2'],
    bo11: ['epi2'],
    bo12: ['epi2'],
    bo13: ['epi2'],
    // SAT
    st1: ['full'],
    st2: ['full'],
    st3: ['full'],
    st4: ['full'],
    st5: ['full'],
    st6: ['full'],
    st7: ['full'],
    // D
    d1: ['ch3'],
    d2: ['ch2','ch3','ch4'],
    d5: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    d6: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    d7: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    d8: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    d9: ['ch4','ch5','ch6','epi1','epi2'],
    d15: ['epi1','epi2'],
    d16: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    d17: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    d18: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    d19: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    d20: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2'],
    d21: ['ch2','ch3','ch4','ch5','ch6','epi1','epi2']
  };

  // Items whose 尾声-only source text couldn't be tied to a specific half via location —
  // tagged with both epi1+epi2 (safe superset) so they still show up either way; worth a
  // manual look since these are the ones most likely to need correcting.
  var CHAPTER_REVIEW_FLAGS = ['a17'];

  function chapterTagsFor(id) {
    return CHAPTER_TAGS[id] || ['full'];
  }

  /* ---------------------------------------------------------------- */
  /* STATE                                                              */
  /* ---------------------------------------------------------------- */
  // Reviewed 2026-09-09. Keep storage IDs stable; translations never touch personal notes.
  (function reviewChecklistContent() {
    var terms = {
      '范葛伦':'瓦伦丁', '祖母绿牧场':'翡翠牧场', '干草堆镇':'风滚草镇', '图博威德':'风滚草镇',
      'Jeremiah Compson':'耶利米·康普森', 'Jeremy Gill':'杰里米·吉尔',
      'Leopold Strauss':'利奥波德·施特劳斯', 'Algernon':'阿尔杰农',
      "Doyle's Tavern":'多伊尔酒馆', 'Miss Marjorie':'玛乔丽小姐', 'Albert Mason':'阿尔伯特·梅森',
      'Edmund Lowry Jr':'小埃德蒙·洛瑞', 'Margaret':'玛格丽特', 'Alphonse Renaud':'阿尔冯斯·雷诺',
      'Marko Dragic':'马尔科·德拉吉奇', 'Andrew Bell III':'安德鲁·贝尔三世',
      'Proetus & Acrisius':'普洛托斯与克里休斯', "Willard's Rest":'魏尔拉德之息',
      'Wendell White & Sampson Black':'白先生与黑先生', 'Brother Dorkins':'多金斯修士',
      'Sister Calderón':'卡尔德隆修女', 'Henri Lemieux':'亨利·勒米厄', 'Jean Marc':'尚·马克',
      'Charlotte Balfour':'夏洛蒂·巴尔福', 'Obediah Hinton':'奥比迪亚·辛顿',
      'Hamish Sinclair':'哈米什·辛克莱', 'Hamish':'哈米什', 'Francis Sinclair':'弗朗西斯·辛克莱',
      'Sinclair':'辛克莱', 'Evelyn Miller':'伊夫林·米勒', 'Theodore Levin':'西奥多·列文',
      "Keane's Saloon":'基恩酒吧', 'Maximo':'马克西莫',
      'Abigail':'艾比盖尔', 'Javier':'哈维尔', 'Mary Beth':'玛丽贝斯', 'Jack':'杰克',
      'Pearson':'皮尔逊', 'Bill':'比尔', 'Charles':'查尔斯', 'Dutch':'达奇', 'Hosea':'何西阿',
      'Lenny':'蓝尼', 'Molly':'茉莉', 'Kieran':'基兰', 'Sadie':'莎迪', 'Sean':'西恩',
      'Susan':'苏珊', 'Tilly':'蒂莉', 'Uncle':'大叔',
      'Flatneck Station':'平脖子车站', 'Flat Iron Lake':'扁铁湖', 'Moonstone Pond':'月光池',
      'Elysian Pool':'极乐池', 'Wallace Station':'华莱士车站', 'Fort Wallace':'华莱士堡',
      'Emerald Ranch':'翡翠牧场', 'Big Valley':'大谷地', 'Heartland Overflow':'大地之心溢流地',
      'Heartlands':'大地之心', 'Fort Mercer':'默瑟堡', 'Cairn Lake':'凯恩湖',
      'Benedict Allbright':'本尼迪克特·奥尔布赖特', 'Ellie Anne Swan':'艾莉·安妮·史旺',
      'Joshua Brown':'约书亚·布朗', 'Mark Johnson':'马克·约翰逊', 'Robbie Laidlaw':'罗比·莱德劳',
      'Lindsay Woffard':'林赛·沃福德', 'Anthony Foreman':'安东尼·福尔曼',
      'Bart Cavanaugh':'巴特·卡瓦诺', 'Herman Zizendorf':'赫尔曼·亲岑多夫',
      'Otis Skinner':'奥蒂斯·斯金纳', 'Elias Green':'伊莱亚斯·格林',
      'Esteban Cortez':'埃斯塔班·科特斯', 'Joaquin Arroyo':'瓦金·阿罗约',
      'Old Harry Fen':'老哈里芬木屋',
      'Penny Dreadful 小说':'惊悚小说', 'landmark':'地标', 'Tatanka野牛':'传说野牛',
      '关瓜(Guarma)':'瓜玛', '(POI)':'', '(Equipment)':'', '(Shacks)':'',
      '(Wild Feverfew)':'', '(Desert Sage)':'', '(Red Sage)':'', '(Prickly Pear)':'', '(Oleander)':'',
      ' Giaguaro':'', '(Tatanka)':'', '(PC限定)':''
    };
    var keys = Object.keys(terms).sort(function(a,b){return b.length-a.length;});
    function zh(text) {
      if (!text) return text;
      keys.forEach(function(key){ text=text.split(key).join(terms[key]); });
      return text.replace(/([\u3400-\u9fff])\s+的/g,'$1的').trim();
    }
    var all=[];
    CATS.forEach(function(cat) {
      var items=cat.items || [].concat.apply([],cat.groups.map(function(g){return g.items;}));
      items.forEach(function(it) {
        // Snapshot keyed translations before changing their Chinese lookup keys.
        it.en=it.en || TITLE_EN[it.id] || it.t;
        it.lEn=LOC_EN[it.l] || it.l;
        it.nEn=it.nEn || NOTE_EN[it.n] || it.n;
        ['t','l','c','n','link'].forEach(function(field){if(it[field]) it[field]=zh(it[field]);});
        if (/^(cc\d+|la\d+)$/.test(it.id)) it.t=it.t.replace(/\s+[A-Za-z].*$/, '');
        if (it.id==='lf4') it.t=it.t.replace(' Muskie','');
        all.push(it);
      });
    });
    function update(id,patch) { all.filter(function(it){return it.id===id;}).forEach(function(it){Object.assign(it,patch);}); }
    var collectionLocationEn = {
      rc1:'Near the O in “MOUNT HAGEN” on the map, on the rock face to the right just before the uphill road ends',
      rc2:'Due south of the second A in “AMBARINO” on the map, at the end of the narrow rock ledge on the west bank of Whinyard Strait, north of the bridge',
      rc3:'On the far side of the nearest mountain northeast of Fort Wallace; climb north onto the ridge from the road south of the fort',
      rc4:'Follow the dotted trail north from the C in “CUMBERLAND FOREST” on the map; the carving is on the western cliff face',
      rc5:'Southwest of the O in “OWANJILA” on the map, on the rock face along the southwest shore of Owanjila',
      rc6:'Due east of the T in “WEST ELIZABETH” on the map, west of the dotted mountaintop trail that crosses the letter',
      rc7:'On the rocky hill northwest of Flatneck Station; climb from the south, then descend along the northern rock face',
      rc8:'Due south of Moonstone Pond, north of the Ambarino–New Hanover border, on the eastern hillside rock face',
      rc9:'Due west of the N in “ROANOKE RIDGE” on the map, on the ridge rock face south of the road',
      rc10:'Northeast of the second E in “NEW HANOVER” on the map, on the rocky ridge just north of the road along Elysian Pool’s east bank',
      dc_nh01:'Due west of the second O in “ROANOKE RIDGE” on the map, northwest of the riverside three-way junction',
      dc_nh02:'Upper right of the second N in “ANNESBURG” on the map, east of the north–south road',
      dc_nh03:'Due south of the U in “ANNESBURG” on the map, in the woods beyond the road',
      dc_nh04:'Due south of the S in “ANNESBURG” on the map, east of the road through Roanoke Ridge',
      dc_nh05:'Upper right of the second E in “NEW HANOVER” on the map, due south of the P in “ELYSIAN POOL”',
      dc_nh06:'In the woods near the centre of the O in “NEW HANOVER” on the map',
      dc_nh07:'Due south of the first E in “VALENTINE” on the map, west of the point where the dotted trail bends outward',
      dc_nh08:'West of the triangular junction southwest of Caliban’s Seat, on the north side of the road',
      dc_nh09:'Due east of the O in “DAKOTA RIVER” on the map, on the ridge east of the first road',
      dc_nh10:'Due north of the second C in “CITADEL ROCK”, between the railway to the south and the road to the north',
      dc_nh11:'Due west of the first E in “NEW HANOVER” on the map, in the woods west of the railway',
      dc_nh12:'At a lone tree near the upper right of the N in “THE HEARTLANDS” on the map',
      dc_nh13:'Among a group of trees at the centre of the southern end of Heartland Overflow',
      dc_nh14:'Due north of the B in “BLUEWATER MARSH” on the map; cross the river and first road, then search along the south edge of the second road',
      dc_le01:'North of and between the M and O in “LEMOYNE” on the map',
      dc_le02:'North of the M and O in “LEMOYNE” on the map, south of the previous Dreamcatcher',
      dc_am01:'Due south of the S in “WEST” within “GRIZZLIES WEST” on the map, on the largest dead tree atop the hill',
      dc_am02:'Northeast of Dreamcatcher #1, west of the short north–south stretch of the winding road beside the railway',
      dc_am03:'Due east of Cotorra Springs and north of the railway, on a prominent brown tree among white-barked trees',
      dc_am04:'Due west of The Loft, north of the railway crossing Ambarino',
      db1:'Ambarino · Due west of Chadwick Farm, on the rock face above the trail beside the Dakota River',
      db2:'Due south of the G in “COTORRA SPRINGS” on the map, on the lower cliff ledge north of the Dakota River',
      db3:'Due north of the O in “AMBARINO” on the map, atop the small hill between the northernmost railway and road',
      db4:'Lower left of the I in “AMBARINO” on the map, on the rock face beside the road east of Donner Falls',
      db5:'Slightly west of the bottom of the S in “EAST” within “GRIZZLIES EAST” on the map, at the mountain summit',
      db6:'Northeast of O’Creagh’s Run, south of the northernmost railway–state border crossing, on the hilltop below the road',
      db7:'Southwest of the lower-left corner of the second S in “BACCHUS STATION” on the map, on the summit northeast of Fort Wallace',
      db8:'Due south of the C in “CUMBERLAND FOREST” on the map, on the ridge edge above the dotted trail',
      db9:'Due north of the right edge of the A in “VALENTINE” on the map, at the edge of the high ground east of the Dakota River',
      db10:'Due east of the O in “DAKOTA RIVER” and due south of the first A in “CUMBERLAND FALLS” on the map, on the rock face',
      db11:'Due south of the gap between A and R in “THE HEARTLANDS” on the map, at the bottom of the abandoned oil derrick',
      db12:'Due south of the gap between R and T in “THE HEARTLANDS” on the map, just before the rocky ridges meet',
      db13:'Due south of the first A in “THE HEARTLANDS” on the map, in the grass north of the southernmost railway',
      db14:'Due east of the midpoint between the first O and A in “ROANOKE RIDGE” on the map, on the ridge east of the first road',
      db15:'Northwest of Van Horn Trading Post, in the woods southwest of the stable beyond the railway and two roads',
      db16:'Due east of the I in “KAMASSA RIVER” on the map, atop the high cliff on the river’s west bank north of Elysian Pool',
      db17:'Due north of the O in “NEW HANOVER” on the map, near the Ambarino border, on bare ground south of the cabin',
      db18:'Due south of the L in “LEMOYNE” on the map, south of the western end of Dewberry Creek',
      db19:'Due north of the D in “DEWBERRY CREEK” on the map, south of the New Hanover border',
      db20:'Due south of the first L in “GRIZZLIES WEST” on the map, in the cave west of the dotted trail northwest of Wallace Station',
      db21:'Between W and E in “WEST ELIZABETH” on the map, in the centre of the dotted trail crossing the letters',
      db22:'Due south of the M in “DREAM” within “BERYL’S DREAM” on the map, at the cliff edge beside the dotted trail',
      db23:'Due south of the first N in “HENNIGAN’S STEAD” on the map, inside the dotted canyon trail connected to the bottom of the letter',
      db24:'Due north of the gap between A and N in “SAN LUIS RIVER” on the map, on the riverbank opposite the offshore island',
      db25:'Slightly east of the bottom of the K in “RIO DEL LOBO ROCK” on the map, on a ledge halfway up the cliff',
      db26:'Due south of the B in “RIO BRAVO” on the map, atop the small hill by the cliff',
      db27:'Between A and U in “NEW AUSTIN” on the map, due east of the bottom of A, west of Jorge’s Gap',
      db28:'Far north of the first S in “CHOLLA SPRINGS” and due west of the H in “RATTLESNAKE HOLLOW” on the map, on the rock face',
      db29:'On the summit between D and G in “RIDGE” within “GAPTOOTH RIDGE” on the map; climb from the north near G',
      db30:'On the summit due south of the L in “TUMBLEWEED” on the map; take the small road above L up the cliff'
    };
    all.forEach(function(it){ if(collectionLocationEn[it.id]) it.lEn=collectionLocationEn[it.id]; });
    DC.forEach(function(parent){
      (parent.details || []).forEach(function(request){
        (request.items || []).forEach(function(child){
          if(collectionLocationEn[child.id]) child.lEn=collectionLocationEn[child.id];
        });
      });
    });
    update('tc3',{t:'触发25次随机事件',en:'25 chance encounters'});
    BETTER_WORLD_ITEM.lEn='Hunting-request posters at post offices and train stations';
    BETTER_WORLD_ITEM.nEn='The fifth request opens in the Epilogue.';
    var survivalistEnglish = {
      su1:'Catch 3 Bluegill fish',
      su2:'Hand 5 animals in to camp or the Trapper',
      su3:'Kill 5 animals using the Varmint Rifle',
      su4:'Craft a Dynamite Arrow, Fire Arrow, Improved Arrow, Poison Arrow, and Small Game Arrow',
      su5:'Catch a fish from a boat in the Bayou and catch another while standing on railroad tracks',
      su6:'Kill an animal scavenging a corpse 5 times',
      su7:'Kill 8 small-game animals with consecutive Small Game Arrow shots',
      su8:'Craft a Homing Tomahawk, Improved Tomahawk, Volatile Dynamite, and Volatile Fire Bottle',
      su9:'Catch a fish weighing at least 19 lb',
      su10:'Catch one of every fish species in the world'
    };
    Object.keys(survivalistEnglish).forEach(function(id){ update(id,{nEn:survivalistEnglish[id]}); });
    update('su2',{lEn:'Camp or Trapper'});
    update('su5',{lEn:'Bayou Nwa and railroad tracks'});
    update('ex9',{nEn:'Find the eighth treasure'});
    update('ex10',{nEn:'Find the ninth treasure; intermediate maps and final treasures in a treasure chain both count'});
    update('lf10',{lEn:'West Elizabeth · Owanjila Lake'});
    update('lf11',{lEn:'West Elizabeth · Aurora Basin',nEn:'Normally obtainable after the Epilogue region opens'});
    update('lf12',{lEn:'West Elizabeth · Stillwater Creek, west of Thieves Landing',nEn:'Normally obtainable after the Epilogue region opens'});
    update('lf14',{nEn:'Unlocked after mailing the first 13 legendary fish'});
    update('rc4',{t:'月光池'}); update('rc6',{t:'极乐池'}); update('db21',{t:'大谷地缓坡'});
    update('a3',{t:'借贷与其他罪过（一至七）'});
    update('a5',{n:'',nEn:''}); // No prerequisite relationship to Landmarks of Riches.
    // User annotations: remove unwanted preset guidance in both languages.
    ['a2','a3','a32','a41','a11','a29','dc1'].forEach(function(id){update(id,{n:'',nEn:''});});
    update('a45',{n:'共4部分',nEn:'4 parts'});
    update('a44',{n:'共5部分',nEn:'5 parts'});
    update('a26',{c:'',n:'需 2× 牛至',nEn:'Requires 2× Oregano'});
    var collectionNames={rc:'石雕',dc:'捕梦网',db:'恐龙骨',cc:'香烟卡'};
    var collectionDescriptions={
      rc:['将石雕位置寄给弗朗西斯·辛克莱，推进《地质学入门》','Mail rock carving locations to Francis Sinclair for Geology for Beginners.'],
      db:['将恐龙骨位置寄给黛博拉·麦金尼斯，推进《信心的考验》','Mail dinosaur bone locations to Deborah MacGuinness for A Test of Faith.'],
      cc:['集满任意一套后寄给菲尼亚斯·拉姆斯博顿可获得奖励','Mail a complete set to Phineas T. Ramsbottom for a reward.']
    };
    CATS.find(function(cat){return cat.id==='COL';}).groups.forEach(function(group){
      group.name=collectionNames[group.id];
      if(collectionDescriptions[group.id]) {
        group.desc=collectionDescriptions[group.id][0];
        GROUP_DESC_EN['COL:'+group.id]=collectionDescriptions[group.id][1];
      }
    });
    update('bo2',{l:'瓦伦丁警长办公室 · 华莱士车站附近',lEn:'Valentine sheriff’s office · Near Wallace Station'});
    ['bo4','bo11'].forEach(function(id){
      var it=all.find(function(x){return x.id===id;});
      it.en=it.en.replace(/\s*\(PC[- ](?:exclusive|only)\)/ig,'');
    });
    CHAPTER_META.forEach(function(meta,index){if(index<6) meta.badge='第'+(index+1)+'章';});

    var explore=CATS.find(function(cat){return cat.id==='D';});
    var from2=['ch2','ch3','ch4','ch5','ch6','epi1','epi2'];
    var from4=['ch4','ch5','ch6','epi1','epi2'];
    var epilogue=['epi1','epi2'];
    // d2 stays a manually checked quest-chain item. Its four weapon children
    // track the missable pickups separately and do not auto-complete the quest.
    update('d2',{t:'枪手任务线 · 高尚男人们与一个女人',en:'Gunslinger quest · The Noblest of Men, and a Woman',c:'第二章起，第四章可完成'});
    CHAPTER_TAGS.d2=from2.slice();
    update('d9',{t:'藏宝图 · 财富地标',en:'Treasure Map · Landmarks of Riches',l:'欧瓦尼拉湖西北 · 方尖碑',lEn:'Northwest of Owanjila · Obelisk',c:'第二章起'});
    CHAPTER_TAGS.d9=from2.slice();
    update('d1',{t:'稀有滚轮闭锁式步枪',l:'布莱斯韦特庄园附近谷仓 · 主线任务中的狙击手',lEn:'Barn near Braithwaite Manor · Sniper in Magicians for Sport'});
    var weapons = [
      ['w_flaco','弗拉科的左轮手枪','Flaco’s Revolver','凯恩湖 · 弗拉科决斗现场','Cairn Lake · Flaco’s duel',from2,''],
      ['w_granger','格兰杰的左轮手枪','Granger’s Revolver','扁铁湖东北农场 · 格兰杰决斗现场','Farm northeast of Flat Iron Lake · Granger’s duel',from2,''],
      ['w_midnight','米德奈特的手枪','Midnight’s Pistol','罗德斯车站出发的列车 · 比利·米德奈特决斗现场','Train from Rhodes station · Billy Midnight’s duel',from2,''],
      ['w_calloway','卡洛韦的左轮手枪','Calloway’s Revolver','白兰地瀑布附近 · 枪手任务线最终决斗','Near Brandywine Drop · Final gunslinger duel',from4,''],
      ['w_rare_shotgun','稀有霰弹枪','Rare Shotgun','安尼斯堡以北 · Manito Glade 隐士小屋','North of Annesburg · Hermit at Manito Glade',from2,''],
      ['w_algernon','阿尔杰农的左轮手枪','Algernon’s Revolver','圣丹尼斯温室 · 公爵夫人与其他动物任务奖励','Saint Denis greenhouse · Duchesses and Other Animals reward',from4,''],
      ['w_otis','奥蒂斯·米勒的左轮手枪','Otis Miller’s Revolver','新奥斯汀 · 响尾蛇山谷洞穴宝箱','New Austin · Rattlesnake Hollow cave chest',epilogue,''],
      ['w_micah','迈卡的左轮手枪','Micah’s Revolver','哈根山 · 美国毒液任务后返回山顶','Mount Hagen · Return after American Venom',['epi2'],''],
      ['w_high_roller','豪客双动式左轮手枪','High Roller Double-Action Revolver','黑市 · 完成第四章游船赌场任务后','Fence · After A Fine Night of Debauchery',from4,''],
      ['w_jawbone','龙骨匕首','Jawbone Knife','黛博拉的农场 · 信心的考验任务奖励','Deborah’s farm · A Test of Faith reward',epilogue,''],
      ['w_ornate','华丽匕首','Ornate Dagger','圣丹尼斯 · 吸血鬼事件现场','Saint Denis · Vampire encounter',from2,''],
      ['w_ancient','古代手斧','Ancient Tomahawk','卡鲁梅特峡谷东侧 · 木靶','East of Calumet Ravine · Wooden target',from2,''],
      ['w_double_bit','双头短斧','Double Bit Hatchet','华莱士车站西北 · 树桩','Northwest of Wallace Station · Tree stump',from2,''],
      ['w_rusted_double_bit','生锈的双头短斧','Rusted Double Bit Hatchet','安尼斯堡北部矿区 · 房屋间树桩','Northern Annesburg mining area · Stump between houses',from2,''],
      ['w_hunter','猎人短斧','Hunter Hatchet','窗岩以南 · 小屋外树桩','South of Window Rock · Stump outside the cabin',from2,''],
      ['w_rusted_hunter','生锈的猎人短斧','Rusted Hunter Hatchet',"Martha's Swain 小屋外 · 树桩","Outside Martha’s Swain · Tree stump",from2,''],
      ['w_hewing','劈砍短斧','Hewing Hatchet','月光池南侧 · 树桩','South side of Moonstone Pond · Tree stump',from2,''],
      ['w_stone','石斧（联动奖励，可选）','Stone Hatchet (optional crossover reward)','欧瓦尼拉湖北侧墓地 · 需完成侠盗猎车手线上模式石斧挑战','Burial site north of Owanjila · Requires GTA Online Stone Hatchet challenge',from2,'']
    ];
    var newItems=weapons.map(function(w) {
      var it=I(w[0],w[1],w[3],'',w[6],'',w[2]);
      it.lEn=w[4]; it.nEn=''; it.weapon=true;
      CHAPTER_TAGS[it.id]=w[5].slice();
      return it;
    });
    // Move the quest itself to Side Quests and fold its four unique handguns
    // into an expandable child checklist. The remaining unique weapons stay
    // as standalone entries under Exploration.
    var gunslingerIndex=explore.items.findIndex(function(it){return it.id==='d2';});
    var gunslingerItem=explore.items.splice(gunslingerIndex,1)[0];
    gunslingerItem.detailsLabel='绝版手枪收集';
    gunslingerItem.detailsLabelEn='Missable handgun collection';
    gunslingerItem.details=[{
      id:'gunslinger_weapons',
      t:'应收集的 4 把任务线专属手枪',
      en:'4 unique quest handguns to collect',
      note:'每场决斗结束后立即拾取',
      noteEn:'Pick each one up immediately after its duel',
      items:newItems.slice(0,4)
    }];
    var betterWorldIndex=A_ITEMS.indexOf(BETTER_WORLD_ITEM);
    A_ITEMS.splice(betterWorldIndex,0,gunslingerItem);
    var aCategory=CATS.find(function(cat){return cat.id==='A';});
    aCategory.groups[0].items=A_ITEMS.filter(function(it){return !CAMP_REQUEST_IDS[it.id];});
    aCategory.groups[1].items=A_ITEMS.filter(function(it){return !!CAMP_REQUEST_IDS[it.id];});
    explore.items.splice.apply(explore.items,[1,0].concat(newItems.slice(4)));
    ['d1','d17','d18','d19','d20','d21'].forEach(function(id){update(id,{weapon:true});});
    explore.items.forEach(function(it){it.n='';it.nEn='';});
  })();

  var state = {};
  (function loadInitial(){
    var src = initialState || {};
    for (var k in src) { state[k] = { c: !!src[k].c, m: src[k].m || '' }; }
    try {
      var saved = JSON.parse(localStorage.getItem('rdr2-full-checklist-v2') || 'null');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        Object.keys(saved).forEach(function(k) {
          if (k === '__proto__' || k === 'constructor' || k === 'prototype') return;
          var item = saved[k];
          if (item && typeof item === 'object') state[k] = {c:!!item.c,m:typeof item.m === 'string' ? item.m : ''};
        });
      }
    } catch (e) {}
  })();

  function st(id){
    if (!state[id]) state[id] = { c:false, m:'' };
    return state[id];
  }

  // Preserve earlier checklist progress when these new detail menus first appear:
  // an already-completed parent starts with all of its newly introduced children complete.
  detailParents().forEach(function (item) {
    if (!item.syncDetails || !st(item.id).c) return;
    var children = detailItems(item);
    var hasSavedChild = children.some(function (child) { return !!state[child.id]; });
    if (!hasSavedChild) children.forEach(function (child) { st(child.id).c = true; });
  });

  var openCats = {TC:true};
  var openGroups = {};
  var openItems = {};
  var alertOpen = false;
  try {
    var savedOpen = JSON.parse(localStorage.getItem('rdr2-full-checklist-open') || '{}');
    openCats = savedOpen.c || {TC:true};
    openGroups = savedOpen.g || {};
    openItems = savedOpen.i || {};
    alertOpen = !!savedOpen.a;
  } catch (e) {}

  function persistOpen(){
    try { localStorage.setItem('rdr2-full-checklist-open', JSON.stringify({ c: openCats, g: openGroups, i: openItems, a: alertOpen })); } catch (e) {}
  }

  function anyExpanded(){
    for (var k in openCats) { if (openCats[k]) return true; }
    for (var k in openGroups) { if (openGroups[k]) return true; }
    for (var k in openItems) { if (openItems[k]) return true; }
    return false;
  }

  function syncExpandAllBtnLabel(){
    var b = document.getElementById('expand-collapse-all');
    if (b) b.textContent = anyExpanded() ? L('全部收起', 'Collapse All') : L('全部展开', 'Expand All');
  }

  /* ---------------------------------------------------------------- */
  /* THEME (light / dark / follow-system)                               */
  /* ---------------------------------------------------------------- */
  var themePref = null;
  try {
    var savedTheme = localStorage.getItem('rdr2-full-checklist-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') themePref = savedTheme;
  } catch (e) {}

  function applyTheme(){
    var root = document.documentElement;
    if (themePref) { root.setAttribute('data-theme', themePref); }
    else { root.removeAttribute('data-theme'); }
    try {
      if (themePref) { localStorage.setItem('rdr2-full-checklist-theme', themePref); }
      else { localStorage.removeItem('rdr2-full-checklist-theme'); }
    } catch (e) {}
  }
  applyTheme();

  /* ---------------------------------------------------------------- */
  /* LANGUAGE (zh / en)                                                  */
  /* ---------------------------------------------------------------- */
  var lang = 'zh';
  try {
    var savedLang = localStorage.getItem('rdr2-full-checklist-lang');
    if (savedLang === 'en') lang = 'en';
  } catch (e) {}

  function applyLangAttr(){
    document.documentElement.setAttribute('data-lang', lang);
  }
  applyLangAttr();

  function setLang(v){
    lang = v === 'en' ? 'en' : 'zh';
    try { localStorage.setItem('rdr2-full-checklist-lang', lang); } catch (e) {}
    applyLangAttr();
  }

  // RDR Lino does not render the middle-dot glyph reliably. Keep it in Chinese,
  // but normalize English copy to an ASCII separator everywhere it is displayed.
  function englishText(text){
    return String(text == null ? '' : text)
      .replace(/\s*·\s*/g, ' - ')
      .replace(/\s*\/\s*/g, ' - ')
      .replace(/，\s*/g, ', ')
      .replace(/；\s*/g, '; ')
      .replace(/：\s*/g, ': ')
      .replace(/、\s*/g, ', ')
      .replace(/（/g, '(')
      .replace(/）/g, ')')
      .replace(/《/g, '“')
      .replace(/》/g, '”')
      .replace(/。/g, '.')
      .replace(/！/g, '!')
      .replace(/？/g, '?');
  }
  // L(zh, en): pick UI-chrome text by current language.
  function L(zh, en){ return lang === 'en' ? englishText(en) : zh; }

  // Per-item text: prefer the item's own official English title (it.en, already hand-set
  // for ~64 quest/mission-style entries), then the researched TITLE_EN table, then fall
  // back to the Chinese title so nothing ever renders blank.
  TITLE_EN.st7 = 'Legend of the East';
  function rowTitle(it){
    if (lang !== 'en') return it.t;
    return englishText(it.en || TITLE_EN[it.id] || it.t);
  }
  function rowLoc(it){
    if (lang !== 'en' || !it.l) return it.l;
    return englishText(it.lEn || LOC_EN[it.l] || it.l);
  }
  function rowNote(it){
    if (lang !== 'en' || !it.n) return it.n;
    return englishText(it.nEn || NOTE_EN[it.n] || it.n);
  }
  function catName(cat){
    if (lang !== 'en') return cat.name;
    return englishText((CAT_EN[cat.id] || {}).name || cat.name);
  }
  function catDesc(cat){
    if (lang !== 'en') return cat.desc;
    return englishText((CAT_EN[cat.id] || {}).desc || cat.desc);
  }
  function groupName(cat, g){
    if (lang !== 'en') return g.name;
    return englishText(GROUP_EN[cat.id + ':' + g.id] || g.name);
  }
  function groupDesc(cat, g){
    if (lang !== 'en') return g.desc;
    return englishText(GROUP_DESC_EN[cat.id + ':' + g.id] || g.desc);
  }

  var currentFilter = 'all';
  var statusFilter = 'all';
  var searchText = '';
  var artifactAPI = null;
  var saveTimer = null;
  var resetConfirmPending = false;
  var resetConfirmTimer = null;
  var themeMenuOpen = false;
  var langMenuOpen = false;
  var filterInlineOpen = false;
  var filterDrag = null; // in-progress drag state; see startFilterDrag()
  var suppressNextFilterClick = false; // set when a drag actually moved, so the browser's
  // trailing synthetic click on the chip (which already got handled via pointerup) is a no-op
  // null until the first paint() runs (page load) — that first paint only seeds this value,
  // it never fires the toast, so reloading an already-100%-complete checklist stays quiet.
  // After that, true/false tracks allBoardsComplete() so the toast fires only on the actual
  // false -> true transition (i.e. the moment the last item gets checked), not on every paint.
  var legendToastSeen = null;
  var THEME_OPTIONS = [
    { value: '', label: '🌗 跟随系统', labelEn: '🌗 System' },
    { value: 'dark', label: '🌙 深色模式', labelEn: '🌙 Dark Mode' },
    { value: 'light', label: '☀️ 浅色模式', labelEn: '☀️ Light Mode' }
  ];
  function themeOptLabel(o){ return lang === 'en' ? o.labelEn : o.label; }
  var LANG_OPTIONS = [
    { value: 'zh', flag: 'cn', text: '中文' },
    { value: 'en', flag: 'gb', text: 'English' }
  ];

  // Windows' system emoji font has no glyphs for the Unicode regional-indicator flag
  // emoji (🇨🇳 / 🇬🇧) — browsers there (incl. Opera GX) fall back to rendering the two
  // bare letter tiles ("CN" / "GB") instead of an actual flag. Tiny inline SVGs render
  // identically on every platform, so use those instead of the emoji characters.
  var FLAG_SVG = {
    cn: '<svg width="15" height="11" viewBox="0 0 30 20" style="vertical-align:-2px;margin-right:5px;border-radius:2px;flex-shrink:0;" aria-hidden="true">' +
      '<rect width="30" height="20" fill="#de2910"/>' +
      '<g fill="#ffde00">' +
        '<path d="M5,1.3 L6.3,3 L5,4.7 L3.7,3 Z"/>' +
        '<circle cx="9.6" cy="1.6" r="0.8"/><circle cx="11.3" cy="3.8" r="0.8"/>' +
        '<circle cx="10.6" cy="6.5" r="0.8"/><circle cx="8.4" cy="7.6" r="0.8"/>' +
      '</g>' +
    '</svg>',
    gb: '<svg width="15" height="11" viewBox="0 0 30 20" style="vertical-align:-2px;margin-right:5px;border-radius:2px;flex-shrink:0;" aria-hidden="true">' +
      '<rect width="30" height="20" fill="#00247d"/>' +
      '<path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" stroke-width="4"/>' +
      '<path d="M0,0 L30,20 M30,0 L0,20" stroke="#cf142b" stroke-width="1.8"/>' +
      '<path d="M15,0 L15,20 M0,10 L30,10" stroke="#fff" stroke-width="6.5"/>' +
      '<path d="M15,0 L15,20 M0,10 L30,10" stroke="#cf142b" stroke-width="3.8"/>' +
    '</svg>'
  };
  function langOptionHtml(o) { return (FLAG_SVG[o.flag] || '') + escapeHtml(o.text); }

  if (window.claude && typeof window.claude.use === 'function') {
    window.claude.use('artifact').then(function (a) { artifactAPI = a; });
  }

  /* ---------------------------------------------------------------- */
  /* ORIGINAL BACKGROUND ARTWORK (hand-drawn desert-dusk silhouette,     */
  /* not game assets) — encoded as data URIs for the glass backdrop     */
  /* ---------------------------------------------------------------- */
  var BG_SVG_DARK =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700">' +
    '<defs>' +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#050608"/>' +
        '<stop offset="45%" stop-color="#1a1410"/>' +
        '<stop offset="75%" stop-color="#3c2412"/>' +
        '<stop offset="100%" stop-color="#653a14"/>' +
      '</linearGradient>' +
      '<radialGradient id="glow" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#ffd28a" stop-opacity="0.9"/>' +
        '<stop offset="100%" stop-color="#ff9f0a" stop-opacity="0"/>' +
      '</radialGradient>' +
    '</defs>' +
    '<rect width="1200" height="700" fill="url(#sky)"/>' +
    '<g fill="#ffffff">' +
      '<circle cx="120" cy="70" r="1.4" opacity="0.7"/><circle cx="230" cy="120" r="1" opacity="0.5"/>' +
      '<circle cx="340" cy="60" r="1.6" opacity="0.6"/><circle cx="480" cy="100" r="1" opacity="0.4"/>' +
      '<circle cx="610" cy="55" r="1.3" opacity="0.6"/><circle cx="90" cy="180" r="1" opacity="0.4"/>' +
      '<circle cx="740" cy="90" r="1.2" opacity="0.5"/><circle cx="1000" cy="60" r="1.4" opacity="0.6"/>' +
      '<circle cx="1100" cy="130" r="1" opacity="0.4"/>' +
    '</g>' +
    '<circle cx="880" cy="360" r="150" fill="url(#glow)"/>' +
    '<circle cx="880" cy="360" r="48" fill="#ffdca0"/>' +
    '<path d="M0,430 L110,395 L230,420 L360,370 L500,410 L640,365 L790,405 L940,375 L1080,400 L1200,385 L1200,700 L0,700 Z" fill="#1c130e" opacity="0.85"/>' +
    '<path d="M0,500 L140,455 L300,490 L450,440 L610,485 L780,445 L930,480 L1080,450 L1200,470 L1200,700 L0,700 Z" fill="#120c08"/>' +
    '<rect x="0" y="620" width="1200" height="80" fill="#0a0705"/>' +
    '<g fill="#0a0704" transform="translate(150,620) scale(0.8)">' +
      '<rect x="-7" y="-100" width="14" height="100" rx="7"/>' +
      '<rect x="-24" y="-70" width="12" height="45" rx="6"/><rect x="-24" y="-70" width="24" height="12" rx="6"/>' +
      '<rect x="12" y="-55" width="12" height="35" rx="6"/><rect x="0" y="-55" width="24" height="12" rx="6"/>' +
    '</g>' +
    '<g fill="#0a0704" transform="translate(1010,620) scale(0.55)">' +
      '<rect x="-7" y="-100" width="14" height="100" rx="7"/>' +
      '<rect x="12" y="-55" width="12" height="35" rx="6"/><rect x="0" y="-55" width="24" height="12" rx="6"/>' +
    '</g>' +
    '</svg>';

  var BG_SVG_LIGHT =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700">' +
    '<defs>' +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#dfeaf7"/>' +
        '<stop offset="45%" stop-color="#f3e0c2"/>' +
        '<stop offset="75%" stop-color="#f8cd93"/>' +
        '<stop offset="100%" stop-color="#f3ab5f"/>' +
      '</linearGradient>' +
      '<radialGradient id="glow" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#fff2d6" stop-opacity="0.95"/>' +
        '<stop offset="100%" stop-color="#ff9f0a" stop-opacity="0"/>' +
      '</radialGradient>' +
    '</defs>' +
    '<rect width="1200" height="700" fill="url(#sky)"/>' +
    '<g fill="#5a3d1e" opacity="0.55">' +
      '<path d="M60,60 q14,-6 26,0" stroke="#5a3d1e" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M150,100 q14,-6 26,0" stroke="#5a3d1e" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M1000,70 q14,-6 26,0" stroke="#5a3d1e" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '</g>' +
    '<circle cx="880" cy="330" r="150" fill="url(#glow)"/>' +
    '<circle cx="880" cy="330" r="50" fill="#fff1cf"/>' +
    '<path d="M0,430 L110,395 L230,420 L360,370 L500,410 L640,365 L790,405 L940,375 L1080,400 L1200,385 L1200,700 L0,700 Z" fill="#caa26f" opacity="0.9"/>' +
    '<path d="M0,500 L140,455 L300,490 L450,440 L610,485 L780,445 L930,480 L1080,450 L1200,470 L1200,700 L0,700 Z" fill="#a9814f"/>' +
    '<rect x="0" y="620" width="1200" height="80" fill="#7c5c34"/>' +
    '<g fill="#3a2c18" transform="translate(150,620) scale(0.8)">' +
      '<rect x="-7" y="-100" width="14" height="100" rx="7"/>' +
      '<rect x="-24" y="-70" width="12" height="45" rx="6"/><rect x="-24" y="-70" width="24" height="12" rx="6"/>' +
      '<rect x="12" y="-55" width="12" height="35" rx="6"/><rect x="0" y="-55" width="24" height="12" rx="6"/>' +
    '</g>' +
    '<g fill="#3a2c18" transform="translate(1010,620) scale(0.55)">' +
      '<rect x="-7" y="-100" width="14" height="100" rx="7"/>' +
      '<rect x="12" y="-55" width="12" height="35" rx="6"/><rect x="0" y="-55" width="24" height="12" rx="6"/>' +
    '</g>' +
    '</svg>';

  function toDataUri(svg) {
    var b64;
    try { b64 = btoa(svg); } catch (e) { b64 = ''; }
    return 'url("data:image/svg+xml;base64,' + b64 + '")';
  }
  var BG_IMAGE_DARK = toDataUri(BG_SVG_DARK);
  var BG_IMAGE_LIGHT = toDataUri(BG_SVG_LIGHT);

  /* ---------------------------------------------------------------- */
  /* CSS                                                                */
  /* ---------------------------------------------------------------- */
  

  

  

  /* ---------------------------------------------------------------- */
  /* HELPERS                                                            */
  /* ---------------------------------------------------------------- */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escapeAttr(s){ return escapeHtml(s); }

  function badgeHtml(tag) {
    var meta = TAG_META[tag];
    if (!meta) return '';
    return '<span class="badge ' + meta.cls + '">' + (lang === 'en' ? englishText(meta.labelEn) : meta.label) + '</span>';
  }

  function countItems(items){
    var total = items.length, done = 0;
    items.forEach(function(it){ if (st(it.id).c) done++; });
    return { total: total, done: done };
  }

  // Rounds a done/total ratio to a display percentage, but never rounds a genuinely
  // incomplete count UP to 100 (e.g. 305/306 = 99.67% would otherwise round to "100%").
  // Only true completion (done === total) is allowed to show 100.
  function pctFor(done, total){
    if (!total) return 0;
    if (done >= total) return 100;
    return Math.min(99, Math.round((done / total) * 100));
  }

  function categoryItems(cat){
    if (cat.kind === 'flat') return cat.items;
    var all = [];
    cat.groups.forEach(function(g){ all = all.concat(g.items); });
    return all;
  }

  function detailParents(){
    return CATS.reduce(function (all, cat) {
      return all.concat(categoryItems(cat).filter(function (item) { return item.syncDetails; }));
    }, []);
  }

  // Overall ring intentionally excludes TC (总进度) — it gets its own ring
  // in its own card so the two boards' progress read independently.
  function countAll(){
    var total = 0, done = 0;
    CATS.forEach(function(cat){
      if (cat.id === 'TC') return;
      var c = countItems(categoryItems(cat));
      total += c.total; done += c.done;
    });
    return { total: total, done: done };
  }

  function compendiumBoardComplete(){
    var saved = readCompendiumState();
    var equipmentExcluded = {'equipment-33':true, 'equipment-35':true};
    return compendiumCount(saved, 'animals-', 1, 178) === 178 &&
      compendiumCount(saved, 'equipment-', 1, 79, equipmentExcluded) === 77 &&
      compendiumCount(saved, 'fish-', 1, 30) === 30 &&
      compendiumCount(saved, 'gangs-', 1, 6) === 6 &&
      compendiumCount(saved, 'plants-', 1, 43) === 43 &&
      compendiumCount(saved, 'horses-', 1, 19) === 19 &&
      compendiumCount(saved, 'weapons-', 1, 63) === 63 &&
      compendiumCount(saved, 'cards-', 1, 144) === 144;
  }

  // True once every checklist board and all 560 standard Compendium entries are complete.
  // The two version-exclusive equipment entries remain optional, matching the Compendium total.
  function allBoardsComplete(){
    return compendiumBoardComplete() && CATS.every(function(cat){
      var c = countItems(categoryItems(cat));
      return c.total > 0 && c.done === c.total;
    });
  }

  // One-shot "mission complete" style banner, fired the moment allBoardsComplete() flips to
  // true (see the legendToastSeen check in paint()). Appended as a sibling of #root — never
  // inside its innerHTML — so paint()'s full-DOM rebuilds on later clicks can't cut its fade
  // animation short or duplicate it. Removed from the DOM once its animation finishes.
  function showLegendToast(){
    var old = document.getElementById('legend-toast');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var el = document.createElement('div');
    el.id = 'legend-toast';
    el.className = 'legend-toast';
    el.setAttribute('role', 'status');
    el.innerHTML =
      '<div class="legend-toast-kicker">' + L('全 部 达 成', 'ALL BOARDS COMPLETE') + '</div>' +
      '<div class="legend-toast-title">' + L('荣誉之路，终至尽头', 'A long road, ridden with honor') + '</div>';
    document.body.appendChild(el);
    setTimeout(function(){
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 4600);
  }

  /* ---------------------------------------------------------------- */
  /* RENDER                                                             */
  /* ---------------------------------------------------------------- */
  var RING_R = 26;
  var RING_C = 2 * Math.PI * RING_R;

  function renderRingBlock(pct, subText) {
    var ringOffset = RING_C * (1 - pct / 100);
    return (
      '<div class="progress-block">' +
        '<div class="ring-wrap">' +
          '<svg viewBox="0 0 64 64" class="ring" aria-hidden="true">' +
            '<circle cx="32" cy="32" r="' + RING_R + '" class="ring-track"></circle>' +
            '<circle cx="32" cy="32" r="' + RING_R + '" class="ring-progress" ' +
              'style="stroke-dasharray:' + RING_C.toFixed(2) + ';stroke-dashoffset:' + ringOffset.toFixed(2) + '"></circle>' +
          '</svg>' +
          '<div class="ring-label"><span class="ring-pct">' + pct + '%</span></div>' +
        '</div>' +
        '<div class="overall-sub">' + subText + '</div>' +
      '</div>'
    );
  }

  function renderThemePicker() {
    var current = THEME_OPTIONS.filter(function (o) { return o.value === (themePref || ''); })[0] || THEME_OPTIONS[0];
    return (
      '<div class="theme-picker" id="theme-picker">' +
        '<button type="button" class="btn-ghost theme-picker-btn" id="theme-picker-btn" aria-haspopup="listbox" ' +
          'aria-expanded="' + (themeMenuOpen ? 'true' : 'false') + '">' + themeOptLabel(current) + '</button>' +
      '</div>'
    );
  }

  // Rendered as a sibling of .toolbar (not nested inside any .glass element), and
  // positioned with `position:fixed` set from JS on open — this keeps the popup from
  // ever being clipped by the toolbar's own overflow:hidden (used for its rounded corners).
  function renderThemeMenu() {
    var optionsHtml = THEME_OPTIONS.map(function (o) {
      var isActive = o.value === (themePref || '');
      return '<button type="button" class="theme-picker-option' + (isActive ? ' is-active' : '') +
        '" data-theme-value="' + o.value + '" role="option" aria-selected="' + (isActive ? 'true' : 'false') + '">' +
        themeOptLabel(o) + '</button>';
    }).join('');
    return (
      '<div class="theme-picker-menu" id="theme-picker-menu" role="listbox"' + (themeMenuOpen ? '' : ' hidden') + '>' +
        optionsHtml +
      '</div>'
    );
  }

  function positionThemeMenu() {
    var btn = document.getElementById('theme-picker-btn');
    var menu = document.getElementById('theme-picker-menu');
    if (!btn || !menu) return;
    var rect = btn.getBoundingClientRect();
    var menuWidth = Math.max(menu.offsetWidth || 150, 150);
    var left = Math.min(Math.max(8, rect.right - menuWidth), window.innerWidth - menuWidth - 8);
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.style.left = left + 'px';
  }

  // Language picker — same dropdown pattern/markup classes as the theme picker above
  // (reuses .theme-picker / .theme-picker-menu / .theme-picker-option), just with its own
  // ids and option list. Each option is prefixed with an inline SVG flag (see FLAG_SVG
  // above) rather than a flag emoji character, for cross-platform rendering.
  function renderLangPicker() {
    var current = LANG_OPTIONS.filter(function (o) { return o.value === lang; })[0] || LANG_OPTIONS[0];
    return (
      '<div class="theme-picker" id="lang-picker">' +
        '<button type="button" class="btn-ghost theme-picker-btn" id="lang-picker-btn" aria-haspopup="listbox" ' +
          'aria-expanded="' + (langMenuOpen ? 'true' : 'false') + '">' + langOptionHtml(current) + '</button>' +
      '</div>'
    );
  }

  function renderLangMenu() {
    var optionsHtml = LANG_OPTIONS.map(function (o) {
      var isActive = o.value === lang;
      return '<button type="button" class="theme-picker-option' + (isActive ? ' is-active' : '') +
        '" data-lang-value="' + o.value + '" role="option" aria-selected="' + (isActive ? 'true' : 'false') + '">' +
        langOptionHtml(o) + '</button>';
    }).join('');
    return (
      '<div class="theme-picker-menu" id="lang-picker-menu" role="listbox"' + (langMenuOpen ? '' : ' hidden') + '>' +
        optionsHtml +
      '</div>'
    );
  }

  function positionLangMenu() {
    var btn = document.getElementById('lang-picker-btn');
    var menu = document.getElementById('lang-picker-menu');
    if (!btn || !menu) return;
    var rect = btn.getBoundingClientRect();
    var menuWidth = Math.max(menu.offsetWidth || 150, 150);
    var left = Math.min(Math.max(8, rect.right - menuWidth), window.innerWidth - menuWidth - 8);
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.style.left = left + 'px';
  }

  /* ---------------------------------------------------------------- */
  /* FILTER BAR (compact toggle button that expands sideways into a     */
  /* row of chapter chips, in the toolbar's normal flow — not a          */
  /* dropdown and not an overlay drawer)                                 */
  /* ---------------------------------------------------------------- */
  function filterList() {
    return ['all'].concat(CHAPTER_META.map(function (c) { return c.id; }));
  }
  function filterLabelMap() {
    var m = { all: L('全部', 'All') };
    CHAPTER_META.forEach(function (c) { m[c.id] = chLabel(c); });
    return m;
  }

  function syncFilterScrollButtons() {
    var row = document.getElementById('filter-chip-row');
    if (!row) return;
    var prev = document.getElementById('filter-scroll-prev');
    var next = document.getElementById('filter-scroll-next');
    if (prev) prev.disabled = row.scrollLeft <= 1;
    if (next) next.disabled = row.scrollLeft >= row.scrollWidth - row.clientWidth - 1;
  }

  function revealFilterChip(chip) {
    if (!chip) return;
    var row = document.getElementById('filter-chip-row');
    var left = chip.offsetLeft;
    var right = left + chip.offsetWidth;
    if (left < row.scrollLeft + 3) row.scrollLeft = left - 3;
    else if (right > row.scrollLeft + row.clientWidth - 3) row.scrollLeft = right - row.clientWidth + 3;
    syncFilterScrollButtons();
  }

  function scrollFilterPage(direction) {
    var row = document.getElementById('filter-chip-row');
    if (!row) return;
    row.scrollLeft += direction * Math.max(80, row.clientWidth * .8);
    syncFilterScrollButtons();
  }

  function startFilterScroll(e, row) {
    // Touch and pen use native panning; only a mouse needs drag-to-scroll.
    if (e.pointerType !== 'mouse') return;
    filterDrag = {scrolling:true, row:row, startX:e.clientX, startScroll:row.scrollLeft, moved:false, pointerId:e.pointerId};
    window.addEventListener('pointermove', onFilterScrollMove);
    window.addEventListener('pointerup', onFilterScrollEnd);
    window.addEventListener('pointercancel', onFilterScrollEnd);
  }

  function onFilterScrollMove(e) {
    var drag = filterDrag;
    if (!drag || !drag.scrolling || e.pointerId !== drag.pointerId) return;
    var distance = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(distance) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      drag.row.classList.add('is-scrolling');
      try { drag.row.setPointerCapture(e.pointerId); } catch (err) {}
    }
    e.preventDefault();
    drag.row.scrollLeft = drag.startScroll - distance;
    syncFilterScrollButtons();
  }

  function onFilterScrollEnd(e) {
    var drag = filterDrag;
    if (!drag || !drag.scrolling || e.pointerId !== drag.pointerId) return;
    window.removeEventListener('pointermove', onFilterScrollMove);
    window.removeEventListener('pointerup', onFilterScrollEnd);
    window.removeEventListener('pointercancel', onFilterScrollEnd);
    drag.row.classList.remove('is-scrolling');
    try { drag.row.releasePointerCapture(e.pointerId); } catch (err) {}
    filterDrag = null;
    if (drag.moved) {
      suppressNextFilterClick = true;
      // The synthetic click belongs to this gesture, not the next deliberate tap.
      setTimeout(function () { suppressNextFilterClick = false; }, 0);
    }
  }

  function onFilterWheel(e) {
    var row = e.target.closest && e.target.closest('#filter-chip-row');
    if (!filterInlineOpen || !row || !row.closest('.is-overflowing') || e.ctrlKey || e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    var delta = e.deltaY * (e.deltaMode === 1 ? 20 : e.deltaMode === 2 ? row.clientWidth : 1);
    var before = row.scrollLeft;
    row.scrollLeft += delta;
    if (row.scrollLeft !== before) e.preventDefault();
    syncFilterScrollButtons();
  }

  function onFilterKeydown(e) {
    var chip = e.target.closest && e.target.closest('.filter-chip');
    if (!filterInlineOpen || !chip) return;
    var row = document.getElementById('filter-chip-row');
    var chips = Array.prototype.slice.call(row.querySelectorAll('.filter-chip'));
    var index = chips.indexOf(chip);
    if (e.key === 'ArrowRight') index = Math.min(chips.length - 1, index + 1);
    else if (e.key === 'ArrowLeft') index = Math.max(0, index - 1);
    else if (e.key === 'Home') index = 0;
    else if (e.key === 'End') index = chips.length - 1;
    else return;
    e.preventDefault();
    chips[index].focus({preventScroll:true});
    revealFilterChip(chips[index]);
  }

  function renderFilterBar() {
    var labels = filterLabelMap();
    var chipsHtml = filterList().map(function (f) {
      return '<button type="button" class="filter-chip' + (f === currentFilter ? ' is-active' : '') +
        '" data-filter="' + f + '" role="option" aria-selected="' + (f === currentFilter ? 'true' : 'false') + '">' +
        escapeHtml(labels[f]) + '</button>';
    }).join('');
    return (
      '<div class="filter-slot" id="filter-slot">' +
        '<button type="button" class="filter-toggle-btn' + (filterInlineOpen ? ' is-fading' : '') + '" id="filter-toggle-btn" ' +
          'aria-haspopup="listbox" aria-expanded="' + (filterInlineOpen ? 'true' : 'false') + '">☰ ' +
          escapeHtml(labels[currentFilter]) + '</button>' +
        '<div class="filter-chip-row' + (filterInlineOpen ? ' is-open' : '') + '" id="filter-chip-row" inert role="listbox" aria-label="' + L('章节筛选', 'Chapter filter') + '">' +
          '<div class="filter-thumb" id="filter-thumb" aria-hidden="true"></div>' +
          chipsHtml +
        '</div>' +
        '<button type="button" class="filter-scroll-btn filter-scroll-prev" id="filter-scroll-prev" data-filter-scroll="-1" aria-controls="filter-chip-row" aria-label="'+L('向前滚动章节','Scroll chapters backward')+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button>' +
        '<button type="button" class="filter-scroll-btn filter-scroll-next" id="filter-scroll-next" data-filter-scroll="1" aria-controls="filter-chip-row" aria-label="'+L('向后滚动章节','Scroll chapters forward')+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button>' +
      '</div>'
    );
  }

  function renderStatusFilters() {
    function button(value, zh, en, symbol) {
      var active = statusFilter === value;
      return '<button type="button" class="status-filter-btn' + (active ? ' is-active' : '') +
        '" data-status-filter="' + value + '" aria-pressed="' + (active ? 'true' : 'false') + '">' +
        '<span aria-hidden="true">' + symbol + '</span> ' + L(zh, en) + '</button>';
    }
    return '<div class="status-filters" role="group" aria-label="' + L('完成状态筛选', 'Completion status filter') + '">' +
      button('incomplete', '仅未完成', 'Incomplete', '○') +
      button('complete', '仅已完成', 'Complete', '✓') +
      '</div>';
  }

  function syncStatusFilterButtons() {
    document.querySelectorAll('.status-filter-btn[data-status-filter]').forEach(function (button) {
      var active = button.dataset.statusFilter === statusFilter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function selectStatusFilter(nextFilter) {
    statusFilter = statusFilter === nextFilter ? 'all' : nextFilter;
    syncStatusFilterButtons();
    applyFilter();
  }

  // Toggling open/closed manipulates the already-rendered DOM directly (rather than going
  // through paint()) so the width transition on .filter-slot actually animates — same
  // trick the cat/group expand-collapse helpers use. The compact button and the chip row
  // are stacked inside .filter-slot (row absolutely positioned over the button); only
  // .filter-slot's own width is ever animated, with the button/row cross-fading via
  // opacity, so the whole thing reads as ONE pill growing/shrinking rather than the
  // button disappearing while a separate element grows next to it.
  function openFilterInline() {
    filterInlineOpen = true;
    var slot = document.getElementById('filter-slot');
    var btn = document.getElementById('filter-toggle-btn');
    var row = document.getElementById('filter-chip-row');
    if (!slot || !btn || !row) return;
    // same FLIP-style measure-then-transition technique as expandEl(): lock the slot's
    // current (compact) width as a concrete starting point, then animate to the row's
    // actual content width (capped only by a viewport safety margin, never by a smaller
    // fixed value — English chapter labels run wider than the Chinese ones).
    var startWidth = slot.getBoundingClientRect().width;
    slot.style.width = startWidth + 'px';
    void slot.offsetWidth; // force reflow so the browser commits the starting width
    row.classList.add('is-open');
    btn.classList.add('is-fading');
    btn.setAttribute('aria-expanded', 'true');
    row.inert = false;
    btn.tabIndex = -1;
    slot.classList.add('is-filter-open');
    slot.classList.remove('is-overflowing');
    var targetWidth = filterRowTargetWidth(row);
    slot.classList.toggle('is-overflowing', row.scrollWidth > targetWidth + 1);
    row.onscroll = syncFilterScrollButtons;
    syncFilterScrollButtons();
    setTimeout(function () {
      if (!filterInlineOpen) return;
      revealFilterChip(row.querySelector('.filter-chip.is-active'));
    }, 350);
    requestAnimationFrame(function () {
      slot.style.width = targetWidth + 'px';
    });
    // deliberately no "release the cap" step afterwards: the row's content is static once
    // rendered, and the slot auto-closes on window resize (see the resize handler below),
    // so there's nothing to gain from un-pinning the width while open.
  }

  function filterRowTargetWidth(row) {
    var toolbar = row.closest('.toolbar');
    var viewportCap = Math.max(160, toolbar ? toolbar.clientWidth - 16 : window.innerWidth - 44);
    return Math.min(row.scrollWidth, viewportCap);
  }

  function closeFilterInline() {
    filterInlineOpen = false;
    var slot = document.getElementById('filter-slot');
    var btn = document.getElementById('filter-toggle-btn');
    var row = document.getElementById('filter-chip-row');
    if (!slot || !btn || !row) return;
    // establish a concrete starting width (mirrors collapseEl())
    slot.style.width = slot.getBoundingClientRect().width + 'px';
    void slot.offsetWidth; // force reflow so the browser commits the starting value
    if (filterDrag && filterDrag.scrolling) onFilterScrollEnd({pointerId:filterDrag.pointerId});
    if (row.contains(document.activeElement) || (document.activeElement && document.activeElement.matches('.filter-scroll-btn'))) btn.focus({preventScroll:true});
    row.inert = true;
    btn.tabIndex = 0;
    slot.classList.remove('is-filter-open');
    row.classList.remove('is-open');
    btn.classList.remove('is-fading');
    btn.setAttribute('aria-expanded', 'false');
    var targetWidth = btn.scrollWidth; // the compact button's own natural content width
    requestAnimationFrame(function () {
      slot.style.width = targetWidth + 'px';
    });
    var released = false;
    var release = function () {
      if (released) return;
      released = true;
      // release the inline width once settled so the slot goes back to auto-sizing off
      // the button's natural width (keeps it correct if the label's text ever changes)
      if (!filterInlineOpen) slot.style.width = '';
    };
    var onEnd = function (ev) {
      if (ev.propertyName !== 'width') return;
      slot.removeEventListener('transitionend', onEnd);
      release();
    };
    slot.addEventListener('transitionend', onEnd);
    setTimeout(release, 500); // safety net in case transitionend never fires
  }

  // Re-renders just the missable-warning panel in place (its content depends on
  // currentFilter) without touching the rest of the page — used by selectFilter() so a
  // chapter switch never needs a full paint(), which would blow away the filter row's
  // in-progress collapse animation.
  function refreshAlert() {
    var slot = document.getElementById('alert-slot');
    if (!slot) return;
    slot.innerHTML = renderAlert();
    if (alertOpen) {
      var body = slot.querySelector('.alert.is-open > .alert-body');
      if (body) body.style.maxHeight = 'none';
    }
  }

  // Switches the active chapter filter. Everything that depends on currentFilter but
  // lives outside the animating .filter-slot (row visibility, the alert panel, the
  // toggle button's label, and the chips' own active-highlight) is updated directly and
  // immediately; the slot itself is then asked to collapse via the existing
  // closeFilterInline() animation, so a chip selection now reads as "the row slides shut
  // around your choice" instead of the old instant full-page repaint.
  function selectFilter(newFilter) {
    if (newFilter === currentFilter) {
      if (filterInlineOpen) closeFilterInline();
      return;
    }
    currentFilter = newFilter;
    applyFilter();
    refreshAlert();
    var labels = filterLabelMap();
    var btn = document.getElementById('filter-toggle-btn');
    if (btn) btn.innerHTML = '☰ ' + escapeHtml(labels[currentFilter]);
    var row = document.getElementById('filter-chip-row');
    if (row) {
      Array.prototype.forEach.call(row.querySelectorAll('.filter-chip'), function (chip) {
        var isActive = chip.dataset.filter === currentFilter;
        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }
    if (filterInlineOpen) { closeFilterInline(); }
  }

  /* ---------------------------------------------------------------- */
  /* FILTER ROW DRAG-TO-SWITCH — press a chip, drag across the open row, and release over  */
  /* the target chapter to switch to it. A frosted "thumb" slides live between chips as you */
  /* drag; nothing is committed until pointerup (a plain press-and-release without moving    */
  /* still behaves exactly like a normal click on that chip).                                */
  /* ---------------------------------------------------------------- */
  function chipRectsFor(row) {
    var rowRect = row.getBoundingClientRect();
    return Array.prototype.map.call(row.querySelectorAll('.filter-chip'), function (chip) {
      var r = chip.getBoundingClientRect();
      return { filter: chip.dataset.filter, left: r.left - rowRect.left, right: r.right - rowRect.left };
    });
  }

  function filterAtX(chips, x) {
    if (!chips.length) return null;
    for (var i = 0; i < chips.length; i++) {
      if (x >= chips[i].left && x < chips[i].right) return chips[i];
    }
    // clamp to whichever end the pointer strayed past
    return x < chips[0].left ? chips[0] : chips[chips.length - 1];
  }

  function positionThumb(chip) {
    if (!filterDrag || !chip) return;
    filterDrag.thumb.style.left = chip.left + 'px';
    filterDrag.thumb.style.width = (chip.right - chip.left) + 'px';
  }

  // Highlights (text color only — the thumb itself is NOT moved/resized here) whichever
  // chip is currently the drag candidate, so the user gets a hint of what will be picked
  // without the thumb visually locking onto it before they've actually let go.
  function markDragCandidate(row, filterId) {
    Array.prototype.forEach.call(row.querySelectorAll('.filter-chip'), function (chip) {
      chip.classList.toggle('is-drag-candidate', filterId != null && chip.dataset.filter === filterId);
    });
  }

  function startFilterDrag(e, row) {
    suppressNextFilterClick = false;
    if (row.closest('.is-overflowing')) { startFilterScroll(e, row); return; }
    var thumb = document.getElementById('filter-thumb');
    var chips = chipRectsFor(row);
    if (!thumb || !chips.length) return;
    var rowRect = row.getBoundingClientRect();
    var startChip = filterAtX(chips, e.clientX - rowRect.left) || chips[0];
    filterDrag = {
      row: row, thumb: thumb, chips: chips, candidate: startChip.filter, moved: false,
      thumbWidth: startChip.right - startChip.left, rowWidth: rowRect.width
    };
    thumb.style.transition = 'none'; // snap instantly to the starting chip, no lag on press
    positionThumb(startChip);
    markDragCandidate(row, startChip.filter);
    row.classList.add('is-dragging');
    if (row.setPointerCapture) { try { row.setPointerCapture(e.pointerId); } catch (err) {} }
    row.addEventListener('pointermove', onFilterDragMove);
    row.addEventListener('pointerup', onFilterDragEnd);
    row.addEventListener('pointercancel', onFilterDragEnd);
  }

  // While the drag is in progress, the thumb does NOT lock to any chip's position/width —
  // it free-floats, re-centered on the pointer at a fixed width, with no transition so it
  // tracks the finger/cursor 1:1. Which chip would be picked if released right now is only
  // tracked internally (filterDrag.candidate) and surfaced via a text-color hint on that
  // chip (markDragCandidate) — the actual "lock to nearest chapter" snap only happens once,
  // in onFilterDragEnd, at the moment of release.
  function onFilterDragMove(e) {
    if (!filterDrag) return;
    filterDrag.moved = true;
    var row = filterDrag.row;
    var x = e.clientX - row.getBoundingClientRect().left;
    var half = filterDrag.thumbWidth / 2;
    var maxLeft = Math.max(0, filterDrag.rowWidth - filterDrag.thumbWidth);
    var left = Math.min(Math.max(x - half, 0), maxLeft);
    filterDrag.thumb.style.left = left + 'px';
    filterDrag.thumb.style.width = filterDrag.thumbWidth + 'px';
    var chip = filterAtX(filterDrag.chips, x);
    if (chip && chip.filter !== filterDrag.candidate) {
      filterDrag.candidate = chip.filter;
      markDragCandidate(row, chip.filter);
    }
  }

  function onFilterDragEnd(e) {
    if (!filterDrag) return;
    var row = filterDrag.row;
    var candidate = filterDrag.candidate;
    var moved = filterDrag.moved;
    var chips = filterDrag.chips;
    var thumb = filterDrag.thumb;
    row.removeEventListener('pointermove', onFilterDragMove);
    row.removeEventListener('pointerup', onFilterDragEnd);
    row.removeEventListener('pointercancel', onFilterDragEnd);
    if (row.releasePointerCapture && e.pointerId != null) { try { row.releasePointerCapture(e.pointerId); } catch (err) {} }
    row.classList.remove('is-dragging');
    markDragCandidate(row, null);
    // the one moment the thumb is allowed to "lock": snap it into the chosen chip's exact
    // rect right as the drag ends, before selectFilter() hands off to the row-closing animation.
    var finalChip = null;
    for (var i = 0; i < chips.length; i++) { if (chips[i].filter === candidate) { finalChip = chips[i]; break; } }
    if (finalChip) {
      thumb.style.transition = 'left .16s cubic-bezier(.4,0,.2,1),width .16s cubic-bezier(.4,0,.2,1)';
      thumb.style.left = finalChip.left + 'px';
      thumb.style.width = (finalChip.right - finalChip.left) + 'px';
    }
    filterDrag = null;
    if (e.type === 'pointercancel') return;
    if (moved) { suppressNextFilterClick = true; setTimeout(function () { suppressNextFilterClick = false; }, 0); }
    selectFilter(candidate);
  }


  function uiIcon(name) {
    if (name === 'TC') return '<img class="rockstar-mark" src="assets/images/rockstar-mark.webp" alt="Rockstar Games" width="36" height="34" decoding="async">';
    var paths = {
      list:'<path d="m3 6 2 2 3-4M11 6h10M3 13h5M11 13h10M3 20h5M11 20h10"/>',
      search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
      A:'<path d="M21 11a8 8 0 0 1-8 8H7l-5 3 1-6a8 8 0 0 1-1-4V9a7 7 0 0 1 7-7h4a8 8 0 0 1 8 8z"/><path d="M7 8h9M7 12h6"/>',
      CH:'<circle cx="12" cy="9" r="6"/><path d="m8 14-2 8 6-3 6 3-2-8m-4-8v6m-3-3h6"/>',
      COL:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
      HUNT:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
      BOUNTY:'<rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="9" r="3"/><path d="M8 17h8M9 20h6"/>',
      SAT:'<rect x="4" y="7" width="16" height="15" rx="4"/><path d="M8 7V5a4 4 0 0 1 8 0v2M4 13h16m-10 0v3h4v-3"/>',
      D:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5z"/>',
      MAP:'<path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3z"/><path d="M8 3v15M16 6v15"/>',
      TC:'<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.list)+'</svg>';
  }

  function renderCompendiumCard() {
    var done = 0;
    try {
      var saved = JSON.parse(localStorage.getItem('rdr2-compendium-v1') || '{}') || {};
      Object.keys(saved).forEach(function (id) {
        if (saved[id] && id !== 'equipment-33' && id !== 'equipment-35') done += 1;
      });
    } catch (e) {}
    return '<a class="cat glass compendium-card' + (done === 560 ? ' cat-complete' : '') + '" href="compendium.html">' +
      '<span class="cat-icon" aria-hidden="true"><img class="compendium-icon" src="assets/images/compendium-icon.jpg" alt=""></span>' +
      '<span class="cat-titlewrap"><h2>' + L('图鉴', 'Compendium') + '</h2><span class="cat-desc">' + L('动物、植物、装备与收藏记录', 'Animals, plants, equipment and collectibles') + '</span></span>' +
      '<span class="chev" aria-hidden="true"></span>' +
      renderRingBlock(pctFor(done, 560), done + ' / 560') + '</a>';
  }

  function renderMapCard() {
    return '<a class="cat glass compendium-card map-entry-card" href="map.html">' +
      '<span class="cat-icon" aria-hidden="true">' + uiIcon('MAP') + '</span>' +
      '<span class="cat-titlewrap"><h2>' + L('互动地图', 'Interactive Map') + '</h2><span class="cat-desc">' + L('高清地图浏览', 'High-resolution map viewer') + '</span></span>' +
      '<span class="chev" aria-hidden="true"></span></a>';
  }

  function renderUpdateTicker() {
    var text = window.RDR2Updates.latestText(lang);
    return '<aside class="update-ticker" aria-label="' + escapeAttr(text) + '">' +
      '<div class="update-ticker-track" aria-hidden="true">' +
        '<span class="update-ticker-copy">' + escapeHtml(text) + '</span>' +
        '<span class="update-ticker-copy">' + escapeHtml(text) + '</span>' +
      '</div>' +
    '</aside>';
  }

  function renderShell() {
    var c = countAll();
    var pct = pctFor(c.done, c.total);
    var resetBtnHtml = resetConfirmPending
      ? '<button type="button" class="btn-ghost btn-danger is-confirm" id="reset-all" aria-label="' + L('再点一次确认清空,清空全部进度', 'Click again to confirm — this clears all progress') + '" title="' + L('再点一次确认清空', 'Click again to confirm') + '">' +
          '<svg class="reset-icon" width="15" height="15" viewBox="0 0 24 24" fill="#000000" aria-hidden="true">' +
            '<path d="M9 3V4H4V6H5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8H11V17H9V8ZM13 8H15V17H13V8Z"/>' +
          '</svg>' +
        '</button>'
      : '<button type="button" class="btn-ghost btn-danger" id="reset-all">' + L('重置清单', 'Reset Checklist') + '</button>';
    return (
      '<header class="topbar">' +
        '<div class="brand">' +
          '<div class="brand-mark" aria-hidden="true"><img src="assets/images/brand-mark.jpg" alt="" width="72" height="72" decoding="async"></div>' +
          '<h1>'+L('RDR2 清单','RDR2 Todo list')+'</h1>' +
          (allBoardsComplete() ? '<span class="legend-badge">🏆 ' + L('传奇亡命之徒 · 全部完成', 'Legendary Outlaw · 100% Complete') + '</span>' : '') +
        '</div>' +
        renderRingBlock(pct, c.done + ' / ' + c.total + ' ' + L('已完成', 'done')) +
      '</header>' +
      '<nav class="toolbar glass" aria-label="'+L('清单工具栏','Checklist toolbar')+'">' +
        '<div class="search-wrap">'+uiIcon('search')+
          '<input id="search" type="search" aria-label="'+L('搜索任务或地点','Search tasks or locations')+'" placeholder="' + L('搜索任务、地点或物品', 'Search tasks, places or items') + '" autocomplete="off" value="' + escapeAttr(searchText) + '"></div>' +
        renderFilterBar() +
        renderStatusFilters() +
        '<div class="tool-right">' +
          renderThemePicker() +
          renderLangPicker() +
          '<button type="button" class="btn-ghost" id="expand-collapse-all">' + (anyExpanded() ? L('全部收起', 'Collapse All') : L('全部展开', 'Expand All')) + '</button>' +
          resetBtnHtml +
        '</div>' +
      '</nav>'
    );
  }

  // An item tagged 'missable' is only genuinely "at risk" if its availability actually
  // ends before the last tracked chapter (Epilogue 2). One that stays available all the
  // way through Epilogue 2 — e.g. a34 一个美好的夜晚, which just needs a random night
  // encounter to unlock and otherwise has no chapter deadline — never truly expires within
  // what this tool tracks, so it should never show up in the warning panel, no matter which
  // chapter filter is selected.
  function isGenuinelyMissable(it) {
    if ((it.tg || []).indexOf('missable') === -1) return false;
    var chTags = chapterTagsFor(it.id);
    if (chTags.indexOf('full') !== -1) return false;
    var lastChapterId = CHAPTER_META[CHAPTER_META.length - 1].id; // 'epi2'
    return chTags.indexOf(lastChapterId) === -1;
  }

  // The last chapter (in CHAPTER_META order) an item's tags reach — i.e. the chapter
  // right before it disappears. Used so the warning panel only flags an item in that
  // one "last chance" chapter, instead of every earlier chapter it happens to also be
  // available in (e.g. a32 募捐者/Fundraiser is available ch2-ch6, but is only genuinely
  // at risk of being missed once you're in Chapter 6 — showing it as a warning back in
  // Chapter 2 already would be premature noise).
  function lastAvailableChapter(chTags) {
    for (var i = CHAPTER_META.length - 1; i >= 0; i--) {
      if (chTags.indexOf(CHAPTER_META[i].id) !== -1) return CHAPTER_META[i].id;
    }
    return null;
  }

  function renderAlert() {
    // per user's spec: the whole panel drops out when "全部" is selected — it only makes
    // sense as a "what's at risk in the chapter I'm currently on" view.
    if (currentFilter === 'all') return '';
    var chMeta = CHAPTER_META_BY_ID[currentFilter];
    var chapterLabel = chMeta ? chLabel(chMeta) : '';
    var pending = [];
    CATS.forEach(function (cat) {
      categoryItems(cat).forEach(function (it) {
        if (!isGenuinelyMissable(it) || st(it.id).c) return;
        var chTags = chapterTagsFor(it.id);
        if (lastAvailableChapter(chTags) === currentFilter) pending.push(it);
      });
    });
    if (pending.length === 0) {
      return '<div class="alert alert-ok">🎉 ' + escapeHtml(chapterLabel) + ' ' +
        L('当前没有待处理的绝版预警事项。', 'has no pending missable warnings right now.') + '</div>';
    }
    var items = pending.map(function (it) {
      return '<li><a href="#item-' + it.id + '">' + escapeHtml(rowTitle(it)) + '</a>' +
        '<span class="alert-loc">' + escapeHtml(rowLoc(it) || '') + '</span></li>';
    }).join('');
    return (
      '<div class="alert alert-warn' + (alertOpen ? ' is-open' : '') + '">' +
        '<button type="button" class="alert-toggle" id="alert-toggle" aria-expanded="' + (alertOpen ? 'true' : 'false') + '">' +
          '<span class="alert-title">⚠️ ' + escapeHtml(chapterLabel) + L(' 尚未处理的绝版预警', ' — Pending Missable Warnings') + '</span>' +
          '<span class="alert-count">' + pending.length + '</span>' +
          '<span class="chev alert-chev">▸</span>' +
        '</button>' +
        '<div class="alert-body"><ul class="alert-list">' + items + '</ul></div>' +
      '</div>'
    );
  }

  function detailItems(it) {
    return (it.details || []).reduce(function (all, request) {
      return all.concat(request.items || []);
    }, []);
  }

  function renderItemDetails(it) {
    if (!it.details || !it.details.length) return '';
    var isOpen = !!openItems[it.id];
    var allDetailItems = detailItems(it);
    var done = allDetailItems.reduce(function (count, child) { return count + (st(child.id).c ? 1 : 0); }, 0);
    var requests = it.details.map(function (request) {
      var requestDone = request.items.reduce(function (count, child) { return count + (st(child.id).c ? 1 : 0); }, 0);
      var complete = requestDone === request.items.length;
      var requestTitle = lang === 'en' ? englishText(request.en) : request.t;
      var stage = lang === 'en' ? englishText(request.stageEn) : request.stage;
      var requestNote = lang === 'en' ? englishText(request.noteEn) : request.note;
      var requestMeta = [];
      if (stage) requestMeta.push(escapeHtml(stage));
      if (request.reward) requestMeta.push(L('奖励 ', 'Reward ') + escapeHtml(request.reward));
      if (requestNote) requestMeta.push(escapeHtml(requestNote));
      requestMeta.push(requestDone + '/' + request.items.length);
      var children = request.items.map(function (child) {
        var childState = st(child.id);
        var childId = 'cb-' + child.id;
        var childLoc = rowLoc(child);
        var childNote = rowNote(child);
        return '<label class="row-detail-item' + (childState.c ? ' is-done' : '') + '" for="' + childId + '">' +
          '<input type="checkbox" id="' + childId + '" data-id="' + child.id + '"' + (childState.c ? ' checked' : '') + '>' +
          '<span class="row-detail-copy"><span>' + escapeHtml(rowTitle(child)) + '</span>' +
            (childLoc ? '<small>📍 ' + escapeHtml(childLoc) + '</small>' : '') +
            (childNote ? '<small class="row-detail-materials">' + escapeHtml(childNote) + '</small>' : '') + '</span>' +
        '</label>';
      }).join('');
      return '<section class="hunting-request' + (complete ? ' is-complete' : '') + '">' +
        '<div class="hunting-request-head"><strong>' + escapeHtml(requestTitle) + '</strong>' +
          '<span>' + requestMeta.join(lang === 'en' ? ' / ' : ' · ') + '</span></div>' +
        '<div class="hunting-request-items">' + children + '</div>' +
      '</section>';
    }).join('');
    var detailsLabel = lang === 'en' ? englishText(it.detailsLabelEn || 'Details') : (it.detailsLabel || '狩猎请求明细');
    return '<div class="row-details' + (isOpen ? ' is-open' : '') + (it.detailsWarning ? ' has-spoiler' : '') + '" data-item-detail="' + it.id + '">' +
      '<button type="button" class="row-detail-toggle" aria-expanded="' + isOpen + '">' +
        '<span class="chev">▸</span><span>' + escapeHtml(detailsLabel) + '</span>' +
        '<span class="row-detail-progress">' + done + ' / ' + allDetailItems.length + '</span>' +
      '</button>' +
      '<div class="row-detail-body">' + requests + '</div>' +
    '</div>';
  }

  function renderRow(it, idSuffix) {
    var s = st(it.id);
    var checked = s.c;
    var tags = it.tg || [];
    // search index always includes both languages' text, so search keeps working across a language switch
    var detailText = detailItems(it).map(function (child) {
      return child.t + ' ' + (child.en || '') + ' ' + (child.l || '') + ' ' + (child.lEn || '') +
        ' ' + (child.n || '') + ' ' + (child.nEn || '');
    }).join(' ');
    var text = (it.t + ' ' + (it.en || '') + ' ' + (TITLE_EN[it.id] || '') + ' ' + (it.l || '') + ' ' + (it.lEn || LOC_EN[it.l] || '') +
      ' ' + (it.n || '') + ' ' + (it.nEn || NOTE_EN[it.n] || '') + ' ' + detailText).toLowerCase();
    var badges = tags.map(badgeHtml).join('');
    var suf = idSuffix ? ('-' + idSuffix) : '';
    var rowId = 'item-' + it.id + suf;
    var cbId = 'cb-' + it.id + suf;
    var title = rowTitle(it);
    var loc = rowLoc(it);
    var note = rowNote(it);
    var metaBits = [];
    if (loc) metaBits.push('📍 ' + escapeHtml(loc));
    // For most items, it.c only ever held chapter/timing info, which the structured chapter
    // badges below already convey in English — so it.c itself was zh-only. A few categories
    // (背包升级/SAT's "解锁:…" unlock conditions, and a handful of kept prerequisite notes
    // elsewhere) repurpose it.c for real content with no English equivalent yet; COND_EN
    // supplies translations for those specific strings so they show up in English mode too.
    if (it.c) {
      var condText = lang === 'en' ? (COND_EN[it.c] ? englishText(COND_EN[it.c]) : null) : it.c;
      if (condText) metaBits.push('<span class="row-chapter">' + escapeHtml(condText) + '</span>');
    }
    var isComputed = !!it.computed;
    var linkHtml = '';
    var chapterTags = chapterTagsFor(it.id);
    // 'full' (no chapter restriction) items get no badge at all — they're always available,
    // so there's nothing worth flagging. They still match every chapter filter (applyFilter()
    // treats 'full' as a wildcard independently of what's rendered here).
    var chaptersHtml = chapterTags.indexOf('full') !== -1
      ? ''
      : chapterTags.map(function (ct) {
          var meta = CHAPTER_META_BY_ID[ct];
          return '<span class="chapter-badge">' + escapeHtml(meta ? chBadge(meta) : ct) + '</span>';
        }).join('');
    return (
      '<div class="row' + (checked ? ' is-done' : '') + (isComputed ? ' is-computed' : '') + '" id="' + rowId + '" data-tags="' + tags.join(' ') +
      '" data-chapters="' + chapterTags.join(' ') + '" data-text="' + escapeAttr(text) + '">' +
        '<input type="checkbox" id="' + cbId + '" data-id="' + it.id + '"' + (checked ? ' checked' : '') + (isComputed ? ' disabled' : '') + '>' +
        '<div class="row-body">' +
          '<label class="row-title-label" for="' + cbId + '">' + escapeHtml(title) +
            // the zh subtitle is redundant once the main title itself is already in English
            '' +
          '</label>' +
          (metaBits.length ? '<div class="row-meta">' + metaBits.join('') + '</div>' : '') +
          '<div class="row-chapters">' + chaptersHtml + '</div>' +
          (note ? '<div class="row-note">' + escapeHtml(note) + '</div>' : '') +
          linkHtml +
          renderItemDetails(it) +
          '<input type="text" class="row-memo" data-memo-id="' + it.id + '" placeholder="' + L('我的备注…', 'My notes…') + '" value="' + escapeAttr(s.m) + '">' +
        '</div>' +
        '<div class="row-badges">' + badges + '</div>' +
      '</div>'
    );
  }

  function renderGroup(cat, g) {
    var c = countItems(g.items);
    var isOpen = !!openGroups[cat.id + ':' + g.id];
    var complete = c.total > 0 && c.done === c.total;
    var gName = groupName(cat, g);
    var gDesc = groupDesc(cat, g);
    return (
      '<div class="group' + (isOpen ? ' is-open' : '') + '" data-group="' + cat.id + ':' + g.id + '">' +
        '<div class="group-head" role="button" tabindex="0" aria-expanded="' + isOpen + '">' +
          '<span class="chev">▸</span>' +
          '<div style="flex:1;min-width:0;">' +
            '<h3>' + escapeHtml(gName) + (complete ? ' <span class="group-complete">✓</span>' : '') + '</h3>' +
            (gDesc ? '<p class="group-desc">' + escapeHtml(gDesc) + '</p>' : '') +
          '</div>' +
          '<div class="group-progress' + (complete ? ' group-complete' : '') + '">' + c.done + ' / ' + c.total + '</div>' +
        '</div>' +
        '<div class="group-body"><div class="rows">' + g.items.map(function (it) { return renderRow(it); }).join('') + '</div></div>' +
      '</div>'
    );
  }

  function renderCategory(cat) {
    var items = categoryItems(cat);
    var c = countItems(items);
    var isOpen = !!openCats[cat.id];
    var isTC = cat.id === 'TC';
    var rowSuffix = isTC ? 'tc' : null;
    var body = cat.kind === 'flat'
      ? '<div class="rows">' + cat.items.map(function (it) { return renderRow(it, rowSuffix); }).join('') + '</div>'
      : cat.groups.map(function (g) { return renderGroup(cat, g); }).join('');
    var progressHtml = isTC
      ? renderRingBlock(pctFor(c.done, c.total), c.done + ' / ' + c.total)
      : '<div class="cat-progress">' + c.done + ' / ' + c.total + '</div>';
    var cName = catName(cat);
    var cDesc = cat.id === 'TC' ? L('游戏内 100% 完成度', 'In-game 100% completion') : catDesc(cat);
    // A whole top-level board — including 总进度 (Total Completion), whose ring/meter now
    // pick up --cat-accent too — turns light green once every item inside it is checked off.
    var isCatComplete = c.total > 0 && c.done === c.total;
    return (
      '<section class="cat glass' + (isOpen ? ' is-open' : '') + (isTC ? ' cat-tc' : '') + (isCatComplete ? ' cat-complete' : '') + '" data-cat="' + cat.id + '">' +
        '<div class="cat-head" role="button" tabindex="0" aria-expanded="' + isOpen + '">' +
          '<span class="cat-icon">' + uiIcon(cat.id) + '</span>' +
          '<span class="chev">▸</span>' +
          '<div class="cat-titlewrap"><h2>' + escapeHtml(cName) + '</h2>' +
          (cDesc ? '<p class="cat-desc">' + escapeHtml(cDesc) + '</p>' : '') + '</div>' +
          progressHtml +
        '</div>' +
        '<div class="cat-body">' + body + '</div>' +
        '<div class="cat-meter" aria-hidden="true"><span style="width:' + (c.total ? 100*c.done/c.total : 0) + '%"></span></div>' +
      '</section>'
    );
  }

  /* ---------------------------------------------------------------- */
  /* EXPAND / COLLAPSE ANIMATION HELPERS                                 */
  /* ---------------------------------------------------------------- */
  function expandEl(el) {
    if (!el) return;
    el.style.maxHeight = el.scrollHeight + 'px';
    var onEnd = function (ev) {
      if (ev.propertyName !== 'max-height') return;
      el.removeEventListener('transitionend', onEnd);
      // release the cap once open so nested content can change size freely
      if (el.style.maxHeight !== '0px') el.style.maxHeight = 'none';
    };
    el.addEventListener('transitionend', onEnd);
  }

  function collapseEl(el) {
    if (!el) return;
    // establish a concrete starting height (in case it is currently "none")
    el.style.maxHeight = el.scrollHeight + 'px';
    void el.offsetHeight; // force reflow so the browser commits the starting value
    requestAnimationFrame(function () {
      el.style.maxHeight = '0px';
    });
  }

  function setOpenInstant(el, open) {
    if (!el) return;
    el.classList.add('no-anim');
    el.style.maxHeight = open ? 'none' : '0px';
    void el.offsetHeight;
    el.classList.remove('no-anim');
  }

  function syncOpenHeights() {
    // innermost first, so an ancestor's measured height already includes it
    document.querySelectorAll('.row-details.is-open > .row-detail-body').forEach(function (el) {
      el.style.maxHeight = 'none';
    });
    document.querySelectorAll('.group.is-open > .group-body').forEach(function (el) {
      el.style.maxHeight = 'none';
    });
    document.querySelectorAll('.cat.is-open > .cat-body').forEach(function (el) {
      el.style.maxHeight = 'none';
    });
    document.querySelectorAll('.alert.is-open > .alert-body').forEach(function (el) {
      el.style.maxHeight = 'none';
    });
  }

  function paint() {
    syncCompendiumItems();
    syncComputedItems();
    var root = document.getElementById('root');
    // The TC ("总进度") panel keeps its own internal scroll (.col-tc .cat-body is a fixed-height,
    // overflow-y:auto column). A full root.innerHTML replace below rebuilds that element from
    // scratch, which resets its scrollTop to 0 — so checking any item inside it used to snap the
    // panel back to the top. Capture/restore its scroll position across the re-render.
    var prevTcBody = document.querySelector('.col-tc .cat-body');
    var prevTcScrollTop = prevTcBody ? prevTcBody.scrollTop : 0;
    // Some browsers (notably mobile Safari) also reset the WHOLE PAGE's scroll position when the
    // focused checkbox is destroyed by the innerHTML replace below — not just the TC panel above.
    // Capture/restore window scroll too so checking any item, in any board, never jumps the page.
    var prevScrollX = window.scrollX;
    var prevScrollY = window.scrollY;
    var tcCat = null;
    var mainCats = [];
    CATS.forEach(function (cat) {
      if (cat.id === 'TC') { tcCat = cat; } else { mainCats.push(cat); }
    });
    root.innerHTML =
      '<div class="scene-backdrop" aria-hidden="true"><div class="scene-ground"></div><div class="scene-art"><img src="assets/images/rdr2-background.jpg" alt="" width="2000" height="1000" decoding="async"></div></div>' +
      '<div class="wrap' + (allBoardsComplete() ? ' is-legend' : '') + '">' +
        renderUpdateTicker() +
        renderShell() +
        renderThemeMenu() +
        renderLangMenu() +
        '<div id="alert-slot">' + renderAlert() + '</div>' +
        '<div class="split">' +
          '<div class="col-tc">' + (tcCat ? renderCategory(tcCat) : '') + renderCompendiumCard() + renderMapCard() + '</div>' +
          '<div class="col-main">' + mainCats.map(renderCategory).join('') + '</div>' +
        '</div>' +
        '<p class="footnote">' + L(
          '数据来源于对多个 RDR2 攻略站点的交叉整理核实,部分坐标/挑战措辞未能逐条百分百核实(已在对应条目注明),建议以游戏内实际显示为准。',
          'Data cross-checked and compiled from multiple RDR2 guide sites; a few coordinates/challenge wordings could not be verified line-by-line (flagged on the relevant entries) — treat the in-game display as authoritative.'
        ) + '</p>' +
        '<p class="copyright">© ' + new Date().getFullYear() + ' Jam8ee</p>' +
      '</div>';
    // Run the filter pass and re-establish every open section's real height BEFORE
    // restoring scroll position below. Right after the innerHTML replace above, every
    // open .cat-body/.group-body is back to its CSS default (max-height:0, i.e. collapsed)
    // until syncOpenHeights() reopens them — so the document is briefly much shorter than
    // it should be. Some browsers resolve window.scrollTo()'s target against whatever the
    // document height is at the moment it's called rather than after the script finishes;
    // restoring scroll while the page is still artificially short can clamp it down (which
    // reads as "the page jumped to the top") and never recovers once the height comes back.
    // Doing the height/filter sync first means scroll is restored against the final layout.
    applyFilter();
    syncOpenHeights();
    if (prevTcScrollTop) {
      var newTcBody = document.querySelector('.col-tc .cat-body');
      if (newTcBody) newTcBody.scrollTop = prevTcScrollTop;
    }
    if (prevScrollX || prevScrollY) window.scrollTo(prevScrollX, prevScrollY);
    // Fire the one-shot completion banner only on the false -> true transition; legendToastSeen
    // starts at null so the very first paint (page load) just seeds it silently. See
    // showLegendToast() above and legendToastSeen's declaration for the full reasoning.
    var nowAllComplete = allBoardsComplete();
    if (legendToastSeen === false && nowAllComplete) showLegendToast();
    legendToastSeen = nowAllComplete;
  }

  function applyFilter() {
    document.getElementById('root').classList.toggle('is-searching', !!searchText);
    document.querySelectorAll('.row').forEach(function (row) {
      var chapters = (row.dataset.chapters || '').split(' ');
      var matchFilter = currentFilter === 'all' || chapters.indexOf('full') !== -1 || chapters.indexOf(currentFilter) !== -1;
      var matchSearch = !searchText || (row.dataset.text || '').indexOf(searchText) !== -1;
      var isComplete = row.classList.contains('is-done');
      var matchStatus = statusFilter === 'all' ||
        (statusFilter === 'complete' && isComplete) ||
        (statusFilter === 'incomplete' && !isComplete);
      row.hidden = !(matchFilter && matchSearch && matchStatus);
    });
    document.querySelectorAll('.group').forEach(function (grp) {
      var anyVisible = Array.prototype.some.call(grp.querySelectorAll('.row'), function (r) { return !r.hidden; });
      grp.style.display = anyVisible ? '' : 'none';
    });
    document.querySelectorAll('.cat:not(.compendium-card)').forEach(function (cat) {
      var anyVisible = Array.prototype.some.call(cat.querySelectorAll('.row'), function (r) { return !r.hidden; });
      cat.style.display = anyVisible ? '' : 'none';
    });
  }

  /* ---------------------------------------------------------------- */
  /* PERSISTENCE                                                        */
  /* ---------------------------------------------------------------- */
  

  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(doSave, 700);
  }

  // saveInFlight/savePending serialize publishes so checking several items in quick
  // succession can never fire two overlapping artifactAPI.publish() calls. Without this,
  // each debounced save re-read `state` and published it independently, but nothing
  // stopped two of those publishes from being in flight at once — if the one built from
  // OLDER state happened to resolve AFTER the one built from newer state (perfectly
  // possible over the network, regardless of call order), its stale content would win and
  // silently roll back whatever the newer save had just written. Now: at most one publish
  // in flight at a time; a change that arrives while one is in flight just sets a pending
  // flag, and once the in-flight one settles we publish again — built fresh from
  // whatever `state` is by then, so it always carries every change made in between.
  var saveInFlight = false;
  var savePending = false;

function doSave() {
    saveTimer = null;
    try {
        localStorage.setItem(
            'rdr2-full-checklist-v2',
            JSON.stringify(state)
        );
    } catch (e) {}
}

  function runSave() {
    saveInFlight = true;
    artifactAPI.publish(buildFullDocument()).catch(function () {}).then(function () {
      saveInFlight = false;
      if (savePending) {
        savePending = false;
        runSave();
      }
    });
  }

  /* ---------------------------------------------------------------- */
  /* INIT                                                               */
  /* ---------------------------------------------------------------- */
  


  // Hidden SVG filter def for the drag-thumb's "convex lens" edge (referenced from CSS via
  // backdrop-filter: ... url(#glassLensDistort) — see .filter-thumb in CSS_TEXT above).
  // feGaussianBlur(SourceAlpha) turns the pill's own rounded-rect shape into a smooth
  // dome-shaped displacement map (opaque/bright in the middle, fading to 0 at the edges) —
  // no external image needed — and feDisplacementMap then bends the frosted backdrop by
  // that amount, which reads as the rim curving/refracting like a real convex lens or
  // mirror edge. Kept out of the document flow (0×0, overflow hidden) rather than
  // display:none, since some engines refuse to apply a filter whose <svg> host is display:none.
  var lensFilterHost = document.createElement('div');
  lensFilterHost.setAttribute('aria-hidden', 'true');
  lensFilterHost.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
  lensFilterHost.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg"><defs>' +
      '<filter id="glassLensDistort" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">' +
        '<feGaussianBlur in="SourceAlpha" stdDeviation="6" result="lensMap"></feGaussianBlur>' +
        '<feDisplacementMap in="SourceGraphic" in2="lensMap" scale="16" xChannelSelector="A" yChannelSelector="A"></feDisplacementMap>' +
      '</filter>' +
    '</defs></svg>';
  document.body.appendChild(lensFilterHost);

  paint();
  document.getElementById('root').addEventListener('keydown', function(e) {
    onFilterKeydown(e);
    var head = e.target.closest && e.target.closest('.cat-head,.group-head');
    if (head && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); head.click(); }
    if (e.key === 'Escape') {
      if (themeMenuOpen) { themeMenuOpen=false; document.getElementById('theme-picker-menu').hidden=true; var tb=document.getElementById('theme-picker-btn'); tb.setAttribute('aria-expanded','false'); tb.focus(); }
      if (langMenuOpen) { langMenuOpen=false; document.getElementById('lang-picker-menu').hidden=true; var lb=document.getElementById('lang-picker-btn'); lb.setAttribute('aria-expanded','false'); lb.focus(); }
      if (filterInlineOpen) closeFilterInline();
    }
  });
  window.addEventListener('pagehide', doSave);
  function refreshCompendiumLinks(){ paint(); }
  window.addEventListener('pageshow', refreshCompendiumLinks);
  window.addEventListener('focus', refreshCompendiumLinks);
  window.addEventListener('storage', function (e) {
    if (!e.key || e.key === 'rdr2-compendium-v1') refreshCompendiumLinks();
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) refreshCompendiumLinks();
  });
  document.getElementById('root').addEventListener('wheel', onFilterWheel, {passive:false});

  document.getElementById('root').addEventListener('change', function (e) {
    var cb = e.target.closest ? e.target.closest('input[type=checkbox][data-id]') : null;
    if (!cb) return;
    var id = cb.dataset.id;
    if (COMPENDIUM_ITEM_LINKS[id]) {
      saveCompendiumLinkedItem(id, cb.checked);
      st(id).c = cb.checked;
      paint();
      scheduleSave();
      return;
    }
    if (cb.disabled || THRESHOLD_LINKS[id]) {
      // read-only / auto-computed: also has the `disabled` attribute, this is belt-and-suspenders
      paint();
      return;
    }
    var parentsWithDetails = detailParents();
    var detailOwner = parentsWithDetails.find(function (item) { return item.id === id; });
    var detailParent = parentsWithDetails.find(function (item) {
      return item.syncDetails && detailItems(item).some(function (child) { return child.id === id; });
    });
    if (detailOwner) {
      st(id).c = cb.checked;
      detailItems(detailOwner).forEach(function (child) { st(child.id).c = cb.checked; });
    } else if (detailParent) {
      st(id).c = cb.checked;
      st(detailParent.id).c = detailItems(detailParent).every(function (child) { return st(child.id).c; });
    } else if (GROUP_LINKS[id]) {
      var wantChecked = cb.checked;
      GROUP_LINKS[id].forEach(function (linkedId) { st(linkedId).c = wantChecked; });
    } else {
      st(id).c = cb.checked;
    }
    paint();
    scheduleSave();
  });

  document.getElementById('root').addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'search') {
      searchText = t.value.toLowerCase();
      applyFilter();
      return;
    }
    if (t.classList && t.classList.contains('row-memo')) {
      st(t.dataset.memoId).m = t.value;
      scheduleSave();
    }
  });

  document.getElementById('root').addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button !== 0) return; // primary button/touch only
    if (!filterInlineOpen) return;
    var chip = e.target.closest ? e.target.closest('.filter-chip[data-filter]') : null;
    if (!chip) return;
    var row = document.getElementById('filter-chip-row');
    if (row) startFilterDrag(e, row);
  });

  document.getElementById('root').addEventListener('click', function (e) {
    // close the theme picker on any click outside the button or the (now detached) menu, before other handlers run
    if (themeMenuOpen) {
      var insideThemePicker = e.target.closest && (e.target.closest('#theme-picker') || e.target.closest('#theme-picker-menu'));
      if (!insideThemePicker) {
        themeMenuOpen = false;
        var openMenuEl = document.getElementById('theme-picker-menu');
        if (openMenuEl) openMenuEl.hidden = true;
        var openBtnEl = document.getElementById('theme-picker-btn');
        if (openBtnEl) openBtnEl.setAttribute('aria-expanded', 'false');
      }
    }
    // close the language picker on any click outside its button or menu, before other handlers run
    if (langMenuOpen) {
      var insideLangPicker = e.target.closest && (e.target.closest('#lang-picker') || e.target.closest('#lang-picker-menu'));
      if (!insideLangPicker) {
        langMenuOpen = false;
        var openLangMenuEl = document.getElementById('lang-picker-menu');
        if (openLangMenuEl) openLangMenuEl.hidden = true;
        var openLangBtnEl = document.getElementById('lang-picker-btn');
        if (openLangBtnEl) openLangBtnEl.setAttribute('aria-expanded', 'false');
      }
    }
    // close the inline filter chip row on any click outside its slot
    if (filterInlineOpen) {
      var insideFilterSlot = e.target.closest && e.target.closest('#filter-slot');
      if (!insideFilterSlot) { closeFilterInline(); }
    }
    var themePickerBtn = e.target.closest ? e.target.closest('#theme-picker-btn') : null;
    if (themePickerBtn) {
      themeMenuOpen = !themeMenuOpen;
      var menuEl = document.getElementById('theme-picker-menu');
      if (menuEl) menuEl.hidden = !themeMenuOpen;
      if (themeMenuOpen) positionThemeMenu();
      themePickerBtn.setAttribute('aria-expanded', themeMenuOpen ? 'true' : 'false');
      return;
    }
    var langPickerBtn = e.target.closest ? e.target.closest('#lang-picker-btn') : null;
    if (langPickerBtn) {
      langMenuOpen = !langMenuOpen;
      var lmenuEl = document.getElementById('lang-picker-menu');
      if (lmenuEl) lmenuEl.hidden = !langMenuOpen;
      if (langMenuOpen) positionLangMenu();
      langPickerBtn.setAttribute('aria-expanded', langMenuOpen ? 'true' : 'false');
      return;
    }
    var pickerOption = e.target.closest ? e.target.closest('.theme-picker-option') : null;
    if (pickerOption) {
      if (pickerOption.dataset.langValue) {
        setLang(pickerOption.dataset.langValue);
        langMenuOpen = false;
        paint();
        return;
      }
      themePref = pickerOption.dataset.themeValue || null;
      applyTheme();
      themeMenuOpen = false;
      paint();
      return;
    }
    var filterToggleBtn = e.target.closest ? e.target.closest('#filter-toggle-btn') : null;
    if (filterToggleBtn) {
      if (filterInlineOpen) { closeFilterInline(); } else { openFilterInline(); }
      return;
    }
    var filterScrollBtn = e.target.closest ? e.target.closest('[data-filter-scroll]') : null;
    if (filterScrollBtn) { scrollFilterPage(Number(filterScrollBtn.dataset.filterScroll)); return; }
    var filterChip = e.target.closest ? e.target.closest('.filter-chip[data-filter]') : null;
    if (filterChip) {
      // a completed drag already called selectFilter() from its own pointerup handler —
      // this trailing synthetic click (if the browser fires one) is a no-op
      if (suppressNextFilterClick) { suppressNextFilterClick = false; return; }
      selectFilter(filterChip.dataset.filter);
      return;
    }
    var statusFilterBtn = e.target.closest ? e.target.closest('.status-filter-btn[data-status-filter]') : null;
    if (statusFilterBtn) {
      selectStatusFilter(statusFilterBtn.dataset.statusFilter);
      return;
    }
    var alertLink = e.target.closest ? e.target.closest('.alert-list a') : null;
    if (alertLink) {
      e.preventDefault();
      var targetId = alertLink.getAttribute('href').slice(1);
      var targetEl = document.getElementById(targetId);
      if (targetEl) {
        // Keep the current chapter filter as-is — every item listed in the warning panel
        // already matches it (or is 'full'), so the row is guaranteed visible without
        // resetting to 全部 (which used to make the whole panel vanish out from under the
        // user, since it's chapter-scoped). Only clear the search box, which could otherwise
        // hide the target row.
        searchText = '';
        statusFilter = 'incomplete';
        var searchInput = document.getElementById('search');
        if (searchInput) searchInput.value = '';
        syncStatusFilterButtons();
        applyFilter();
        // Open ancestors instantly before measuring the target. If their max-height
        // transitions are still running when scrollIntoView starts, the row keeps
        // moving and the browser lands above it.
        var ancestorGroup = targetEl.closest('.group');
        if (ancestorGroup && !ancestorGroup.classList.contains('is-open')) {
          openGroups[ancestorGroup.dataset.group] = true;
          ancestorGroup.classList.add('is-open');
          var ancestorGroupHead = ancestorGroup.querySelector('.group-head');
          if (ancestorGroupHead) ancestorGroupHead.setAttribute('aria-expanded', 'true');
          setOpenInstant(ancestorGroup.querySelector('.group-body'), true);
        }
        var ancestorCat = targetEl.closest('.cat');
        if (ancestorCat && !ancestorCat.classList.contains('is-open')) {
          openCats[ancestorCat.dataset.cat] = true;
          ancestorCat.classList.add('is-open');
          var ancestorCatHead = ancestorCat.querySelector('.cat-head');
          if (ancestorCatHead) ancestorCatHead.setAttribute('aria-expanded', 'true');
          setOpenInstant(ancestorCat.querySelector('.cat-body'), true);
        }
        persistOpen();
        syncExpandAllBtnLabel();
        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            targetEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
            targetEl.classList.add('is-highlight');
            setTimeout(function () { targetEl.classList.remove('is-highlight'); }, 1800);
          });
        });
      }
      return;
    }
    var rowDetailToggle = e.target.closest ? e.target.closest('.row-detail-toggle') : null;
    if (rowDetailToggle) {
      var rowDetails = rowDetailToggle.closest('.row-details');
      var detailId = rowDetails.dataset.itemDetail;
      var detailBody = rowDetails.querySelector('.row-detail-body');
      openItems[detailId] = !openItems[detailId];
      rowDetails.classList.toggle('is-open', openItems[detailId]);
      rowDetailToggle.setAttribute('aria-expanded', String(openItems[detailId]));
      if (openItems[detailId]) { expandEl(detailBody); } else { collapseEl(detailBody); }
      var detailCatBody = rowDetails.closest('.cat-body');
      if (detailCatBody) detailCatBody.style.maxHeight = 'none';
      persistOpen();
      syncExpandAllBtnLabel();
      return;
    }
    var alertToggle = e.target.closest ? e.target.closest('#alert-toggle') : null;
    if (alertToggle) {
      var alertBox = alertToggle.closest('.alert');
      var alertBody = alertBox.querySelector('.alert-body');
      alertOpen = !alertOpen;
      alertBox.classList.toggle('is-open', alertOpen);
      alertToggle.setAttribute('aria-expanded', alertOpen ? 'true' : 'false');
      if (alertOpen) { expandEl(alertBody); } else { collapseEl(alertBody); }
      persistOpen();
      return;
    }
    var catHead = e.target.closest ? e.target.closest('.cat-head') : null;
    if (catHead) {
      var cat = catHead.closest('.cat');
      var id = cat.dataset.cat;
      var catBody = cat.querySelector('.cat-body');
      openCats[id] = !openCats[id];
      cat.classList.toggle('is-open', openCats[id]);
      catHead.setAttribute('aria-expanded', String(openCats[id]));
      if (openCats[id]) { expandEl(catBody); } else { collapseEl(catBody); }
      persistOpen();
      syncExpandAllBtnLabel();
      return;
    }
    var groupHead = e.target.closest ? e.target.closest('.group-head') : null;
    if (groupHead) {
      var grp = groupHead.closest('.group');
      var gid = grp.dataset.group;
      var groupBody = grp.querySelector('.group-body');
      openGroups[gid] = !openGroups[gid];
      grp.classList.toggle('is-open', openGroups[gid]);
      groupHead.setAttribute('aria-expanded', String(openGroups[gid]));
      if (openGroups[gid]) { expandEl(groupBody); } else { collapseEl(groupBody); }
      persistOpen();
      syncExpandAllBtnLabel();
      return;
    }
    if (e.target.id === 'expand-collapse-all') {
      var shouldExpand = !anyExpanded();
      document.querySelectorAll('.cat').forEach(function (c) {
        c.classList.toggle('is-open', shouldExpand); openCats[c.dataset.cat] = shouldExpand;
        c.querySelector('.cat-head').setAttribute('aria-expanded', String(shouldExpand));
        setOpenInstant(c.querySelector('.cat-body'), shouldExpand);
      });
      document.querySelectorAll('.group').forEach(function (g) {
        g.classList.toggle('is-open', shouldExpand); openGroups[g.dataset.group] = shouldExpand;
        g.querySelector('.group-head').setAttribute('aria-expanded', String(shouldExpand));
        setOpenInstant(g.querySelector('.group-body'), shouldExpand);
      });
      document.querySelectorAll('.row-details').forEach(function (d) {
        d.classList.toggle('is-open', shouldExpand); openItems[d.dataset.itemDetail] = shouldExpand;
        d.querySelector('.row-detail-toggle').setAttribute('aria-expanded', String(shouldExpand));
        setOpenInstant(d.querySelector('.row-detail-body'), shouldExpand);
      });
      persistOpen();
      syncExpandAllBtnLabel();
      return;
    }
    var resetBtnEl = e.target.closest ? e.target.closest('#reset-all') : null;
    if (resetBtnEl) {
      if (resetConfirmTimer) { clearTimeout(resetConfirmTimer); resetConfirmTimer = null; }
      if (!resetConfirmPending) {
        resetConfirmPending = true;
        resetConfirmTimer = setTimeout(function () {
          resetConfirmPending = false;
          resetConfirmTimer = null;
          paint();
        }, 4000);
        paint();
        return;
      }
      resetConfirmPending = false;
      state = {};
      try { localStorage.removeItem('rdr2-compendium-v1'); } catch (e) {}
      try { localStorage.removeItem('rdr2-compendium-notes-v1'); } catch (e) {}
      try { localStorage.removeItem('rdr2-compendium-horse-coats-v1'); } catch (e) {}
      paint();
      doSave();
      return;
    }
  });

  // keep the (now viewport-fixed) theme menu glued to its button while open, and
  // drop it on resize so it never gets left floating at a stale position
  window.addEventListener('scroll', function () {
    if (themeMenuOpen) positionThemeMenu();
    if (langMenuOpen) positionLangMenu();
  }, true);
  window.addEventListener('resize', function () {
    if (themeMenuOpen) {
      themeMenuOpen = false;
      var menuEl = document.getElementById('theme-picker-menu');
      if (menuEl) menuEl.hidden = true;
      var btnEl = document.getElementById('theme-picker-btn');
      if (btnEl) btnEl.setAttribute('aria-expanded', 'false');
    }
    if (langMenuOpen) {
      langMenuOpen = false;
      var lmenuEl = document.getElementById('lang-picker-menu');
      if (lmenuEl) lmenuEl.hidden = true;
      var lbtnEl = document.getElementById('lang-picker-btn');
      if (lbtnEl) lbtnEl.setAttribute('aria-expanded', 'false');
    }
    if (filterInlineOpen) { closeFilterInline(); }
  });
}

mainApp({"gc_rc":{"c":false,"m":""},"rc1":{"c":false,"m":""},"gc_dc":{"c":false,"m":""},"dc1":{"c":false,"m":""},"gc_ch":{"c":false,"m":""},"we1":{"c":false,"m":""},"bo1":{"c":false,"m":""},"bo2":{"c":false,"m":""},"bo3":{"c":false,"m":""},"bo4":{"c":false,"m":""},"bo5":{"c":false,"m":""},"bo6":{"c":false,"m":""},"bo7":{"c":false,"m":""},"bo8":{"c":false,"m":""},"bo9":{"c":false,"m":""},"bo10":{"c":false,"m":""},"bo11":{"c":false,"m":""},"bo12":{"c":false,"m":""},"bo13":{"c":false,"m":""},"th_bounty5":{"c":false,"m":""},"cc1":{"c":false,"m":""},"cc2":{"c":false,"m":""},"cc3":{"c":false,"m":""},"cc4":{"c":false,"m":""},"cc5":{"c":false,"m":""},"cc6":{"c":false,"m":""},"cc7":{"c":false,"m":""},"cc8":{"c":false,"m":""},"cc9":{"c":false,"m":""},"cc10":{"c":false,"m":""},"cc11":{"c":false,"m":""},"cc12":{"c":false,"m":""},"th_cc1":{"c":false,"m":""},"la1":{"c":false,"m":""},"la2":{"c":false,"m":""},"la3":{"c":false,"m":""},"la4":{"c":false,"m":""},"la5":{"c":false,"m":""},"la6":{"c":false,"m":""},"la7":{"c":false,"m":""},"la8":{"c":false,"m":""},"la9":{"c":false,"m":""},"la10":{"c":false,"m":""},"la11":{"c":false,"m":""},"la12":{"c":false,"m":""},"la13":{"c":false,"m":""},"la14":{"c":false,"m":""},"la15":{"c":false,"m":""},"la16":{"c":false,"m":""},"th_la5":{"c":false,"m":""},"a1":{"c":false,"m":""},"a2":{"c":false,"m":""},"a3":{"c":false,"m":""},"a4":{"c":false,"m":""},"a5":{"c":false,"m":""},"a30":{"c":false,"m":""},"a31":{"c":false,"m":""},"a32":{"c":false,"m":""},"a33":{"c":false,"m":""},"a34":{"c":false,"m":""},"a35":{"c":false,"m":""},"a36":{"c":false,"m":""},"a37":{"c":false,"m":""},"a38":{"c":false,"m":""},"a39":{"c":false,"m":""},"a40":{"c":false,"m":""},"a41":{"c":false,"m":""},"a42":{"c":false,"m":""},"a43":{"c":false,"m":""},"a44":{"c":false,"m":""},"a45":{"c":false,"m":""},"a46":{"c":false,"m":""},"a6":{"c":false,"m":""},"a8":{"c":false,"m":""},"a9":{"c":false,"m":""},"a10":{"c":false,"m":""},"a11":{"c":false,"m":""},"a12":{"c":false,"m":""},"a13":{"c":false,"m":""},"a14":{"c":false,"m":""},"a15":{"c":false,"m":""},"a16":{"c":false,"m":""},"a17":{"c":false,"m":""},"a18":{"c":false,"m":""},"a19":{"c":false,"m":""},"a20":{"c":false,"m":""},"a21":{"c":false,"m":""},"a22":{"c":false,"m":""},"a23":{"c":false,"m":""},"a24":{"c":false,"m":""},"a25":{"c":false,"m":""},"a26":{"c":false,"m":""},"a27":{"c":false,"m":""},"a28":{"c":false,"m":""},"a29":{"c":false,"m":""},"we2":{"c":false,"m":""},"we3":{"c":false,"m":""},"we4":{"c":false,"m":""},"we5":{"c":false,"m":""},"we6":{"c":false,"m":""},"we7":{"c":false,"m":""},"we8":{"c":false,"m":""},"we9":{"c":false,"m":""},"we10":{"c":false,"m":""},"he1":{"c":false,"m":""},"he2":{"c":false,"m":""},"he3":{"c":false,"m":""},"he4":{"c":false,"m":""},"he5":{"c":false,"m":""},"he6":{"c":false,"m":""},"he7":{"c":false,"m":""},"he8":{"c":false,"m":""},"he9":{"c":false,"m":""},"he10":{"c":false,"m":""},"ga1":{"c":false,"m":""},"ga2":{"c":false,"m":""},"ga3":{"c":false,"m":""},"ga4":{"c":false,"m":""},"ga5":{"c":false,"m":""},"ga6":{"c":false,"m":""},"ga7":{"c":false,"m":""},"ga8":{"c":false,"m":""},"ga9":{"c":false,"m":""},"ga10":{"c":false,"m":""},"ho1":{"c":false,"m":""},"ho2":{"c":false,"m":""},"ho3":{"c":false,"m":""},"ho4":{"c":false,"m":""},"ho5":{"c":false,"m":""},"ho6":{"c":false,"m":""},"ho7":{"c":false,"m":""},"ho8":{"c":false,"m":""},"ho9":{"c":false,"m":""},"ho10":{"c":false,"m":""},"sh1":{"c":false,"m":""},"sh2":{"c":false,"m":""},"sh3":{"c":false,"m":""},"sh4":{"c":false,"m":""},"sh5":{"c":false,"m":""},"sh6":{"c":false,"m":""},"sh7":{"c":false,"m":""},"sh8":{"c":false,"m":""},"sh9":{"c":false,"m":""},"sh10":{"c":false,"m":""},"su1":{"c":false,"m":""},"su2":{"c":false,"m":""},"su3":{"c":false,"m":""},"su4":{"c":false,"m":""},"su5":{"c":false,"m":""},"su6":{"c":false,"m":""},"su7":{"c":false,"m":""},"su8":{"c":false,"m":""},"su9":{"c":false,"m":""},"su10":{"c":false,"m":""},"mh1":{"c":false,"m":""},"mh2":{"c":false,"m":""},"mh3":{"c":false,"m":""},"mh4":{"c":false,"m":""},"mh5":{"c":false,"m":""},"mh6":{"c":false,"m":""},"mh7":{"c":false,"m":""},"mh8":{"c":false,"m":""},"mh9":{"c":false,"m":""},"mh10":{"c":false,"m":""},"bh1":{"c":false,"m":""},"bh2":{"c":false,"m":""},"bh3":{"c":false,"m":""},"bh4":{"c":false,"m":""},"bh5":{"c":false,"m":""},"bh6":{"c":false,"m":""},"bh7":{"c":false,"m":""},"bh8":{"c":false,"m":""},"bh9":{"c":false,"m":""},"bh10":{"c":false,"m":""},"ex1":{"c":false,"m":""},"ex2":{"c":false,"m":""},"ex3":{"c":false,"m":""},"ex4":{"c":false,"m":""},"ex5":{"c":false,"m":""},"ex6":{"c":false,"m":""},"ex7":{"c":false,"m":""},"ex8":{"c":false,"m":""},"ex9":{"c":false,"m":""},"rc2":{"c":false,"m":""},"rc3":{"c":false,"m":""},"rc4":{"c":false,"m":""},"rc5":{"c":false,"m":""},"rc6":{"c":false,"m":""},"rc7":{"c":false,"m":""},"rc8":{"c":false,"m":""},"rc9":{"c":false,"m":""},"dc2":{"c":false,"m":""},"dc3":{"c":false,"m":""},"db1":{"c":false,"m":""},"db2":{"c":false,"m":""},"db3":{"c":false,"m":""},"db4":{"c":false,"m":""},"db5":{"c":false,"m":""},"db6":{"c":false,"m":""},"db7":{"c":false,"m":""},"db8":{"c":false,"m":""},"db9":{"c":false,"m":""},"db10":{"c":false,"m":""},"db11":{"c":false,"m":""},"db12":{"c":false,"m":""},"db13":{"c":false,"m":""},"db14":{"c":false,"m":""},"db15":{"c":false,"m":""},"db16":{"c":false,"m":""},"db17":{"c":false,"m":""},"db18":{"c":false,"m":""},"db19":{"c":false,"m":""},"db20":{"c":false,"m":""},"db21":{"c":false,"m":""},"db22":{"c":false,"m":""},"db23":{"c":false,"m":""},"db24":{"c":false,"m":""},"db25":{"c":false,"m":""},"db26":{"c":false,"m":""},"db27":{"c":false,"m":""},"db28":{"c":false,"m":""},"db29":{"c":false,"m":""},"db30":{"c":false,"m":""},"lf1":{"c":false,"m":""},"lf2":{"c":false,"m":""},"lf3":{"c":false,"m":""},"lf4":{"c":false,"m":""},"lf5":{"c":false,"m":""},"lf6":{"c":false,"m":""},"lf7":{"c":false,"m":""},"lf8":{"c":false,"m":""},"lf9":{"c":false,"m":""},"lf10":{"c":false,"m":""},"lf11":{"c":false,"m":""},"lf12":{"c":false,"m":""},"lf13":{"c":false,"m":""},"lf14":{"c":false,"m":""},"ou1":{"c":false,"m":""},"ou2":{"c":false,"m":""},"ou3":{"c":false,"m":""},"ou4":{"c":false,"m":""},"ou5":{"c":false,"m":""},"ou6":{"c":false,"m":""},"ou7":{"c":false,"m":""},"ou8":{"c":false,"m":""},"tk1":{"c":false,"m":""},"tk2":{"c":false,"m":""},"tk3":{"c":false,"m":""},"tk4":{"c":false,"m":""},"tk5":{"c":false,"m":""},"tk6":{"c":false,"m":""},"tk7":{"c":false,"m":""},"tk8":{"c":false,"m":""},"tk9":{"c":false,"m":""},"tk10":{"c":false,"m":""},"tk11":{"c":false,"m":""},"tk12":{"c":false,"m":""},"tk13":{"c":false,"m":""},"tk14":{"c":false,"m":""},"tk15":{"c":false,"m":""},"tk16":{"c":false,"m":""},"tk17":{"c":false,"m":""},"tk18":{"c":false,"m":""},"tk19":{"c":false,"m":""},"tk20":{"c":false,"m":""},"tk21":{"c":false,"m":""},"tk22":{"c":false,"m":""},"tk23":{"c":false,"m":""},"tk24":{"c":false,"m":""},"tk25":{"c":false,"m":""},"tk26":{"c":false,"m":""},"st1":{"c":false,"m":""},"st2":{"c":false,"m":""},"st3":{"c":false,"m":""},"st4":{"c":false,"m":""},"st5":{"c":false,"m":""},"st6":{"c":false,"m":""},"st7":{"c":false,"m":""},"d1":{"c":false,"m":""},"d2":{"c":false,"m":""},"d5":{"c":false,"m":""},"d6":{"c":false,"m":""},"d7":{"c":false,"m":""},"d8":{"c":false,"m":""},"d9":{"c":false,"m":""},"tc1":{"c":false,"m":""},"tc2":{"c":false,"m":""},"tc3":{"c":false,"m":""},"tc4":{"c":false,"m":""},"tc5":{"c":false,"m":""},"tc6":{"c":false,"m":""},"tc7":{"c":false,"m":""},"tc8":{"c":false,"m":""},"tc9":{"c":false,"m":""},"tc10":{"c":false,"m":""},"tc11":{"c":false,"m":""},"tc12":{"c":false,"m":""},"tc13":{"c":false,"m":""},"tc14":{"c":false,"m":""},"tc15":{"c":false,"m":""},"tc16":{"c":false,"m":""},"tc17":{"c":false,"m":""},"tc18":{"c":false,"m":""},"tc19":{"c":false,"m":""},"tc20":{"c":false,"m":""},"tc21":{"c":false,"m":""},"tc22":{"c":false,"m":""},"tc23":{"c":false,"m":""},"tc24":{"c":false,"m":""},"tc25":{"c":false,"m":""},"tc26":{"c":false,"m":""},"tc27":{"c":false,"m":""},"tc28":{"c":false,"m":""},"tc29":{"c":false,"m":""},"d15":{"c":false,"m":""},"d16":{"c":false,"m":""},"d17":{"c":false,"m":""},"d18":{"c":false,"m":""},"d19":{"c":false,"m":""},"d20":{"c":false,"m":""},"d21":{"c":false,"m":""}});
