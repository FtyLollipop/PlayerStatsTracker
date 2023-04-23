const defaultConfig = {
  playTimeInterval: 10,
  placedBlocksSaveInterval: 10000
}

const config = new JsonConfigFile('plugins/PlayerStatsTracker/config.json', data.toJson(defaultConfig))
const playTimeInterval = Math.floor(config.get('playTimeInterval')) || defaultConfig.playTimeInterval
const placedBlocksSaveInterval = Math.floor(config.get('placedBlocksSaveInterval')) || defaultConfig.placedBlocksSaveInterval

const format = {

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
  mined: 0, // 挖矿数
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
    mined: { // 具体采矿数
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
      'minecraft:deepslate_emerald_ore': 0,
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
          showStats(origin.player, results.player)
        }
      } else {
        output.error('你无权查询其他玩家')
      }
    }
  } else {
    if (!origin.player) {
      output.error('请指定玩家')
    } else {
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

let command3 = mc.newCommand('statsbackup', '备份统计信息数据库', PermType.Console)
command3.overload([])
command3.setCallback((cmd, origin, output, results) => {
  File.mkdir()
  File.copy()
})
command3.setup()

let db
let newFarmlands = new Set()
// 服务器启动
mc.listen('onServerStarted', () => {
  db = new DataBase('./plugins/PlayerStatsTracker/data/', defaultPlayerData, placedBlocksSaveInterval)
})

function showStats(player, name) {
  let form = mc.newSimpleForm()
  form.setTitle(name + '的统计')
  form.setContent(formatStats(db.getPlayer(name)))
  player.sendForm(form, () => {
  })
}

function outputStats(name) {
  logger.info(data.toJson(db.getPlayer(name), 4))
}

function formatStats(stats) {
  let str = `
死亡: ${stats.death}
击杀: ${stats.killed}
累计造成伤害: ${stats.damageDealt}
累计受到伤害: ${stats.damageTaken}
破坏方块: ${stats.destroyed}
放置方块: ${stats.placed}
`

  return str
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
  } else if ((defaultPlayerData.subStats.mined.hasOwnProperty(block.type) || litRedstoneOres.includes(block.type)) && !db.hasPlacedBlock(block.pos)) {
    db.set(player.realName, 'mined', 'add', 1)
    if (redstoneOres.includes(block.type)) {
      db.setSub(player.realName, 'mined', 'minecraft:redstone_ore', 'add', 1)
    } else if (deepslateRedstoneOres.includes(block.type)) {
      db.setSub(player.realName, 'mined', 'minecraft:deepslate_redstone_ore', 'add', 1)
    } else {
      db.setSub(player.realName, 'mined', block.type, 'add', 1)
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

// ==============================================================================================
class DataBase {
  playerDataTemplate
  placedBlocks
  kvdb

  constructor(str, playerDataTemplate, placedBlocksSaveInterval) {
    this.playerDataTemplate = playerDataTemplate
    Object.freeze(this.playerDataTemplate)
    this.kvdb = new KVDatabase(str)
    if (!this.kvdb) {
      this.readErr()
      return null
    }
    if (!this.kvdb.get('data')) {
      this.kvdb.set('data', {
        lastUpdate: Date.now(),
        placedBlocks: []
      })
    } else {
      if (this.kvdb.get('data').lastUpdate > Date.now()) {
        this.timeErr(this.kvdb.get('data').lastUpdate)
        return null
      }
    }
    this.placedBlocks = new Set(this.kvdb.get('data').placedBlocks)
    setInterval(() => {
      this.savePlacedBlocks()
    }, placedBlocksSaveInterval)
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
    return this.dataAssign(this.playerDataTemplate, playerData)
  }

  // 获取方块放置记录
  getPlacedBlocks() {
    return this.placedBlocks
  }

  // 设置新的方块放置记录
  addPlacedBlock(intPos) {
    return this.placedBlocks.add([intPos.x, ',', intPos.y, ',', intPos.z, ',', intPos.dimid].join(''))
  }

  deletePlacedBlock(intPos) {
    return this.placedBlocks.delete([intPos.x, ',', intPos.y, ',', intPos.z, ',', intPos.dimid].join(''))
  }

  // 查询是否存在方块放置记录
  hasPlacedBlock(intPos) {
    return this.placedBlocks.has([intPos.x, ',', intPos.y, ',', intPos.z, ',', intPos.dimid].join(''))
  }

  // 保存方块放置记录
  savePlacedBlocks() {
    let data = this.kvdb.get('data')
    data.placedBlocks = Array.from(this.placedBlocks)
    data.lastUpdate = Date.now()
    this.kvdb.set('data', data)
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