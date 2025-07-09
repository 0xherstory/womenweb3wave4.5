// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // 或 ^0.8.24

import "./LearnToken.sol";

contract LearnToEarn {
    LearnToken public learnToken;

    mapping(address => uint256) public progress;

    uint256 public rewardPerProgress = 10 * 10 ** 18;

    constructor(address tokenAddress) {
        learnToken = LearnToken(tokenAddress);
    }

    function updateProgress(address learner, uint256 progressUpdate) public {
        progress[learner] += progressUpdate;

        uint256 reward = progressUpdate * rewardPerProgress;
        require(
            learnToken.balanceOf(address(this)) >= reward,
            "Not enough tokens to reward"
        );
        learnToken.transfer(learner, reward);
    }

    function setRewardPerProgress(uint256 newReward) public {
        rewardPerProgress = newReward;
    }
}
