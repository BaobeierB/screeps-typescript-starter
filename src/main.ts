import { ErrorMapper } from "utils/ErrorMapper";
import { spawnWorkers, runWorkers } from "./worker";
import { spawnUpgraders, runUpgraders } from "./upgrader";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definition alone.
          You must also give them an implementation if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    /**
     * 工人状态机：'harvest' | 'build' | 'store'，可选
     * 升级者状态机：'withdraw' | 'upgrade'，可选
     */
  state?: "harvest" | "build" | "store" | "withdraw" | "upgrade" | "repair";
  }

}
// Syntax for adding properties to `global` (ex "global.log")
declare const global: {
  log: any;
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {

  // 获取名为 "Spawn1" 的孵化器对象
  const spawn = Game.spawns["Spawn1"];
  if (spawn) {
    // 工人创建逻辑
    spawnWorkers(spawn);
    // 工人工作逻辑
    runWorkers(spawn);
    // 升级者创建逻辑
    spawnUpgraders(spawn);
    // 升级者工作逻辑
    runUpgraders(spawn);
  }

  // 自动清理已经死亡的 creep 的内存，防止内存泄漏
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
