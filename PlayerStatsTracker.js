ll.registerPlugin('PlayerStatsTracker', 'Track player stats.', [0, 1, 1])

const defaultConfig = {
  timezone: {
    auto: true,
    offset: 8
  },
  backupLocation: './plugins/PlayerStatsTracker/backups',
  exportLocation: './plugins/PlayerStatsTracker/exports',
  databaseSaveInterval: 10000
}

const config = new JsonConfigFile('./plugins/PlayerStatsTracker/config.json', data.toJson(defaultConfig))
const timezone = config.get('timezone') || defaultConfig.timezone
const autoTimezone = timezone?.auto || defaultConfig.timezone.auto
const timezoneOffset = timezone?.offset || defaultConfig.timezone.auto
const backupLocation = config.get('backupLocation') || defaultConfig.backupLocation
const exportLocation = config.get('exportLocation') || defaultConfig.exportLocation
const databaseSaveInterval = Math.floor(config.get('databaseSaveInterval')) || defaultConfig.databaseSaveInterval

const strings = {
  ranking: '排行榜',
  playerName: '玩家名称',
  baseinfo: '基础信息',
  combat: '战斗',
  mining: '挖矿',
  planting: '种植',
  fishing: '钓鱼',
  death: '死亡数',
  killed: '击杀数',
  damageTaken: '累计受到伤害',
  damageDealt: '累计造成伤害',
  destroyed: '破坏方块数',
  placed: '放置方块数',
  tilled: '耕地次数',
  planted: '种植次数',
  harvested: '收获次数',
  overworldMined: '主世界挖矿数',
  netherMined: '下界挖矿数',
  fished: '钓鱼次数',
  hooked: '钩实体次数',
  ate: '吃掉食物数',
  totem: '消耗不死图腾数',
  chat: '聊天次数',
  chatChars: '聊天字符数',
  jumped: '跳跃次数',
  expObtained: '累积获得经验',
  highestLevel: '最高等级',
  playTime: '游玩时间',
  lastOnline: '最后在线时间',
  loginDays: '登录天数',
  distanceMoved: '移动距离',
  subStrings: {
    ate: {
      'minecraft:golden_apple': '金苹果',
      'minecraft:enchanted_golden_apple': '附魔金苹果'
    },
    killed: {
      'equus': '马属',
      'minecraft:horse': '马',
      'minecraft:skeleton_horse': '骷髅马',
      'minecraft:zombie_horse': '僵尸马',
      'minecraft:donkey': '驴',
      'minecraft:mule': '骡',
      'minecraft:wandering_trader': '流浪商人',
      'minecraft:trader_llama': '行商羊驼',
      'minecraft:iron_golem': '铁傀儡',
      'minecraft:warden': '监守者',
      'minecraft:wither': '凋灵',
      'minecraft:ender_dragon': '末影龙',
    },
    fished: {
      'fish': '鱼',
      'junk': '垃圾',
      'treasure': '宝藏'
    },
    planted: {
      'minecraft:wheat': '小麦种子',
      'minecraft:potatoes': '马铃薯',
      'minecraft:carrots': '胡萝卜',
      'minecraft:melon_stem': '西瓜种子',
      'minecraft:pumpkin_stem': '南瓜种子',
      'minecraft:beetroot': '甜菜种子',
      'minecraft:pitcher_crop': '瓶子草荚果',
      'minecraft:torchflower_crop': '火把花种子',
      'minecraft:nether_wart': '下界疣',
      'minecraft:cocoa': '可可豆'
    },
    harvested: {
      'minecraft:wheat': '小麦',
      'minecraft:potatoes': '马铃薯',
      'minecraft:carrots': '胡萝卜',
      'minecraft:beetroot': '甜菜根',
      'minecraft:pitcher_crop': '瓶子草',
      'minecraft:torchflower_crop': '火把花',
      'minecraft:pumpkin': '南瓜',
      'minecraft:melon_block': '西瓜',
      'minecraft:nether_wart': '下界疣',
      'minecraft:cocoa': '可可果'
    },
    overworldMined: {
      'minecraft:coal_ore': '煤矿石',
      'minecraft:deepslate_coal_ore': '深层煤矿石',
      'minecraft:iron_ore': '铁矿石',
      'minecraft:deepslate_iron_ore': '深层铁矿石',
      'minecraft:copper_ore': '铜矿石',
      'minecraft:deepslate_copper_ore': '深层铜矿石',
      'minecraft:lapis_ore': '青金石矿石',
      'minecraft:deepslate_lapis_ore': '深层青金石矿石',
      'minecraft:gold_ore': '金矿石',
      'minecraft:deepslate_gold_ore': '深层金矿石',
      'minecraft:redstone_ore': '红石矿石',
      'minecraft:deepslate_redstone_ore': '深层红石矿石',
      'minecraft:diamond_ore': '钻石矿石',
      'minecraft:deepslate_diamond_ore': '深层钻石矿石',
      'minecraft:emerald_ore': '绿宝石矿石',
      'minecraft:deepslate_emerald_ore': '深层绿宝石矿石'
    },
    netherMined: {
      'minecraft:quartz_ore': '下界石英矿石',
      'minecraft:nether_gold_ore': '下界金矿石',
      'minecraft:ancient_debris': '远古残骸'
    },
    distanceMoved: {
      'aviate': '鞘翅飞行',
      'minecraft:boat': '乘船',
      'minecraft:chest_boat': '乘运输船',
      'minecraft:minecart': '乘矿车',
      'equus': '骑马属',
      'minecraft:horse': '骑马',
      'minecraft:skeleton_horse': '骑骷髅马',
      'minecraft:zombie_horse': '骑僵尸马',
      'minecraft:donkey': '骑驴',
      'minecraft:mule': '骑骡',
      'minecraft:pig': '骑猪',
      'minecraft:strider': '骑炽足兽'
    }
  }
}

