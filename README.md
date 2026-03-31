# 学校招生信息填报系统

## 功能
- 学生信息采集（姓名、身份证）
- 监护人信息（1-2名，含姓名、手机号、工作单位）
- 表单验证（实时校验）
- 数据持久化存储（后端 API）

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动后端服务
```bash
npm start
```

服务将在 http://localhost:3000 启动

### 3. 打开报名页面
在浏览器中打开 `index.html`

> 注意：由于涉及 API 调用，建议使用本地服务器打开：
> ```bash
> npx serve .
> ```
> 然后访问 http://localhost:3000

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/submissions | 获取所有报名记录 |
| POST | /api/submissions | 提交报名信息 |
| GET | /api/submissions/:id | 查询单个报名 |
| DELETE | /api/submissions/:id | 删除报名记录 |
| GET | /api/stats | 统计信息 |

## 数据存储
- 报名数据存储在 `data/submissions.json`
- 每次提交后数据持久化到文件

## 项目结构
```
enrollment/
├── index.html          # 报名页面
├── server.js           # 后端服务
├── package.json        # 依赖配置
├── styles/
│   └── main.css        # 样式
├── scripts/
│   └── main.js         # 前端脚本
└── data/
    └── submissions.json # 报名数据
```