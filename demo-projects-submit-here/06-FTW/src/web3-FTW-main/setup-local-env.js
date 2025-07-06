const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

// 配置颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 检查是否为Windows系统
const isWindows = os.platform() === 'win32';

// 日志函数
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(80));
  console.log(`${title}`);
  console.log('='.repeat(80) + colors.reset + '\n');
}

// 执行命令并返回Promise
function execCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    log(`执行命令: ${command}`, colors.yellow);
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        log(`命令执行失败: ${error}`, colors.red);
        return reject(error);
      }
      if (stderr) {
        log(`命令警告: ${stderr}`, colors.yellow);
      }
      if (stdout) {
        log(`命令输出: ${stdout}`);
      }
      resolve(stdout);
    });
  });
}

// 启动子进程并保持运行
function startProcess(command, args, cwd, name) {
  log(`启动${name}...`, colors.green);
  
  const process = spawn(command, args, {
    cwd,
    shell: true,
    stdio: 'pipe'
  });
  
  process.stdout.on('data', (data) => {
    log(`[${name}] ${data}`, colors.cyan);
  });
  
  process.stderr.on('data', (data) => {
    log(`[${name}错误] ${data}`, colors.red);
  });
  
  process.on('close', (code) => {
    if (code !== 0) {
      log(`${name}进程退出，退出码: ${code}`, colors.red);
    } else {
      log(`${name}进程正常退出`, colors.green);
    }
  });
  
  return process;
}