function statsToFormattedList(stats) {
  return [
    {
      title: strings.baseinfo,
      titleFormat: '§f§l',
      contents: [
        { title: strings.lastOnline, value: dateToString(new Date(stats.lastOnline)) },
        { title: strings.playTime, value: secToTime(stats.playTime) },
        { title: strings.loginDays, value: stats.loginDays },
        { title: strings.destroyed, value: stats.destroyed },
        { title: strings.placed, value: stats.placed },
        { title: strings.jumped, value: stats.jumped },
        {
          title: strings.distanceMoved, value: stats.distanceMoved.toFixed(2), subContents: [
            { title: strings.subStrings.distanceMoved['minecraft:boat'], value: (stats.subStats.distanceMoved['minecraft:boat'] + stats.subStats.distanceMoved['minecraft:chest_boat']).toFixed(2) },
            { title: strings.subStrings.distanceMoved['minecraft:minecart'], value: stats.subStats.distanceMoved['minecraft:minecart'].toFixed(2) },
            { title: strings.subStrings.distanceMoved['equus'], value: (stats.subStats.distanceMoved['minecraft:horse'] + stats.subStats.distanceMoved['minecraft:skeleton_horse'] + stats.subStats.distanceMoved['minecraft:zombie_horse'] + stats.subStats.distanceMoved['minecraft:donkey'] + stats.subStats.distanceMoved['minecraft:mule']).toFixed(2) },
            { title: strings.subStrings.distanceMoved['minecraft:pig'], value: stats.subStats.distanceMoved['minecraft:pig'].toFixed(2) },
            { title: strings.subStrings.distanceMoved['minecraft:strider'], value: stats.subStats.distanceMoved['minecraft:strider'].toFixed(2) },
            { title: strings.subStrings.distanceMoved['aviate'], value: stats.subStats.distanceMoved['aviate'].toFixed(2) }
          ]
        },
        { title: strings.totem, value: stats.totem },
        { title: strings.chat, value: stats.chat },
        { title: strings.chatChars, value: stats.chatChars },
        { title: strings.expObtained, value: stats.expObtained },
        { title: strings.highestLevel, value: stats.highestLevel },
        {
          title: strings.ate, value: stats.ate, subContents: [
            { title: strings.subStrings.ate['minecraft:golden_apple'], value: stats.subStats.ate['minecraft:golden_apple'] },
            { title: strings.subStrings.ate['minecraft:enchanted_golden_apple'], value: stats.subStats.ate['minecraft:enchanted_golden_apple'] }
          ]
        }
      ]
    },
    {
      title: strings.combat,
      titleFormat: '§c§l',
      contents: [
        {
          title: strings.killed, value: stats.killed, subContents: [
            { title: strings.subStrings.killed['equus'], value: stats.subStats.killed['minecraft:horse'] + stats.subStats.killed['minecraft:skeleton_horse'] + stats.subStats.killed['minecraft:zombie_horse'] + stats.subStats.killed['minecraft:donkey'] + stats.subStats.killed['minecraft:mule'] },
            { title: strings.subStrings.killed['minecraft:wandering_trader'], value: stats.subStats.killed['minecraft:wandering_trader'] },
            { title: strings.subStrings.killed['minecraft:trader_llama'], value: stats.subStats.killed['minecraft:trader_llama'] },
            { title: strings.subStrings.killed['minecraft:iron_golem'], value: stats.subStats.killed['minecraft:iron_golem'] },
            { title: strings.subStrings.killed['minecraft:warden'], value: stats.subStats.killed['minecraft:warden'] },
            { title: strings.subStrings.killed['minecraft:wither'], value: stats.subStats.killed['minecraft:wither'] },
            { title: strings.subStrings.killed['minecraft:ender_dragon'], value: stats.subStats.killed['minecraft:ender_dragon'] }
          ]
        },
        { title: strings.death, value: stats.death },
        { title: strings.damageDealt, value: stats.damageDealt },
        { title: strings.damageTaken, value: stats.damageTaken }
      ]
    },
    {
      title: strings.mining,
      titleFormat: '§7§l',
      contents: [
        {
          title: strings.overworldMined, value: stats.overworldMined, subContents: [
            { title: strings.subStrings.overworldMined['minecraft:coal_ore'], value: stats.subStats.overworldMined['minecraft:coal_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:deepslate_coal_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_coal_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:iron_ore'], value: stats.subStats.overworldMined['minecraft:iron_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:deepslate_iron_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_iron_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:copper_ore'], value: stats.subStats.overworldMined['minecraft:copper_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:deepslate_copper_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_copper_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:lapis_ore'], value: stats.subStats.overworldMined['minecraft:lapis_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:deepslate_lapis_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_lapis_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:gold_ore'], value: stats.subStats.overworldMined['minecraft:gold_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:deepslate_gold_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_gold_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:redstone_ore'], value: stats.subStats.overworldMined['minecraft:redstone_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:deepslate_redstone_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_redstone_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:diamond_ore'], value: stats.subStats.overworldMined['minecraft:diamond_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:deepslate_diamond_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_diamond_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:emerald_ore'], value: stats.subStats.overworldMined['minecraft:emerald_ore'] },
            { title: strings.subStrings.overworldMined['minecraft:deepslate_emerald_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_emerald_ore'] }
          ]
        },
        {
          title: strings.netherMined, value: stats.netherMined, subContents: [
            { title: strings.subStrings.netherMined['minecraft:quartz_ore'], value: stats.subStats.netherMined['minecraft:quartz_ore'] },
            { title: strings.subStrings.netherMined['minecraft:nether_gold_ore'], value: stats.subStats.netherMined['minecraft:nether_gold_ore'] },
            { title: strings.subStrings.netherMined['minecraft:ancient_debris'], value: stats.subStats.netherMined['minecraft:ancient_debris'] }
          ]
        }
      ]
    },
    {
      title: strings.planting,
      titleFormat: '§2§l',
      contents: [
        { title: strings.tilled, value: stats.tilled },
        {
          title: strings.planted, value: stats.planted, subContents: [
            { title: strings.subStrings.planted['minecraft:wheat'], value: stats.subStats.planted['minecraft:wheat'] },
            { title: strings.subStrings.planted['minecraft:beetroot'], value: stats.subStats.planted['minecraft:beetroot'] },
            { title: strings.subStrings.planted['minecraft:potatoes'], value: stats.subStats.planted['minecraft:potatoes'] },
            { title: strings.subStrings.planted['minecraft:carrots'], value: stats.subStats.planted['minecraft:carrots'] },
            { title: strings.subStrings.planted['minecraft:melon_stem'], value: stats.subStats.planted['minecraft:melon_stem'] },
            { title: strings.subStrings.planted['minecraft:pumpkin_stem'], value: stats.subStats.planted['minecraft:pumpkin_stem'] },
            { title: strings.subStrings.planted['minecraft:torchflower_crop'], value: stats.subStats.planted['minecraft:torchflower_crop'] },
            { title: strings.subStrings.planted['minecraft:pitcher_crop'], value: stats.subStats.planted['minecraft:pitcher_crop'] },
            { title: strings.subStrings.planted['minecraft:cocoa'], value: stats.subStats.planted['minecraft:cocoa'] },
            { title: strings.subStrings.planted['minecraft:nether_wart'], value: stats.subStats.planted['minecraft:nether_wart'] },
          ]
        },
        {
          title: strings.harvested, value: stats.harvested, subContents: [
            { title: strings.subStrings.harvested['minecraft:wheat'], value: stats.subStats.harvested['minecraft:wheat'] },
            { title: strings.subStrings.harvested['minecraft:beetroot'], value: stats.subStats.harvested['minecraft:beetroot'] },
            { title: strings.subStrings.harvested['minecraft:potatoes'], value: stats.subStats.harvested['minecraft:potatoes'] },
            { title: strings.subStrings.harvested['minecraft:carrots'], value: stats.subStats.harvested['minecraft:carrots'] },
            { title: strings.subStrings.harvested['minecraft:melon_block'], value: stats.subStats.harvested['minecraft:melon_block'] },
            { title: strings.subStrings.harvested['minecraft:pumpkin'], value: stats.subStats.harvested['minecraft:pumpkin'] },
            { title: strings.subStrings.harvested['minecraft:torchflower_crop'], value: stats.subStats.harvested['minecraft:torchflower_crop'] },
            { title: strings.subStrings.harvested['minecraft:pitcher_crop'], value: stats.subStats.harvested['minecraft:pitcher_crop'] },
            { title: strings.subStrings.harvested['minecraft:cocoa'], value: stats.subStats.harvested['minecraft:cocoa'] },
            { title: strings.subStrings.harvested['minecraft:nether_wart'], value: stats.subStats.harvested['minecraft:nether_wart'] },
          ]
        }
      ]
    },
    {
      title: strings.fishing,
      titleFormat: '§3§l',
      contents: [
        {
          title: strings.fished, value: stats.fished, subContents: [
            { title: strings.subStrings.fished['fish'], value: stats.subStats.fished['fish'] },
            { title: strings.subStrings.fished['treasure'], value: stats.subStats.fished['treasure'] },
            { title: strings.subStrings.fished['junk'], value: stats.subStats.fished['junk'] }
          ]
        },
        { title: strings.hooked, value: stats.hooked }
      ]
    }
  ]
}

