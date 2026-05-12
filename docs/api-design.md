# API 接口设计

## 一、API 规范

- **协议**：HTTPS
- **基地址**：`https://api.pethub.com/v1`
- **格式**：JSON (request/response)
- **鉴权**：JWT Bearer Token (Header: `Authorization: Bearer <token>`)
- **分页**：`?page=1&page_size=20` → `{ data: [...], total: 100, page: 1, page_size: 20 }`
- **错误**：`{ code: 40001, message: "参数错误", details: {...} }`

## 二、接口列表

### 2.1 认证相关

```
POST   /auth/register          # 注册
POST   /auth/login             # 登录
POST   /auth/sms/send          # 发送验证码
POST   /auth/sms/verify        # 验证码验证
POST   /auth/refresh           # 刷新 Token
POST   /auth/oauth/{provider}  # 第三方登录 (wechat/qq)
```

### 2.2 用户

```
GET    /users/me               # 当前用户信息
PUT    /users/me               # 更新个人资料
GET    /users/:id              # 用户主页
GET    /users/:id/pets         # 用户宠物列表
GET    /users/:id/feeds        # 用户动态列表
POST   /users/:id/follow       # 关注
DELETE /users/:id/follow       # 取消关注
GET    /users/:id/followers    # 粉丝列表
GET    /users/:id/following   # 关注列表
```

### 2.3 宠物档案

```
POST   /pets                   # 添加宠物
PUT    /pets/:id               # 更新宠物信息
DELETE /pets/:id               # 删除宠物
GET    /pets/:id               # 宠物详情
GET    /pets/breeds            # 品种列表 (按类型分组)
```

### 2.4 动态 Feed

```
POST   /feeds                  # 发布动态
DELETE /feeds/:id              # 删除动态
GET    /feeds/:id              # 动态详情
GET    /feeds/timeline         # 关注流
GET    /feeds/recommend        # 推荐流
GET    /feeds/nearby           # 同城流 (需定位)
GET    /feeds/hot              # 热门流
POST   /feeds/:id/like         # 点赞
DELETE /feeds/:id/like         # 取消点赞
POST   /feeds/:id/bookmark     # 收藏
DELETE /feeds/:id/bookmark     # 取消收藏
GET    /feeds/:id/comments     # 评论列表
POST   /feeds/:id/comments     # 发表评论
DELETE /feeds/:id/comments/:cid # 删除评论
```

### 2.5 视频

```
POST   /videos/upload          # 上传视频 (返回 upload_url)
POST   /videos/:id/complete    # 视频上传完成通知
GET    /videos/:id/play        # 获取播放地址 (HLS)
POST   /videos/:id/like       # 点赞视频
```

### 2.6 话题/圈子

```
GET    /topics                 # 热门话题列表
GET    /topics/:id             # 话题详情 + 动态列表
POST   /topics                 # 创建话题
POST   /circles                # 创建圈子
GET    /circles                # 圈子列表
GET    /circles/:id            # 圈子详情
POST   /circles/:id/join       # 加入圈子
DELETE /circles/:id/leave      # 退出圈子
```

### 2.7 交易市场 - 商品

```
POST   /products               # 发布商品
PUT    /products/:id           # 更新商品
DELETE /products/:id           # 下架商品
GET    /products/:id           # 商品详情
GET    /products               # 商品列表 (筛选: category/price/breed/location)
GET    /products/search        # 搜索商品 (q=关键词)
```

### 2.8 交易市场 - 订单

```
POST   /orders                 # 创建订单
GET    /orders                 # 我的订单列表 (buyer_orders / seller_orders)
GET    /orders/:id             # 订单详情
PUT    /orders/:id/pay         # 支付订单
PUT    /orders/:id/confirm     # 确认收货 (买家)
PUT    /orders/:id/cancel      # 取消订单
PUT    /orders/:id/refund      # 申请退款
```

### 2.9 服务预约

```
GET    /services               # 服务列表 (类型/城市筛选)
GET    /services/:id           # 服务详情
POST   /services/:id/book      # 创建预约
GET    /appointments           # 我的预约
PUT    /appointments/:id/cancel # 取消预约
POST   /appointments/:id/review # 评价服务
```

### 2.10 即时通讯

```
POST   /conversations          # 创建会话
GET    /conversations          # 会话列表
GET    /conversations/:id/messages  # 历史消息
POST   /conversations/:id/read # 标记已读
WS     /ws                     # WebSocket 连接 (消息推送)
```

### 2.11 搜索

```
GET    /search                 # 统一搜索 (q=关键词, type=all/feeds/products/users)
POST   /search/suggest         # 搜索建议
```

### 2.12 通知

```
GET    /notifications          # 通知列表
PUT    /notifications/:id/read # 标记已读
PUT    /notifications/read-all # 全部已读
```

### 2.13 管理后台

```
GET    /admin/dashboard        # 数据看板
GET    /admin/users            # 用户管理列表
PUT    /admin/users/:id/ban    # 封禁用户
GET    /admin/feeds/pending    # 待审核动态
PUT    /admin/feeds/:id/status # 审核动态 (pass/reject)
GET    /admin/products/pending # 待审核商品
PUT    /admin/orders/:id/dispute # 交易纠纷处理
```

## 三、通用数据结构

```json
// 用户
{
  "id": "u_123456",
  "nickname": "喵星人",
  "avatar": "https://cdn.pethub.com/avatars/xxx.jpg",
  "bio": "两只猫的铲屎官",
  "city": "北京",
  "gender": 1,
  "pet_count": 2,
  "follower_count": 128,
  "following_count": 56,
  "feed_count": 89,
  "is_followed": true,
  "created_at": "2026-01-15T08:00:00Z"
}

// 宠物档案
{
  "id": "p_78901",
  "name": "咪咪",
  "type": "cat",
  "breed": "英短蓝猫",
  "gender": 0,
  "age": 3,
  "weight": 5.2,
  "is_neutered": true,
  "vaccine_status": "completed",
  "avatar": "https://cdn.pethub.com/pets/xxx.jpg",
  "tags": ["粘人", "爱睡觉", "怕生"]
}

// 动态 Feed
{
  "id": "f_34567",
  "user": { "id": "u_123456", "nickname": "...", "avatar": "..." },
  "pets": [{"id": "p_78901", "name": "咪咪"}],
  "content": "今天的咪咪特别乖",
  "images": ["https://cdn.pethub.com/feeds/xxx.jpg"],
  "video": null,
  "location": { "lat": 39.9042, "lng": 116.4074, "name": "北京·朝阳公园" },
  "topics": ["#猫咪日常", "#英短"],
  "like_count": 42,
  "comment_count": 8,
  "bookmark_count": 12,
  "is_liked": false,
  "is_bookmarked": true,
  "created_at": "2026-05-12T14:30:00Z"
}

// 商品
{
  "id": "prod_23456",
  "seller": { "id": "u_654321", "nickname": "...", "avatar": "..." },
  "title": "皇家猫粮 K36 2kg",
  "category": "pet_food",
  "price": 12800,
  "original_price": 15800,
  "images": ["https://cdn.pethub.com/products/xxx.jpg"],
  "stock": 50,
  "description": "...",
  "specs": { "brand": "皇家", "flavor": "鸡肉", "weight": "2kg" },
  "is_secondhand": false,
  "sales_count": 236,
  "rating": 4.8,
  "created_at": "2026-04-20T10:00:00Z"
}
```
