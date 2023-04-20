const defaultConfig = {
  death: true,
  chat: true,
  jump: true,
  sneak: true,
  eat: true,
  totem: true,
  destroy: true,
  place: true,
  sprinting : true,
  xp: true
}
const config = data.parseJson(new JsonConfigFile('plugins/PlayerStatsTracker/config.json', data.toJson(defaultConfig)))

ll.registerPlugin('PlayerStatsTracker', 'Track player stats.', [1, 0, 0])

let db = new KVDatabase('./plugins/PlayerStatsTracker/data')

// 进入游戏
mc.listen('onJoin', (player) => {

})

// 离开游戏
mc.listen('onLeft', (player) => {

})

// 死亡
mc.listen('onPlayerDie', (player, source) => {

})

// 聊天
mc.listen('onChat', (player, msg) => {

})

// 跳跃
mc.listen('onPlayerJump', (player) => {

})

// 潜行
mc.listen('onSneak', (player, isSneaking) => {

})

// 吃食物
mc.listen('onAte', (player, item) => {

})

// 消耗图腾
mc.listen('onConsumeTotem', (player) => {

})

// 破坏方块
mc.listen('onDestroyBlock', (player) => {

})

// 放置方块
mc.listen('onPlaceBlock', (player) => {

})

// 疾跑
mc.listen('onChangeSprinting', (player, sprinting) => {

})

// 获得经验
mc.listen('onExperienceAdd', (player, sprinting) => {

})