const defaultPlayerData = {
  death: 0, // 死亡次数
  killed: 0, // 击杀数
  damageTaken: 0, // 受到的伤害
  damageDealt: 0, // 造成的伤害
  destroyed: 0, // 破坏方块数
  placed: 0, // 放置方块数
  tilled: 0, // 耕地数
  planted: 0, // 种植次数
  harvested: 0, // 收获次数
  overworldMined: 0, // 主世界挖矿数
  netherMined: 0, // 下界挖矿数
  fished: 0, // 钓鱼数
  hooked: 0, // 用钓鱼竿钩实体次数
  ate: 0, // 吃掉的食物数
  totem: 0, // 消耗的图腾数
  chat: 0, // 聊天消息条数
  chatChars: 0, // 聊天消息字符数
  jumped: 0, // 跳跃次数
  expObtained: 0, // 累计获得的经验数
  highestLevel: 0, // 最高到达的等级
  playTime: 0, // 游玩时间
  lastOnline: 0, // 最后在线时间
  loginDays: 0, // 登录天数
  distanceMoved: 0, // 移动距离
  subStats: {
    ate: { // 具体吃掉的食物数
      'minecraft:golden_apple': 0,
      'minecraft:enchanted_golden_apple': 0
    },
    killed: { // 具体击杀数
      'minecraft:horse': 0,
      'minecraft:skeleton_horse': 0,
      'minecraft:zombie_horse': 0,
      'minecraft:donkey': 0,
      'minecraft:mule': 0,
      'minecraft:wandering_trader': 0,
      'minecraft:trader_llama': 0,
      'minecraft:iron_golem': 0,
      'minecraft:warden': 0,
      'minecraft:wither': 0,
      'minecraft:ender_dragon': 0,
    },
    fished: { // 具体钓鱼数
      'fish': 0,
      'junk': 0,
      'treasure': 0
    },
    planted: { // 具体种植数
      'minecraft:wheat': 0,
      'minecraft:potatoes': 0,
      'minecraft:carrots': 0,
      'minecraft:melon_stem': 0,
      'minecraft:pumpkin_stem': 0,
      'minecraft:beetroot': 0,
      'minecraft:pitcher_crop': 0,
      'minecraft:torchflower_crop': 0,
      'minecraft:nether_wart': 0,
      'minecraft:cocoa': 0
    },
    harvested: { // 具体收获数
      'minecraft:wheat': 0,
      'minecraft:potatoes': 0,
      'minecraft:carrots': 0,
      'minecraft:beetroot': 0,
      'minecraft:pitcher_crop': 0,
      'minecraft:torchflower_crop': 0,
      'minecraft:pumpkin': 0,
      'minecraft:melon_block': 0,
      'minecraft:nether_wart': 0,
      'minecraft:cocoa': 0
    },
    overworldMined: { // 具体主世界采矿数
      'minecraft:coal_ore': 0,
      'minecraft:deepslate_coal_ore': 0,
      'minecraft:iron_ore': 0,
      'minecraft:deepslate_iron_ore': 0,
      'minecraft:copper_ore': 0,
      'minecraft:deepslate_copper_ore': 0,
      'minecraft:lapis_ore': 0,
      'minecraft:deepslate_lapis_ore': 0,
      'minecraft:gold_ore': 0,
      'minecraft:deepslate_gold_ore': 0,
      'minecraft:redstone_ore': 0,
      'minecraft:deepslate_redstone_ore': 0,
      'minecraft:diamond_ore': 0,
      'minecraft:deepslate_diamond_ore': 0,
      'minecraft:emerald_ore': 0,
      'minecraft:deepslate_emerald_ore': 0
    },
    netherMined: { // 具体下界采矿数
      'minecraft:quartz_ore': 0,
      'minecraft:nether_gold_ore': 0,
      'minecraft:ancient_debris': 0
    },
    distanceMoved: {
      'aviate': 0,
      'minecraft:boat': 0,
      'minecraft:chest_boat': 0,
      'minecraft:minecart': 0,
      'minecraft:horse': 0,
      'minecraft:skeleton_horse': 0,
      'minecraft:zombie_horse': 0,
      'minecraft:donkey': 0,
      'minecraft:mule': 0,
      'minecraft:pig': 0,
      'minecraft:strider': 0
    }
  }
}

const listenPlacedBlocks = [
  'minecraft:melon_block',
  'minecraft:pumpkin',
  'minecraft:coal_ore',
  'minecraft:deepslate_coal_ore',
  'minecraft:iron_ore',
  'minecraft:deepslate_iron_ore',
  'minecraft:copper_ore',
  'minecraft:deepslate_copper_ore',
  'minecraft:lapis_ore',
  'minecraft:deepslate_lapis_ore',
  'minecraft:gold_ore',
  'minecraft:deepslate_gold_ore',
  'minecraft:redstone_ore',
  'minecraft:deepslate_redstone_ore',
  'minecraft:lit_redstone_ore',
  'minecraft:lit_deepslate_redstone_ore',
  'minecraft:diamond_ore',
  'minecraft:deepslate_diamond_ore',
  'minecraft:emerald_ore',
  'minecraft:deepslate_emerald_ore',
  'minecraft:quartz_ore',
  'minecraft:nether_gold_ore',
  'minecraft:ancient_debris'
]

const listenMovePlacedBlocks = [
  'minecraft:coal_ore',
  'minecraft:deepslate_coal_ore',
  'minecraft:iron_ore',
  'minecraft:deepslate_iron_ore',
  'minecraft:copper_ore',
  'minecraft:deepslate_copper_ore',
  'minecraft:lapis_ore',
  'minecraft:deepslate_lapis_ore',
  'minecraft:gold_ore',
  'minecraft:deepslate_gold_ore',
  'minecraft:redstone_ore',
  'minecraft:deepslate_redstone_ore',
  'minecraft:lit_redstone_ore',
  'minecraft:lit_deepslate_redstone_ore',
  'minecraft:diamond_ore',
  'minecraft:deepslate_diamond_ore',
  'minecraft:emerald_ore',
  'minecraft:deepslate_emerald_ore',
  'minecraft:quartz_ore',
  'minecraft:nether_gold_ore',
  'minecraft:ancient_debris'
]

const redstoneOres = [
  'minecraft:redstone_ore',
  'minecraft:lit_redstone_ore',
]

const deepslateRedstoneOres = [
  'minecraft:deepslate_redstone_ore',
  'minecraft:lit_deepslate_redstone_ore',
]

const preFarmlandBlocks = [
  'minecraft:dirt',
  'minecraft:grass',
  'minecraft:grass_path'
]

const cakes = [
  'minecraft:cake',
  'minecraft:candle_cake',
  'minecraft:white_candle_cake',
  'minecraft:orange_candle_cake',
  'minecraft:magenta_candle_cake',
  'minecraft:light_blue_candle_cake',
  'minecraft:yellow_candle_cake',
  'minecraft:lime_candle_cake',
  'minecraft:pink_candle_cake',
  'minecraft:gray_candle_cake',
  'minecraft:light_gray_candle_cake',
  'minecraft:cyan_candle_cake',
  'minecraft:purple_candle_cake',
  'minecraft:blue_candle_cake',
  'minecraft:brown_candle_cake',
  'minecraft:green_candle_cake',
  'minecraft:red_candle_cake',
  'minecraft:black_candle_cake'
]

let fishingLootTable = {}

{
  let fish = new Set([
    ...data.parseJson(File.readFrom('./behavior_packs/vanilla/loot_tables/gameplay/fishing/fish.json')).pools[0].entries.map(obj => obj.name),
    ...data.parseJson(File.readFrom('./behavior_packs/vanilla/loot_tables/gameplay/fishing/jungle_fish.json')).pools[0].entries.map(obj => obj.name)
  ])
  fish.delete('minecraft:fish')
  fish.add('minecraft:cod')
  let junk = new Set([
    ...data.parseJson(File.readFrom('./behavior_packs/vanilla/loot_tables/gameplay/fishing/junk.json')).pools[0].entries.map(obj => obj.name),
    ...data.parseJson(File.readFrom('./behavior_packs/vanilla/loot_tables/gameplay/fishing/jungle_junk.json')).pools[0].entries.map(obj => obj.name)
  ])
  junk.delete('minecraft:dye')
  junk.add('minecraft:ink_sac')
  let treasure = new Set(data.parseJson(File.readFrom('./behavior_packs/vanilla/loot_tables/gameplay/fishing/treasure.json')).pools[0].entries.map(obj => obj.name))
  treasure.delete('minecraft:book')
  treasure.add('minecraft:enchanted_book')

  fishingLootTable = {
    fish: Array.from(fish),
    junk: Array.from(junk),
    treasure: Array.from(treasure)
  }
}

