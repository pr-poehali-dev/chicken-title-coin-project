-- Создание таблиц для платформы ЧикенТитул

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    coins INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE,
    time_spent_seconds INTEGER DEFAULT 0
);

-- Таблица титулов
CREATE TABLE IF NOT EXISTS titles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    color VARCHAR(50),
    is_exclusive BOOLEAN DEFAULT FALSE
);

-- Таблица купленных титулов пользователей
CREATE TABLE IF NOT EXISTS user_titles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title_id INTEGER REFERENCES titles(id),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, title_id)
);

-- Таблица квестов
CREATE TABLE IF NOT EXISTS quests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reward INTEGER NOT NULL,
    quest_type VARCHAR(50),
    target_value INTEGER,
    category VARCHAR(50)
);

-- Таблица прогресса квестов пользователей
CREATE TABLE IF NOT EXISTS user_quests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    quest_id INTEGER REFERENCES quests(id),
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    UNIQUE(user_id, quest_id)
);

-- Таблица ежедневных наград
CREATE TABLE IF NOT EXISTS daily_rewards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    day_number INTEGER NOT NULL,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reward_type VARCHAR(20) NOT NULL,
    reward_value TEXT
);

-- Таблица сообщений чата
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_user_titles_user_id ON user_titles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_id ON daily_rewards(user_id);

-- Вставка начальных титулов
INSERT INTO titles (name, price, description, color, is_exclusive) VALUES
('[NEWBIE]', 0, 'Начальный титул', 'text-gray-400', false),
('[VIP]', 500, 'Твой второй титул будет, да?', 'text-neon-purple', false),
('[ADMIN]', 1000, 'Администратор', 'text-red-500', false),
('[SNIPER]', 750, 'Снайпер', 'text-neon-cyan', false),
('[LEGEND]', 2000, 'Легенда', 'text-yellow-400', false),
('[KING]', 3000, 'Король', 'text-neon-pink', false),
('[TASK-MASTER]', 1500, 'Мастер заданий', 'text-green-400', false),
('[CHEATER]', 999, 'Читер', 'text-purple-400', false),
('[CREATOR]', 5000, 'Создатель', 'text-orange-400', false),
('[COLLAB]', 1200, 'Коллаборация', 'text-blue-400', false),
('[SAF ADMIN]', 2500, 'Крак', 'text-red-600', false),
('[SAT ADMIN]', 2500, 'No_Texture', 'text-cyan-400', false),
('[TROLLER]', 666, 'Тролль', 'text-pink-400', false),
('[Третий]', 0, 'Эксклюзивный титул за 3 дня', 'text-amber-500', true),
('[Ежедневный]', 0, 'Эксклюзивный титул за 7 дней', 'text-emerald-500', true)
ON CONFLICT (name) DO NOTHING;