const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const dbPath = path.resolve(__dirname, '../data/web3ftw.db');

// 确保数据目录存在
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接错误:', err.message);
  } else {
    console.log('已连接到SQLite数据库');
    initializeDatabase();
  }
});

// 初始化数据库
function initializeDatabase() {
  const schemaPath = path.resolve(__dirname, './schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  db.exec(schema, (err) => {
    if (err) {
      console.error('初始化数据库失败:', err.message);
    } else {
      console.log('数据库已初始化');
    }
  });
}

// 封装查询方法
function query(sql, params = []) {
  console.log('[DB QUERY]', sql, params);
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('[DB QUERY ERROR]', sql, params, err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// 封装单行查询方法
function get(sql, params = []) {
  console.log('[DB GET]', sql, params);
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('[DB GET ERROR]', sql, params, err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// 封装执行方法
function run(sql, params = []) {
  console.log('[DB RUN]', sql, params);
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('[DB RUN ERROR]', sql, params, err);
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// 封装事务方法
function transaction(callback) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      Promise.resolve()
        .then(() => callback(db))
        .then(() => {
          db.run('COMMIT');
          resolve();
        })
        .catch(err => {
          db.run('ROLLBACK');
          reject(err);
        });
    });
  });
}

// 获取当前时间戳
function currentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

module.exports = {
  db,
  query,
  get,
  run,
  transaction,
  currentTimestamp
}; 