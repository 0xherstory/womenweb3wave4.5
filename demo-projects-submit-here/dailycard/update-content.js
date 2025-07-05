const fs = require('fs');
const path = require('path');

// 读取内容库文件
const contentLibraryPath = path.join(__dirname, '../content-library.json');
const contentLibrary = JSON.parse(fs.readFileSync(contentLibraryPath, 'utf8'));

// 更新后端服务中的内容库
const backendServerPath = path.join(__dirname, '../backend/server.js');
let backendServerContent = fs.readFileSync(backendServerPath, 'utf8');

// 提取内容数组
const contentArray = contentLibrary.content;

// 创建新的内容数组字符串
const newContentArray = `const inspirationContent = ${JSON.stringify(contentArray, null, 2)};`;

// 替换后端文件中的内容数组
const contentRegex = /const inspirationContent = \[[\s\S]*?\];/;
backendServerContent = backendServerContent.replace(contentRegex, newContentArray);

// 写回文件
fs.writeFileSync(backendServerPath, backendServerContent);

// 更新前端文件中的内容库
const frontendHomePath = path.join(__dirname, '../frontend/src/pages/Home.js');
let frontendHomeContent = fs.readFileSync(frontendHomePath, 'utf8');

// 替换前端文件中的内容数组
const frontendContentRegex = /const inspirationContent = \[[\s\S]*?\];/;
frontendHomeContent = frontendHomeContent.replace(frontendContentRegex, newContentArray);

// 写回文件
fs.writeFileSync(frontendHomePath, frontendHomeContent);

// 更新智能合约中的内容库大小
const contractPath = path.join(__dirname, '../contracts/DailyInspirationCard.sol');
let contractContent = fs.readFileSync(contractPath, 'utf8');

// 更新内容库大小
const newLibrarySize = contentArray.length;
const librarySizeRegex = /uint256 public contentLibrarySize = \d+;/;
contractContent = contractContent.replace(librarySizeRegex, `uint256 public contentLibrarySize = ${newLibrarySize};`);

// 写回文件
fs.writeFileSync(contractPath, contractContent);

console.log('✅ 内容库更新完成！');
console.log(`📊 更新统计:`);
console.log(`   - 内容总数: ${contentArray.length}`);
console.log(`   - 更新文件: 3个`);
console.log(`   - 后端服务: ${backendServerPath}`);
console.log(`   - 前端页面: ${frontendHomePath}`);
console.log(`   - 智能合约: ${contractPath}`);

// 显示分类统计
const categoryStats = {};
contentArray.forEach(item => {
  categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
});

console.log(`\n📈 分类统计:`);
Object.entries(categoryStats).forEach(([category, count]) => {
  console.log(`   - ${category}: ${count}条`);
});

console.log('\n🚀 下一步操作:');
console.log('1. 重新编译智能合约: npm run compile');
console.log('2. 重新部署合约: npm run deploy:testnet');
console.log('3. 重启应用: npm run dev'); 