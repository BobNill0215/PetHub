# 数据库设计

## 一、数据库选型策略

| 数据类型 | 数据库 | 理由 |
|---------|--------|------|
| 用户/订单/交易 | PostgreSQL | 强 ACID，关系复杂，需要事务 |
| 动态/评论/内容 | MongoDB | 非结构化，schema 灵活，读写频繁 |
| 缓存/会话 | Redis | 高性能缓存，排行榜，GEO |
| 搜索 | Elasticsearch | 全文检索，聚合分析 |
| 文件 | 阿里云 OSS | 图片/视频存储，成本低 |

## 二、PostgreSQL 核心表设计

### 2.1 用户表 (users)

```sql
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    uuid            VARCHAR(32) UNIQUE NOT NULL,
    phone           VARCHAR(20) UNIQUE,
    email           VARCHAR(100) UNIQUE,
    password_hash   VARCHAR(255),
    nickname        VARCHAR(50) NOT NULL,
    avatar          VARCHAR(500),
    bio             VARCHAR(200),
    gender          SMALLINT DEFAULT 0,       -- 0:未知 1:男 2:女
    city            VARCHAR(50),
    province        VARCHAR(50),
    birthday        DATE,
    role            SMALLINT DEFAULT 1,       -- 1:普通 2:商家 3:管理员
    status          SMALLINT DEFAULT 1,       -- 1:正常 2:封禁
    is_verified     BOOLEAN DEFAULT FALSE,    -- 实名认证
    follow_count    INT DEFAULT 0,
    fan_count       INT DEFAULT 0,
    feed_count      INT DEFAULT 0,
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_city ON users(city);
```

### 2.2 宠物表 (pets)

```sql
CREATE TABLE pets (
    id              BIGSERIAL PRIMARY KEY,
    uuid            VARCHAR(32) UNIQUE NOT NULL,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    name            VARCHAR(50) NOT NULL,
    type            VARCHAR(20) NOT NULL,      -- dog / cat / other
    breed           VARCHAR(50),               -- 品种
    gender          SMALLINT DEFAULT 0,        -- 0:未知 1:公 2:母
    birth_date      DATE,
    weight          DECIMAL(5,2),              -- kg
    is_neutered     BOOLEAN DEFAULT FALSE,
    vaccine_status  VARCHAR(20) DEFAULT 'none', -- none/partial/completed
    avatar          VARCHAR(500),
    color           VARCHAR(50),
    personality_tags TEXT[],                    -- ['粘人','活泼','胆小']
    bio             VARCHAR(500),
    is_public       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_pets_type_breed ON pets(type, breed);
```

### 2.3 关注表 (follows)

```sql
CREATE TABLE follows (
    id              BIGSERIAL PRIMARY KEY,
    follower_id     BIGINT NOT NULL REFERENCES users(id),
    followee_id     BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, followee_id)
);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_followee ON follows(followee_id);
```

### 2.4 商品表 (products)

```sql
CREATE TABLE products (
    id              BIGSERIAL PRIMARY KEY,
    uuid            VARCHAR(32) UNIQUE NOT NULL,
    seller_id       BIGINT NOT NULL REFERENCES users(id),
    title           VARCHAR(200) NOT NULL,
    category        VARCHAR(50) NOT NULL,      -- pet_food / supplies / pet_live / secondhand
    sub_category    VARCHAR(50),
    price           INT NOT NULL,              -- 单位:分
    original_price  INT,
    stock           INT DEFAULT 0,
    images          TEXT[],                    -- JSON 数组
    video_url       VARCHAR(500),
    description     TEXT,
    specs           JSONB,                     -- {brand:"皇家", weight:"2kg"}
    condition       VARCHAR(20),               -- new / used
    pet_type        VARCHAR(20),               -- dog / cat / all
    pet_breed       VARCHAR(50),
    status          SMALLINT DEFAULT 0,        -- 0:待审核 1:上架 2:下架 3:审核拒绝
    sales_count     INT DEFAULT 0,
    rating_sum      INT DEFAULT 0,
    review_count    INT DEFAULT 0,
    city            VARCHAR(50),
    province        VARCHAR(50),
    lat             DECIMAL(10,7),
    lng             DECIMAL(10,7),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_city ON products(city);
```

### 2.5 订单表 (orders)

