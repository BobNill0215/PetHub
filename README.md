# 宠物社区 + 交易平台 (PetHub)

一个集宠物社交、内容分享、交易市场、服务预约于一体的综合宠物平台。

## 项目定位

连接宠物主人、宠物爱好者、宠物服务商与商家的综合生态平台。

## 目录结构

```
pet-platform/
├── frontend/                 # Web 前端 (Next.js + TypeScript)
├── mobile/                   # 移动端 (Flutter)
├── backend/                  # 后端微服务
│   ├── api-gateway/          # API 网关
│   └── services/             # 微服务
├── docs/                     # 文档
└── infra/                    # 基础设施配置
```

## 快速开始

```bash
# 克隆项目
git clone <repo-url> && cd pet-platform

# 启动后端服务
cd backend && docker-compose up -d

# 启动前端
cd frontend && pnpm install && pnpm dev
```

## 文档索引

| 文档 | 说明 |
|------|------|
| `docs/architecture.md` | 系统架构与技术选型 |
| `docs/features.md` | 功能模块详细设计 |
| `docs/api-design.md` | API 接口设计 |
| `docs/database-schema.md` | 数据库设计 |
| `docs/development-plan.md` | 开发计划与里程碑 |