// 等待用户输入
function waitForInput(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// 检查环境变量文件
async function checkAndCreateEnvFiles() {
  logSection('检查环境变量文件');
  
  // 检查contracts/.env
  if (!fs.existsSync(path.join(process.cwd(), 'contracts', '.env'))) {
    log('创建contracts/.env文件...', colors.yellow);
    const contractsEnv = `PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80\nINFURA_API_KEY=\nETHERSCAN_API_KEY=\n`;
    fs.writeFileSync(path.join(process.cwd(), 'contracts', '.env'), contractsEnv);
    log('contracts/.env文件已创建', colors.green);
  }
  
  // 检查server/.env
  if (!fs.existsSync(path.join(process.cwd(), 'server', '.env'))) {
    log('创建server/.env文件...', colors.yellow);
    const serverEnv = `PORT=3001\nRPC_URL=http://localhost:8545\nFACTORY_ADDRESS=\nJWT_SECRET=dev_secret_key_123\nCORS_ORIGIN=http://localhost:3000\n`;
    fs.writeFileSync(path.join(process.cwd(), 'server', '.env'), serverEnv);
    log('server/.env文件已创建', colors.green);
  }
  
  // 检查client/.env.local
  if (!fs.existsSync(path.join(process.cwd(), 'client', '.env.local'))) {
    log('创建client/.env.local文件...', colors.yellow);
    const clientEnv = `REACT_APP_API_URL=http://localhost:3001/api\nREACT_APP_FACTORY_ADDRESS=\n`;
    fs.writeFileSync(path.join(process.cwd(), 'client', '.env.local'), clientEnv);
    log('client/.env.local文件已创建', colors.green);
  }
}

// 更新环境变量中的合约地址
function updateContractAddresses(factoryAddress) {
  logSection('更新环境变量中的合约地址');
  
  // 更新server/.env
  const serverEnvPath = path.join(process.cwd(), 'server', '.env');
  let serverEnv = '';
  
  if (fs.existsSync(serverEnvPath)) {
    serverEnv = fs.readFileSync(serverEnvPath, 'utf8');
  serverEnv = serverEnv.replace(/FACTORY_ADDRESS=.*/g, `FACTORY_ADDRESS=${factoryAddress}`);
  } else {
    // 创建新的.env文件
    serverEnv = `# Web3-FTW 后端环境变量
PORT=3001
DB_PATH=./data/web3ftw.db
RPC_URL=http://localhost:8545
FACTORY_ADDRESS=${factoryAddress}
API_PREFIX=/api
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=web3ftw-secret-key-2024
`;
  }
  
  fs.writeFileSync(serverEnvPath, serverEnv);
  log('已更新server/.env中的合约地址', colors.green);
  
  // 更新client/.env.local
  const clientEnvPath = path.join(process.cwd(), 'client', '.env.local');
  let clientEnv = '';
  
  if (fs.existsSync(clientEnvPath)) {
    clientEnv = fs.readFileSync(clientEnvPath, 'utf8');
  clientEnv = clientEnv.replace(/REACT_APP_FACTORY_ADDRESS=.*/g, `REACT_APP_FACTORY_ADDRESS=${factoryAddress}`);
  } else {
    // 创建新的.env.local文件
    clientEnv = `# Web3-FTW 前端环境变量
REACT_APP_FACTORY_ADDRESS=${factoryAddress}
REACT_APP_API_URL=http://localhost:3001/api
`;
  }
  
  fs.writeFileSync(clientEnvPath, clientEnv);
  log('已更新client/.env.local中的合约地址', colors.green);
}

// 检查端口是否被占用（Windows和Unix兼容）
async function isPortInUse(port) {
  try {
    if (isWindows) {
      const result = await execCommand(`netstat -ano | findstr :${port}`);
      return result.trim() !== '';
    } else {
      const result = await execCommand(`lsof -i:${port} -t`);
      return result.trim() !== '';
    }
  } catch (error) {
    // 如果命令执行失败，通常意味着端口未被使用
    return false;
  }
}

// 终止占用端口的进程
async function killProcessOnPort(port) {
  try {
    if (isWindows) {
      // 获取PID - 使用更精确的方法
      const result = await execCommand(`netstat -ano | findstr :${port}`);
      const lines = result.trim().split('\n');
      
      // 查找LISTENING状态的进程
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            log(`尝试终止PID ${pid}的进程...`, colors.yellow);
          await execCommand(`taskkill /F /PID ${pid}`);
          return true;
        }
      }
      }
      
      // 如果没找到LISTENING，尝试终止所有相关进程
      const pids = new Set();
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && !isNaN(pid)) {
          pids.add(pid);
        }
      }
      
      if (pids.size > 0) {
        for (const pid of pids) {
          try {
            log(`尝试终止PID ${pid}的进程...`, colors.yellow);
            await execCommand(`taskkill /F /PID ${pid}`);
          } catch (err) {
            log(`终止PID ${pid}失败: ${err.message}`, colors.yellow);
          }
        }
        return true;
      }
      
      return false;
    } else {
      await execCommand(`lsof -i:${port} -t | xargs kill -9`);
      return true;
    }
  } catch (error) {
    log(`终止进程失败: ${error}`, colors.red);
    return false;
  }
}

