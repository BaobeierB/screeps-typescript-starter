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
import { enableBuild, enableRepair, enableUpgradeController } from "../config";

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
 */
export function repair(creep: Creep) {
  if (!enableRepair) return false;
  const repairTargets = creep.room.find(FIND_STRUCTURES, {
    filter: s => s.hits < s.hitsMax
  }).sort((a, b) => (b.hitsMax - b.hits) - (a.hitsMax - a.hits));
  for (const target of repairTargets) {
    const repairAmount = Math.min(target.hitsMax - target.hits, creep.store[RESOURCE_ENERGY] * 100);
    if (repairAmount >= creep.store[RESOURCE_ENERGY] * 100) {
      creep.say("修理");
      if (creep.repair(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: "#00aaff" } });
      }
      return true;
    }
  }
  return false;
}

/**
 * 建造工地
 */
export function build(creep: Creep) {
  if (!enableBuild) return false;
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
 */
export function upgrade(creep: Creep) {
  if (!enableUpgradeController || !creep.room.controller) return false;
  creep.say("升级");
  if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#00ffff" } });
  }
  return true;
}