const rankingKeys = [
  {
    text: `§0${strings.baseinfo}§r`, keys: [
      { text: strings.playTime, key: 'playTime' },
      { text: strings.loginDays, key: 'loginDays' },
      { text: strings.destroyed, key: 'destroyed' },
      { text: strings.placed, key: 'placed' },
      { text: strings.jumped, key: 'jumped' },
      { text: strings.distanceMoved, key: 'distanceMoved' },
      { text: strings.totem, key: 'totem' },
      { text: strings.chat, key: 'chat' },
      { text: strings.chatChars, key: 'chatChars' },
      { text: strings.expObtained, key: 'expObtained' },
      { text: strings.highestLevel, key: 'highestLevel' },
      { text: strings.ate, key: 'ate' }
    ]
  },
  {
    text: `§c${strings.combat}§r`, keys: [
      { text: strings.killed, key: 'killed' },
      { text: strings.death, key: 'death' },
      { text: strings.damageDealt, key: 'damageDealt' },
      { text: strings.damageTaken, key: 'damageTaken' }
    ]
  },
  {
    text: `§8${strings.mining}§r`, keys: [
      { text: strings.overworldMined, key: 'overworldMined' },
      { text: strings.netherMined, key: 'netherMined' }
    ]
  },
  {
    text: `§2${strings.planting}§r`, keys: [
      { text: strings.tilled, key: 'tilled' },
      { text: strings.planted, key: 'planted' },
      { text: strings.harvested, key: 'harvested' }
    ]
  },
  {
    text: `§3${strings.fishing}§r`, keys: [
      { text: strings.fished, key: 'fished' },
      { text: strings.hooked, key: 'hooked' }
    ]
  }
]

let rankingKeyList = []

for (let i = 0; i < rankingKeys.length; i++) {
  rankingKeyList = rankingKeyList.concat(rankingKeys[i].keys)
}

let db
let newFarmlands = new Set()
let cakesAten = new Set()
let listenMovePlacedBlocksQueue = []
// 服务器启动
mc.listen('onServerStarted', () => {
  db = new DataBase('./plugins/PlayerStatsTracker/data/', defaultPlayerData, databaseSaveInterval, backupLocation)
})

// ↓ 命令注册 ======================================================================
let command1 = mc.newCommand('stats', '查看统计信息', PermType.Any)
command1.optional('player', ParamType.String)
command1.overload(['player'])
command1.setCallback((cmd, origin, output, results) => {
  if (!origin.player) { // 控制台查询
    if (results.player) { // 控制台有参数
      if (db.hasPlayer(results.player)) {
        output.success(`${results.player}的统计\n${formatStats(db.getPlayer(results.player), false)}`)
      } else {
        output.error('无此玩家数据')
      }
    } else { // 控制台无参数
      output.error('请指定玩家名')
    }
  } else { // 玩家查询
    if (results.player) { // 玩家有参数
      if (origin.player.realName === results.player) { // 玩家有参数查自己
        showStats(origin.player, origin.player.realName)
      } else { // 玩家有参数查别人
        if (origin.player.isOP()) {
          if (db.hasPlayer(results.player)) {
            showStats(origin.player, results.player)
          } else {
            output.error('无此玩家数据')
          }
        } else {
          output.error('你无权查询其他玩家')
        }
      }
    } else { // 玩家无参数
      showStats(origin.player, origin.player.realName)
    }
  }
})
command1.setup()

let command2 = mc.newCommand('statsdelete', '删除统计信息', PermType.Console)
command2.optional('player', ParamType.String)
command2.overload(['player'])
command2.setCallback((cmd, origin, output, results) => {
  if (results.player) {
    if (!data.name2xuid(results.player)) {
      output.error('无此玩家')
    } else {
      db.deletePlayer(results.player)
    }
  } else {
    output.error('请指定玩家')
  }
})
command2.setup()

let command3 = mc.newCommand('ranking', '查看统计排行榜', PermType.Any)
command3.optional('number', ParamType.Int)
command3.overload(['number'])
command3.setCallback((cmd, origin, output, results) => {
  if (origin.player) {
    showRanking(origin.player)
  } else {
    if (results.number === null) {
      let keysStr = ''
      for (let i = 0; i < rankingKeyList.length; i++) {
        keysStr += `\n${i}. ${rankingKeyList[i].text}`
      }
      output.success('请使用"ranking <编号>"来查询某一项统计数据的排行榜' + keysStr)
    } else {
      if (rankingKeyList.length - 1 > results.number) {
        if (rankingKeyList[results.number].key === 'playTime') {
          output.success(`${strings.ranking}-${rankingKeyList[results.number].text}\n${formatRanking(db.getRanking(rankingKeyList[results.number].key), false, secToTime)}`)
        } else {
          output.success(`${strings.ranking}-${rankingKeyList[results.number].text}\n${formatRanking(db.getRanking(rankingKeyList[results.number].key), false)}`)
        }
      } else {
        output.error('无此编号的排行榜')
      }
    }
  }
})
command3.setup()

let command4 = mc.newCommand('statsbackup', '备份统计信息数据库', PermType.GameMasters)
command4.overload([])
command4.setCallback((cmd, origin, output, results) => {
  if (db.dbBackup()) {
    output.success('数据库备份完成')
  } else {
    output.error('数据库备份失败')
  }
})
command4.setup()

let command5 = mc.newCommand('statsexport', '导出统计信息', PermType.Console)
command5.overload([])
command5.setCallback((cmd, origin, output, results) => {
  if (exportStats()) {
    output.success('统计信息导出完成')
  } else {
    output.error('统计信息导出失败')
  }
})
command5.setup()
// ↑ 命令注册 ======================================================================

// ↓ API ======================================================================
ll.exports(getStats, 'PlayerStatsTracker', 'getStats')
ll.exports(getFormatedStats, 'PlayerStatsTracker', 'getFormatedStats')
ll.exports(getRanking, 'PlayerStatsTracker', 'getRanking')
ll.exports(getFormatedRanking, 'PlayerStatsTracker', 'getFormatedRanking')
ll.exports(getRankingKeyList, 'PlayerStatsTracker', 'getRankingKeyList')

function getFormatedStats(name) {
  if (!db.hasPlayer(name)) {
    return null
  }
  return formatStats(db.getPlayer(name), false)
}

function getStats(name) {
  if (!db.hasPlayer(name)) {
    return null
  }
  return db.getPlayer(name)
}

function getFormatedRanking(key) {
  if (key === 'playTime') {
    return formatRanking(db.getRanking(key), false, secToTime)
  } else {
    return formatRanking(db.getRanking(key), false)
  }
}

function getRanking(key) {
  if (rankingKeyList.includes(key)) {
    return db.getRanking(key)
  } else {
    return null
  }

}

function getRankingKeyList() {
  return rankingKeyList
}

function hasRankingKey(key) {
  for (let i = 0; i < rankingKeyList.length; i++) {
    if (rankingKeyList[i].key === key) {
      return true
    }
  }
  return false
}
// ↑ API ======================================================================