// 清理旧的编译和部署数据
async function cleanupOldData(cleanupLevel) {
  logSection('清理旧数据');
  
  if (cleanupLevel >= 1) {
    // 清理合约编译产物
    log('清理合约编译产物...', colors.yellow);
    try {
      await execCommand('npx hardhat clean', path.join(process.cwd(), 'contracts'));
      log('合约编译产物已清理', colors.green);
    } catch (error) {
      log('清理合约编译产物失败，继续执行...', colors.yellow);
    }
    
    // 清理ABI文件
    log('清理前端和后端的ABI文件...', colors.yellow);
    const clientAbisDir = path.join(process.cwd(), 'client/src/abis');
    const serverAbisDir = path.join(process.cwd(), 'server/abis');
    
    if (fs.existsSync(clientAbisDir)) {
      fs.readdirSync(clientAbisDir).forEach(file => {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(clientAbisDir, file));
        }
      });
      log('前端ABI文件已清理', colors.green);
    }
    
    if (fs.existsSync(serverAbisDir)) {
      fs.readdirSync(serverAbisDir).forEach(file => {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(serverAbisDir, file));
        }
      });
      log('后端ABI文件已清理', colors.green);
    }
  }
  
  if (cleanupLevel >= 2) {
    // 清理数据库
    log('清理后端数据库...', colors.yellow);
    const dbPath = path.join(process.cwd(), 'server/data/web3ftw.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      log('数据库已删除', colors.green);
    } else {
      log('数据库文件不存在，无需清理', colors.yellow);
    }
  }
  
  if (cleanupLevel >= 3) {
    // 清理node_modules (可选，但通常不需要)
    log('此级别的清理会删除所有node_modules目录，可能需要很长时间重新安装', colors.red);
    const confirm = await waitForInput('确定要继续吗? (y/n): ');
    if (confirm.toLowerCase() === 'y') {
      log('清理node_modules目录...', colors.yellow);
      try {
        if (isWindows) {
          await execCommand('rmdir /s /q node_modules', path.join(process.cwd(), 'contracts'));
          await execCommand('rmdir /s /q node_modules', path.join(process.cwd(), 'server'));
          await execCommand('rmdir /s /q node_modules', path.join(process.cwd(), 'client'));
        } else {
          await execCommand('rm -rf node_modules', path.join(process.cwd(), 'contracts'));
          await execCommand('rm -rf node_modules', path.join(process.cwd(), 'server'));
          await execCommand('rm -rf node_modules', path.join(process.cwd(), 'client'));
        }
        log('node_modules目录已清理', colors.green);
      } catch (error) {
        log('清理node_modules失败，继续执行...', colors.yellow);
      }
    } else {
      log('跳过清理node_modules', colors.yellow);
    }
  }
}

