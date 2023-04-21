const defaultConfig = {
}

const config = data.parseJson(new JsonConfigFile('plugins/PlayerStatsTracker/config.json', data.toJson(defaultConfig)))
const crops = [
  'mineraft:weat',
  'mineraft:potatoes',
  'mineraft:carrots',
  'minecraft:melon_stem',
  'minecraft:pumpkin_stem',
  'minecraft:beetroot',
  'minecraft:pitcher_crop',
  'minecraft:torchflower_crop'
]

const defaultPlayerData = {
  death: 0,
  killed: 0,
  damageTaken: 0,
  damageDealt: 0,
  destroyed: 0,
  placed: 0,
  ate: 0,
  totem: 0,
  expObtained: 0,
  highestLevel: 0,
  playTime: 0,
  distanceWalked: 0,
  distanceFlown: 0,
  subStats: {
    ate: {
      "minecraft:golden_apple": 0,
      "minecraft:enchanted_golden_apple": 0
    },
    killed: {
      "minecraft:horse": 0
    },
    planted: {
      'mineraft:weat': 0,
      'mineraft:potatoes': 0,
      'mineraft:carrots': 0,
      'minecraft:melon_stem': 0,
      'minecraft:pumpkin_stem': 0,
      'minecraft:beetroot': 0,
      'minecraft:pitcher_crop': 0,
      'minecraft:torchflower_crop': 0
    }
  }
}

ll.registerPlugin('PlayerStatsTracker', 'Track player stats.', [1, 0, 0])

const command1 = mc.newCommand('stats', '查看统计信息', PermType.Any)
command1.optional('player', ParamType.String)
command1.overload(['player'])
command1.setCallback((cmd, origin, output, results) => {
  if (!results.player) {
    if (!origin.player) {
      outputStats(results.player)
    } else {
      if (results.player.isOP() || results.player === origin.player.realName) {
        showStats(results.player)
      } else {
        output.err('你无权查询其他玩家')
      }
    }
  } else {
    if (!origin.player) {
      output.error('请指定玩家')
    } else {
      showStats(origin.player)
    }
  }
})
command1.setup()

const command2 = mc.newCommand('backup', '备份统计信息数据库', PermType.Console)
command2.overload([])
command2.setCallback((cmd, origin, output, results) => {
  File.mkdir()
  File.copy()
})
command2.setup()

let db = new DataBase('./plugins/PlayerStatsTracker/data', defaultPlayerData)

class DataBase {
  kvdb
  defaultPlayerData

  constructor(str, defaultPlayerData) {
    this.kvdb = new KVDatabase(str)
    this.defaultPlayerData = defaultPlayerData
    if (!this.kvdb) {
      this.readErr()
    }
  }

  readErr() {
    logger.error('打开数据库文件失败')
  }

  writeErr() {
    logger.error('写入数据库文件失败')
  }

  // 洗数据
  cleanData(playerData) {
    let cleanedData = Object.assign(defaultPlayerData, playerData)
    cleanedData.subStats = Object.assign(defaultPlayerData.subStats, playerData.subStats)
    Object.keys(cleanedData.subStats).forEach(key => {
      cleanedData.subStats[key] = Object.assign(defaultPlayerData.subStats[key], playerData.subStats[key])
    });
    return cleanedData
  }

  // 获取玩家某一项统计
  get(name, key) {
    return Object.assign(defaultPlayerData, this.kvdb.get(name))?.[key]
  }

  // 获取玩家所有统计
  getPlayer(name) {
    return this.cleanData(this.kvdb.get(name))
  }

