# API 接口文档

Base URL: `http://服务器IP:7008/api`

## 认证说明

后台接口需要在请求头中携带 JWT Token：

```
Authorization: Bearer <token>
```

---

## 认证接口

### 登录

**POST** `/auth/login`

```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

响应：
```json
{
  "code": 200,
  "data": {
    "token": "eyJ...",
    "username": "admin",
    "role": "super_admin"
  }
}
```

### 修改密码

**POST** `/auth/change-password`  🔒 需认证

```json
{ "oldPassword": "Admin@123", "newPassword": "NewPass@123" }
```

---

## 分类接口

### 获取分类列表（含文件数）

**GET** `/categories`

响应：
```json
{
  "code": 200,
  "data": [
    { "id": 1, "name": "合同模板", "icon": "FileTextOutlined", "sort_order": 1, "doc_count": 3 }
  ]
}
```

### 新增分类 🔒

**POST** `/categories`

```json
{ "name": "合同模板", "icon": "FileTextOutlined", "sort_order": 1 }
```

### 编辑分类 🔒

**PUT** `/categories/:id`

### 删除分类 🔒

**DELETE** `/categories/:id`

> 注意：分类下有文件时无法删除

---

## 文档接口

### 获取文档列表

**GET** `/documents`

Query参数：

| 参数 | 类型 | 说明 |
|---|---|---|
| q | string | 搜索关键词（匹配标题、描述、标签）|
| category_id | number | 分类ID |
| file_type | string | 文件类型（pdf/docx/xlsx等）|
| page | number | 页码，默认1 |
| page_size | number | 每页数量，默认20，最大100 |
| sort | string | 排序字段（updated_at/created_at/download_count/title）|
| order | string | asc/desc |

响应：
```json
{
  "code": 200,
  "data": {
    "total": 100,
    "page": 1,
    "page_size": 20,
    "list": [...]
  }
}
```

### 获取热门下载 TOP10

**GET** `/documents/top`

### 获取最新发布 TOP10

**GET** `/documents/recent`

### 获取文档详情

**GET** `/documents/:id`

### 下载文件

**GET** `/documents/:id/download`

> 触发文件下载，下载次数+1，记录下载日志

### PDF在线预览

**GET** `/documents/:id/preview`

> 返回PDF文件流（Content-Type: application/pdf）

### 上传文件 🔒

**POST** `/documents`  `Content-Type: multipart/form-data`

| 字段 | 必填 | 说明 |
|---|---|---|
| file | 是 | 文件（最大200MB）|
| title | 是 | 文件显示名称 |
| category_id | 是 | 分类ID |
| version | 否 | 版本号，默认v1.0 |
| description | 否 | 文件说明 |
| tags | 否 | 标签，逗号分隔 |

### 编辑文档信息 🔒

**PUT** `/documents/:id`

```json
{
  "title": "更新后的名称",
  "category_id": 1,
  "version": "v2.0",
  "description": "...",
  "tags": "合同,模板",
  "is_top": 1
}
```

### 切换置顶 🔒

**PATCH** `/documents/:id/top`

### 移入回收站 🔒

**DELETE** `/documents/:id`

### 从回收站恢复 🔒

**POST** `/documents/:id/restore`

### 永久删除 🔒

**DELETE** `/documents/:id/permanent`

### 获取下载日志 🔒

**GET** `/documents/:id/logs`

---

## 统计接口

### 仪表盘统计 🔒

**GET** `/stats`

响应：
```json
{
  "code": 200,
  "data": {
    "total_docs": 50,
    "total_downloads": 1234,
    "monthly_uploads": 5,
    "recent_docs": [...],
    "top_downloads": [...],
    "category_stats": [...]
  }
}
```

### 下载日志列表 🔒

**GET** `/stats/download-logs?page=1&page_size=20`

---

## 通用响应格式

```json
{
  "code": 200,        // 200=成功，400=参数错误，401=未认证，404=不存在，500=服务器错误
  "message": "ok",
  "data": {}
}
```
