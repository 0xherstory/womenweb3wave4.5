-- 检查 swordsdata 表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'swordsdata';

-- 查看 swordsdata 表的实际结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'swordsdata' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 查看现有数据数量
SELECT COUNT(*) as total_records FROM swordsdata;

-- 显示前5条数据（不使用 created_at）
SELECT * FROM swordsdata ORDER BY "ID" DESC LIMIT 5;

-- 显示所有数据
SELECT * FROM swordsdata ORDER BY "ID";
