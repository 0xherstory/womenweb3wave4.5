-- 营地表
CREATE TABLE IF NOT EXISTS camps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_address TEXT NOT NULL UNIQUE,  -- 营地合约地址
    factory_address TEXT NOT NULL,          -- 工厂合约地址
    organizer_address TEXT NOT NULL,        -- 组织者地址
    name TEXT NOT NULL,                     -- 营地名称
    signup_deadline INTEGER NOT NULL,       -- 报名截止时间戳
    camp_end_date INTEGER NOT NULL,         -- 结营时间戳
    challenge_count INTEGER NOT NULL,       -- 挑战关卡总数
    min_participants INTEGER NOT NULL,      -- 最小参与者数量
    max_participants INTEGER NOT NULL,      -- 最大参与者数量
    deposit_amount TEXT NOT NULL,           -- 押金金额(wei)
    state INTEGER NOT NULL,                 -- 营地状态 (0:报名, 1:失败, 2:成功, 3:闯关, 4:结营)
    participant_count INTEGER NOT NULL DEFAULT 0, -- 当前参与者数量
    completed_count INTEGER NOT NULL DEFAULT 0,   -- 完成所有关卡的人数
    current_level INTEGER NOT NULL DEFAULT 1,     -- 当前关卡编号
    created_at INTEGER NOT NULL,            -- 创建时间戳
    updated_at INTEGER NOT NULL,            -- 最后更新时间戳
    ipfs_metadata TEXT                      -- IPFS元数据哈希(可选)
);

-- 参与者表
CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_id INTEGER NOT NULL,               -- 关联的营地ID
    participant_address TEXT NOT NULL,      -- 参与者地址
    state INTEGER NOT NULL,                 -- 参与者状态 (0:未报名, 1:已报名, 2:已完成, 3:已提取, 4:已罚没)
    completed_challenges INTEGER NOT NULL DEFAULT 0, -- 已完成关卡数
    registration_time INTEGER,              -- 报名时间戳
    created_at INTEGER NOT NULL,            -- 创建时间戳
    updated_at INTEGER NOT NULL,            -- 最后更新时间戳
    UNIQUE(camp_id, participant_address)
);

-- 关卡表
CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_id INTEGER NOT NULL,               -- 关联的营地ID
    challenge_index INTEGER NOT NULL,       -- 关卡索引
    deadline INTEGER NOT NULL,              -- 关卡截止时间戳
    password_hash TEXT NOT NULL,            -- 密码哈希
    state INTEGER NOT NULL,                 -- 关卡状态 (0:未配置, 1:激活, 2:已过期)
    completed_count INTEGER NOT NULL DEFAULT 0, -- 完成人数
    created_at INTEGER NOT NULL,            -- 创建时间戳
    updated_at INTEGER NOT NULL,            -- 最后更新时间戳
    UNIQUE(camp_id, challenge_index)
);

-- 关卡完成记录表
CREATE TABLE IF NOT EXISTS challenge_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_id INTEGER NOT NULL,          -- 关联的关卡ID
    participant_id INTEGER NOT NULL,        -- 关联的参与者ID
    completed_at INTEGER NOT NULL,          -- 完成时间戳
    UNIQUE(challenge_id, participant_id)
);

-- 事件日志表
CREATE TABLE IF NOT EXISTS event_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_address TEXT NOT NULL,         -- 合约地址
    event_name TEXT NOT NULL,               -- 事件名称
    transaction_hash TEXT NOT NULL,         -- 交易哈希
    block_number INTEGER NOT NULL,          -- 区块号
    log_index INTEGER NOT NULL,             -- 日志索引
    data TEXT NOT NULL,                     -- 事件数据(JSON)
    created_at INTEGER NOT NULL             -- 创建时间戳
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_camps_organizer ON camps(organizer_address);
CREATE INDEX IF NOT EXISTS idx_camps_state ON camps(state);
CREATE INDEX IF NOT EXISTS idx_participants_address ON participants(participant_address);
CREATE INDEX IF NOT EXISTS idx_participants_camp ON participants(camp_id);
CREATE INDEX IF NOT EXISTS idx_challenges_camp ON challenges(camp_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_challenge ON challenge_completions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_participant ON challenge_completions(participant_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_contract ON event_logs(contract_address);
CREATE INDEX IF NOT EXISTS idx_event_logs_name ON event_logs(event_name); 