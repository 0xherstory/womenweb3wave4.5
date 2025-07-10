-- 创建格言表
CREATE TABLE IF NOT EXISTS quotes (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建更新时间的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE
    ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO quotes (text, author, category) VALUES
('The master''s tools will never dismantle the master''s house.', 'Audre Lorde', 'Social Justice'),
('In a time of deceit telling the truth is a revolutionary act.', 'George Orwell', 'Truth'),
('The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.', 'Albert Camus', 'Freedom'),
('Injustice anywhere is a threat to justice everywhere.', 'Martin Luther King Jr.', 'Justice'),
('The most common way people give up their power is by thinking they don''t have any.', 'Alice Walker', 'Empowerment'),
('If you are neutral in situations of injustice, you have chosen the side of the oppressor.', 'Desmond Tutu', 'Justice'),
('The revolution is not an apple that falls when it is ripe. You have to make it fall.', 'Che Guevara', 'Revolution'),
('Education is the most powerful weapon which you can use to change the world.', 'Nelson Mandela', 'Education'),
('The oppressed are allowed once every few years to decide which particular representatives of the oppressing class are to represent and repress them.', 'Karl Marx', 'Politics');
