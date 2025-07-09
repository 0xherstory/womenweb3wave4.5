const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'data', 'web3ftw.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath);

console.log('检查数据库schema...');

// 检查camps表结构
db.all("PRAGMA table_info(camps)", (err, columns) => {
  if (err) {
    console.error('获取表结构失败:', err);
    return;
  }
  
  console.log('\n=== camps表结构 ===');
  columns.forEach(col => {
    console.log(`${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
  });
  
  // 检查是否有current_level字段
  const hasCurrentLevel = columns.some(col => col.name === 'current_level');
  console.log(`\ncurrent_level字段: ${hasCurrentLevel ? '✅ 存在' : '❌ 不存在'}`);
  
  if (!hasCurrentLevel) {
    console.log('\n需要执行数据库更新脚本: node update-db-schema.js');
  } else {
    console.log('\n数据库结构已是最新版本');
  }
  
  db.close();
}); 