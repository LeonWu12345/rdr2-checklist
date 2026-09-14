(function () {
  "use strict";

  function item(id, category, zh, en, detailZh, detailEn, pointType, sourceIds, chapterTags) {
    return {
      id: id,
      category: category,
      nameZh: zh,
      nameEn: en,
      detailZh: detailZh || "",
      detailEn: detailEn || "",
      pointType: pointType || "single",
      sourceIds: sourceIds || [id],
      chapterTags: chapterTags || []
    };
  }

  var zhNumbers = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十", "二十一", "二十二", "二十三", "二十四", "二十五", "二十六", "二十七", "二十八", "二十九", "三十"];
  var entries = [];

  var rockCarvingHints = [
    "地图“MOUNT HAGEN”字母 O 附近，上山道路尽头前的右侧岩壁",
    "地图“AMBARINO”第二个 A 正南，温亚德海峡西岸桥北侧的窄岩台尽头",
    "华莱士堡东北最近的山体背面，由堡垒南侧道路向北登上山脊",
    "地图“CUMBERLAND FOREST”字母 C 旁的虚线小径向北，西侧悬崖岩壁",
    "地图“OWANJILA”字母 O 西南，欧万吉拉湖西南岸岩壁",
    "地图“WEST ELIZABETH”字母 T 正东，穿过 T 的山顶虚线小径西侧",
    "弗拉特尼克车站西北的岩丘，由南侧上山后沿北侧岩壁下行",
    "月光石池正南、安巴里诺与新汉诺威州界北侧，东面山丘岩壁",
    "地图“ROANOKE RIDGE”字母 N 正西，道路南侧山脊岩壁",
    "地图“NEW HANOVER”第二个 E 东北，极乐池东岸过路处正北的岩脊"
  ];
  var rockCarvingHintsEn = [
    "Near the O in “MOUNT HAGEN” on the map, on the rock face to the right just before the uphill road ends",
    "Due south of the second A in “AMBARINO” on the map, at the end of the narrow rock ledge on the west bank of Whinyard Strait, north of the bridge",
    "On the far side of the nearest mountain northeast of Fort Wallace; climb north onto the ridge from the road south of the fort",
    "Follow the dotted trail north from the C in “CUMBERLAND FOREST” on the map; the carving is on the western cliff face",
    "Southwest of the O in “OWANJILA” on the map, on the rock face along the southwest shore of Owanjila",
    "Due east of the T in “WEST ELIZABETH” on the map, west of the dotted mountaintop trail that crosses the letter",
    "On the rocky hill northwest of Flatneck Station; climb from the south, then descend along the northern rock face",
    "Due south of Moonstone Pond, north of the Ambarino–New Hanover border, on the eastern hillside rock face",
    "Due west of the N in “ROANOKE RIDGE” on the map, on the ridge rock face south of the road",
    "Northeast of the second E in “NEW HANOVER” on the map, on the rocky ridge just north of the road along Elysian Pool’s east bank"
  ];
  for (var rc = 1; rc <= 10; rc += 1) {
    entries.push(item("rc" + rc, "rock-carvings", zhNumbers[rc - 1] + "号石雕", "Rock Carving #" + rc, rockCarvingHints[rc - 1], rockCarvingHintsEn[rc - 1]));
  }

  var dreamcatchers = [
    ["dc_nh01", "地图“ROANOKE RIDGE”第二个 O 正西、河边三岔路口西北", "Northwest of the riverside junction in Roanoke Ridge"],
    ["dc_nh02", "地图“ANNESBURG”第二个 N 右上角，南北道路东侧", "Roadside east of Beaver Hollow"],
    ["dc_nh03", "地图“ANNESBURG”字母 U 正南，越过道路后的树林内", "Woods south of Annesburg"],
    ["dc_nh04", "地图“ANNESBURG”字母 S 正南，罗诺克岭道路东侧", "East of the north-south road in Roanoke Ridge"],
    ["dc_nh05", "地图“NEW HANOVER”第二个 E 右上方、极乐池字母 P 正南", "Hillside southwest of Elysian Pool"],
    ["dc_nh06", "地图“NEW HANOVER”字母 O 中央附近的树林内", "Near the center of the New Hanover map label"],
    ["dc_nh07", "地图“VALENTINE”第一个 E 正南，小径向西凸出处的西侧", "Beside the trail southwest of Valentine"],
    ["dc_nh08", "卡利班之座西南三角路口以西、道路北侧", "Junction southwest of Caliban's Seat"],
    ["dc_nh09", "地图“DAKOTA RIVER”字母 O 正东，第一条道路东侧的山脊上", "High ground east of the Dakota River"],
    ["dc_nh10", "城堡岩第二个 C 正北，铁路北侧与道路南侧之间", "Between the railway and road north of Citadel Rock"],
    ["dc_nh11", "地图“NEW HANOVER”第一个 E 正西、铁路西侧树林", "West of the railway in central New Hanover"],
    ["dc_nh12", "地图“THE HEARTLANDS”字母 N 右上角附近的孤树", "Lone tree in eastern The Heartlands"],
    ["dc_nh13", "大地之心溢流南端中央的一组树中", "South bank of Heartland Overflow"],
    ["dc_nh14", "地图“BLUEWATER MARSH”字母 B 正北，跨河和第一条路后、第二条路南缘", "Near the state line north of Bluewater Marsh"],
    ["dc_le01", "地图“LEMOYNE”字母 M 与 O 的北侧、两字母之间", "Southeast of Emerald Ranch and northwest of Aberdeen Pig Farm"],
    ["dc_le02", "地图“LEMOYNE”字母 M 与 O 北侧，位于上一处捕梦网以南", "Northwest of Lonnie's Shack and Pleasance"],
    ["dc_am01", "地图“GRIZZLIES WEST”中 WEST 的 S 正南，山丘上最大的一棵枯树", "Hill in Grizzlies West"],
    ["dc_am02", "上一处东北方，铁路旁弯曲道路中短暂南北直线路段的西侧", "Roadside north of the Dakota River headwaters"],
    ["dc_am03", "科托拉泉正东、铁路北侧，白树间醒目的棕色大树", "East of Cotorra Springs"],
    ["dc_am04", "阁楼小屋正西、穿过安巴里诺的铁路北侧", "West of The Loft"]
  ];
  dreamcatchers.forEach(function (entry, index) {
    entries.push(item(entry[0], "dreamcatchers", zhNumbers[index] + "号捕梦网", "Dreamcatcher #" + (index + 1), entry[1], entry[2]));
  });

  var dinosaurBoneHints = [
    "安巴里诺 · 查德威克农场正西，紧邻达科塔河的小径上方岩壁",
    "地图“COTORRA SPRINGS”字母 G 正南，达科塔河北侧悬崖下层岩台",
    "地图“AMBARINO”字母 O 正北，最北侧铁路与道路之间的小山顶部",
    "地图“AMBARINO”字母 I 底部左侧，唐纳瀑布东侧道路旁岩壁",
    "地图“GRIZZLIES EAST”中 EAST 的 S 底部偏西，山峰顶部",
    "奥克里夫潭东北，最北侧铁路与州界交点向南、道路下方山顶",
    "地图“BACCHUS STATION”第二个 S 左下角西南侧，华莱士堡东北山顶",
    "地图“CUMBERLAND FOREST”字母 C 正南，虚线小径上方山脊边缘",
    "地图“VALENTINE”字母 A 右端正北，达科塔河东岸高地边缘",
    "地图“DAKOTA RIVER”字母 O 正东、“CUMBERLAND FALLS”第一个 A 正南的岩壁",
    "地图“THE HEARTLANDS”字母 A 与 R 之间正南，废弃采油井井底",
    "地图“THE HEARTLANDS”字母 R 与 T 之间正南，岩脊相接处前方",
    "地图“THE HEARTLANDS”第一个 A 正南，最南侧铁路北面的草地",
    "地图“ROANOKE RIDGE”第一个 O 与 A 中点正东，第一条道路东侧山脊",
    "范霍恩贸易站西北，马厩西南并越过铁路与两条道路后的林地",
    "地图“KAMASSA RIVER”字母 I 正东，极乐池北侧河流西岸高崖",
    "地图“NEW HANOVER”字母 O 正北、安巴里诺州界附近，小屋南侧裸地",
    "地图“LEMOYNE”字母 L 正南，露莓溪西端尽头南侧",
    "地图“DEWBERRY CREEK”字母 D 正北，新汉诺威州界南侧",
    "地图“GRIZZLIES WEST”第一个 L 正南，华莱士车站西北虚线小径西侧洞穴",
    "地图“WEST ELIZABETH”字母 W 与 E 之间，穿过两字母的虚线小径中央",
    "地图“BERYL’S DREAM”中 DREAM 的 M 正南，虚线小径旁悬崖边缘",
    "地图“HENNIGAN’S STEAD”第一个 N 正南，与字母底部相连的峡谷虚线小径内侧",
    "地图“SAN LUIS RIVER”字母 A 与 N 之间正北，正对离岸小岛的河岸",
    "地图“RIO DEL LOBO ROCK”字母 K 底部偏东，山崖中段平台",
    "地图“RIO BRAVO”字母 B 正南，临崖小山顶部",
    "地图“NEW AUSTIN”字母 A 与 U 之间、A 底部正东，豪尔赫峡谷西侧",
    "地图“CHOLLA SPRINGS”第一个 S 远北、“RATTLESNAKE HOLLOW”字母 H 正西的岩壁",
    "地图“GAPTOOTH RIDGE”中 RIDGE 的 D 与 G 之间山顶，由 G 附近北侧上山",
    "地图“TUMBLEWEED”字母 L 正南的山顶，由 L 上方小路登上悬崖"
  ];
  var dinosaurBoneHintsEn = [
    "Ambarino · Due west of Chadwick Farm, on the rock face above the trail beside the Dakota River",
    "Due south of the G in “COTORRA SPRINGS” on the map, on the lower cliff ledge north of the Dakota River",
    "Due north of the O in “AMBARINO” on the map, atop the small hill between the northernmost railway and road",
    "Lower left of the I in “AMBARINO” on the map, on the rock face beside the road east of Donner Falls",
    "Slightly west of the bottom of the S in “EAST” within “GRIZZLIES EAST” on the map, at the mountain summit",
    "Northeast of O’Creagh’s Run, south of the northernmost railway–state border crossing, on the hilltop below the road",
    "Southwest of the lower-left corner of the second S in “BACCHUS STATION” on the map, on the summit northeast of Fort Wallace",
    "Due south of the C in “CUMBERLAND FOREST” on the map, on the ridge edge above the dotted trail",
    "Due north of the right edge of the A in “VALENTINE” on the map, at the edge of the high ground east of the Dakota River",
    "Due east of the O in “DAKOTA RIVER” and due south of the first A in “CUMBERLAND FALLS” on the map, on the rock face",
    "Due south of the gap between A and R in “THE HEARTLANDS” on the map, at the bottom of the abandoned oil derrick",
    "Due south of the gap between R and T in “THE HEARTLANDS” on the map, just before the rocky ridges meet",
    "Due south of the first A in “THE HEARTLANDS” on the map, in the grass north of the southernmost railway",
    "Due east of the midpoint between the first O and A in “ROANOKE RIDGE” on the map, on the ridge east of the first road",
    "Northwest of Van Horn Trading Post, in the woods southwest of the stable beyond the railway and two roads",
    "Due east of the I in “KAMASSA RIVER” on the map, atop the high cliff on the river’s west bank north of Elysian Pool",
    "Due north of the O in “NEW HANOVER” on the map, near the Ambarino border, on bare ground south of the cabin",
    "Due south of the L in “LEMOYNE” on the map, south of the western end of Dewberry Creek",
    "Due north of the D in “DEWBERRY CREEK” on the map, south of the New Hanover border",
    "Due south of the first L in “GRIZZLIES WEST” on the map, in the cave west of the dotted trail northwest of Wallace Station",
    "Between W and E in “WEST ELIZABETH” on the map, in the centre of the dotted trail crossing the letters",
    "Due south of the M in “DREAM” within “BERYL’S DREAM” on the map, at the cliff edge beside the dotted trail",
    "Due south of the first N in “HENNIGAN’S STEAD” on the map, inside the dotted canyon trail connected to the bottom of the letter",
    "Due north of the gap between A and N in “SAN LUIS RIVER” on the map, on the riverbank opposite the offshore island",
    "Slightly east of the bottom of the K in “RIO DEL LOBO ROCK” on the map, on a ledge halfway up the cliff",
    "Due south of the B in “RIO BRAVO” on the map, atop the small hill by the cliff",
    "Between A and U in “NEW AUSTIN” on the map, due east of the bottom of A, west of Jorge’s Gap",
    "Far north of the first S in “CHOLLA SPRINGS” and due west of the H in “RATTLESNAKE HOLLOW” on the map, on the rock face",
    "On the summit between D and G in “RIDGE” within “GAPTOOTH RIDGE” on the map; climb from the north near G",
    "On the summit due south of the L in “TUMBLEWEED” on the map; take the small road above L up the cliff"
  ];
  for (var db = 1; db <= 30; db += 1) {
    entries.push(item("db" + db, "dinosaur-bones", zhNumbers[db - 1] + "号骨", "Dinosaur Bone #" + db, dinosaurBoneHints[db - 1], dinosaurBoneHintsEn[db - 1]));
  }

  var legendaryAnimals = [
    ["la1", "传说海狸 Malia", "Legendary Beaver", "新汉诺威 · 布彻溪", "New Hanover · Butcher Creek"],
    ["la2", "传说灰熊 Bharati", "Legendary Bharati Grizzly Bear", "安巴里诺 · 灰熊山东部", "Ambarino · Grizzlies East"],
    ["la3", "传说大角羊", "Legendary Bighorn Ram", "西伊丽莎白 · 猫尾塘", "West Elizabeth · Cattail Pond"],
    ["la4", "传说野猪 Oryx", "Legendary Boar", "莱莫因 · 蓝水沼泽", "Lemoyne · Bluewater Marsh"],
    ["la5", "传说公鹿 Obie", "Legendary Buck", "西伊丽莎白 · 黑骨森林", "West Elizabeth · Black Bone Forest"],
    ["la6", "传说郊狼 Suki", "Legendary Coyote", "新汉诺威 · 斯嘉丽草甸", "New Hanover · Scarlett Meadows"],
    ["la7", "传说麋鹿 Enyeto", "Legendary Elk", "新汉诺威 · 巴克斯站", "New Hanover · Bacchus Station"],
    ["la8", "传说狐狸 Layla", "Legendary Fox", "莱莫因 · 罗德斯以北", "Lemoyne · North of Rhodes"],
    ["la9", "传说驼鹿 Anoki", "Legendary Moose", "新汉诺威 · 罗诺克岭", "New Hanover · Roanoke Ridge"],
    ["la10", "传说白野牛", "Legendary White Bison", "安巴里诺 · 伊莎贝拉湖", "Ambarino · Lake Isabella"],
    ["la11", "传说狼 Hotah", "Legendary Wolf", "安巴里诺 · 科托拉泉", "Ambarino · Cotorra Springs"],
    ["la12", "传说黑豹 Giaguaro", "Legendary Giaguaro Panther", "莱莫因 · 布莱斯韦特庄园正东", "Lemoyne · East of Braithwaite Manor"],
    ["la13", "传说短吻鳄 Lacartus", "Legendary Bullgator", "莱莫因 · 巴约努瓦沼泽", "Lemoyne · Bayou Nwa"],
    ["la14", "传说美洲狮", "Legendary Cougar", "新奥斯汀 · 加普图斯岭", "New Austin · Gaptooth Ridge"],
    ["la15", "传说叉角羚 Ira", "Legendary Pronghorn", "新奥斯汀 · 德尔洛沃岩", "New Austin · Rio Del Lobo Rock"],
    ["la16", "传说野牛 Tatanka", "Legendary Tatanka Bison", "新奥斯汀 · 亨尼根牧场", "New Austin · Hennigan's Stead"]
  ];
  var legendaryAnimalLinks = {
    la1: ["tk1"], la3: ["tk10"], la5: ["tk2"], la6: ["tk4"], la7: ["tk5"], la8: ["tk6"],
    la9: ["tk7"], la11: ["tk12"], la12: ["mh10", "tk8"], la14: ["tk3"], la15: ["tk9"], la16: ["tk11"]
  };
  legendaryAnimals.forEach(function (entry, index) {
    entries.push(item(entry[0], "legendary-animals", entry[1], entry[2], entry[3], entry[4], "single", [entry[0]].concat(legendaryAnimalLinks[entry[0]] || []), index >= 13 ? ["epi1", "epi2"] : []));
  });

  var legendaryFish = [
    ["lf1", "传说硬头鳟", "Legendary Steelhead Trout", "罗诺克岭 · 布兰迪怀恩瀑布东北", "Roanoke Ridge · Northeast of Brandywine Drop"],
    ["lf2", "传说河鲈", "Legendary Perch", "安巴里诺 · 极乐池", "Ambarino · Elysian Pool"],
    ["lf3", "传说长吻雀鳝", "Legendary Longnose Gar", "莱莫因 · 拉格拉斯/蓝水沼泽", "Lemoyne · Lagras / Bluewater Marsh"],
    ["lf4", "传说北美狗鱼", "Legendary Chain Pickerel", "范霍恩贸易站附近", "Near Van Horn Trading Post"],
    ["lf5", "传说大头鲶鱼", "Legendary Bullhead Catfish", "莱莫因 · 西西卡监狱东岸", "Lemoyne · East shore of Sisika Penitentiary"],
    ["lf6", "传说湖鲟", "Legendary Lake Sturgeon", "莱莫因 · 圣丹尼斯附近铁轨以南", "Lemoyne · South of the railway near Saint Denis"],
    ["lf7", "传说蓝鳃太阳鱼", "Legendary Bluegill", "莱莫因 · 罗德斯与布莱斯韦特庄园之间", "Lemoyne · Between Rhodes and Braithwaite Manor"],
    ["lf8", "传说暗色狗鱼", "Legendary Pickerel", "新汉诺威 · 达科塔河", "New Hanover · Dakota River"],
    ["lf9", "传说红鲑鱼", "Legendary Sockeye Salmon", "安巴里诺 · 伊莎贝拉湖南岸", "Ambarino · South shore of Lake Isabella"],
    ["lf10", "传说小口黑鲈", "Legendary Smallmouth Bass", "西伊丽莎白 · 欧瓦尼拉湖", "West Elizabeth · Owanjila"],
    ["lf11", "传说岩钝鲈", "Legendary Rock Bass", "西伊丽莎白 · 极光盆地", "West Elizabeth · Aurora Basin"],
    ["lf12", "传说红鳍带纹鱼", "Legendary Redfin Pickerel", "西伊丽莎白 · 盗贼领地以西的静水溪", "West Elizabeth · Stillwater Creek west of Thieves Landing"],
    ["lf13", "传说大口黑鲈", "Legendary Largemouth Bass", "新奥斯汀 · 圣路易斯河", "New Austin · San Luis River"]
  ];
  legendaryFish.forEach(function (entry, index) {
    entries.push(item(entry[0], "legendary-fish", entry[1], entry[2], entry[3], entry[4], "single", [entry[0]], index >= 10 ? ["epi1", "epi2"] : []));
  });

  [
    ["tk15_cobalt_wood", "钴化木", "Cobalt Petrified Wood", "用于野猪獠牙护身符；伊莎贝拉湖附近固定木箱", "For the Boar Tusk Talisman; fixed chest near Lake Isabella", ["tk15"]],
    ["tk16_abalone_shell", "鲍鱼壳碎片", "Abalone Shell Fragment", "用于野牛角护身符；罗德斯北侧老宅", "For the Bison Horn Talisman; old house north of Rhodes", ["tk16"]],
    ["tk18", "鹰爪饰品", "Hawk Talon Trinket", "Deadboot Creek 营地遗址", "Deadboot Creek campsite"],
    ["tk19", "猫眼饰品", "Cat Eye Trinket", "布莱斯韦特庄园以西小岛锁箱", "Lockbox on the island west of Braithwaite Manor"],
    ["tk20", "鲨鱼牙饰品", "Shark Tooth Trinket", "安尼斯堡以北沉船附近锁箱", "Lockbox near the shipwreck north of Annesburg"],
    ["tk21", "龟壳饰品", "Turtle Shell Trinket", "加普图斯山口最大建筑楼梯下", "Under the stairs of the largest building at Gaptooth Breach"]
  ].forEach(function (entry) {
    entries.push(item(entry[0], "trinkets", entry[1], entry[2], entry[3], entry[4], "single", entry[5] || [entry[0]]));
  });

  [
    ["w_rare_shotgun", "稀有霰弹枪", "Rare Shotgun", "安尼斯堡以北 · Manito Glade 隐士小屋", "North of Annesburg · Hermit at Manito Glade"],
    ["w_otis", "奥蒂斯·米勒的左轮手枪", "Otis Miller's Revolver", "新奥斯汀 · 响尾蛇山谷洞穴宝箱", "New Austin · Rattlesnake Hollow cave chest"],
    ["w_micah", "迈卡的左轮手枪", "Micah's Revolver", "哈根山 · 尾声任务后返回山顶", "Mount Hagen · Return to the summit after the epilogue mission"],
    ["w_ornate", "华丽匕首", "Ornate Dagger", "圣丹尼斯 · 吸血鬼事件现场", "Saint Denis · Vampire encounter site"],
    ["w_ancient", "古代手斧", "Ancient Tomahawk", "卡鲁梅特峡谷东侧 · 木靶", "East of Calumet Ravine · Wooden target"],
    ["w_double_bit", "双头短斧", "Double Bit Hatchet", "华莱士车站西北 · 树桩", "Northwest of Wallace Station · Tree stump"],
    ["w_rusted_double_bit", "生锈的双头短斧", "Rusted Double Bit Hatchet", "安尼斯堡北部矿区 · 房屋间树桩", "Northern Annesburg mining area · Stump between houses"],
    ["w_hunter", "猎人短斧", "Hunter Hatchet", "窗岩以南 · 小屋外树桩", "South of Window Rock · Stump outside the cabin"],
    ["w_rusted_hunter", "生锈的猎人短斧", "Rusted Hunter Hatchet", "Martha's Swain 小屋外 · 树桩", "Outside Martha's Swain · Tree stump"],
    ["w_hewing", "劈砍短斧", "Hewing Hatchet", "月光石池南侧 · 树桩", "South side of Moonstone Pond · Tree stump"],
    ["d17", "鹿角猎刀", "Antler Knife", "大谷地 · 吊狗牧场西北", "Big Valley · Northwest of Hanging Dog Ranch"],
    ["d18", "破损海盗剑", "Broken Pirate Sword", "巴约努瓦 · 圣丹尼斯南桥外小岛沉船", "Bayou Nwa · Shipwreck on the island south of Saint Denis"],
    ["d19", "南北战争猎刀", "Civil War Knife", "布伦南德堡地下室", "Basement of Fort Brennand"],
    ["d20", "维京战斧", "Viking Hatchet", "罗诺克岭 · 古墓遗迹", "Roanoke Ridge · Old Tomb"],
    ["d21", "宽刃猎刀", "Wide-Blade Knife", "沙恩山西侧 · 贝丽尔的梦矿洞", "West of Mount Shann · Beryl's Dream mine"]
  ].forEach(function (entry) {
    entries.push(item(entry[0], "unique-weapons", entry[1], entry[2], entry[3], entry[4], "single", [entry[0]]));
  });

  [
    ["d5", "杰克霍尔帮藏宝链", "Jack Hall Gang Treasure", "录入每处固定线索与终点", "Place every fixed clue and the treasure endpoint"],
    ["d6", "毒药小径藏宝链", "The Poisonous Trail Treasure", "录入每处固定线索与终点", "Place every fixed clue and the treasure endpoint"],
    ["d7", "隐士撕裂地图藏宝链", "Torn Treasure Map", "录入两张地图与终点", "Place both map pieces and the endpoint"],
    ["d8", "高额赌注藏宝链", "High Stakes Treasure", "不标随机首图来源；录入后续固定地点", "Skip the random first-map source; place later fixed locations"],
    ["d9", "财富地标藏宝链", "Landmarks of Riches Treasure", "录入每处固定线索与终点", "Place every fixed clue and the treasure endpoint"],
    ["d15", "元素踪迹藏宝链", "The Elemental Trail Treasure", "终点同时关联乌鸦喙饰品", "The endpoint also links to the Crow Beak Trinket"],
    ["d16", "亡者之财藏宝链", "Le Tresor Des Morts", "预购/特别版专属；录入固定地点", "Pre-order/Special Edition; place fixed locations"]
  ].forEach(function (entry) {
    entries.push(item(entry[0], "treasures", entry[1], entry[2], entry[3], entry[4], "multi", entry[0] === "d15" ? [entry[0], "tk22"] : [entry[0]]));
  });

  [
    ["tc13_jenny", "珍妮·柯克之墓", "Jenny Kirk's Grave"], ["tc13_davey", "戴维·卡兰德之墓", "Davey Callander's Grave"],
    ["tc13_eagle_flies", "飞鹰之墓", "Eagle Flies' Grave"], ["tc13_arthur", "亚瑟·摩根之墓", "Arthur Morgan's Grave"],
    ["tc13_susan", "苏珊·格里姆肖之墓", "Susan Grimshaw's Grave"], ["tc13_hosea", "何西阿·马修斯之墓", "Hosea Matthews' Grave"],
    ["tc13_lenny", "蓝尼·萨默斯之墓", "Lenny Summers' Grave"], ["tc13_kieran", "基兰·达菲之墓", "Kieran Duffy's Grave"],
    ["tc13_sean", "西恩·麦奎尔之墓", "Sean MacGuire's Grave"]
  ].forEach(function (entry) { entries.push(item(entry[0], "graves", entry[1], entry[2], "", "", "single", [entry[0]], ["epi1", "epi2"])); });

  [
    ["tc5_six_point", "六点小屋", "Six Point Cabin"], ["tc5_shady_belle", "谢迪贝莱", "Shady Belle"],
    ["tc5_beaver_hollow", "河狸洞窟", "Beaver Hollow"], ["tc5_hanging_dog", "吊狗牧场", "Hanging Dog Ranch"],
    ["tc5_thieves_landing", "盗贼领地", "Thieves Landing"], ["tc5_fort_mercer", "默瑟堡", "Fort Mercer"]
  ].forEach(function (entry) { entries.push(item(entry[0], "hideouts", entry[1], entry[2])); });

  window.RDR2MapEditorData = {
    version: 1,
    categories: [
      { id: "rock-carvings", zh: "石雕", en: "Rock Carvings" },
      { id: "dreamcatchers", zh: "捕梦网", en: "Dreamcatchers" },
      { id: "dinosaur-bones", zh: "恐龙骨", en: "Dinosaur Bones" },
      { id: "legendary-animals", zh: "传说动物", en: "Legendary Animals" },
      { id: "legendary-fish", zh: "传说鱼", en: "Legendary Fish" },
      { id: "trinkets", zh: "饰品材料", en: "Trinkets & Materials" },
      { id: "unique-weapons", zh: "独特武器", en: "Unique Weapons" },
      { id: "treasures", zh: "藏宝链", en: "Treasure Maps" },
      { id: "graves", zh: "坟墓", en: "Graves" },
      { id: "hideouts", zh: "帮派老巢", en: "Gang Hideouts" }
    ],
    entries: entries
  };
})();
