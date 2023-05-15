# PlayerStatsTracker - 玩家统计信息

基本功能：

- 持续统计多种玩家信息
- 查看玩家统计信息
- 查看排行榜
- 删除玩家所有统计信息
- 映射统计信息到计分板
- 导出统计信息到csv
- 数据库备份
- 一些API导出可供其他插件使用

最后经验证支持的BDS版本：1.19.81.01

## 基本使用

### 菜单（游戏内使用）

`/stats [player]` 打开统计信息菜单

- `[player]` 要查询的玩家名称，为空时为自己

`/ranking` 打开排行榜菜单

`/statsmapping` 打开计分板映射菜单

### 命令（控制台使用）

`stats <player>` 查看玩家统计信息

- `<player>` 要查询的玩家名称

`ranking [number]` 查看排行榜

- `[number]` 要查询的排行榜编号，为空时列出所有可用编号

`statsmodify list players` 查看可以修改的玩家列表

`statsmodify list numbers` 查看可以修改的统计信息编号列表

`statsmodify <set|add|reduce> <player> <value> <number> <subnumber>` 设置/增加/减少玩家统计信息的值

- `<set|add|reduce>` 要进行的修改操作，设置/增加/减少
- `<player>` 要设置的玩家名称
- `<value>` 要设置的值
- `<number>` 要设置的统计信息编号
- `<subnumber>` 要设置的统计信息子项编号

`statsmodify delete <player>` 删除玩家所有统计信息

- `<player>` 要删除的玩家名称

`statsexport ` 导出统计信息到csv文件

`statsbackup` 备份统计信息数据库

`statsmapping list mappings` 查看计分板映射列表

`statsmapping list numbers ` 查看映射可用的统计信息编号列表

`statsmapping add <objective> <number>` 添加计分板映射

- `<objective>` 要添加映射的计分项
- `<key>` 要映射到的统计信息编号

`statsmapping remove <objective> ` 删除计分板映射

- `<objective>` 要删除映射的计分项

`statsmapping reload <objective> ` 重载计分板映射

- `<objective>` 要重载的计分项

`statsmapping reloadall ` 重载全部计分板映射

## 安装

1. 安装LiteLoaderBDS。
2. 将`PlayerStatsTracker.js`放到`BDS根目录\plugins`目录中。
3. 运行BDS。

## 配置

第一次运行时会生成配置文件`BDS根目录\plugins\PlayerStatsTracker\config.json`。

请不要在实际配置文件中添加注释，LiteLoaderBDS不支持带注释的配置文件。

配置文件说明：

```json
{
    "language": "zh_CN", // 显示语言，可选中文(zh_CN)或英文(en_US)
    "timezone": { // 时区
        "auto": true, // 是否使用系统时区，true为是，false为否
        "offset": 8 // 时区偏移小时数，仅支持整数，仅在不使用系统时区时生效
    },
    "backupLocation": "./plugins/PlayerStatsTracker/backups", // 数据库备份位置
    "exportLocation": "./plugins/PlayerStatsTracker/exports", // 数据导出位置
    "databaseSaveInterval": 10000 // 数据库保存间隔时间（毫秒）
}
```

## 可统计的项目

### 基础信息

| 名称             | 子项       | 说明                                     |
| ---------------- | ---------- | ---------------------------------------- |
| 最后在线时间     |            |                                          |
| 游玩时间         |            | 最小单位为秒                             |
| 登录天数         |            |                                          |
| 破坏方块数       |            |                                          |
| 放置方块数       |            |                                          |
| 跳跃次数         |            |                                          |
| 移动距离         | 总数       | 包括末影珍珠传送和命令传送等一切移动距离 |
|                  | 乘船       | 包含船和运输船                           |
|                  | 乘矿车     |                                          |
|                  | 骑马属     | 包含马、骷髅马、僵尸马、驴、骡           |
|                  | 骑猪       |                                          |
|                  | 骑炽足兽   |                                          |
|                  | 鞘翅飞行   |                                          |
| 消耗的不死图腾数 |            |                                          |
| 聊天次数         |            |                                          |
| 聊天字符数       |            |                                          |
| 累计获得经验     |            |                                          |
| 最高等级         |            |                                          |
| 吃掉食物数       | 总数       | 包括蛋糕片                               |
|                  | 金苹果     |                                          |
|                  | 附魔金苹果 |                                          |

