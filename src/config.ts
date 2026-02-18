// 是否允许工人修理（true=允许，false=不允许）
export const enableRepair: boolean = true;
// 是否允许工人建造（true=允许，false=不允许）
export const enableBuild: boolean = true;
// 是否允许工人升级控制器（true=允许，false=不允许）
export const enableUpgradeController: boolean = true;
// 最大工人数
export const maxWorkers: number = 8;
// 工人身体部件配置
export const workerBody: BodyPartConstant[] = [WORK, CARRY, MOVE];

