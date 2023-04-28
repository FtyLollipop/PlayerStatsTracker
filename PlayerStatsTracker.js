ll.registerPlugin('PlayerStatsTracker', 'Track player stats.', [1, 0, 0])

const defaultConfig = {
  timezone: 8,
  backupLocation: './plugins/PlayerStatsTracker/backups',
  databaseSaveInterval: 10000
}

const config = new JsonConfigFile('./plugins/PlayerStatsTracker/config.json', data.toJson(defaultConfig))
const timezone = config.get('timezone') || defaultConfig.timezone
const backupLocation = config.get('backupLocation') || defaultConfig.backupLocation
const databaseSaveInterval = Math.floor(config.get('databaseSaveInterval')) || defaultConfig.databaseSaveInterval

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
  distanceWalked: 0, // 行走距离
  distanceFlown: 0, // 飞行距离
  distanceMoved: 0, // 移动距离
  subStats: {
    ate: { // 具体吃掉的食物数
      "minecraft:golden_apple": 0,
      "minecraft:enchanted_golden_apple": 0
    },
    killed: { // 具体击杀数
      "minecraft:horse": 0,
      "minecraft:donkey": 0,
      "minecraft:mule": 0,
      "minecraft:wandering_trader": 0
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

const rankingKeys = [
  {
    text: '§0基础信息', keys: [
      { text: '游玩时间', key: 'playTime' },
      { text: '登录天数', key: 'loginDays' },
      { text: '破坏方块', key: 'destroyed' },
      { text: '放置方块', key: 'placed' },
      { text: '跳跃', key: 'jumped' },
      { text: '消耗的不死图腾', key: 'totem' },
      { text: '聊天数', key: 'chat' },
      { text: '聊天字符数', key: 'chatChars' },
      { text: '累计经验', key: 'expObtained' },
      { text: '最高等级', key: 'highestLevel' },
      { text: '吃掉食物', key: 'ate' }
    ]
  },
  {
    text: '§c战斗', keys: [
      { text: '击杀', key: 'killed' },
      { text: '死亡', key: 'death' },
      { text: '累计造成伤害', key: 'damageDealt' },
      { text: '累计受到伤害', key: 'damageTaken' }
    ]
  },
  {
    text: '§8挖矿', keys: [
      { text: '主世界挖矿', key: 'overworldMined' },
      { text: '下界挖矿', key: 'netherMined' }
    ]
  },
  {
    text: '§2种植', keys: [
      { text: '耕地', key: 'tilled' },
      { text: '种植', key: 'planted' },
      { text: '收获', key: 'harvested' }
    ]
  }
]

let rankingKeyList = []

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
          output.success(`排行榜-${rankingKeyList[results.number].text}\n${formatRanking(db.getRanking(rankingKeyList[results.number].key), false, secToTime)}`)
        } else {
          output.success(`排行榜-${rankingKeyList[results.number].text}\n${formatRanking(db.getRanking(rankingKeyList[results.number].key), false)}`)
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

let db
let newFarmlands = new Set()
// 服务器启动
mc.listen('onServerStarted', () => {
  db = new DataBase('./plugins/PlayerStatsTracker/data/', defaultPlayerData, databaseSaveInterval, backupLocation)
  buildRankingKeyList()
})

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

  return db.getRanking(key)
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

function buildRankingKeyList() {
  for (let i = 0; i < rankingKeys.length; i++) {
    rankingKeyList = rankingKeyList.concat(rankingKeys[i].keys)
  }
}

function showStats(player, name) {
  const easterEgg = '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n害翻，害翻，真以为你有那么多事值得统计啊？'
  let form = mc.newSimpleForm()
  form.setTitle(name + '的统计')
  form.setContent(formatStats(db.getPlayer(name), true) + easterEgg)
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
    subOptionsFormId = id
    subOptionsForm = mc.newSimpleForm()
    subOptionsForm.setTitle('统计排行榜-' + rankingKeys[id].text)
    for (let i = 0; i < rankingKeys[id].keys.length; i++) {
      subOptionsForm.addButton(rankingKeys[id].keys[i].text)
    }
    player.sendForm(subOptionsForm, subOptionsFormHandler)
  }

  function subOptionsFormHandler(player, id) {
    if (id == null) {
      player.sendForm(optionsForm, optionsFormHandler)
    } else {
      let rankingForm = mc.newSimpleForm()
      rankingForm.setTitle('统计排行榜-' + rankingKeys[subOptionsFormId].keys[id].text)
      if (rankingKeys[subOptionsFormId].keys[id].key === 'playTime') {
        rankingForm.setContent(formatRanking(db.getRanking(rankingKeys[subOptionsFormId].keys[id].key), true, secToTime))
      } else {
        rankingForm.setContent(formatRanking(db.getRanking(rankingKeys[subOptionsFormId].keys[id].key), true))
      }
      player.sendForm(rankingForm, rankingFormHandler)
    }
  }

  function rankingFormHandler(player, data) {
    player.sendForm(subOptionsForm, subOptionsFormHandler)
  }
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
  const h = date.getUTCHours() + parseInt(timezone)
  let dateObj = date
  if (h >= 24) {
    dateObj = new Date(date.valueOf() + 86400000)
  } else if (h < 0) {
    dateObj = new Date(date.valueOf() - 86400000)
  }
  const Y = dateObj.getUTCFullYear()
  const M = dateObj.getUTCMonth() + 1
  const D = dateObj.getUTCDate()
  return format.replace('YYYY', Y).replace('MM', M < 10 ? '0' + M : M).replace('DD', D < 10 ? '0' + D : D).replace('M', M).replace('D', D)
}

function dateToTimeString(date, format = 'hh:mm:ss') {
  let h = date.getUTCHours() + parseInt(timezone)
  const m = date.getUTCMinutes()
  const s = date.getUTCSeconds()
  if (h >= 24) {
    h -= 24
  } else if (h < 0) {
    h += 24
  }
  return format.replace('hh', h < 10 ? '0' + h : h).replace('mm', m < 10 ? '0' + m : m).replace('ss', s < 10 ? '0' + s : s).replace('h', h).replace('m', m).replace('s', s)
}

function formatStats(stats, colorful) {
  const reg = /§./g
  let str = `§l========== 基础 ==========§r
最后在线时间: ${dateToString(new Date(stats.lastOnline))}
游玩时间: ${secToTime(stats.playTime)}
登录天数: ${stats.loginDays}
破坏方块: ${stats.destroyed}
放置方块: ${stats.placed}
跳跃: ${stats.jumped}
消耗的不死图腾: ${stats.totem}
聊天数: ${stats.chat}
聊天字符数: ${stats.chatChars}
累计经验: ${stats.expObtained}
最高等级: ${stats.highestLevel}
吃掉食物: ${stats.ate}
  - 金苹果: ${stats.subStats.ate['minecraft:golden_apple']}
  - 附魔金苹果: ${stats.subStats.ate['minecraft:enchanted_golden_apple']}

§c§l========== 战斗 ==========§r
击杀: ${stats.killed}
  - 马属: ${stats.subStats.killed['minecraft:horse'] + stats.subStats.killed['minecraft:donkey'] + stats.subStats.killed['minecraft:mule']}
  - 流浪商人: ${stats.subStats.killed['minecraft:wandering_trader']}
死亡: ${stats.death}
累计造成伤害: ${stats.damageDealt}
累计受到伤害: ${stats.damageTaken}

§7§l========== 挖矿 ==========§r
主世界挖矿: ${stats.overworldMined}
  - 煤矿石: ${stats.subStats.overworldMined['minecraft:coal_ore']}
  - 深层煤矿石: ${stats.subStats.overworldMined['minecraft:deepslate_coal_ore']}
  - 铁矿石: ${stats.subStats.overworldMined['minecraft:iron_ore']}
  - 深层铁矿石: ${stats.subStats.overworldMined['minecraft:deepslate_iron_ore']}
  - 铜矿石: ${stats.subStats.overworldMined['minecraft:copper_ore']}
  - 深层铜矿石: ${stats.subStats.overworldMined['minecraft:deepslate_copper_ore']}
  - 青金石矿石: ${stats.subStats.overworldMined['minecraft:lapis_ore']}
  - 深层青金石矿石: ${stats.subStats.overworldMined['minecraft:deepslate_lapis_ore']}
  - 金矿石: ${stats.subStats.overworldMined['minecraft:gold_ore']}
  - 深层金矿石: ${stats.subStats.overworldMined['minecraft:deepslate_gold_ore']}
  - 红石矿石: ${stats.subStats.overworldMined['minecraft:redstone_ore']}
  - 深层红石矿石: ${stats.subStats.overworldMined['minecraft:deepslate_redstone_ore']}
  - 钻石矿石: ${stats.subStats.overworldMined['minecraft:diamond_ore']}
  - 深层钻石矿石: ${stats.subStats.overworldMined['minecraft:deepslate_diamond_ore']}
  - 绿宝石矿石: ${stats.subStats.overworldMined['minecraft:emerald_ore']}
  - 深层绿宝石矿石: ${stats.subStats.overworldMined['minecraft:deepslate_emerald_ore']}
下界挖矿: ${stats.netherMined}
  - 下界石英矿石: ${stats.subStats.netherMined['minecraft:quartz_ore']}
  - 下界金矿石: ${stats.subStats.netherMined['minecraft:nether_gold_ore']}
  - 远古残骸: ${stats.subStats.netherMined['minecraft:ancient_debris']}

§2§l========== 种植 ==========§r
耕地: ${stats.tilled}
种植: ${stats.planted}
  - 小麦种子: ${stats.subStats.planted['minecraft:wheat']}
  - 甜菜种子: ${stats.subStats.planted['minecraft:beetroot']}
  - 马铃薯: ${stats.subStats.planted['minecraft:potatoes']}
  - 胡萝卜: ${stats.subStats.planted['minecraft:carrots']}
  - 西瓜种子: ${stats.subStats.planted['minecraft:melon_stem']}
  - 南瓜种子: ${stats.subStats.planted['minecraft:pumpkin_stem']}
  - 火把花种子: ${stats.subStats.planted['minecraft:torchflower_crop']}
  - 瓶子草荚果: ${stats.subStats.planted['minecraft:pitcher_crop']}
  - 可可豆: ${stats.subStats.planted['minecraft:cocoa']}
  - 下界疣: ${stats.subStats.planted['minecraft:nether_wart']}
收获: ${stats.harvested}
  - 小麦: ${stats.subStats.harvested['minecraft:wheat']}
  - 甜菜根: ${stats.subStats.harvested['minecraft:beetroot']}
  - 马铃薯: ${stats.subStats.harvested['minecraft:potatoes']}
  - 胡萝卜: ${stats.subStats.harvested['minecraft:carrots']}
  - 西瓜: ${stats.subStats.harvested['minecraft:melon_block']}
  - 南瓜: ${stats.subStats.harvested['minecraft:pumpkin']}
  - 火把花: ${stats.subStats.harvested['minecraft:torchflower_crop']}
  - 瓶子草: ${stats.subStats.harvested['minecraft:pitcher_crop']}
  - 可可果: ${stats.subStats.harvested['minecraft:cocoa']}
  - 下界疣: ${stats.subStats.harvested['minecraft:nether_wart']}`
  return colorful ? str : str.replace(reg, '')
}

function formatRanking(ranking, colorful, func = (str) => { return str }) {
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
    if(i !== 0) {
      str +='\n'
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

// 更新最后在线时间和登录天数
function updateLastOnline(name) {
  if (dateToDateString(new Date(db.get(name, 'lastOnline'))) < dateToDateString(new Date())) {
    db.set(name, 'loginDays', 'add', 1)
  }
  db.set(name, 'lastOnline', 'set', Date.now())
}

// 进入游戏
mc.listen('onJoin', (player) => {
  if (player.isSimulatedPlayer()) { return }
  updateLastOnline(player.realName)
  player.setExtraData('playTimeTimer', setInterval(() => {
    db.set(player.realName, 'playTime', 'add', 1)
    updateLastOnline()
  }, 1000))
})

// 离开游戏
mc.listen('onLeft', (player) => {
  if (player.isSimulatedPlayer()) { return }
  clearInterval(player.getExtraData('playTimeTimer'))
  player.delExtraData('playTimeTimer')
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

// 使用物品
mc.listen('onUseItem', (player, item) => {

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
    const pl = entity1.toPlayer()
    if (!pl.isSimulatedPlayer()) {
      // something
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
  if (hoes.includes(item.type) && preFarmlandBlocks.includes(block.type)) {
    const blockPosStr = [block.pos.x, ',', block.pos.y, ',', block.pos.z, ',', block.pos.dimid].join('')
    setTimeout(() => {
      if (newFarmlands.has(blockPosStr)) {
        newFarmlands.delete(blockPosStr)
        db.set(player.realName, 'tilled', 'add', 1)
      }
    }, 5)
  }
})

// 方块改变
mc.listen('onBlockChanged', (beforeBlock, afterBlock) => {
  if (listenPlacedBlocks.includes(beforeBlock.type)) {
    if ((!redstoneOres.includes(beforeBlock.type) || !redstoneOres.includes(afterBlock.type)) && (!deepslateRedstoneOres.includes(beforeBlock.type) || !deepslateRedstoneOres.includes(afterBlock.type))) {
      setTimeout(() => {
        db.deletePlacedBlock(beforeBlock.pos)
      }, 5)
    }
  } else if (afterBlock.type === 'minecraft:farmland' && preFarmlandBlocks.includes(beforeBlock.type)) {
    const blockPosStr = [beforeBlock.pos.x, ',', beforeBlock.pos.y, ',', beforeBlock.pos.z, ',', beforeBlock.pos.dimid].join('')
    newFarmlands.add(blockPosStr)
    setTimeout(() => {
      newFarmlands.delete(blockPosStr)
    }, 50)
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
mc.listen('onProjectileCreated', (shooter, entity) => {
  if (entity.type === 'minecraft:fishing_hook') {
  }
})

// 方块被弹射物击中
mc.listen('onProjectileHitBlock', (block, source) => {

})

// 实体被弹射物击中
mc.listen('onProjectileHitEntity', (entity, source) => {

})

// 疾跑
mc.listen('onChangeSprinting', (player, sprinting) => {
  if (player.isSimulatedPlayer()) { return }
})

// 潜行
mc.listen('onSneak', (player, isSneaking) => {

})

// 钓鱼
mc.listen('onPlayerPullFishingHook', (player, entity, item) => {

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
      this.#db.set(name, this.#playerDataTemplate)
    } else {
      this.#db.set(name, this.#cleanData(this.#kvdb.get(name)))
    }
  }

  // 保存并从内存中卸载
  #dbUnmount(name) {
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

  // 数据合并
  #dataAssign(obj1, obj2) {
    let assignedObj = {}
    Object.keys(obj1).forEach(key => {
      if (typeof obj1[key] === 'object' && obj2?.hasOwnProperty(key)) {
        assignedObj[key] = this.#dataAssign(obj1[key], obj2[key])
      } else if (obj2?.hasOwnProperty(key)) {
        assignedObj[key] = obj1[key] + obj2[key]
      } else {
        assignedObj[key] = obj1[key]
      }
    })
    if (obj2?.hasOwnProperty('lastOnline')) {
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
    if (this.#db.has(name)) {
      return this.#db.get(name)[key]
    } else {
      return this.#cleanData(this.#kvdb.get(name))[key]
    }
  }

  // 获取玩家某一子项统计
  getSub(name, key, subKey) {
    if (this.#db.has(name)) {
      return this.#db.get(name).subStats[key][subKey]
    } else {
      return this.#cleanData(this.#kvdb.get(name)).subStats[key][subKey]
    }
  }

  // 获取玩家所有统计
  getPlayer(name) {
    if (this.#db.has(name)) {
      return this.#db.get(name)
    } else {
      return this.#cleanData(this.#kvdb.get(name))
    }
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
    const names = Array.from(new Set([...this.#kvdb.listKey(), ...this.#db.keys()]))
    let ranking = []
    for (let i = 0; i < names.length; i++) {
      if (names[i] !== 'data') {
        ranking.push({ name: names[i], data: this.getPlayer(names[i])[key] })
      }
    }
    return sort(ranking)
  }

  // 设置玩家某一项统计
  set(name, key, operator, value) {
    let playerData = this.getPlayer(name)
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
    let playerData = this.getPlayer(name)
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
    const path = [this.#backupLocation, '/', timeObj.Y, '-', timeObj.M, '-', timeObj.D, ' ', timeObj.h, '.', timeObj.m, '.', timeObj.s].join('')
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
      this.#dbMount(this.#mountQueue.shift())
    }
    while (this.#unmountQueue.length !== 0) {
      this.#dbUnmount(this.#unmountQueue.shift())
    }
    this.#createSaveTimer()
    return success
  }
}