// 检查并安装缺失的依赖
async function checkAndInstallDependencies() {
  logSection('检查前端依赖');
  
  const clientPackageJsonPath = path.join(process.cwd(), 'client', 'package.json');
  if (!fs.existsSync(clientPackageJsonPath)) {
    log('找不到client/package.json文件', colors.red);
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(clientPackageJsonPath, 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  // 检查是否已安装MUI依赖
  const missingDeps = [];
  const requiredDeps = {
    '@mui/material': '^5.14.0',
    '@mui/x-date-pickers': '^6.10.0',
    '@emotion/react': '^11.11.1',
    '@emotion/styled': '^11.11.0',
    'date-fns': '^2.30.0'
  };
  
  for (const [dep, version] of Object.entries(requiredDeps)) {
    if (!dependencies[dep]) {
      missingDeps.push(`${dep}@${version}`);
    }
  }
  
  if (missingDeps.length > 0) {
    log(`检测到缺失的依赖: ${missingDeps.join(', ')}`, colors.yellow);
    const installConfirm = await waitForInput('是否安装这些依赖? (y/n): ');
    
    if (installConfirm.toLowerCase() === 'y') {
      log('安装缺失的依赖...', colors.yellow);
      try {
        await execCommand(`npm install --save ${missingDeps.join(' ')} --legacy-peer-deps`, path.join(process.cwd(), 'client'));
        log('依赖安装完成', colors.green);
      } catch (error) {
        log(`依赖安装失败: ${error}`, colors.red);
      }
    } else {
      log('跳过安装缺失的依赖，前端可能无法正常运行', colors.yellow);
    }
  } else {
    log('所有必需的依赖已安装', colors.green);
  }
}

// 确保目录存在
function ensureDirectoryExists(dirPath) {
  const normalizedPath = path.normalize(dirPath);
  if (!fs.existsSync(normalizedPath)) {
    // 创建嵌套目录
    fs.mkdirSync(normalizedPath, { recursive: true });
    log(`已创建目录: ${normalizedPath}`, colors.green);
  }
}

// 安装Hardhat工具链依赖
async function installHardhatDependencies() {
  logSection('安装Hardhat工具链依赖');
  
  const hardhatDeps = [
    "@nomicfoundation/hardhat-network-helpers@^1.0.0",
    "@nomicfoundation/hardhat-chai-matchers@^1.0.0",
    "@types/chai@^4.2.0",
    "@types/mocha@^9.1.0",
    "@typechain/ethers-v5@^10.1.0",
    "@typechain/hardhat@^6.1.2",
    "chai@^4.2.0",
    "hardhat-gas-reporter@^1.0.8",
    "solidity-coverage@^0.8.1",
    "ts-node@^8.0.0",
    "typechain@^8.1.0",
    "typescript@^4.5.0"
  ];
  
  log('安装Hardhat工具链依赖...', colors.yellow);
  try {
    await execCommand(`npm install --save-dev ${hardhatDeps.join(' ')} --legacy-peer-deps`, path.join(process.cwd(), 'contracts'));
    log('Hardhat工具链依赖安装完成', colors.green);
    return true;
  } catch (error) {
    log(`Hardhat工具链依赖安装失败: ${error}`, colors.red);
    return false;
  }
}

// 主函数
async function main() {
  try {
    logSection('Web3-FTW 本地测试环境部署');
    
    // 检查是否需要清理旧数据
    log('检测到可能的重复部署...', colors.yellow);
    log('清理级别说明:', colors.cyan);
    log('1: 基本清理 - 清理合约编译产物和ABI文件', colors.cyan);
    log('2: 完整清理 - 基本清理 + 删除数据库', colors.cyan);
    log('3: 深度清理 - 完整清理 + 删除node_modules (不推荐)', colors.cyan);
    log('0: 不清理 - 直接开始部署', colors.cyan);
    
    const cleanupLevel = parseInt(await waitForInput('请选择清理级别 (0-3): '), 10) || 0;
    
    if (cleanupLevel > 0) {
      await cleanupOldData(cleanupLevel);
    } else {
      log('跳过清理，直接开始部署', colors.yellow);
    }
    
    // 检查环境变量文件
    await checkAndCreateEnvFiles();
    
    // 1. 安装合约依赖
    logSection('1. 安装合约依赖');
    await execCommand('npm install --legacy-peer-deps', path.join(process.cwd(), 'contracts'));
    
    // 1.1 安装Hardhat工具链依赖
    await installHardhatDependencies();
    
    // 2. 启动本地区块链
    logSection('2. 启动本地区块链');
    
    // 检查是否有运行中的hardhat节点
    log('检查是否有运行中的hardhat节点...', colors.yellow);
    const port8545InUse = await isPortInUse(8545);
    
    if (port8545InUse) {
      log('检测到端口8545已被占用，可能是之前的hardhat节点仍在运行', colors.red);
      log('请选择操作:', colors.yellow);
      log('1. 尝试自动终止进程', colors.cyan);
      log('2. 手动终止进程（推荐）', colors.cyan);
      log('3. 继续使用现有节点', colors.cyan);
      
      const choice = await waitForInput('请选择 (1/2/3): ');
      
      if (choice === '1') {
        if (await killProcessOnPort(8545)) {
          log('已终止运行中的hardhat节点', colors.green);
        } else {
          log('自动终止失败，请手动关闭占用端口8545的进程后重试', colors.red);
          log('提示：可以在任务管理器中查找并结束node.exe进程', colors.yellow);
          return;
        }
      } else if (choice === '2') {
        log('请手动终止占用端口8545的进程：', colors.yellow);
        log('1. 打开任务管理器（Ctrl+Shift+Esc）', colors.cyan);
        log('2. 查找并结束node.exe进程（可能有多个）', colors.cyan);
        log('3. 或者在命令行中运行：taskkill /f /im node.exe', colors.cyan);
        await waitForInput('完成后按回车继续...');
        
        // 重新检查端口
        if (await isPortInUse(8545)) {
          log('端口8545仍被占用，请确保已终止相关进程', colors.red);
          return;
      } else {
          log('端口8545已释放', colors.green);
        }
      } else if (choice === '3') {
        log('继续使用现有的hardhat节点', colors.yellow);
      } else {
        log('无效选择，退出部署', colors.red);
        return;
      }
    } else {
      log('未检测到运行中的hardhat节点，将启动新的节点', colors.green);
    }
    
    const hardhatNode = startProcess('npx', ['hardhat', 'node'], path.join(process.cwd(), 'contracts'), 'Hardhat节点');
    
    // 等待几秒，确保节点启动
    log('等待Hardhat节点启动...', colors.yellow);
    await new Promise(resolve => setTimeout(resolve, 8000)); // 增加等待时间确保节点完全启动
    
    // 3. 编译并部署合约
    logSection('3. 编译并部署合约');
    try {
      // 先尝试编译合约
      log('编译智能合约...', colors.yellow);
      await execCommand('npx hardhat compile', path.join(process.cwd(), 'contracts'));
      log('合约编译成功', colors.green);
      
      // 然后部署合约
      const deployOutput = await execCommand('npx hardhat run scripts/deploy.js --network localhost', path.join(process.cwd(), 'contracts'));
      
      // 提取工厂合约地址
      const factoryAddressMatch = deployOutput.match(/CampFactory 已部署到: (0x[a-fA-F0-9]{40})/);
      if (factoryAddressMatch && factoryAddressMatch[1]) {
        const factoryAddress = factoryAddressMatch[1];
        log(`工厂合约地址: ${factoryAddress}`, colors.green);
        
        // 更新环境变量中的合约地址
        updateContractAddresses(factoryAddress);
      } else {
        log('无法从部署输出中提取工厂合约地址', colors.red);
      }
    } catch (error) {
      log('部署合约失败', colors.red);
      log('尝试安装缺失的依赖并重新部署...', colors.yellow);
      
      // 再次尝试安装依赖
      if (await installHardhatDependencies()) {
        try {
          // 重新编译和部署
          log('重新编译智能合约...', colors.yellow);
          await execCommand('npx hardhat compile', path.join(process.cwd(), 'contracts'));
          log('合约编译成功', colors.green);
          
          const deployOutput = await execCommand('npx hardhat run scripts/deploy.js --network localhost', path.join(process.cwd(), 'contracts'));
          
          // 提取工厂合约地址
          const factoryAddressMatch = deployOutput.match(/CampFactory 已部署到: (0x[a-fA-F0-9]{40})/);
          if (factoryAddressMatch && factoryAddressMatch[1]) {
            const factoryAddress = factoryAddressMatch[1];
            log(`工厂合约地址: ${factoryAddress}`, colors.green);
            
            // 更新环境变量中的合约地址
            updateContractAddresses(factoryAddress);
          } else {
            log('无法从部署输出中提取工厂合约地址', colors.red);
            throw new Error('无法提取合约地址');
          }
        } catch (retryError) {
          log('重新部署合约失败', colors.red);
          throw retryError;
        }
      } else {
        throw error;
      }
    }
    
    // 4. 安装后端依赖
    logSection('4. 安装后端依赖');
    await execCommand('npm install --legacy-peer-deps', path.join(process.cwd(), 'server'));
    
    // 5. 初始化数据库
    logSection('5. 初始化数据库');
    // 确保数据目录存在
    ensureDirectoryExists(path.join(process.cwd(), 'server', 'data'));
    
    try {
      if (isWindows) {
        // Windows上使用PowerShell来执行sqlite3命令
        await execCommand('powershell -Command "Get-Content models/schema.sql | sqlite3 data/web3ftw.db"', path.join(process.cwd(), 'server'));
      } else {
        await execCommand('sqlite3 data/web3ftw.db < models/schema.sql', path.join(process.cwd(), 'server'));
      }
      log('数据库初始化成功', colors.green);
    } catch (error) {
      log('数据库初始化失败，可能是sqlite3命令不可用，将在服务首次启动时自动创建数据库', colors.yellow);
      log('错误详情: ' + error.message, colors.yellow);
    }
    
    // 6. 检查并关闭已运行的后端服务
    log('检查是否有运行中的后端服务...', colors.yellow);
    const port3001InUse = await isPortInUse(3001);
    
    if (port3001InUse) {
      log('检测到端口3001已被占用，可能是之前的后端服务仍在运行', colors.red);
      const killBackend = await waitForInput('是否终止该进程? (y/n): ');
      if (killBackend.toLowerCase() === 'y') {
        if (await killProcessOnPort(3001)) {
          log('已终止运行中的后端服务', colors.green);
        } else {
          log('无法终止运行中的后端服务，请手动关闭占用端口3001的进程后重试', colors.red);
          return;
        }
      } else {
        log('继续使用现有的后端服务', colors.yellow);
      }
    } else {
      log('未检测到运行中的后端服务', colors.green);
    }
    
    // 启动后端服务
    logSection('6. 启动后端服务');
    const serverProcess = startProcess('npm', ['run', 'dev'], path.join(process.cwd(), 'server'), '后端服务');
    
    // 等待几秒，确保服务启动
    log('等待后端服务启动...', colors.yellow);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 7. 检查并安装缺失的前端依赖
    await checkAndInstallDependencies();
    
    // 8. 安装前端依赖
    logSection('8. 安装前端依赖');
    await execCommand('npm install --legacy-peer-deps', path.join(process.cwd(), 'client'));
    
    // 9. 检查并关闭已运行的前端应用
    log('检查是否有运行中的前端应用...', colors.yellow);
    const port3000InUse = await isPortInUse(3000);
    
    if (port3000InUse) {
      log('检测到端口3000已被占用，可能是之前的前端应用仍在运行', colors.red);
      const killFrontend = await waitForInput('是否终止该进程? (y/n): ');
      if (killFrontend.toLowerCase() === 'y') {
        if (await killProcessOnPort(3000)) {
          log('已终止运行中的前端应用', colors.green);
        } else {
          log('无法终止运行中的前端应用，请手动关闭占用端口3000的进程后重试', colors.red);
          return;
        }
      } else {
        log('继续使用现有的前端应用', colors.yellow);
      }
    } else {
      log('未检测到运行中的前端应用', colors.green);
    }
    
    // 启动前端应用
    logSection('10. 启动前端应用');
    const clientProcess = startProcess('npm', ['start'], path.join(process.cwd(), 'client'), '前端应用');
    
    // 11. 显示测试说明
    logSection('🎉 测试环境已启动');
    log('1. 前端应用运行在: http://localhost:3000', colors.green);
    log('2. 后端服务运行在: http://localhost:3001', colors.green);
    log('3. 本地区块链运行在: http://localhost:8545', colors.green);
    log('\n请在MetaMask中添加本地网络:', colors.yellow);
    log('  - 网络名称: Localhost 8545');
    log('  - RPC URL: http://localhost:8545');
    log('  - 链ID: 31337');
    log('  - 货币符号: ETH');
    
    log('\n可以导入以下测试账户私钥到MetaMask:', colors.yellow);
    log('  - 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 (账户#0)');
    log('  - 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d (账户#1)');
    
    log('\n按Ctrl+C可以停止所有服务', colors.magenta);
    log('输入exit可以退出脚本', colors.magenta);
    
    // 等待用户输入以保持脚本运行
    while (true) {
      const input = await waitForInput('');
      if (input.toLowerCase() === 'exit') {
        break;
      }
    }
    
  } catch (error) {
    log(`设置过程中出错: ${error}`, colors.red);
    process.exit(1);
  }
}

// 运行主函数
main().catch(console.error); 