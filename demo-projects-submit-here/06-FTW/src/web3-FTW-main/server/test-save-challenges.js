const { query, run } = require('./models/db');

async function testSaveChallenges() {
  try {
    console.log('开始测试保存关卡数据...');
    
    // 获取第一个营地
    const camps = await query('SELECT * FROM camps LIMIT 1');
    if (camps.length === 0) {
      console.log('没有找到营地数据');
      return;
    }
    
    const camp = camps[0];
    console.log('找到营地:', camp.name, 'ID:', camp.id);
    
    // 创建测试关卡数据
    const now = Math.floor(Date.now() / 1000);
    const testChallenges = [
      {
        campId: camp.id,
        challengeIndex: 0,
        deadline: now + 86400, // 1天后
        passwordHash: '0x' + 'a'.repeat(64), // 64个a字符
        state: 1 // ACTIVE
      },
      {
        campId: camp.id,
        challengeIndex: 1,
        deadline: now + 172800, // 2天后
        passwordHash: '0x' + 'b'.repeat(64), // 64个b字符
        state: 1 // ACTIVE
      },
      {
        campId: camp.id,
        challengeIndex: 2,
        deadline: now + 259200, // 3天后
        passwordHash: '0x' + 'c'.repeat(64), // 64个c字符
        state: 1 // ACTIVE
      }
    ];
    
    console.log('准备保存关卡数据:', testChallenges);
    
    // 保存关卡数据
    for (const challenge of testChallenges) {
      const result = await run(
        `INSERT INTO challenges (
          camp_id, challenge_index, deadline, password_hash, 
          state, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          challenge.campId,
          challenge.challengeIndex,
          challenge.deadline,
          challenge.passwordHash,
          challenge.state,
          now,
          now
        ]
      );
      
      console.log(`关卡 ${challenge.challengeIndex} 保存成功，ID: ${result.id}`);
    }
    
    // 验证保存结果
    const savedChallenges = await query(
      'SELECT * FROM challenges WHERE camp_id = ? ORDER BY challenge_index ASC',
      [camp.id]
    );
    
    console.log('保存后的关卡数据:', savedChallenges);
    
  } catch (error) {
    console.error('测试保存关卡数据失败:', error);
  }
}

testSaveChallenges(); 