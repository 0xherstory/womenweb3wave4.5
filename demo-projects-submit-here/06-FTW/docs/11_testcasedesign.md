
### 测试分类
1. **功能测试项**

   - **页面渲染**：确认首页背景、阶梯图案、价值观文案正确显示
   - **按钮样式**：验证两个登山靴形状的按钮（黑色和红色）显示正确
   - **按钮交互**：悬停和点击效果是否正常
   - **钱包连接**：
     - 点击"连接钱包"按钮，测试MetaMask弹窗是否正常出现
     - 确认连接后地址显示正确
     - 验证右上角菜单展开/收起功能

2. **移动设备兼容性响应式测试**

   使用浏览器开发者工具模拟不同设备尺寸：
   ```
   Chrome/Edge: F12 > 切换设备工具栏 (Ctrl+Shift+M)
   Firefox: F12 > 响应式设计模式 (Ctrl+Shift+M)
   ```

   测试以下设备尺寸下的显示效果：
   - 手机（320px ~ 480px）
   - 平板（768px ~ 1024px）
   - 桌面（> 1200px）

3. **浏览器兼容性测试**

   在以下浏览器中测试网站：
   - Chrome
   - Firefox
   - Edge

4. **场景测试**

   - 业务逻辑、流程
   - 用户场景
   - 交互体验

5. **安全测试**

   - 权限限制
   - 资金安全
   - 密码策略

### 网络连接测试

1. **安装MetaMask**

   如果尚未安装MetaMask钱包扩展，请从[官方网站](https://metamask.io/download/)下载并安装。

2. **配置测试网络**

   在MetaMask中添加测试网络（如Sepolia）：
   - 打开MetaMask
   - 点击网络下拉菜单
   - 选择"添加网络"
   - 选择常用测试网络或手动添加

3. **获取测试代币**

   从测试网络水龙头获取测试ETH：
   - Goerli: https://goerlifaucet.com/
   - Sepolia: https://sepoliafaucet.com/

4. **测试连接流程**
   - 确保在测试网络上
   - 点击网站上的"连接钱包"按钮
   - 授权连接请求
   - 验证地址是否正确显示

### Sonic 的测试网络
  **配置RPC**
  以 MetaMask 钱包为例。我们在钱包的左上角点击 Select a network → Add a custom network，并填入以下 RPC 信息：RPC URL: https://rpc.blaze.soniclabs.comChain 
  ID: 57054
  Currency Symbol: $SBlock 
  Explorer URL: https://testnet.sonicscan.org
  **领取测试币**
  可以在 Sonic 的区块链浏览器中领取原生测试币 $S 以及 Coral, Diamond, Fluorite 等 ERC20 代币。
  登录 https://testnet.soniclabs.com/account，链接 MetaMask 钱包。
  点击 Request Sonic 按钮，此时会弹出钱包签名界面，确认即可。
  也可以 Request Coral、Diamond 等 ERC20 代币，并通过 Add to MetaMask 按钮将这些代币的合约地址添加到钱包中，以便直接展示代币信息。


### 测试用例
待补充