```sql
CREATE TABLE orders (
    id              BIGSERIAL PRIMARY KEY,
    order_no        VARCHAR(32) UNIQUE NOT NULL,
    product_id      BIGINT NOT NULL REFERENCES products(id),
    buyer_id        BIGINT NOT NULL REFERENCES users(id),
    seller_id       BIGINT NOT NULL REFERENCES users(id),
    quantity        INT DEFAULT 1,
    total_fee       INT NOT NULL,              -- 总金额(分)
    status          VARCHAR(20) DEFAULT 'pending', -- pending/paid/shipped/received/cancelled/refunding/refunded
    payment_method  VARCHAR(20),
    payment_no      VARCHAR(100),              -- 第三方支付单号
    paid_at         TIMESTAMP,
    shipped_at      TIMESTAMP,
    received_at     TIMESTAMP,
    cancel_reason   VARCHAR(500),
    refund_reason   VARCHAR(500),
    receiver_name   VARCHAR(50),
    receiver_phone  VARCHAR(20),
    receiver_addr   VARCHAR(500),
    buyer_note      VARCHAR(500),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_no ON orders(order_no);
```

### 2.6 服务表 (services)

```sql
CREATE TABLE services (
    id              BIGSERIAL PRIMARY KEY,
    provider_id     BIGINT NOT NULL REFERENCES users(id),  -- 商家用户
    shop_name       VARCHAR(100) NOT NULL,
    shop_avatar     VARCHAR(500),
    shop_phone      VARCHAR(20),
    type            VARCHAR(30) NOT NULL,      -- grooming / vet / boarding / training
    city            VARCHAR(50),
    address         VARCHAR(500),
    lat             DECIMAL(10,7),
    lng             DECIMAL(10,7),
    business_hours  JSONB,                     -- {"mon":"09:00-18:00",...}
    description     TEXT,
    images          TEXT[],
    status          SMALLINT DEFAULT 0,        -- 0:待审核 1:营业 2:休息 3:关闭
    rating_avg      DECIMAL(2,1) DEFAULT 0,
    review_count    INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_services_city ON services(city);
```

### 2.7 评价表 (reviews)

```sql
CREATE TABLE reviews (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    target_type     VARCHAR(20) NOT NULL,      -- product / service
    target_id       BIGINT NOT NULL,
    order_id        BIGINT REFERENCES orders(id),
    rating          SMALLINT NOT NULL CHECK(rating BETWEEN 1 AND 5),
    content         TEXT,
    images          TEXT[],
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

## 三、MongoDB 核心集合

### 3.1 动态集合 (feeds)

```json
{
  "_id": ObjectId,
  "uuid": "f_xxxxx",
  "user_id": 12345,
  "content": "今天的咪咪特别乖",
  "images": ["https://..."],
  "video": { "url": "https://...", "cover": "https://...", "duration": 30 },
  "location": { "type": "Point", "coordinates": [116.4, 39.9], "name": "朝阳公园" },
  "topics": ["猫咪日常", "英短"],
  "pet_ids": [78901],
  "like_count": 42,
  "comment_count": 8,
  "bookmark_count": 12,
  "status": 1,                 // 0:pending 1:normal 2:blocked
  "created_at": ISODate,
  "updated_at": ISODate
}
// 索引: { status: 1, created_at: -1 }, { location: "2dsphere" }, { topics: 1 }
```

### 3.2 评论集合 (comments)

```json
{
  "_id": ObjectId,
  "feed_id": ObjectId,
  "user_id": 12345,
  "content": "好可爱！",
  "parent_id": null,           // 回复某条评论时指向父评论
  "reply_to": { "user_id": 67890, "nickname": "..." },
  "like_count": 5,
  "created_at": ISODate
}
// 索引: { feed_id: 1, created_at: -1 }
```

### 3.3 通知集合 (notifications)

```json
{
  "_id": ObjectId,
  "user_id": 12345,            // 通知接收者
  "type": "like",              // like / comment / follow / system
  "actor_id": 67890,           // 触发者
  "target_type": "feed",
  "target_id": "f_xxxxx",
  "content": "xxx 赞了你的动态",
  "is_read": false,
  "created_at": ISODate
}
// 索引: { user_id: 1, is_read: 1, created_at: -1 }
```

## 四、Redis 缓存设计

| Key 模式 | 类型 | 用途 | TTL |
|----------|------|------|-----|
| `session:{token}` | String | 登录会话 | 7天 |
| `user:{id}` | Hash | 用户信息缓存 | 1h |
| `feed:timeline:{user_id}` | List | 关注流 Feed ID 列表 | 1h |
| `feed:hot` | ZSet | 热门动态排行 | 15min |
| `like:feed:{feed_id}` | Set | 动态点赞用户集合 | 永久 |
| `rate:limit:{ip}:{api}` | String | 接口限流 | 1s-1min |
| `geo:nearby:{city}` | GEO | 同城用户/位置索引 | 永久 |