// ↓ 游戏内菜单 ======================================================================
function showStats(player, name) {
  let form = mc.newSimpleForm()
  form.setTitle(`${name}的统计`)
  form.setContent(formatStats(db.getPlayer(name), true))
  player.sendForm(form, () => {
  })
}

function showRanking(player) {
  let optionsForm = mc.newSimpleForm()
  let subOptionsForm = null
  let subOptionsFormId = -1
  optionsForm.setTitle('统计排行榜')
  for (let i = 0; i < rankingKeys.length; i++) {
    optionsForm.addButton(rankingKeys[i].text)
  }
  player.sendForm(optionsForm, optionsFormHandler)

  function optionsFormHandler(player, id) {
    if (id == null) { return }
    const keyItem = rankingKeys[id]
    subOptionsFormId = id
    subOptionsForm = mc.newSimpleForm()
    subOptionsForm.setTitle('统计排行榜-' + keyItem.text)
    for (let i = 0; i < keyItem.keys.length; i++) {
      subOptionsForm.addButton(keyItem.keys[i].text)
    }
    player.sendForm(subOptionsForm, subOptionsFormHandler)
  }

  function subOptionsFormHandler(player, id) {
    if (id == null) {
      player.sendForm(optionsForm, optionsFormHandler)
    } else {
      const keyItem = rankingKeys[subOptionsFormId].keys[id]
      let rankingForm = mc.newSimpleForm()
      rankingForm.setTitle('统计排行榜-' + keyItem.text)
      if (keyItem.key === 'playTime') {
        rankingForm.setContent(formatRanking(db.getRanking(keyItem.key), true, secToTime))
      } else if (['distanceMoved', 'damageTaken', 'damageDealt'].includes(keyItem.key)) {
        rankingForm.setContent(formatRanking(db.getRanking(keyItem.key), true, value => value.toFixed(2)))
      } else {
        rankingForm.setContent(formatRanking(db.getRanking(keyItem.key), true))
      }
      player.sendForm(rankingForm, rankingFormHandler)
    }
  }

  function rankingFormHandler(player, data) {
    player.sendForm(subOptionsForm, subOptionsFormHandler)
  }
}
// ↑ 游戏内菜单 ======================================================================

// ↓ Utils ======================================================================
function posToString(pos) {
  return [pos.x, ',', pos.y, ',', pos.z, ',', pos.dimid].join('')
}

function secToTime(sec) {
  const s = sec % 60
  const m = parseInt(sec / 60) % 60
  const h = parseInt(sec / 3600)
  return [h >= 10 ? h : '0' + h, ':', m >= 10 ? m : '0' + m, ':', s >= 10 ? s : '0' + s].join('')
}

function dateToString(date, format = 'YYYY-MM-DD hh:mm:ss') {
  return dateToDateString(date, dateToTimeString(date, format))
}

function dateToDateString(date, format = 'YYYY-MM-DD') {
  let Y = null
  let M = null
  let D = null
  if (autoTimezone) {
    const timeObj = system.getTimeObj()
    Y = timeObj.Y
    M = timeObj.M
    D = timeObj.D
  } else {
    const h = date.getUTCHours() + parseInt(timezoneOffset)
    let dateObj = date
    if (h >= 24) {
      dateObj = new Date(date.valueOf() + 86400000)
    } else if (h < 0) {
      dateObj = new Date(date.valueOf() - 86400000)
    }
    Y = dateObj.getUTCFullYear()
    M = dateObj.getUTCMonth() + 1
    D = dateObj.getUTCDate()
  }
  return format.replace('YYYY', Y).replace('MM', M < 10 ? '0' + M : M).replace('DD', D < 10 ? '0' + D : D).replace('M', M).replace('D', D)
}

function dateToTimeString(date, format = 'hh:mm:ss') {
  let h = null
  let m = null
  let s = null
  if (autoTimezone) {
    const timeObj = system.getTimeObj()
    h = timeObj.h
    m = timeObj.m
    s = timeObj.s
  } else {
    h = date.getUTCHours() + parseInt(timezoneOffset)
    m = date.getUTCMinutes()
    s = date.getUTCSeconds()
    if (h >= 24) {
      h -= 24
    } else if (h < 0) {
      h += 24
    }
  }
  return format.replace('hh', h < 10 ? '0' + h : h).replace('mm', m < 10 ? '0' + m : m).replace('ss', s < 10 ? '0' + s : s).replace('h', h).replace('m', m).replace('s', s)
}

function formatStats(stats, colorful) {
  const reg = /§./g
  const statsFormattedList = statsToFormattedList(stats)
  let str = ''

  for (let i = 0; i < statsFormattedList.length; i++) {
    str += `§6◁〖§r ${statsFormattedList[i].titleFormat}${statsFormattedList[i].title} §r§6〗▷§r\n`
    for (let j = 0; j < statsFormattedList[i].contents.length; j++) {
      str += `${statsFormattedList[i].contents[j].title}: ${statsFormattedList[i].contents[j].value}\n`
      if (statsFormattedList[i].contents[j].hasOwnProperty('subContents')) {
        for (let k = 0; k < statsFormattedList[i].contents[j].subContents.length; k++) {
          str += `  - ${statsFormattedList[i].contents[j].subContents[k].title}: ${statsFormattedList[i].contents[j].subContents[k].value}\n`
        }
      }
    }
    str += '\n'
  }
  return colorful ? str : str.replace(reg, '')
}

function formatRanking(ranking, colorful, func = str => str) {
  const reg = /§./g
  let str = ''
  let rank = 0
  let count = 0
  let prev = null
  for (let i = 0; i < ranking.length; i++) {
    count++
    if (prev !== ranking[i].data) {
      rank += count
      count = 0
    }
    prev = ranking[i].data
    if (i !== 0) {
      str += '\n'
    }
    switch (rank) {
      case 1:
        str += `§g§l${rank}. ${ranking[i].name}: ${func(ranking[i].data)}§r`
        break
      case 2:
        str += `§7§l${rank}. ${ranking[i].name}: ${func(ranking[i].data)}§r`
        break
      case 3:
        str += `§6§l${rank}. ${ranking[i].name}: ${func(ranking[i].data)}§r`
        break
      default:
        str += `${rank}. ${ranking[i].name}: ${func(ranking[i].data)}`
    }
  }
  return colorful ? str : str.replace(reg, '')
}

function exportStats() {
  const timeObj = system.getTimeObj()
  const path = [exportLocation, '/', timeObj.Y, '-', timeObj.M < 10 ? '0' + timeObj.M : timeObj.M, '-', timeObj.D < 10 ? '0' + timeObj.D : timeObj.D, '_', timeObj.h < 10 ? '0' + timeObj.h : timeObj.h, '-', timeObj.m < 10 ? '0' + timeObj.m : timeObj.m, '-', timeObj.s < 10 ? '0' + timeObj.s : timeObj.s, '.csv'].join('')
  if (File.exists(path)) {
    return false
  } else {
    let exportContents = `\uFEFF"${strings.playerName}"`
    const titleTemplate = statsToFormattedList(defaultPlayerData)
    for (let i = 0; i < titleTemplate.length; i++) {
      for (let j = 0; j < titleTemplate[i].contents.length; j++) {
        exportContents += `,"${titleTemplate[i].contents[j].title}"`
        if (titleTemplate[i].contents[j].hasOwnProperty('subContents')) {
          for (let k = 0; k < titleTemplate[i].contents[j].subContents.length; k++) {
            exportContents += `,"${titleTemplate[i].contents[j].title}-${titleTemplate[i].contents[j].subContents[k].title}"`
          }
        }
      }
    }
    exportContents += '\n'

    const playersData = db.getPlayers()
    for (let p = 0; p < playersData.length; p++) {
      const playerDataFormattedList = statsToFormattedList(playersData[p].data)
      exportContents += `"${playersData[p].name}"`
      for (let i = 0; i < playerDataFormattedList.length; i++) {
        for (let j = 0; j < playerDataFormattedList[i].contents.length; j++) {
          exportContents += `,"${playerDataFormattedList[i].contents[j].value}"`
          if (playerDataFormattedList[i].contents[j].hasOwnProperty('subContents')) {
            for (let k = 0; k < playerDataFormattedList[i].contents[j].subContents.length; k++) {
              exportContents += `,"${playerDataFormattedList[i].contents[j].subContents[k].value}"`
            }
          }
        }
      }
      exportContents += '\n'
    }

    if (File.writeTo(path, exportContents)) {
      return true
    } else {
      return false
    }
  }
}
// ↑ Utils ======================================================================

