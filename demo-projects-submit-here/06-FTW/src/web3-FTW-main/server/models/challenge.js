const { query, get, run, transaction, currentTimestamp } = require('./db');
const { ChallengeState } = require('./camp');

/**
 * 创建关卡
 * @param {Object} challengeData 关卡数据
 * @returns {Promise<Object>} 创建结果
 */
async function createChallenge(challengeData) {
  const now = currentTimestamp();
  
  const result = await run(
    `INSERT INTO challenges (
      camp_id, challenge_index, deadline, password_hash, 
      state, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      challengeData.campId,
      challengeData.challengeIndex,
      challengeData.deadline,
      challengeData.passwordHash,
      challengeData.state || ChallengeState.ACTIVE,
      now,
      now
    ]
  );
  
  return getChallengeById(result.id);
}

/**
 * 批量创建关卡
 * @param {Array} challengesData 关卡数据数组
 * @returns {Promise<Array>} 创建结果
 */
async function createChallenges(challengesData) {
  const now = currentTimestamp();
  
  return await transaction(async (db) => {
    const results = [];
    
    for (const challengeData of challengesData) {
      const result = await run(
        `INSERT INTO challenges (
          camp_id, challenge_index, deadline, password_hash, 
          state, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          challengeData.campId,
          challengeData.challengeIndex,
          challengeData.deadline,
          challengeData.passwordHash,
          challengeData.state || ChallengeState.ACTIVE,
          now,
          now
        ]
      );
      
      results.push(result);
    }
    
    return results;
  });
}

/**
 * 根据ID获取关卡
 * @param {number} id 关卡ID
 * @returns {Promise<Object|null>} 关卡数据
 */
async function getChallengeById(id) {
  return await get('SELECT * FROM challenges WHERE id = ?', [id]);
}

/**
 * 获取营地的所有关卡
 * @param {number} campId 营地ID
 * @returns {Promise<Array>} 关卡列表
 */
async function getChallengesByCampId(campId) {
  return await query(
    'SELECT * FROM challenges WHERE camp_id = ? ORDER BY challenge_index ASC',
    [campId]
  );
}

/**
 * 获取特定的关卡
 * @param {number} campId 营地ID
 * @param {number} challengeIndex 关卡索引
 * @returns {Promise<Object|null>} 关卡数据
 */
async function getChallenge(campId, challengeIndex) {
  return await get(
    'SELECT * FROM challenges WHERE camp_id = ? AND challenge_index = ?',
    [campId, challengeIndex]
  );
}

/**
 * 更新关卡状态
 * @param {number} id 关卡ID
 * @param {number} state 新状态
 * @returns {Promise<Object>} 更新结果
 */
async function updateChallengeState(id, state) {
  const now = currentTimestamp();
  
  return await run(
    'UPDATE challenges SET state = ?, updated_at = ? WHERE id = ?',
    [state, now, id]
  );
}

/**
 * 更新关卡完成人数
 * @param {number} id 关卡ID
 * @param {number} completedCount 完成人数
 * @returns {Promise<Object>} 更新结果
 */
async function updateCompletedCount(id, completedCount) {
  const now = currentTimestamp();
  
  return await run(
    'UPDATE challenges SET completed_count = ?, updated_at = ? WHERE id = ?',
    [completedCount, now, id]
  );
}

/**
 * 更新关卡信息
 * @param {number} campId 营地ID
 * @param {number} challengeIndex 关卡索引
 * @param {Object} updateData 更新数据
 * @returns {Promise<Object>} 更新结果
 */
async function updateChallenge(campId, challengeIndex, updateData) {
  const now = currentTimestamp();
  const { deadline, passwordHash, state } = updateData;
  
  return await run(
    'UPDATE challenges SET deadline = ?, password_hash = ?, state = ?, updated_at = ? WHERE camp_id = ? AND challenge_index = ?',
    [deadline, passwordHash, state, now, campId, challengeIndex]
  );
}

/**
 * 记录参与者完成关卡
 * @param {number} challengeId 关卡ID
 * @param {number} participantId 参与者ID
 * @returns {Promise<Object>} 创建结果
 */
async function recordChallengeCompletion(challengeId, participantId) {
  const now = currentTimestamp();
  
  try {
    const result = await run(
      'INSERT INTO challenge_completions (challenge_id, participant_id, completed_at) VALUES (?, ?, ?)',
      [challengeId, participantId, now]
    );
    
    // 更新关卡完成人数
    const challenge = await getChallengeById(challengeId);
    await updateCompletedCount(challengeId, challenge.completed_count + 1);
    
    return result;
  } catch (error) {
    // 如果已经存在记录（唯一约束冲突），则忽略错误
    if (error.code === 'SQLITE_CONSTRAINT') {
      return { id: null, changes: 0 };
    }
    throw error;
  }
}

/**
 * 检查参与者是否完成了关卡
 * @param {number} challengeId 关卡ID
 * @param {number} participantId 参与者ID
 * @returns {Promise<boolean>} 是否已完成
 */
async function hasCompletedChallenge(challengeId, participantId) {
  const result = await get(
    'SELECT 1 FROM challenge_completions WHERE challenge_id = ? AND participant_id = ?',
    [challengeId, participantId]
  );
  
  return !!result;
}

/**
 * 获取参与者完成的关卡
 * @param {number} participantId 参与者ID
 * @returns {Promise<Array>} 完成的关卡ID列表
 */
async function getCompletedChallenges(participantId) {
  const results = await query(
    'SELECT challenge_id FROM challenge_completions WHERE participant_id = ?',
    [participantId]
  );
  
  return results.map(row => row.challenge_id);
}

/**
 * 检查所有关卡是否都已过期
 * @param {number} campId 营地ID
 * @returns {Promise<boolean>} 是否全部过期
 */
async function areAllChallengesExpired(campId) {
  const challenges = await getChallengesByCampId(campId);
  
  if (challenges.length === 0) {
    return false;
  }
  
  for (const challenge of challenges) {
    if (challenge.state !== ChallengeState.EXPIRED) {
      return false;
    }
  }
  
  return true;
}

module.exports = {
  createChallenge,
  createChallenges,
  getChallengeById,
  getChallengesByCampId,
  getChallenge,
  updateChallengeState,
  updateCompletedCount,
  updateChallenge,
  recordChallengeCompletion,
  hasCompletedChallenge,
  getCompletedChallenges,
  areAllChallengesExpired,
  ChallengeState
}; 