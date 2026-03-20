-- Burnlog: Initial Schema
-- profiles + daily_usage tables with RLS

-- profiles: public user information
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  subscription_plan TEXT DEFAULT 'pro' CHECK (subscription_plan IN ('pro', 'max_5x', 'max_20x')),
  subscription_price NUMERIC(10,2) DEFAULT 20.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- daily_usage: per-day per-model usage aggregates
CREATE TABLE daily_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  platform TEXT NOT NULL DEFAULT 'claude' CHECK (platform IN ('claude', 'codex')),
  model TEXT NOT NULL,
  input_tokens BIGINT DEFAULT 0,
  output_tokens BIGINT DEFAULT 0,
  cache_creation_tokens BIGINT DEFAULT 0,
  cache_read_tokens BIGINT DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,
  total_cost NUMERIC(10,6) DEFAULT 0,
  active_hours JSONB DEFAULT '{}',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, platform, model)
);

-- Indexes
CREATE INDEX idx_daily_usage_user_date ON daily_usage(user_id, date DESC);
CREATE INDEX idx_daily_usage_platform ON daily_usage(user_id, platform);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

-- profiles: everyone can read, owners can write
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- daily_usage: only owners can read/write
CREATE POLICY "Users can view own usage"
  ON daily_usage FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON daily_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON daily_usage FOR UPDATE USING (auth.uid() = user_id);

-- Public profile stats function (bypasses RLS, returns only aggregated data)
CREATE OR REPLACE FUNCTION get_public_profile_stats(target_username TEXT)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'username', p.username,
    'display_name', p.display_name,
    'avatar_url', p.avatar_url,
    'subscription_plan', p.subscription_plan,
    'total_tokens', COALESCE(SUM(d.total_tokens), 0),
    'total_cost', COALESCE(SUM(d.total_cost), 0),
    'days_active', COUNT(DISTINCT d.date),
    'platforms_used', COALESCE(array_agg(DISTINCT d.platform) FILTER (WHERE d.platform IS NOT NULL), ARRAY[]::TEXT[]),
    'models_used', COALESCE(array_agg(DISTINCT d.model) FILTER (WHERE d.model IS NOT NULL), ARRAY[]::TEXT[]),
    'first_date', MIN(d.date),
    'last_date', MAX(d.date)
  )
  FROM profiles p
  LEFT JOIN daily_usage d ON d.user_id = p.id
  WHERE p.username = target_username
  GROUP BY p.id;
$$;

-- Public heatmap data function (returns daily totals for heatmap, no sensitive data)
CREATE OR REPLACE FUNCTION get_public_heatmap(target_username TEXT, days_back INT DEFAULT 365)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  FROM (
    SELECT d.date, SUM(d.total_tokens) as tokens
    FROM daily_usage d
    JOIN profiles p ON p.id = d.user_id
    WHERE p.username = target_username
      AND d.date >= CURRENT_DATE - days_back
    GROUP BY d.date
    ORDER BY d.date
  ) t;
$$;

-- Trigger to update updated_at on profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
