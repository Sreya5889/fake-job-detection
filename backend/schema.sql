-- =============================================================================
-- FAKE JOB DETECTION — SUPABASE POSTGRESQL DATABASE SCHEMA
-- Execute this SQL script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- =============================================================================

-- Enable pgcrypto extension for UUID generation if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on email for fast lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger to automatically update updated_at timestamp on users table
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_timestamp ON users;
CREATE TRIGGER set_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================================================
-- 2. ANALYSES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    input_type VARCHAR(20) NOT NULL CHECK (input_type IN ('text', 'url', 'image', 'voice')),
    input_text TEXT,
    input_url TEXT,
    image_path VARCHAR(500),
    transcription TEXT,
    trust_score INTEGER NOT NULL CHECK (trust_score >= 0 AND trust_score <= 100),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    prediction VARCHAR(50) NOT NULL,
    explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast query retrieval and user isolation
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_risk_level ON analyses(risk_level);
CREATE INDEX IF NOT EXISTS idx_analyses_input_type ON analyses(input_type);

-- =============================================================================
-- 3. INDICATORS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    indicator VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_indicators_analysis_id ON indicators(analysis_id);

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Supabase enforces security at the PostgreSQL database row level.
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;

-- Note: The Node.js Express backend communicates with Supabase using the 
-- SUPABASE_SERVICE_ROLE_KEY which bypasses RLS for administrative access.
-- If client direct queries are ever permitted, policies below enforce user isolation:

-- Analyses: Users can only select their own records
CREATE POLICY "Users can view own analyses" 
    ON analyses FOR SELECT 
    USING (auth.uid() = user_id);

-- Analyses: Users can only insert their own records
CREATE POLICY "Users can insert own analyses" 
    ON analyses FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Analyses: Users can only delete their own records
CREATE POLICY "Users can delete own analyses" 
    ON analyses FOR DELETE 
    USING (auth.uid() = user_id);

-- Indicators: Users can view indicators for their own analyses
CREATE POLICY "Users can view indicators of own analyses" 
    ON indicators FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM analyses 
            WHERE analyses.id = indicators.analysis_id 
            AND analyses.user_id = auth.uid()
        )
    );
