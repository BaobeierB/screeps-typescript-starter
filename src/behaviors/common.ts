/**
 * 拾取掉落能量
 */
export function pickupDroppedEnergy(creep: Creep) {
  const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
    filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 0
  });
  if (dropped) {
    creep.say("捡能量");
    if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
      creep.moveTo(dropped, { visualizePathStyle: { stroke: "#ff8800" } });
    }
    return true;
  }
  return false;
}


/**
 * 采集能量
 */
export function harvest(creep: Creep) {
  creep.say("采集");
  const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
  if (source) {
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  }
}

/**
 * 存储能量
 */
export function store(creep: Creep) {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: s => (
      (s.structureType === STRUCTURE_SPAWN ||
        s.structureType === STRUCTURE_EXTENSION ||
        s.structureType === STRUCTURE_STORAGE ||
        s.structureType === STRUCTURE_CONTAINER)
      && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    )
  });
  if (target) {
    creep.say("存储");
    if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
    }
    return true;
  }
  return false;
}



/**
 * 修理建筑
 * 持续修理同一目标直到能量耗尽或目标修满
 */
export function repair(creep: Creep) {
  // 优先修理记忆中的目标
  let target: Structure | null = null;
  if (creep.memory.repairTargetId) {
    target = Game.getObjectById<Structure>(creep.memory.repairTargetId);
    // 如果目标不存在或已修满，清除记忆
    if (!target || target.hits >= target.hitsMax) {
      creep.memory.repairTargetId = undefined;
      target = null;
    }
  }
  // 没有目标则重新查找
  if (!target) {
    const repairTargets = creep.room.find(FIND_STRUCTURES, {
      filter: s => s.hits < s.hitsMax
    }).sort((a, b) => (b.hitsMax - b.hits) - (a.hitsMax - a.hits));
    if (repairTargets.length > 0) {
      target = repairTargets[0];
      creep.memory.repairTargetId = target.id;
    }
  }
  if (target) {
    creep.say("修理");
    if (creep.repair(target) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: "#00aaff" } });
    }
    return true;
  }
  return false;
}

/**
 * 建造工地
 * 只负责执行建造目标，不负责分配数量
 */
export function build(creep: Creep) {
  const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
  if (site) {
    creep.say("建造");
    if (creep.build(site) === ERR_NOT_IN_RANGE) {
      creep.moveTo(site, { visualizePathStyle: { stroke: "#00ff00" } });
    }
    return true;
  }
  return false;
}

/**
 * 升级控制器
 * 只负责执行升级目标，不负责分配数量
 */
export function upgrade(creep: Creep) {
  if (!creep.room.controller) return false;
  creep.say("升级");
  if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#00ffff" } });
  }
  return true;
}
