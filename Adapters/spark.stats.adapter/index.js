const defaultConfig = {
  admins: [],
  statsCmd: '统计信息',
  rankingCmd: '排行榜'
}
const config = new JsonConfigFile('./plugins/sparkbridge/spark.stats.adapter/config.json',data.toJson(defaultConfig))
const admins = config.get('admins') || defaultConfig.admins
const statsCmd = config.get('statsCmd') || defaultConfig.statsCmd
const rankingCmd = config.get('rankingCmd') || defaultConfig.rankingCmd
const group = new JsonConfigFile('./plugins/sparkbridge/spark.mc/config.json').get('group') || 0
ll.require('PlayerStatsTracker.js')

let getFormatedStats

function onStart(adapter) {
  getFormatedStats = ll.import('PlayerStatsTracker', 'getFormatedStats')
  const getFormatedRanking = ll.import('PlayerStatsTracker', 'getFormatedRanking')
  const getRankingKeyList = ll.import('PlayerStatsTracker', 'getRankingKeyList')
  const rankingKeyList = getRankingKeyList()
  let formatedRankingKeyList = ''
  for (let i = 0; i < rankingKeyList.length; i++) {
    formatedRankingKeyList += `\n${i}. ${rankingKeyList[i].text}`
  }

  adapter.on('bot.message.private', (e) => {
    const { raw_message, sender } = e
    if (raw_message.startsWith(statsCmd)) {
      const playerName = new JsonConfigFile('./plugins/sparkbridge/spark.mc/data/xuid.json').get(sender.user_id.toString())
      if (raw_message === statsCmd) {
        if (playerName !== undefined) {
          adapter.sendFriendMsg(sender.user_id, getStatsStr(playerName))
        } else {
          adapter.sendFriendMsg(sender.user_id, '请先绑定白名单')
        }
      } else if (raw_message.startsWith(statsCmd + ' ')) {
        const queryName = raw_message.substring(statsCmd.length + 1, raw_message.length)
        if(admins.includes(sender.user_id) || isOP(playerName)) {
          adapter.sendFriendMsg(sender.user_id, getStatsStr(queryName))
        } else {
          if(playerName !== undefined) {
            if(playerName === queryName) {
              adapter.sendFriendMsg(sender.user_id, getStatsStr(queryName))
            } else {
              adapter.sendFriendMsg(sender.user_id, '你无权查询其他玩家')
            }
          } else {
            adapter.sendFriendMsg(sender.user_id, '你无权查询其他玩家')
          }
        }
      }
    } else if (raw_message.startsWith(rankingCmd)) {
      if (raw_message === rankingCmd) {
        adapter.sendFriendMsg(sender.user_id, `请使用“${rankingCmd} <编号>”来查询某一项统计数据的排行榜${formatedRankingKeyList}`)
      } else if (raw_message.startsWith(rankingCmd + ' ')) {
        const num = parseInt(raw_message.substring(rankingCmd.length + 1, raw_message.length))
        if (num !== NaN && num >= 0 && num < rankingKeyList.length) {
          adapter.sendFriendMsg(sender.user_id, `排行榜-${rankingKeyList[num].text}\n${getFormatedRanking(rankingKeyList[num].key)}`)
        } else {
          adapter.sendFriendMsg(sender.user_id, `不存在此编号，请使用“${rankingCmd}”来查看编号信息`)
        }
      }
    }
  })
}

function isOP(name) {
  const xuid = data.name2xuid(name)
  const permissionList = data.parseJson(File.readFrom('./permissions.json'))
  for (let i = 0; i < permissionList.length; i++) {
    if (permissionList[i].xuid == xuid) {
      if (permissionList[i].permission === 'operator') {
        return true
      } else {
        return false
      }
    }
  }
  return false
}

function getStatsStr(name) {
  const statsStr = getFormatedStats(name)
  if (statsStr == null) {
    return `玩家${name}无数据`
  } else {
    return `${name}的统计\n${statsStr}`
  }
}

function info() {
  return {
    name: 'spark.stats.adapter',
    desc: 'PlayerStatsTracker适配器-群内查询玩家统计数据和排行榜',
    author: 'FtyLollipop',
    version: [1, 0, 0]
  }
}

module.exports = { onStart, info }