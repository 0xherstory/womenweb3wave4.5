const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'data', 'web3ftw.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath);

console.log('正在更新数据库schema...');

// 检查current_level字段是否存在
db.get("PRAGMA table_info(camps)", (err, rows) => {
  if (err) {
    console.error('检查表结构失败:', err);
    return;
  }
  
  db.all("PRAGMA table_info(camps)", (err, columns) => {
    if (err) {
      console.error('获取表结构失败:', err);
      return;
    }
    
    const hasCurrentLevel = columns.some(col => col.name === 'current_level');
    
    if (!hasCurrentLevel) {
      console.log('添加current_level字段...');
      
      // 添加current_level字段
      db.run("ALTER TABLE camps ADD COLUMN current_level INTEGER NOT NULL DEFAULT 1", (err) => {
        if (err) {
          console.error('添加current_level字段失败:', err);
        } else {
          console.log('成功添加current_level字段');
        }
        
        // 关闭数据库连接
        db.close((err) => {
          if (err) {
            console.error('关闭数据库失败:', err);
          } else {
            console.log('数据库更新完成');
          }
        });
      });
    } else {
      console.log('current_level字段已存在，无需更新');
      
      // 关闭数据库连接
      db.close((err) => {
        if (err) {
          console.error('关闭数据库失败:', err);
        } else {
          console.log('数据库检查完成');
        }
      });
    }
  });
}); 