  // 设置玩家某一项统计
  set(name, key, operator, value) {
    const playerData = this.kvdb.get(name)
    if (!playerData?.[key]) {
      if (!this.kvdb.set(name, Object.assign(defaultPlayerData, playerData))) {
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
    if (!this.kvdb.set(name, Object.assign(defaultPlayerData, playerData))) {
      this.writeErr()
      return false
    }
    return true
  }

  // 设置某一子项统计
  setSub(name, key, subKey, operator, value) {
    const playerData = this.getPlayer(name)
    if (!playerData?.[key]?.[subKey]) {
      if (!this.kvdb.set(name, this.cleanData(playerData))) {
        this.writeErr()
        return false
      }
      return this.set(name, key, subKey, operator, value)
    }
    switch (operator) {
      case 'set':
        playerData[key][subKey] = value
        break
      case 'add':
        playerData[key][subKey] += value
        break
      case 'reduce':
        playerData[key][subKey] -= value
        break
      default:
        return false
    }
    if (!this.kvdb.set(name, Object.assign(defaultPlayerData, playerData))) {
      this.writeErr()
      return false
    }
    return true
  }

  // 设置玩家所有统计
  setPlayer(name, playerData) {
    if (!this.kvdb.set(name, this.cleanData(playerData))) {
      this.writeErr()
      return false
    }
    return true
  }

  // 删除某个玩家统计信息
  removePlayer(name) {
    if (!this.kvdb.remove(name)) {
      this.writeErr()
      return false
    }
    return true
  }
}

function showStats(name) {

}

function outputStats(name) {

}

// 进入游戏
mc.listen('onJoin', (player) => {

})

// 离开游戏
mc.listen('onLeft', (player) => {

})

// 死亡
mc.listen('onPlayerDie', (player, source) => {
  if (!player.isSimulatedPlayer()) {
    db.set(player.realName, 'death', 'add', 1)
  }
})

// 生物死亡
mc.listen('onMobDie', (mob, source, cause) => {
  if (source?.isPlayer()) {
    const pl = source.toPlayer()
    if (!pl.isSimulatedPlayer()) {
      db.set(pl.realName, 'kill', 'add', 1)
    }
  }
})

// 聊天
mc.listen('onChat', (player, msg) => {
  if (!player.isSimulatedPlayer()) {
    db.set(player.realName, 'chat', 'add', 1)
  }
})

// 跳跃
mc.listen('onPlayerJump', (player) => {
  if (!player.isSimulatedPlayer()) {
    db.set(player.realName, 'jump', 'add', 1)
  }
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

})

// 吃食物
mc.listen('onAte', (player, item) => {
  if (!player.isSimulatedPlayer()) {
    db.set(player.realName, 'ate', 'add', 1)
  }
})

// 消耗图腾
mc.listen('onConsumeTotem', (player) => {
  if (!player.isSimulatedPlayer()) {
    db.set(player.realName, 'totem', 'add', 1)
  }
})

// 破坏方块
mc.listen('onDestroyBlock', (player, block) => {
  if (!player.isSimulatedPlayer()) {
    db.set(player.realName, 'destroyed', 'add', 1)
  }
})

// 放置方块
mc.listen('afterPlaceBlock', (player, block) => {
  if (!player.isSimulatedPlayer()) {
    db.set(player.realName, 'placed', 'add', 1)
    if (crops.includes(block.type)) {
      db.set(player.realName, 'planted', 'add', 1)
    }
  }
})

// 疾跑
mc.listen('onChangeSprinting', (player, sprinting) => {

})

// 获得经验
mc.listen('onExperienceAdd', (player, exp) => {
  if (!player.isSimulatedPlayer()) {
    db.set(player.realName, 'expObtained', 'add', exp)
    const playerLevel = player.getLevel()
    if (playerLevel > db.get(player.realName, 'highestLevel')) {
      db.set(player.realName, 'highestLevel', 'set', playerLevel)
    }
  }
})

// 弹射物创建完毕
mc.listen('onProjectileCreated', (shooter, entity) => {

})

// 方块被弹射物击中
mc.listen('onProjectileHitBlock', (block, source) => {

})

// 实体被弹射物击中
mc.listen('onProjectileHitEntity', (entity, source) => {

})