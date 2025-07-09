const cron = require('node-cron');
const campModel = require('../models/camp');
const { currentTimestamp } = require('../models/db');

/**
 * 检查并更新需要变更状态的营地
 * 1. 找出所有处于"报名中"(state=0)且报名截止时间已过的营地
 * 2. 遍历这些营地，根据当前报名人数与最少人数判断，更新为"开营成功"(state=2)或"开营失败"(state=1)
 */
const checkAndProcessCamps = async () => {
  console.log('开始执行定时任务：检查并更新营地状态...');
  
  try {
    const now = currentTimestamp();
    const campsToProcess = await campModel.findCampsPastDeadline(now);
    
    if (campsToProcess.length === 0) {
      console.log('没有需要处理的过期营地。');
      return;
    }

    console.log(`发现 ${campsToProcess.length} 个需要处理的营地。`);

    for (const camp of campsToProcess) {
      let newStatus;
      if (camp.participant_count >= camp.min_participants) {
        newStatus = 'success'; // 开营成功
      } else {
        newStatus = 'failed'; // 开营失败
      }
      
      console.log(`营地 ${camp.name} (${camp.contract_address}) 状态将从 'signup' 更新为 '${newStatus}'`);
      
      await campModel.updateCampStatus(camp.contract_address, newStatus);
    }

    console.log('所有过期营地状态更新完毕。');
  } catch (error) {
    console.error('执行营地状态更新任务时出错:', error);
  }
};

/**
 * 启动定时任务，每分钟检查一次
 */
const start = () => {
  // 每分钟执行一次 checkAndProcessCamps 函数
  cron.schedule('* * * * *', checkAndProcessCamps);
  
  console.log('营地状态自动更新服务已启动，每分钟检查一次。');
};

module.exports = {
  start,
  checkAndProcessCamps, // 导出以便于测试
}; 