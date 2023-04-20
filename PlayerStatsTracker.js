const config = data.toJson(new JsonConfigFile('plugins/PlayerStatsTracker/config.json'))

ll.registerPlugin('PlayerStatsTracker', 'Track player stats', [1, 0, 0])

let db = new KVDatabase('./plugins/PlayerStatsTracker/data')