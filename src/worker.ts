import { maxWorkers } from "config";

import { harvest, store, repair, build, upgrade, pickupDroppedEnergy } from "behaviors/common";

/**
 * 根据能量上限自动生成最优 worker 身体部件
 * 设计原则：
 * 1. 以 [WORK, CARRY, MOVE] 为一组，单组消耗 200 能量，保证采集、搬运、移动能力均衡
 * 2. 尽可能多组，最大不超过 50 个部件（Screeps 单个 creep 身体上限）
 * 3. 剩余能量优先补充 CARRY 和 MOVE，提升搬运和机动性
 * 4. 充分利用能量上限，避免浪费
 * @param energyCapacity 房间最大可用能量（room.energyCapacityAvailable）
 * @returns 最优 worker 身体部件数组
 */
export function generateOptimalWorkerBody(energyCapacity: number): BodyPartConstant[] {
  const body: BodyPartConstant[] = [];
  const unitCost = 200; // 一组 [WORK, CARRY, MOVE] 的能量消耗
  const unitParts: BodyPartConstant[] = [WORK, CARRY, MOVE];
  // 计算最多能生成多少组
  const maxUnits = Math.floor(energyCapacity / unitCost);
  const maxBodyParts = 50;
  // 受身体上限约束，最多能有多少组
  const units = Math.min(maxUnits, Math.floor(maxBodyParts / 3));
  // 堆叠完整组
  for (let i = 0; i < units; i++) {
    body.push(...unitParts);
  }
  // 计算剩余能量
  let remaining = energyCapacity - units * unitCost;
  // 用剩余能量补充 CARRY 和 MOVE，优先保证搬运和移动能力
  while (body.length < maxBodyParts && remaining >= 50) {
    if (remaining >= 50) {
      body.push(CARRY);
      remaining -= 50;
    }
    if (body.length < maxBodyParts && remaining >= 50) {
      body.push(MOVE);
      remaining -= 50;
    }
  }
  return body;
}

/**
 * 工人创建逻辑
 * 只要有能量建筑未满或有工地，就尝试创建工人，数量不超过 maxWorkers
 */
export function spawnWorkers(spawn: StructureSpawn) {
  // 统计当前工人数
  const workers = Object.values(Game.creeps).filter(c => c.memory.role === "worker");
  if (workers.length >= maxWorkers) return;

  // 检查是否有能量建筑未满
  const energyTargets = spawn.room.find(FIND_STRUCTURES, {
    filter: s => (
      (s.structureType === STRUCTURE_SPAWN ||
        s.structureType === STRUCTURE_EXTENSION ||
        s.structureType === STRUCTURE_STORAGE ||
        s.structureType === STRUCTURE_CONTAINER)
      && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    )
  });
  // 检查是否有工地
  const sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
  if (energyTargets.length === 0 && sites.length === 0) return;

  // 动态生成最优 worker 身体部件
  const body = generateOptimalWorkerBody(spawn.room.energyCapacityAvailable);
  const name = `Worker${Game.time}`;
  spawn.spawnCreep(body, name, {
    memory: {
      role: "worker",
      room: spawn.room.name,
      working: false
    }
  });
}

/**
 * 工人工作逻辑（状态机版）
 * - 每个工人有自己的状态：'harvest'（采集）、'build'（建造）、'store'（存储）
 * - 采集时必须采满，建造时必须用完能量，存储时也要用完能量
 * - 一半工人分配建造，另一半分配采集/存储，单数多出来的优先采集/存储
 */
export function runWorkers(spawn: StructureSpawn) {
  const workers = Object.values(Game.creeps).filter(c => c.memory.role === "worker");
  if (workers.length === 0) return;



  workers.forEach((creep, i) => {
    // 初始化状态
    if (!creep.memory.state) {
      creep.memory.state = "harvest";
    }

    // 状态机逻辑
    switch (creep.memory.state) {
      case "harvest": {
        // 采集直到能量满
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          harvest(creep);
        } else {
          // 采满后优先存储，若无可存储目标则修理、建造、升级
          creep.memory.state = "store";
        }
        break;
      }
      case "store": {
        // 有能量优先存储，若无目标则修理、建造、升级，直到能量用完
        if (creep.store[RESOURCE_ENERGY] > 0) {
          if (store(creep)) return;
          if (repair(creep)) return;
          if (build(creep)) return;
          if (upgrade(creep)) return;
          // 没有任何目标，直接切回采集
          creep.say("采集");
          creep.memory.state = "harvest";
        } else {
          // 优先拾取掉落能量
          if (pickupDroppedEnergy(creep)) return;
          // 能量用完切回采集
          creep.memory.state = "harvest";
        }
        break;
      }
    }
  });
}