### 战斗

| 名称         | 子项     | 说明                         |
| ------------ | -------- | ---------------------------- |
| 击杀数       | 总数     |                              |
|              | 马属     |                              |
|              | 流浪商人 |                              |
|              | 行商羊驼 |                              |
|              | 铁傀儡   |                              |
|              | 监守者   |                              |
|              | 凋灵     |                              |
|              | 末影龙   |                              |
| 死亡数       |          |                              |
| 累计造成伤害 |          | 盔甲减免前，包括死亡溢出伤害 |
| 累计受到伤害 |          | 盔甲减免前，包括死亡溢出伤害 |

### 挖矿

| 名称       | 子项           | 说明             |
| ---------- | -------------- | ---------------- |
| 主世界挖矿 | 总数           | 手动放置的不计入 |
|            | 煤矿石         |                  |
|            | 深层煤矿石     |                  |
|            | 铁矿石         |                  |
|            | 深层铁矿石     |                  |
|            | 铜矿石         |                  |
|            | 深层铜矿石     |                  |
|            | 青金石矿石     |                  |
|            | 深层青金石矿石 |                  |
|            | 金矿石         |                  |
|            | 深层金矿石     |                  |
|            | 红石矿石       |                  |
|            | 深层红石矿石   |                  |
|            | 钻石矿石       |                  |
|            | 深层钻石矿石   |                  |
|            | 绿宝石矿石     |                  |
|            | 深层绿宝石矿石 |                  |
| 下界挖矿   | 总数           | 手动放置的不计入 |
|            | 下界石英矿石   |                  |
|            | 下界金矿石     |                  |
|            | 远古残骸       |                  |

### 种植

| 名称     | 子项       | 说明               |
| -------- | ---------- | ------------------ |
| 耕地次数 |            |                    |
| 种植次数 | 总数       |                    |
|          | 小麦种子   |                    |
|          | 甜菜种子   |                    |
|          | 马铃薯     |                    |
|          | 胡萝卜     |                    |
|          | 西瓜种子   |                    |
|          | 南瓜种子   |                    |
|          | 火把花种子 |                    |
|          | 瓶子草荚果 |                    |
|          | 可可豆     |                    |
|          | 下界疣     |                    |
| 收获次数 | 总数       | 未完全成熟的不计入 |
|          | 小麦       |                    |
|          | 甜菜根     |                    |
|          | 马铃薯     |                    |
|          | 胡萝卜     |                    |
|          | 西瓜       | 手动放置的不计入   |
|          | 南瓜       | 手动放置的不计入   |
|          | 火把花     |                    |
|          | 瓶子草     |                    |
|          | 可可果     |                    |
|          | 下界疣     |                    |

### 钓鱼

| 名称       | 子项 | 说明 |
| ---------- | ---- | ---- |
| 钓鱼次数   | 总数 |      |
|            | 鱼   |      |
|            | 宝藏 |      |
|            | 垃圾 |      |
| 钩实体次数 |      |      |

## 数据库备份恢复

1. 关服
2. 把`BDS根目录\plugins\PlayerStatsTracker\data`中的文件全部删除
3. 把备份的数据库文件放进去
4. 开服

## API导出

```javascript
// getStats(name) 获取玩家统计信息对象
ll.exports(getStats, 'PlayerStatsTracker', 'getStats')
// getFormatedStats(name) 获取格式化的玩家统计信息字符串
ll.exports(getFormatedStats, 'PlayerStatsTracker', 'getFormatedStats')
// getRanking(key) 获取排行榜数组，传参为某一项排行榜的键名
ll.exports(getRanking, 'PlayerStatsTracker', 'getRanking')
// getFormatedRanking(key) 获取格式化的排行榜字符串，传参为某一项排行榜的键名
ll.exports(getFormatedRanking, 'PlayerStatsTracker', 'getFormatedRanking')
// getRankingKeyList() 获取排行榜可用键名和说明的数组
ll.exports(getRankingKeyList, 'PlayerStatsTracker', 'getRankingKeyList')
```

