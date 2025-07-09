import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

// 代币合约ABI和地址
const tokenABI = [
    // 这里只是简化的合约ABI，你需要替换为自己的ABI
    {
        "constant": true,
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }],
        "name": "transfer",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const rewardContractABI = [
    // 这里是奖励合约的简化ABI
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "learner",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "progressUpdate",
                "type": "uint256"
            }
        ],
        "name": "updateProgress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const tokenAddress = 'YOUR_TOKEN_CONTRACT_ADDRESS';
const rewardContractAddress = 'YOUR_REWARD_CONTRACT_ADDRESS';

function App() {
    const [account, setAccount] = useState('');
    const [balance, setBalance] = useState(0);
    const [progress, setProgress] = useState(0);
    const [web3, setWeb3] = useState(null);

    useEffect(() => {
        if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);

            window.ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
                setAccount(accounts[0]);
            });
        } else {
            alert('Please install MetaMask!');
        }
    }, []);

    useEffect(() => {
        if (web3 && account) {
            const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
            tokenContract.methods.balanceOf(account).call().then(balance => {
                setBalance(web3.utils.fromWei(balance, 'ether'));
            });
        }
    }, [web3, account]);

    const updateLearningProgress = async (progressUpdate) => {
        if (web3 && account) {
            const rewardContract = new web3.eth.Contract(rewardContractABI, rewardContractAddress);
            await rewardContract.methods.updateProgress(account, progressUpdate).send({ from: account });
            alert(`Successfully updated progress and received ${progressUpdate * 10} tokens!`);
        }
    };

    return (
        <div>
            <h1>Learn-to-Earn</h1>
            <p>Account: {account}</p>
            <p>Balance: {balance} LT</p>
            <div>
                <h3>Update Learning Progress</h3>
                <input
                    type="number"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                    placeholder="Enter progress to update"
                />
                <button onClick={() => updateLearningProgress(progress)}>Update Progress</button>
            </div>
        </div>
    );
}

export default App;
