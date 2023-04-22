const defaultConfig = {
  playTimeInterval: 10,
  dbUpdateInterval: 1000
}

const config = new JsonConfigFile('plugins/PlayerStatsTracker/config.json', data.toJson(defaultConfig))
const playTimeInterval = Math.floor(config.get('playTimeInterval')) || defaultConfig.playTimeInterval
const dbUpdateInterval = Math.floor(config.get('dbUpdateInterval')) || defaultConfig.dbUpdateInterval

const defaultPlayerData = {
  death: 0, // 死亡次数
  killed: 0, // 击杀数
  damageTaken: 0, // 受到的伤害
  damageDealt: 0, // 造成的伤害
  destroyed: 0, // 破坏方块数
  placed: 0, // 放置方块数
  planted: 0, // 种植次数
  harvested: 0, // 收获次数
  ate: 0, // 吃掉的食物数
  totem: 0, // 消耗的图腾数
  chat: 0, // 聊天消息条数
  chatChars: 0, // 聊天消息字符数
  jumped: 0, // 跳跃次数
  expObtained: 0, // 累计获得的经验数
  highestLevel: 0, // 最高到达的等级
  playTime: 0, // 游玩时间（10秒记一次）
  lastOnline: 0, // 最后在线时间
  loginDays: 0, // 登录天数
  distanceWalked: 0, // 行走距离
  distanceFlown: 0, // 飞行距离
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
    }
  }
}

ll.registerPlugin('PlayerStatsTracker', 'Track player stats.', [1, 0, 0])