// 更新最后在线时间和登录天数
function updateLastOnline(name) {
  if (dateToDateString(new Date(db.get(name, 'lastOnline'))) < dateToDateString(new Date())) {
    db.set(name, 'loginDays', 'add', 1)
  }
  db.set(name, 'lastOnline', 'set', Date.now())
}

// 更新移动距离
function updateDistanceMoved(player) {
  const lastPosition = player.getExtraData('lastPosition')
  const currentPosition = player.pos
  const aviating = player.isGliding
  const aviated = player.getExtraData('aviating')
  let ridingEntity = null
  if (aviating) {
    player.setExtraData('aviating', true)
  } else {
    player.delExtraData('aviating')
  }

  if (player.isRiding) {
    ridingEntity = player.getExtraData('riding')
  } else {
    player.delExtraData('riding')
  }
  player.setExtraData('lastPosition', currentPosition)
  if (lastPosition?.dimid !== currentPosition.dimid) { return }

  const distance = player.distanceTo(lastPosition)
  db.set(player.realName, 'distanceMoved', 'add', distance)
  if (player.isGliding && aviated) {
    db.setSub(player.realName, 'distanceMoved', 'aviate', 'add', distance)
  } else if (player.isRiding && ridingEntity !== null) {
    db.setSub(player.realName, 'distanceMoved', ridingEntity, 'add', distance)
  }
}

// 进入游戏
mc.listen('onJoin', (player) => {
  if (player.isSimulatedPlayer()) { return }
  updateLastOnline(player.realName)
  player.setExtraData('playTimeTimer', setInterval(() => {
    db.set(player.realName, 'playTime', 'add', 1)
    updateLastOnline(player.realName)
  }, 1000))
  player.setExtraData('movementTimer', setInterval(() => {
    updateDistanceMoved(player)
  }, 200))
})

// 离开游戏
mc.listen('onLeft', (player) => {
  if (player.isSimulatedPlayer()) { return }
  if (player.getExtraData('playTimeTimer')) {
    clearInterval(player.getExtraData('playTimeTimer'))
  }
  if (player.getExtraData('movementTimer')) {
    clearInterval(player.getExtraData('movementTimer'))
  }
  player.delExtraData('playTimeTimer')
  player.delExtraData('movementTimer')
  db.unmountPlayer(player.realName)
})

// 死亡
mc.listen('onPlayerDie', (player, source) => {
  if (player.isSimulatedPlayer()) { return }
  db.set(player.realName, 'death', 'add', 1)
})

// 生物死亡
mc.listen('onMobDie', (mob, source, cause) => {
  if (source?.isPlayer()) {
    const pl = source.toPlayer()
    if (!pl.isSimulatedPlayer()) {
      db.set(pl.realName, 'killed', 'add', 1)
      if (defaultPlayerData.subStats.killed.hasOwnProperty(mob.type)) {
        db.setSub(pl.realName, 'killed', mob.type, 'add', 1)
      }
    }
  }
})

// 聊天
mc.listen('onChat', (player, msg) => {
  if (player.isSimulatedPlayer()) { return }
  db.set(player.realName, 'chat', 'add', 1)
  const iterator = msg[Symbol.iterator]()
  let theChar = iterator.next()
  let count = 0
  while (!theChar.done) {
    count++
    theChar = iterator.next()
  }
  db.set(player.realName, 'chatChars', 'add', count)
})

// 跳跃
mc.listen('onJump', (player) => {
  if (player.isSimulatedPlayer()) { return }
  db.set(player.realName, 'jumped', 'add', 1)
})

// 生物受伤
mc.listen('onMobHurt', (mob, source, damage, cause) => {
  if (mob?.isPlayer()) {
    const pl = mob.toPlayer()
    if (!pl.isSimulatedPlayer()) {
      db.set(pl.realName, 'damageTaken', 'add', damage)
    }
  }
  if (source?.isPlayer()) {
    const pl = source.toPlayer()
    if (!pl.isSimulatedPlayer()) {
      db.set(pl.realName, 'damageDealt', 'add', damage)
    }
  }
})

// 骑乘 尝试骑乘的实体 被骑乘的实体
mc.listen('onRide', (entity1, entity2) => {
  if (entity1?.isPlayer()) {
    const player = entity1.toPlayer()
    if (!player.isSimulatedPlayer()) {
      player.setExtraData('riding', entity2.type)
    }
  }
})

// 吃食物
mc.listen('onAte', (player, item) => {
  if (player.isSimulatedPlayer()) { return }
  db.set(player.realName, 'ate', 'add', 1)
  if (defaultPlayerData.subStats.ate.hasOwnProperty(item.type)) {
    db.setSub(player.realName, 'ate', item.type, 'add', 1)
  }
})

// 消耗图腾
mc.listen('onConsumeTotem', (player) => {
  if (player.isSimulatedPlayer()) { return }
  db.set(player.realName, 'totem', 'add', 1)
})

// 玩家对方快使用物品
mc.listen('onUseItemOn', (player, item, block, side, pos) => {
  const hoes = [
    'minecraft:wooden_hoe',
    'minecraft:stone_hoe',
    'minecraft:iron_hoe',
    'minecraft:diamond_hoe',
    'minecraft:golden_hoe',
    'minecraft:netherite_hoe'
  ]
  if (preFarmlandBlocks.includes(block.type) && hoes.includes(item.type)) {
    const blockPosStr = posToString(block.pos)
    setTimeout(() => {
      if (newFarmlands.has(blockPosStr)) {
        newFarmlands.delete(blockPosStr)
        db.set(player.realName, 'tilled', 'add', 1)
      }
    }, 5)
  } else if (cakes.includes(block.type)) {
    const blockPosStateStr = posToString(block.pos) + block.getBlockState()?.['bite_counter']
    setTimeout(() => {
      if (cakesAten.has(blockPosStateStr)) {
        cakesAten.delete(blockPosStateStr)
        db.set(player.realName, 'ate', 'add', 1)
      }
    }, 5)
  }
})

// 活塞推动
mc.listen('onPistonPush', (pistonPos, block) => {
  if (listenMovePlacedBlocks.includes(block.type)) {
    if (db.hasPlacedBlock(block.pos)) {
      db.deletePlacedBlock(block.pos)
      listenMovePlacedBlocksQueue.push(true)
    } else {
      listenMovePlacedBlocksQueue.push(false)
    }
  }
})

