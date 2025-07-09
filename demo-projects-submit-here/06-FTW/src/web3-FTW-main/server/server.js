const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const eventListener = require('./services/eventListener');
const web3Service = require('./services/web3Service');
const campStatusService = require('./services/campStatusService');

// 导入路由
const campRoutes = require('./routes/campRoutes');
const web3Routes = require('./routes/web3Routes');

// 创建Express应用
const app = express();

// 中间件
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// API路由
app.use(`${config.apiPrefix}/camps`, campRoutes);
app.use(`${config.apiPrefix}/web3`, web3Routes);

// 根路由
app.get('/', (req, res) => {
  res.json({ message: 'Web3-FTW API服务已启动' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ success: false, message: '服务器内部错误', error: err.message });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: '请求的资源不存在' });
});

// 初始化Web3服务
web3Service.init();

// 启动事件监听服务
eventListener.start().then(success => {
  if (success) {
    console.log('事件监听服务已启动');
    // 启动营地状态自动更新服务
    campStatusService.start();
  } else {
    console.error('事件监听服务启动失败');
  }
});

// 启动服务器
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`服务器已启动，监听端口: ${PORT}`);
  console.log(`API路径前缀: ${config.apiPrefix}`);
}); 