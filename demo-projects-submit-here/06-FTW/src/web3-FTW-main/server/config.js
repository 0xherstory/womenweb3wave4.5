/**
 * 应用配置
 */
const config = {
  // 服务器配置
  port: process.env.PORT || 3001,
  
  // 数据库配置
  database: {
    path: process.env.DB_PATH || './data/web3ftw.db'
  },
  
  // Web3配置
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
  campFactoryAddress: process.env.FACTORY_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  
  // API配置
  apiPrefix: '/api',
  
  // CORS配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'web3ftw-secret-key',
    expiresIn: '7d'
  },
  
  // 缓存配置
  cache: {
    ttl: 30 * 60 // 30分钟
  }
};

module.exports = config; 