// 方块改变
mc.listen('onBlockChanged', (beforeBlock, afterBlock) => {
  if (beforeBlock.type === 'minecraft:moving_block' && listenMovePlacedBlocks.includes(afterBlock.type) && listenMovePlacedBlocksQueue.shift()) {
    db.addPlacedBlock(beforeBlock.pos)
  } else if (listenPlacedBlocks.includes(beforeBlock.type)) {
    if ((!redstoneOres.includes(beforeBlock.type) || !redstoneOres.includes(afterBlock.type)) && (!deepslateRedstoneOres.includes(beforeBlock.type) || !deepslateRedstoneOres.includes(afterBlock.type))) {
      setTimeout(() => {
        db.deletePlacedBlock(beforeBlock.pos)
      }, 5)
    }
  } else if (afterBlock.type === 'minecraft:farmland' && preFarmlandBlocks.includes(beforeBlock.type)) {
    const blockPosStr = posToString(beforeBlock.pos)
    newFarmlands.add(blockPosStr)
    setTimeout(() => {
      newFarmlands.delete(blockPosStr)
    }, 40)
  } else if (cakes.includes(beforeBlock.type) && (beforeBlock.getBlockState()?.['bite_counter'] ?? 0) + 1 === (afterBlock.getBlockState()?.['bite_counter'] ?? 7)) {
    const blockPosStateStr = posToString(beforeBlock.pos) + beforeBlock.getBlockState()?.['bite_counter']
    cakesAten.add(blockPosStateStr)
    setTimeout(() => {
      cakesAten.delete(blockPosStateStr)
    }, 40)
  }
})

// 破坏方块
mc.listen('onDestroyBlock', (player, block) => {
  const cropsGrownData = {
    'minecraft:wheat': [7],
    'minecraft:potatoes': [7],
    'minecraft:carrots': [7],
    'minecraft:beetroot': [7],
    'minecraft:pitcher_crop': [4],
    'minecraft:torchflower_crop': [7],
    'minecraft:nether_wart': [3],
    'minecraft:cocoa': [8, 9, 10, 11]
  }
  const litRedstoneOres = [
    'minecraft:lit_redstone_ore',
    'minecraft:lit_deepslate_redstone_ore'
  ]
  if (player.isSimulatedPlayer()) { return }
  db.set(player.realName, 'destroyed', 'add', 1)
  if (defaultPlayerData.subStats.harvested.hasOwnProperty(block.type)) {
    if (cropsGrownData.hasOwnProperty(block.type) && cropsGrownData[block.type].includes(block.tileData)) {
      db.set(player.realName, 'harvested', 'add', 1)
      db.setSub(player.realName, 'harvested', block.type, 'add', 1)
    } else if (!db.hasPlacedBlock(block.pos)) {
      db.set(player.realName, 'harvested', 'add', 1)
      db.setSub(player.realName, 'harvested', block.type, 'add', 1)
    }
    return
  } else if ((defaultPlayerData.subStats.overworldMined.hasOwnProperty(block.type) || litRedstoneOres.includes(block.type)) && !db.hasPlacedBlock(block.pos)) {
    db.set(player.realName, 'overworldMined', 'add', 1)
    if (redstoneOres.includes(block.type)) {
      db.setSub(player.realName, 'overworldMined', 'minecraft:redstone_ore', 'add', 1)
    } else if (deepslateRedstoneOres.includes(block.type)) {
      db.setSub(player.realName, 'overworldMined', 'minecraft:deepslate_redstone_ore', 'add', 1)
    } else {
      db.setSub(player.realName, 'overworldMined', block.type, 'add', 1)
    }
  } else if (defaultPlayerData.subStats.netherMined.hasOwnProperty(block.type) && !db.hasPlacedBlock(block.pos)) {
    db.set(player.realName, 'netherMined', 'add', 1)
    db.setSub(player.realName, 'netherMined', block.type, 'add', 1)
  }
})


// 放置方块
mc.listen('afterPlaceBlock', (player, block) => {
  if (player.isSimulatedPlayer()) { return }
  db.set(player.realName, 'placed', 'add', 1)
  if (defaultPlayerData.subStats.planted.hasOwnProperty(block.type)) {
    db.set(player.realName, 'planted', 'add', 1)
    db.setSub(player.realName, 'planted', block.type, 'add', 1)
  }
  if (listenPlacedBlocks.includes(block.type)) {
    db.addPlacedBlock(block.pos)
  }
})

// 获得经验
mc.listen('onExperienceAdd', (player, exp) => {
  if (player.isSimulatedPlayer()) { return }
  db.set(player.realName, 'expObtained', 'add', exp)
  const playerLevel = player.getLevel()
  if (playerLevel > db.get(player.realName, 'highestLevel')) {
    db.set(player.realName, 'highestLevel', 'set', playerLevel)
  }
})

// 弹射物创建完毕
// mc.listen('onProjectileCreated', (shooter, entity) => {
//   if (shooter?.isPlayer() && entity.type === 'minecraft:ender_pearl') {
//     const pl = shooter.toPlayer()
//     if (!pl.isSimulatedPlayer()) {
//     }
//   }
// })

// 钓鱼
mc.listen('onPlayerPullFishingHook', (player, entity, item) => {
  if (player.isSimulatedPlayer()) { return }
  if (entity.type === 'minecraft:item') { // 钓鱼
    db.set(player.realName, 'fished', 'add', 1)
    if (fishingLootTable.fish.includes(item.type)) { // 鱼
      db.setSub(player.realName, 'fished', 'fish', 'add', 1)
    } else if (fishingLootTable.junk.includes(item.type) && !item.isEnchanted) { // 垃圾
      db.setSub(player.realName, 'fished', 'junk', 'add', 1)
    } else { // 宝藏
      db.setSub(player.realName, 'fished', 'treasure', 'add', 1)
    }
  } else { // 钩实体
    db.set(player.realName, 'hooked', 'add', 1)
  }
})

// ==============================================================================================

class DataBase {
  #kvdb
  #db
  #databaseSaveInterval
  #playerDataTemplate
  #placedBlocks
  #dbPath
  #backupFlag
  #mountQueue
  #unmountQueue
  #backupLocation

  #saveTimer

