-- 首先检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'quotes';

-- 如果表存在，查看表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quotes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS quotes CASCADE;

-- 重新创建表
CREATE TABLE quotes (
  id BIGSERIAL PRIMARY KEY,
  名言 TEXT NOT NULL,
  作者 TEXT,
  出处 TEXT,
  更新人 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quotes_updated_at 
    BEFORE UPDATE ON quotes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 插入测试数据
INSERT INTO quotes (名言, 作者, 出处, 更新人) VALUES
('主人的工具永远不会拆毁主人的房子。', 'Audre Lorde', '《主人的工具永远不会拆毁主人的房子》', 'admin'),
('在欺骗的时代，说真话就是革命行为。', 'George Orwell', '《1984》', 'admin'),
('对付不自由世界的唯一方法就是变得绝对自由，自由到你的存在本身就是一种反叛行为。', 'Albert Camus', '《反抗者》', 'admin'),
('任何地方的不公正都是对所有地方正义的威胁。', 'Martin Luther King Jr.', '《伯明翰监狱来信》', 'admin'),
('人们放弃权力最常见的方式就是认为自己没有权力。', 'Alice Walker', '《紫色》', 'admin');

-- 验证数据插入
SELECT COUNT(*) as total_records FROM quotes;
SELECT * FROM quotes ORDER BY created_at DESC;
