-- ============================================================
-- Bumi Niaga Agrochem — Database Initialization
-- Run once on a fresh PostgreSQL instance
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SCHEMA: user_schema
-- ============================================================
CREATE SCHEMA IF NOT EXISTS user_schema;

CREATE TABLE IF NOT EXISTS user_schema.users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    address     TEXT,
    role        VARCHAR(20) NOT NULL DEFAULT 'BUYER',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_schema.refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES user_schema.users(id) ON DELETE CASCADE,
    token       VARCHAR(512) UNIQUE NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON user_schema.users(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON user_schema.refresh_tokens(token);

-- ============================================================
-- SCHEMA: product_schema
-- ============================================================
CREATE SCHEMA IF NOT EXISTS product_schema;

CREATE TABLE IF NOT EXISTS product_schema.categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_schema.products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id     UUID REFERENCES product_schema.categories(id),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT,
    price           NUMERIC(15,2) NOT NULL,
    stock           INTEGER NOT NULL DEFAULT 0,
    unit            VARCHAR(50),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_schema.product_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES product_schema.products(id) ON DELETE CASCADE,
    s3_url      VARCHAR(1024) NOT NULL,
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON product_schema.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON product_schema.products(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_schema.product_images(product_id);

-- ============================================================
-- SCHEMA: order_schema
-- ============================================================
CREATE SCHEMA IF NOT EXISTS order_schema;

CREATE TYPE order_schema.order_status AS ENUM (
    'PENDING_PAYMENT',
    'PAYMENT_CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);

CREATE TABLE IF NOT EXISTS order_schema.orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        VARCHAR(50) UNIQUE NOT NULL,
    buyer_id            UUID NOT NULL,
    status              order_schema.order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
    subtotal            NUMERIC(15,2) NOT NULL,
    shipping_cost       NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(15,2) NOT NULL,
    shipping_name       VARCHAR(255) NOT NULL,
    shipping_phone      VARCHAR(20) NOT NULL,
    shipping_address    TEXT NOT NULL,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_schema.order_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES order_schema.orders(id) ON DELETE CASCADE,
    product_id          UUID NOT NULL,
    product_name        VARCHAR(255) NOT NULL,
    product_image_url   VARCHAR(1024),
    product_price       NUMERIC(15,2) NOT NULL,
    quantity            INTEGER NOT NULL,
    subtotal            NUMERIC(15,2) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON order_schema.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON order_schema.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON order_schema.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_schema.order_items(order_id);

-- ============================================================
-- SCHEMA: payment_schema
-- ============================================================
CREATE SCHEMA IF NOT EXISTS payment_schema;

CREATE TYPE payment_schema.payment_status AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'EXPIRED',
    'REFUNDED'
);

CREATE TABLE IF NOT EXISTS payment_schema.payments (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                    UUID UNIQUE NOT NULL,
    order_number                VARCHAR(50) NOT NULL,
    buyer_id                    UUID NOT NULL,
    amount                      NUMERIC(15,2) NOT NULL,
    status                      payment_schema.payment_status NOT NULL DEFAULT 'PENDING',
    midtrans_transaction_id     VARCHAR(255),
    midtrans_snap_token         VARCHAR(512),
    midtrans_payment_type       VARCHAR(100),
    midtrans_raw_response       JSONB,
    paid_at                     TIMESTAMPTZ,
    expires_at                  TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payment_schema.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_midtrans_id ON payment_schema.payments(midtrans_transaction_id);

-- ============================================================
-- SEED: Default admin user
-- Password: Admin@12345 (BCrypt hash)
-- GANTI PASSWORD INI SETELAH PERTAMA KALI LOGIN!
-- ============================================================
INSERT INTO user_schema.users (email, password, full_name, role)
VALUES (
    'admin@buminiagaagrochem.id',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6PdaKyoGgW',
    'Administrator',
    'ADMIN'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- SEED: Sample categories
-- ============================================================
INSERT INTO product_schema.categories (name, slug, description) VALUES
    ('Pupuk', 'pupuk', 'Berbagai jenis pupuk untuk tanaman'),
    ('Pestisida', 'pestisida', 'Insektisida, fungisida, herbisida'),
    ('Benih', 'benih', 'Benih unggul untuk berbagai tanaman'),
    ('Alat Pertanian', 'alat-pertanian', 'Peralatan dan perlengkapan pertanian')
ON CONFLICT (name) DO NOTHING;
