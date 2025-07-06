const { query, get, run, currentTimestamp } = require('./db');
const { ParticipantState } = require('./camp');

/**
 * 创建参与者记录
 * @param {Object} participantData 参与者数据
 * @returns {Promise<Object>} 创建结果
 */
async function createParticipant(participantData) {
  const now = currentTimestamp();
  
  const result = await run(
    `INSERT INTO participants (
      camp_id, participant_address, state, 
      registration_time, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      participantData.campId,
      participantData.participantAddress,
      participantData.state || ParticipantState.REGISTERED,
      participantData.registrationTime || now,
      now,
      now
    ]
  );
  
  return getParticipantById(result.id);
}

/**
 * 根据ID获取参与者
 * @param {number} id 参与者ID
 * @returns {Promise<Object|null>} 参与者数据
 */
async function getParticipantById(id) {
  return await get('SELECT * FROM participants WHERE id = ?', [id]);
}

/**
 * 获取营地的参与者
 * @param {number} campId 营地ID
 * @param {Object} options 查询选项
 * @returns {Promise<Array>} 参与者列表
 */
async function getParticipantsByCampId(campId, options = {}) {
  let sql = 'SELECT * FROM participants WHERE camp_id = ?';
  const params = [campId];
  
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
    // 默认按报名时间升序排列
    sql += ' ORDER BY registration_time ASC';
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
 * 获取用户在特定营地的参与记录
 * @param {number} campId 营地ID
 * @param {string} participantAddress 参与者地址
 * @returns {Promise<Object|null>} 参与者数据
 */
async function getParticipant(campId, participantAddress) {
  return await get(
    'SELECT * FROM participants WHERE camp_id = ? AND participant_address = ?',
    [campId, participantAddress]
  );
}

/**
 * 更新参与者状态
 * @param {number} id 参与者ID
 * @param {number} state 新状态
 * @returns {Promise<Object>} 更新结果
 */
async function updateParticipantState(id, state) {
  const now = currentTimestamp();
  
  return await run(
    'UPDATE participants SET state = ?, updated_at = ? WHERE id = ?',
    [state, now, id]
  );
}

/**
 * 更新参与者完成的关卡数
 * @param {number} id 参与者ID
 * @param {number} completedChallenges 完成的关卡数
 * @returns {Promise<Object>} 更新结果
 */
async function updateCompletedChallenges(id, completedChallenges) {
  const now = currentTimestamp();
  
  return await run(
    'UPDATE participants SET completed_challenges = ?, updated_at = ? WHERE id = ?',
    [completedChallenges, now, id]
  );
}

/**
 * 检查用户是否已经参与了某个营地
 * @param {string} participantAddress 参与者地址
 * @param {number} campId 营地ID
 * @returns {Promise<boolean>} 是否已参与
 */
async function isParticipant(participantAddress, campId) {
  const participant = await getParticipant(campId, participantAddress);
  return !!participant;
}

/**
 * 检查用户是否有进行中的营地
 * @param {string} participantAddress 参与者地址
 * @returns {Promise<boolean>} 是否有进行中的营地
 */
async function hasActiveParticipation(participantAddress) {
  const result = await get(
    `SELECT COUNT(*) as count FROM participants p
     JOIN camps c ON p.camp_id = c.id
     WHERE p.participant_address = ?
     AND p.state = ?
     AND c.state IN (?, ?, ?)`,
    [
      participantAddress,
      ParticipantState.REGISTERED,
      0, // Registration
      2, // Success
      3  // Challenging
    ]
  );
  
  return result && result.count > 0;
}

/**
 * 获取用户参与的所有营地ID
 * @param {string} participantAddress 参与者地址
 * @returns {Promise<Array>} 营地ID列表
 */
async function getParticipatedCampIds(participantAddress) {
  const results = await query(
    'SELECT camp_id FROM participants WHERE participant_address = ?',
    [participantAddress]
  );
  
  return results.map(row => row.camp_id);
}

module.exports = {
  createParticipant,
  getParticipantById,
  getParticipantsByCampId,
  getParticipant,
  updateParticipantState,
  updateCompletedChallenges,
  isParticipant,
  hasActiveParticipation,
  getParticipatedCampIds
}; 