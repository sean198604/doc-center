<p align="center"><img src="assets/readme-cover.png" alt="Doc Center project cover" width="100%" /></p>

# 企业文档下载中心 · Doc-Center

> 📁 企业内网文档下载中心 — 支持文档分类管理、全文搜索、在线下载与 PDF 预览  
> 📁 Enterprise internal document download center — categorization, full-text search, online download & PDF preview.

---

## 📋 项目信息

| 项目 | 详情 |
|---|---|
| **名称** | 企业文档下载中心（Doc-Center） |
| **版本** | 1.0.0 |
| **端口** | 7008 |
| **部署** | Docker Compose |
| **仓库** | [sean198604/doc-center](https://github.com/sean198604/doc-center) |

## 项目概述

企业内网文档下载中心，支持文档分类管理、全文搜索、在线下载、PDF预览等功能。

| 项 | 内容 |
|---|---|
| 前端访问 | `http://服务器IP:7008` |
| 后台地址 | `http://服务器IP:7008/admin` |
| 默认账号 | `admin` / `Admin@123` |

---

## 技术栈

| 组件 | 版本 | 说明 |
|---|---|---|
| React + TypeScript | 18.x | 前端框架 |
| Ant Design | 5.x | UI组件库 |
| Node.js + Express | 18.x | 后端服务 |
| MySQL | 8.0 | 数据库 |
| Nginx | Alpine | 前端服务+反代 |
| Docker Compose | 3.8 | 容器编排 |

---

## 快速部署（Docker）

### 前置要求

- Docker >= 20.10
- Docker Compose >= 2.0
- 服务器开放 **7008** 端口

### 一键启动

```bash
# 1. 进入项目目录（假设项目在 /opt/doc-center）
cd /opt/doc-center

# 2. 构建并启动（首次约3-5分钟）
docker compose up -d --build

# 3. 查看启动状态
docker compose ps

# 4. 查看日志
docker compose logs -f
```

### 验证服务

```bash
# 健康检查
curl http://localhost:7008/api/health

# 预期返回：{"status":"ok","time":"..."}
```

---

## 目录结构

```
doc-center/
├── frontend/          # React前端
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/    # 前台页面
│   │   │   └── admin/     # 后台页面
│   │   ├── api/           # API接口
│   │   ├── types/         # TypeScript类型
│   │   └── utils/         # 工具函数
│   ├── Dockerfile
│   └── nginx.conf
├── backend/           # Node.js后端
│   ├── src/
│   │   ├── routes/        # 路由
│   │   ├── middleware/    # 中间件
│   │   └── utils/         # 工具
│   ├── uploads/           # 上传文件目录
│   └── Dockerfile
├── mysql/
│   └── init.sql           # 数据库初始化
└── docker-compose.yml
```

---

## 数据持久化

文件存储和数据库数据均使用 Docker 命名卷持久化：

| 卷名 | 说明 |
|---|---|
| `doc_center_mysql_data` | MySQL数据 |
| `doc_center_uploads` | 上传文件 |

**重要：不要随意 `docker compose down -v`，否则会删除所有数据！**

---

## 常用运维命令

```bash
# 查看所有容器状态
docker compose ps

# 重启某个服务
docker compose restart backend

# 查看实时日志
docker compose logs -f frontend
docker compose logs -f backend

# 进入后端容器
docker compose exec backend sh

# 备份数据库
docker compose exec mysql mysqldump -u docuser -pDocCenter@2024 doc_center > backup_$(date +%Y%m%d).sql

# 更新部署（代码有变化后）
docker compose up -d --build

# 完全重置（⚠️ 删除所有数据）
docker compose down -v
```

---

## 密码修改

初始密码 `Admin@123` 上线后请及时修改：

1. 登录后台 `/admin`
2. 右上角点击用户名 → 修改密码

---

## 配置说明

### 环境变量（backend/.env）

```env
JWT_SECRET=      # JWT密钥，请修改为随机字符串
DB_PASSWORD=     # 数据库密码
MAX_FILE_SIZE=   # 最大上传文件大小（字节），默认200MB
```

### 文件大小限制

系统默认支持 **200MB** 单文件上传。
如需修改：
1. 修改 `backend/.env` 中的 `MAX_FILE_SIZE`
2. 修改 `frontend/nginx.conf` 中的 `client_max_body_size`
3. 重新构建：`docker compose up -d --build`

---

## 功能说明

### 前台（无需登录）

| 功能 | 说明 |
|---|---|
| 文档列表 | 支持分类筛选、类型筛选、关键词搜索 |
| 文档详情 | 显示文件信息和说明 |
| 直接下载 | 点击即下载，无需登录 |
| PDF预览 | PDF文件支持在线预览 |
| 热门下载 | 按下载次数排行 |
| 最新发布 | 按上传时间排序 |

### 后台（需登录）

| 功能 | 说明 |
|---|---|
| 仪表盘 | 统计概览 + 下载TOP10 |
| 文件管理 | 上传、编辑、删除、置顶 |
| 分类管理 | 新增、编辑、删除分类 |
| 回收站 | 恢复或永久删除文件 |
| 下载日志 | 记录所有下载行为 |
