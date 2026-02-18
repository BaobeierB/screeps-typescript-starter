// 是否允许工人修理（true=允许，false=不允许）
export const enableRepair: boolean = true;
// 是否允许工人建造（true=允许，false=不允许）
export const enableBuild: boolean = true;
// 是否允许工人升级控制器（true=允许，false=不允许）
export const enableUpgradeController: boolean = true;
// 最大工人数
export const maxWorkers: number = 10;


// 最大控制器升级者数量（0 表示不开启升级者）
export const maxUpgraders: number = 1;
// 升级者身体部件配置
export const upgraderBody: BodyPartConstant[] = [WORK, WORK, WORK, WORK, CARRY, MOVE];