  constructor(dbPath, playerDataTemplate, databaseSaveInterval, backupLocation) {
    this.#databaseSaveInterval = databaseSaveInterval
    this.#backupFlag = false
    this.#playerDataTemplate = playerDataTemplate
    this.#dbPath = dbPath
    this.#kvdb = new KVDatabase(dbPath)
    this.#db = new Map()
    this.#mountQueue = []
    this.#unmountQueue = []
    this.#backupLocation = backupLocation
    if (!this.#kvdb) {
      return null
    }
    if (!this.#kvdb.get('data')) {
      this.#kvdb.set('data', {
        lastUpdate: Date.now(),
        placedBlocks: []
      })
    } else {
      if (this.#kvdb.get('data').lastUpdate > Date.now()) {
        this.#timeErr(this.#kvdb.get('data').lastUpdate)
        return null
      }
    }
    this.#placedBlocks = new Set(this.#kvdb.get('data').placedBlocks)
    this.#createSaveTimer()
  }

  #createSaveTimer() {
    this.#saveTimer = setInterval(() => {
      this.#dbSaveAll()
    }, this.#databaseSaveInterval)
  }

  #clearSaveTimer() {
    clearInterval(this.#saveTimer)
  }

  #timeErr(time) {
    logger.error(`数据库最后更新时间为${new Date(time).toLocaleString()}，晚于当前系统时间${new Date().toLocaleString()}，请更新系统时间后重试`)
  }

  // 更新保存时间
  #dbUpdateTime() {
    let data = this.#kvdb.get('data')
    data.lastUpdate = Date.now()
    this.#kvdb.set('data', data)
  }

  // 数据载入内存
  #dbMount(name) {
    if (this.#backupFlag) {
      this.#mountQueue.push(name)
      this.#db.set(name, this.#cleanData(null))
    } else {
      this.#db.set(name, this.#cleanData(this.#kvdb.get(name)))
    }
  }

  // 保存并从内存中卸载
  #dbUnmount(name) {
    if (!this.#db.has(name)) { return }
    if (this.#backupFlag) {
      this.#unmountQueue.push(name)
    } else {
      this.#kvdb.set(name, this.#db.get(name))
      this.#db.delete(name)
      this.#dbUpdateTime()
    }
  }

  // 保存所有内存中的数据(包括放置方块数据)
  #dbSaveAll() {
    for (let [key, value] of this.#db) {
      this.#kvdb.set(key, value)
    }
    let data = this.#kvdb.get('data')
    data.placedBlocks = Array.from(this.#placedBlocks)
    data.lastUpdate = Date.now()
    this.#kvdb.set('data', data)
  }

  // 保存并卸载所有内存中的数据
  #dbUnmountAll() {
    for (let [key, value] of this.#db) {
      this.#kvdb.set(key, value)
      this.#db.delete(key)
    }
    this.#dbUpdateTime()
  }

  // 挂载并获取玩家
  #dbMountQuery(name) {
    if (this.#db.has(name)) {
      return this.#db.get(name)
    } else {
      this.#dbMount(name)
      return this.#db.get(name)
    }
  }

  // 获取玩家
  #dbQuery(name) {
    if (this.#db.has(name)) {
      return this.#db.get(name)
    } else {
      if (this.#backupFlag) {
        return this.#cleanData(null)
      } else {
        return this.#cleanData(this.#kvdb.get(name))
      }
    }
  }

  // 数据合并
  #dataAssign(obj1, obj2) {
    let assignedObj = {}
    Object.keys(obj1).forEach(key => {
      if (typeof obj1[key] === 'object') {
        if (obj2?.hasOwnProperty(key)) {
          assignedObj[key] = this.#dataAssign(obj1[key], obj2[key])
        } else {
          assignedObj[key] = this.#dataAssign(obj1[key], null)
        }
      } else {
        if (obj2?.hasOwnProperty(key)) {
          assignedObj[key] = obj1[key] + obj2[key]
        } else {
          assignedObj[key] = obj1[key]
        }
      }
    })
    if (obj2?.hasOwnProperty('lastOnline') && assignedObj.lastOnline < obj2.lastOnline) {
      assignedObj.lastOnline = obj2.lastOnline
    }
    return assignedObj
  }

  // 洗数据
  #cleanData(playerData) {
    return this.#dataAssign(this.#playerDataTemplate, playerData)
  }

  // 获取方块放置记录
  getPlacedBlocks() {
    return this.#placedBlocks
  }

  // 设置新的方块放置记录
  addPlacedBlock(intPos) {
    return this.#placedBlocks.add([intPos.x, ',', intPos.y, ',', intPos.z, ',', intPos.dimid].join(''))
  }

  // 删除方块放置记录
  deletePlacedBlock(intPos) {
    return this.#placedBlocks.delete([intPos.x, ',', intPos.y, ',', intPos.z, ',', intPos.dimid].join(''))
  }

  // 查询是否存在方块放置记录
  hasPlacedBlock(intPos) {
    return this.#placedBlocks.has([intPos.x, ',', intPos.y, ',', intPos.z, ',', intPos.dimid].join(''))
  }

  // 查询是否有该玩家的数据
  hasPlayer(name) {
    const names = new Set([...this.#kvdb.listKey(), ...this.#db.keys()])
    return names.has(name)
  }

  // 获取玩家某一项统计
  get(name, key) {
    return this.#dbQuery(name)[key]
  }

  // 获取玩家某一子项统计
  getSub(name, key, subKey) {
    return this.#dbQuery(name).subStats[key][subKey]
  }

  // 获取玩家所有统计
  getPlayer(name) {
    return this.#dbQuery(name)
  }

  getPlayers() {
    let namesSet = null
    if (this.#backupFlag) {
      namesSet = new Set(this.#db.keys())
    } else {
      namesSet = new Set([...this.#kvdb.listKey(), ...this.#db.keys()])
    }
    namesSet.delete('data')
    const names = Array.from(namesSet)
    let statsArray = []
    for (let i = 0; i < names.length; i++) {
      statsArray.push({ name: names[i], data: this.getPlayer(names[i]) })
    }
    return statsArray
  }

  // 获取某一项的排行
  getRanking(key) {
    function sort(items, left = 0, right = items.length - 1) {
      function swap(items, leftIndex, rightIndex) {
        let temp = items[leftIndex]
        items[leftIndex] = items[rightIndex]
        items[rightIndex] = temp
      }
      function partition(items, left, right) {
        let pivot = items[Math.floor((right + left) / 2)],
          i = left,
          j = right
        while (i <= j) {
          while (items[i].data > pivot.data) {
            i++
          }
          while (items[j].data < pivot.data) {
            j--
          }
          if (i <= j) {
            swap(items, i, j)
            i++
            j--
          }
        }
        return i
      }
      let index
      if (items.length > 1) {
        index = partition(items, left, right)
        if (left < index - 1) {
          sort(items, left, index - 1)
        }
        if (index < right) {
          sort(items, index, right)
        }
      }
      return items
    }
    const namesSet = new Set([...this.#kvdb.listKey(), ...this.#db.keys()])
    namesSet.delete('data')
    const names = Array.from(namesSet)
    let ranking = []
    for (let i = 0; i < names.length; i++) {
      ranking.push({ name: names[i], data: this.getPlayer(names[i])[key] })
    }
    return sort(ranking)
  }

  // 设置玩家某一项统计
  set(name, key, operator, value) {
    let playerData = this.#dbMountQuery(name)
    switch (operator) {
      case 'set':
        playerData[key] = value
        break
      case 'add':
        playerData[key] += value
        break
      case 'reduce':
        playerData[key] -= value
        break
      default:
        return false
    }
    this.#db.set(name, playerData)
    return true
  }

  // 设置某一子项统计
  setSub(name, key, subKey, operator, value) {
    let playerData = this.#dbMountQuery(name)
    switch (operator) {
      case 'set':
        playerData.subStats[key][subKey] = value
        break
      case 'add':
        playerData.subStats[key][subKey] += value
        break
      case 'reduce':
        playerData.subStats[key][subKey] -= value
        break
      default:
        return false
    }
    this.#db.set(name, playerData)
    return true
  }

  // 设置玩家所有统计
  setPlayer(name, playerData) {
    this.#db.set(name, playerData)
    return true
  }

  // 删除某个玩家统计信息
  deletePlayer(name) {
    this.#db.delete(name)
    this.#kvdb.delete(name)
    this.#dbUpdateTime()
    return true
  }

  // 内存中卸载玩家数据
  unmountPlayer(name) {
    this.#dbUnmount(name)
  }

  // 数据库热备份
  dbBackup() {
    this.#clearSaveTimer()
    this.#backupFlag = true
    this.#dbSaveAll()
    this.#kvdb.close()

    let success = false
    const timeObj = system.getTimeObj()
    const path = [this.#backupLocation, '/', timeObj.Y, '-', timeObj.M < 10 ? '0' + timeObj.M : timeObj.M, '-', timeObj.D < 10 ? '0' + timeObj.D : timeObj.D, '_', timeObj.h < 10 ? '0' + timeObj.h : timeObj.h, '-', timeObj.m < 10 ? '0' + timeObj.m : timeObj.m, '-', timeObj.s < 10 ? '0' + timeObj.s : timeObj.s].join('')
    if (File.exists(path)) {
      success = false
    } else {
      if (!File.mkdir(path)) {
        success = false
      } else {
        if (File.copy(this.#dbPath, path)) {
          success = true
        } else {
          success = false
        }
      }
    }
    this.#kvdb = new KVDatabase(this.#dbPath)
    this.#backupFlag = false
    while (this.#mountQueue.length !== 0) {
      const name = this.#mountQueue.shift()
      this.#db.set(name, this.#dataAssign(this.#db.get(name), this.#kvdb.get(name)))
    }
    while (this.#unmountQueue.length !== 0) {
      this.#dbUnmount(this.#unmountQueue.shift())
    }
    this.#createSaveTimer()
    return success
  }
}