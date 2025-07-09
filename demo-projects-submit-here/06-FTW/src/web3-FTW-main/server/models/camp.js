const { query, get, run, currentTimestamp } = require('./db');

/**
 * 营地状态枚举
 */
const CampState = {
  REGISTRATION: 0,
  FAILED: 1,
  SUCCESS: 2,
  CHALLENGING: 3,
  COMPLETED: 4
};

/**
 * 参与者状态枚举
 */
const ParticipantState = {
  NOT_REGISTERED: 0,
  REGISTERED: 1,
  COMPLETED: 2,
  WITHDRAWN: 3,
  FORFEITED: 4
};

/**
 * 关卡状态枚举
 */
const ChallengeState = {
  NOT_CONFIGURED: 0,
  ACTIVE: 1,
  EXPIRED: 2
};

/**
 * 创建新营地
 * @param {Object} campData 营地数据
 * @returns {Promise<Object>} 创建的营地
 */
async function createCamp(campData) {
  const now = currentTimestamp();
  
  const result = await run(
    `INSERT INTO camps (
      contract_address, factory_address, organizer_address, name, 
      signup_deadline, camp_end_date, challenge_count, min_participants, 
      max_participants, deposit_amount, state, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      campData.contractAddress,
      campData.factoryAddress,
      campData.organizerAddress,
      campData.name,
      campData.signupDeadline,
      campData.campEndDate,
      campData.challengeCount,
      campData.minParticipants,
      campData.maxParticipants,
      campData.depositAmount,
      CampState.REGISTRATION, // 初始状态为报名阶段
      now,
      now
    ]
  );
  
  return getCampById(result.id);
}

/**
 * 根据ID获取营地
 * @param {number} id 营地ID
 * @returns {Promise<Object|null>} 营地数据
 */
async function getCampById(id) {
  return await get('SELECT * FROM camps WHERE id = ?', [id]);
}

/**
 * 根据合约地址获取营地
 * @param {string} contractAddress 合约地址
 * @returns {Promise<Object|null>} 营地数据
 */
async function getCampByContractAddress(contractAddress) {
  return await get('SELECT * FROM camps WHERE contract_address = ?', [contractAddress]);
}

/**
 * 更新营地状态
 * @param {string} contractAddress 合约地址
 * @param {number} state 新状态
 * @returns {Promise<Object>} 更新结果
 */
async function updateCampState(contractAddress, state) {
  const now = currentTimestamp();
  
  return await run(
    'UPDATE camps SET state = ?, updated_at = ? WHERE contract_address = ?',
    [state, now, contractAddress]
  );
}

/**
 * 更新营地参与者数量
 * @param {string} contractAddress 合约地址
 * @param {number} participantCount 参与者数量
 * @returns {Promise<Object>} 更新结果
 */
async function updateParticipantCount(contractAddress, participantCount) {
  const now = currentTimestamp();
  
  return await run(
    'UPDATE camps SET participant_count = ?, updated_at = ? WHERE contract_address = ?',
    [participantCount, now, contractAddress]
  );
}

/**
 * 更新完成所有关卡的人数
 * @param {string} contractAddress 合约地址
 * @param {number} completedCount 完成人数
 * @returns {Promise<Object>} 更新结果
 */
async function updateCompletedCount(contractAddress, completedCount) {
  const now = currentTimestamp();
  
  return await run(
    'UPDATE camps SET completed_count = ?, updated_at = ? WHERE contract_address = ?',
    [completedCount, now, contractAddress]
  );
}

/**
 * 更新当前关卡
 * @param {string} contractAddress 合约地址
 * @param {number} currentLevel 当前关卡
 * @returns {Promise<Object>} 更新结果
 */
async function updateCurrentLevel(contractAddress, currentLevel) {
  const now = currentTimestamp();
  
  return await run(
    'UPDATE camps SET current_level = ?, updated_at = ? WHERE contract_address = ?',
    [currentLevel, now, contractAddress]
  );
}

/**
 * 获取所有营地
 * @param {Object} options 查询选项
 * @returns {Promise<Array>} 营地列表
 */
async function getAllCamps(options = {}) {
  let sql = 'SELECT * FROM camps';
  const params = [];
  
  // 添加状态过滤
  if (options.state !== undefined) {
    sql += ' WHERE state = ?';
    params.push(options.state);
  }
  
  // 添加排序
  if (options.sortBy) {
    sql += ` ORDER BY ${options.sortBy}`;
    if (options.sortDirection) {
      sql += ` ${options.sortDirection}`;
    }
  } else {
    // 默认按报名截止日期倒序排列
    sql += ' ORDER BY signup_deadline DESC';
  }
  
  // 添加分页
  if (options.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
    
    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }
  }
  
  return await query(sql, params);
}

/**
 * 获取用户创建的营地
 * @param {string} organizerAddress 组织者地址
 * @param {Object} options 查询选项
 * @returns {Promise<Array>} 营地列表
 */
async function getCampsByOrganizer(organizerAddress, options = {}) {
  let sql = 'SELECT * FROM camps WHERE LOWER(organizer_address) = LOWER(?)';
  const params = [organizerAddress];
  
  // 添加状态过滤
  if (options.state !== undefined) {
    sql += ' AND state = ?';
    params.push(options.state);
  }
  
  // 添加排序
  if (options.sortBy) {
    sql += ` ORDER BY ${options.sortBy}`;
    if (options.sortDirection) {
      sql += ` ${options.sortDirection}`;
    }
  } else {
    // 默认按创建时间倒序排列
    sql += ' ORDER BY created_at DESC';
  }
  
  // 添加分页
  if (options.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
    
    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }
  }
  
  return await query(sql, params);
}

/**
 * 获取用户参与的营地
 * @param {string} participantAddress 参与者地址
 * @param {Object} options 查询选项
 * @returns {Promise<Array>} 营地列表
 */
async function getCampsByParticipant(participantAddress, options = {}) {
  let sql = `
    SELECT c.* FROM camps c
    JOIN participants p ON c.id = p.camp_id
    WHERE LOWER(p.participant_address) = LOWER(?)
  `;
  const params = [participantAddress];
  
  // 添加状态过滤
  if (options.state !== undefined) {
    sql += ' AND c.state = ?';
    params.push(options.state);
  }
  
  // 添加排序
  if (options.sortBy) {
    sql += ` ORDER BY c.${options.sortBy}`;
    if (options.sortDirection) {
      sql += ` ${options.sortDirection}`;
    }
  } else {
    // 默认按创建时间倒序排列
    sql += ' ORDER BY c.created_at DESC';
  }
  
  // 添加分页
  if (options.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
    
    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }
  }
  
  return await query(sql, params);
}

/**
 * 获取用户可参与的营地（报名开始状态且非用户创建的）
 * @param {string} userAddress 用户地址
 * @param {Object} options 查询选项
 * @returns {Promise<Array>} 可参与的营地列表
 */
async function getAvailableCamps(userAddress, options = {}) {
  const now = currentTimestamp();
  
  // SQL查询，筛选出用户未创建、未参与，且仍在报名期的营地
  let sql = `
    SELECT c.* FROM camps c
    WHERE 
      c.state = 0 AND
      c.signup_deadline > ? AND
      LOWER(c.organizer_address) != LOWER(?) AND
      c.id NOT IN (
        SELECT p.camp_id FROM participants p WHERE LOWER(p.participant_address) = LOWER(?)
      )
  `;
  
  const params = [now, userAddress, userAddress];

  // 添加排序
  if (options.sortBy) {
    sql += ` ORDER BY c.${options.sortBy}`;
    if (options.sortDirection) {
      sql += ` ${options.sortDirection}`;
    }
  } else {
    sql += ' ORDER BY c.created_at DESC';
  }

  // 添加分页
  if (options.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
    
    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }
  }
  
  return await query(sql, params);
}

/**
 * 更新营地状态
 * @param {string} contractAddress 营地合约地址
 * @param {string} status 新状态
 * @returns {Promise<void>}
 */
async function updateCampStatus(contractAddress, status) {
  const now = currentTimestamp();
  
  // 状态枚举映射
  const statusMap = {
    'signup': 0,
    'failed': 1,
    'success': 2,
    'fighting': 3,
    'ended': 4
  };

  const state = statusMap[status];
  if (state === undefined) {
    throw new Error('无效的状态值');
  }

  await run(
    `UPDATE camps 
     SET state = ?, updated_at = ?
     WHERE contract_address = ?`,
    [state, now, contractAddress]
  );
}

/**
 * 查找所有报名已截止但状态仍为"报名中"的营地
 * @param {number} timestamp 当前时间戳
 * @returns {Promise<Array>} 需要处理的营地列表
 */
async function findCampsPastDeadline(timestamp) {
  const sql = `
    SELECT * FROM camps
    WHERE 
      state = 0 AND
      signup_deadline <= ?
  `;
  return await query(sql, [timestamp]);
}

module.exports = {
  CampState,
  ParticipantState,
  ChallengeState,
  createCamp,
  getCampById,
  getCampByContractAddress,
  updateCampState,
  updateParticipantCount,
  updateCompletedCount,
  updateCurrentLevel,
  getAllCamps,
  getCampsByOrganizer,
  getCampsByParticipant,
  getAvailableCamps,
  updateCampStatus,
  findCampsPastDeadline,
}; 