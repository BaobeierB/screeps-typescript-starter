import { maxUpgraders } from "../config";

/**
 * 控制器升级者（upgrader）创建逻辑
 * 只要最大数量未达上限，就尝试创建升级者
 */
export function spawnUpgraders(spawn: StructureSpawn) {
  if (maxUpgraders <= 0) return;
  const upgraders = Object.values(Game.creeps).filter(c => c.memory.role === "upgrader");
  if (upgraders.length >= maxUpgraders) return;

  // 动态生成身体部件，和 worker 类似
  const body: BodyPartConstant[] = [WORK, CARRY, MOVE];
  const name = `Upgrader${Game.time}`;
  spawn.spawnCreep(body, name, {
    memory: {
      role: "upgrader",
      room: spawn.room.name,
      upgrading: false
    }
  });
}

/**
 * 控制器升级者行为逻辑
 * 1. 从有能量的容器/存储中取能量
 * 2. 升级控制器
 */
export function runUpgraders(spawn: StructureSpawn) {
  const upgraders = Object.values(Game.creeps).filter(c => c.memory.role === "upgrader");
  if (upgraders.length === 0) return;

  upgraders.forEach(creep => {
    // 初始化状态
    if (!creep.memory.state) creep.memory.state = "withdraw";

    switch (creep.memory.state) {
      case "withdraw": {
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          // 寻找最近的有能量的容器或存储
          const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0
          });
          if (target) {
            if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
          }
        } else {
          creep.memory.state = "upgrade";
        }
        break;
      }
      case "upgrade": {
        if (creep.store[RESOURCE_ENERGY] > 0) {
          if (creep.upgradeController(creep.room.controller!) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller!, { visualizePathStyle: { stroke: '#ffffff' } });
          }
        } else {
          creep.memory.state = "withdraw";
        }
        break;
      }
    }
  });
}
