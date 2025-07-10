-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'swordsdata';

-- 如果表存在，查看表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'swordsdata' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 创建 swordsdata 表（如果不存在）
CREATE TABLE IF NOT EXISTS swordsdata (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  author TEXT,
  origin TEXT,
  "user" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_swordsdata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS update_swordsdata_updated_at ON swordsdata;

-- 创建新触发器
CREATE TRIGGER update_swordsdata_updated_at 
    BEFORE UPDATE ON swordsdata 
    FOR EACH ROW 
    EXECUTE FUNCTION update_swordsdata_updated_at();

-- 验证表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'swordsdata' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 查看现有数据数量
SELECT COUNT(*) as total_records FROM swordsdata;

-- 显示前5条数据（如果有的话）
SELECT * FROM swordsdata ORDER BY created_at DESC LIMIT 5;