let command1 = mc.newCommand('stats', '查看统计信息', PermType.Any)
command1.optional('player', ParamType.String)
command1.overload(['player'])
command1.setCallback((cmd, origin, output, results) => {
  if (results.player) {
    if (!origin.player) {
      if (!data.name2xuid(results.player)) {
        output.error('无此玩家')
      } else {
        outputStats(results.player)
      }
    } else {
      if (origin.player.isOP() || results.player === origin.player.realName) {
        if (!data.name2xuid(results.player)) {
          output.error('无此玩家')
        } else {
          showStats(results.player)
        }
      } else {
        output.error('你无权查询其他玩家')
      }
    }
  } else {
    if (!origin.player) {
      output.error('请指定玩家')
    } else {
      showStats(origin.player.realName)
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

let command3 = mc.newCommand('statsbackup', '备份统计信息数据库', PermType.Console)
command3.overload([])
command3.setCallback((cmd, origin, output, results) => {
  File.mkdir()
  File.copy()
})
command3.setup()

let db
let cakeTimers = new Map()
let melonTimers = new Map()
let pumpkinTimers = new Map()
mc.listen('onServerStarted', () => {
  db = new DataBase('./plugins/PlayerStatsTracker/data/', defaultPlayerData, dbUpdateInterval)
})

function showStats(name) {
  logger.info(data.toJson(db.getPlayer(name), 4))
}

function outputStats(name) {
  logger.info(data.toJson(db.getPlayer(name), 4))
}

function updateLastOnline(name) {
  if (new Date(db.get(name, 'lastOnline')).toLocaleDateString('zh-CN') < new Date().toLocaleDateString('zh-CN')) {
    db.set(name, 'loginDays', 'add', 1)
  }
  db.set(name, 'lastOnline', 'set', Date.now())
}

// 进入游戏
mc.listen('onJoin', (player) => {
  if (player.isSimulatedPlayer()) { return }
  updateLastOnline(player.realName)
  player.setExtraData('playTimeTimer', setInterval(() => {
    db.set(player.realName, 'playTime', 'add', playTimeInterval)
    updateLastOnline(player.realName)
  }, playTimeInterval * 1000))
})

// 离开游戏
mc.listen('onLeft', (player) => {
  if (player.isSimulatedPlayer()) { return }
  clearInterval(player.getExtraData('playTimeTimer'))
  player.delExtraData('playTimeTimer')
  updateLastOnline(player.realName)
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
        db.setSub(player.realName, 'killed', mob.type, 'add', 1)
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

// // 物品栏改变
// mc.listen('onInventoryChange', (player,slotNum,oldItem,newItem) => {
//   logger.info('old ',oldItem.getNbt().toString(4))
//   logger.info('new ',newItem.getNbt().toString(4))
// })

// 跳跃
mc.listen('onJump', (player) => {
  if (player.isSimulatedPlayer()) { return }
  db.set(player.realName, 'jumped', 'add', 1)
})

// 潜行
mc.listen('onSneak', (player, isSneaking) => {

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

// // 玩家对方快使用物品
// mc.listen('onUseItemOn', (player,item,block,side,pos) => {
//   logger.info(block.type)
// })

// // 方块改变
// mc.listen('onBlockChanged', (beforeBlock,afterBlock) => {
//   logger.info(beforeBlock.type,':',beforeBlock.tileData,'  ',afterBlock.type,':',afterBlock.tileData)
// })

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
  if (player.isSimulatedPlayer()) { return }
  db.set(player.realName, 'destroyed', 'add', 1)
  if (defaultPlayerData.subStats.harvested.hasOwnProperty(block.type)) {
    if (cropsGrownData.hasOwnProperty(block.type) && cropsGrownData[block.type].includes(block.tileData)) {
      db.set(player.realName, 'harvested', 'add', 1)
      db.setSub(player.realName, 'harvested', block.type, 'add', 1)
      return
    }
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
})

// 疾跑
mc.listen('onChangeSprinting', (player, sprinting) => {
  if (player.isSimulatedPlayer()) { return }
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

// ==============================================================================================
class DataBase {
  defaultPlayerData
  dbUpdateInterval
  kvdb

  constructor(str, defaultPlayerData, dbUpdateInterval) {
    this.defaultPlayerData = defaultPlayerData
    Object.freeze(this.defaultPlayerData)
    this.dbUpdateInterval = dbUpdateInterval
    this.kvdb = new KVDatabase(str)
    if (!this.kvdb) {
      this.readErr()
      return null
    }
    if (!this.kvdb.get('data')) {
      this.kvdb.set('data', {
        lastUpdate: Date.now()
      })
    } else {
      if (this.kvdb.get('data').lastUpdate > Date.now()) {
        this.timeErr(this.kvdb.get('data').lastUpdate)
        return null
      }
    }
  }

  readErr() {
    logger.error('打开数据库文件失败')
  }

  writeErr() {
    logger.error('写入数据库文件失败')
  }

  timeErr(time) {
    logger.error(`数据库最后更新时间为${new Date(time).toLocaleString}，晚于当前系统时间${new Date().toLocaleString}，请更新系统时间后重试`)
  }

  dbUpdateTime() {
    let data = this.kvdb.get('data')
    data.lastUpdate = Date.now()
    this.kvdb.set('data', data)
  }

  dataAssign(obj1, obj2) {
    let assignedObj = {}
    Object.keys(obj1).forEach(key => {
      if (typeof obj1[key] === 'object' && obj2?.hasOwnProperty(key)) {
        assignedObj[key] = this.dataAssign(obj1[key], obj2[key])
      } else if (obj2?.hasOwnProperty(key)) {
        assignedObj[key] = obj2[key]
      } else {
        assignedObj[key] = obj1[key]
      }
    })
    return assignedObj
  }

  // 洗数据
  cleanData(playerData) {
    return this.dataAssign(defaultPlayerData, playerData)
  }

  // 获取玩家某一项统计
  get(name, key) {
    return this.cleanData(this.kvdb.get(name))[key]
  }

  // 获取玩家某一子项统计
  getSub(name, key, subKey) {
    return this.cleanData(this.kvdb.get(name)).subStats[key][subKey]
  }

  // 获取玩家所有统计
  getPlayer(name) {
    return this.cleanData(this.kvdb.get(name))
  }

  // 设置玩家某一项统计
  set(name, key, operator, value) {
    const playerData = this.kvdb.get(name)
    if (!playerData?.hasOwnProperty(key)) {
      if (!this.kvdb.set(name, this.cleanData(playerData))) {
        this.writeErr()
        return false
      }
      return this.set(name, key, operator, value)
    }
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
    if (!this.kvdb.set(name, this.cleanData(playerData))) {
      this.writeErr()
      return false
    }
    this.dbUpdateTime()
    return true
  }

  // 设置某一子项统计
  setSub(name, key, subKey, operator, value) {
    const playerData = this.getPlayer(name)
    if (!playerData?.subStats?.[key]?.hasOwnProperty(subKey)) {
      if (!this.kvdb.set(name, this.cleanData(playerData))) {
        this.writeErr()
        return false
      }
      return this.set(name, key, subKey, operator, value)
    }
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
    if (!this.kvdb.set(name, this.cleanData(playerData))) {
      this.writeErr()
      return false
    }
    this.dbUpdateTime()
    return true
  }

  // 设置玩家所有统计
  setPlayer(name, playerData) {
    if (!this.kvdb.set(name, this.cleanData(playerData))) {
      this.writeErr()
      return false
    }
    this.dbUpdateTime()
    return true
  }

  // 删除某个玩家统计信息
  deletePlayer(name) {
    if (!this.kvdb.delete(name)) {
      this.writeErr()
      return false
    }
    this.dbUpdateTime()
    return true
  }
}