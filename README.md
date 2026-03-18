# 基金账本

一个轻量级的基金管理Web应用，帮助个人投资者统一管理多个基金账户、追踪持仓盈亏、自动获取净值数据。

## 功能特性

### 核心功能

- **多账户管理** - 支持创建和管理多个投资账户，区分不同平台或用途的投资组合
- **基金持仓管理** - 添加基金持仓，自动获取基金基本信息，实时查看持仓市值和收益
- **交易记录管理** - 记录买入、卖出、分红等交易操作，自动计算持仓成本
- **净值自动获取** - 通过Tushare API自动获取基金净值历史数据，支持手动刷新
- **持仓盈亏计算** - 自动计算持仓收益、收益率，支持加权平均成本法
- **数据导入导出** - 支持JSON和CSV格式的数据导入导出，方便备份和迁移
- **数据可视化** - 资产配置饼图、收益曲线图、净值走势图等图表展示

### 特色亮点

- 📊 **实时数据可视化** - 一眼看清资产状况，直观了解收益情况
- 🎯 **流畅交互体验** - 减少操作步骤，关键操作一键直达
- 📱 **响应式设计** - 支持桌面和移动端访问，随时随地管理持仓
- 💾 **本地数据存储** - 数据完全在用户控制之下，无需担心隐私泄露
- 🚀 **轻量级部署** - 基于FastAPI和React，部署简单，资源占用少

## 技术栈

### 后端

- **框架**: FastAPI (Python)
- **数据库**: SQLite
- **数据源**: Tushare (基金信息和净值历史)
- **ORM**: SQLAlchemy

### 前端

- **框架**: React 18 + TypeScript
- **UI组件库**: Ant Design 5.x
- **图表库**: ECharts
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **路由**: React Router v6
- **构建工具**: Vite

### 开发工具

- **包管理**: pnpm
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript strict mode
- **API文档**: FastAPI自动生成 (Swagger UI)

## 快速开始

### 环境要求

- Python 3.9+
- Node.js 16+
- pnpm 8+

### 安装依赖

```bash
# 后端依赖
cd backend
pip install -r requirements.txt

# 前端依赖
cd frontend
pnpm install
```

### 配置Tushare API

1. 注册[Tushare](https://tushare.pro/)账号
2. 获取API Token
3. 在后端配置文件中设置Token

```python
# backend/config.py
TUSHARE_TOKEN = "your_tushare_token_here"
```

### 启动应用

```bash
# 启动后端服务
cd backend
uvicorn main:app --reload

# 启动前端开发服务器
cd frontend
pnpm dev
```

访问 http://localhost:5173 即可使用应用。

## 项目结构

```
tui-app/
├── backend/                 # 后端代码
│   ├── api/                # API路由
│   ├── models/             # 数据模型
│   ├── services/           # 业务逻辑
│   ├── database/           # 数据库配置
│   └── main.py             # 应用入口
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API服务
│   │   ├── stores/         # 状态管理
│   │   ├── utils/          # 工具函数
│   │   └── App.tsx         # 应用入口
│   └── package.json
├── PRD.md                  # 产品需求文档
├── UI_DESIGN.md            # UI设计文档
└── README.md               # 项目说明
```

## 开发指南

### 数据库设计

项目使用SQLite数据库，包含以下核心表：

- `accounts` - 账户表
- `funds` - 基金信息表
- `holdings` - 持仓表
- `transactions` - 交易记录表
- `net_values` - 净值历史表

详细设计请参考 [PRD.md](./PRD.md) 文档。

### API设计

后端提供RESTful API，主要接口包括：

- `/api/accounts` - 账户管理
- `/api/funds` - 基金管理
- `/api/holdings` - 持仓管理
- `/api/transactions` - 交易记录
- `/api/export` - 数据导出
- `/api/import` - 数据导入

完整API文档请访问 http://localhost:8000/docs

### 前端组件

前端采用组件化开发，主要组件包括：

- `AccountCard` - 账户卡片
- `HoldingTable` - 持仓表格
- `TransactionForm` - 交易表单
- `AssetChart` - 资产配置图表
- `ProfitChart` - 收益曲线图

详细设计请参考 [UI_DESIGN.md](./UI_DESIGN.md) 文档。

## 功能演示

### 首页/仪表盘

![仪表盘](./docs/images/dashboard.png)

展示资产总览、资产配置、收益趋势和持仓列表。

### 账户管理

![账户管理](./docs/images/accounts.png)

创建和管理多个投资账户。

### 持仓详情

![持仓详情](./docs/images/holdings.png)

查看单个基金的持仓详情、净值走势和交易记录。

### 交易记录

![交易记录](./docs/images/transactions.png)

记录买入、卖出、分红等交易操作。

## 路线图

### v1.0 (MVP)

- [x] 产品需求文档
- [x] UI设计文档
- [ ] 后端API开发
- [ ] 前端页面开发
- [ ] 数据库设计和实现
- [ ] Tushare API集成
- [ ] 基本功能测试

### v1.1

- [ ] 分红记录功能
- [ ] 净值历史图表
- [ ] 资产配置饼图
- [ ] 收益曲线图
- [ ] 数据导入功能
- [ ] 移动端适配优化

### v1.2

- [ ] 批量净值刷新
- [ ] 导出CSV格式
- [ ] 交易记录筛选和排序
- [ ] 持仓详情页优化
- [ ] 帮助文档和FAQ
- [ ] 性能优化

### v2.0 (未来规划)

- [ ] 多币种支持
- [ ] 定投计划管理
- [ ] 收益归因分析
- [ ] 基金对比功能
- [ ] 邮件/微信通知
- [ ] 云端同步
- [ ] 移动App

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 联系方式

- 项目主页: [GitHub Repository URL]
- 问题反馈: [GitHub Issues]
- 邮箱: [your-email@example.com]

## 致谢

- [FastAPI](https://fastapi.tiangolo.com/) - 现代化的Python Web框架
- [React](https://react.dev/) - 用于构建用户界面的JavaScript库
- [Ant Design](https://ant.design/) - 企业级UI设计语言和React组件库
- [Tushare](https://tushare.pro/) - 金融数据接口
- [ECharts](https://echarts.apache.org/) - 强大的可视化图表库

---

**注意**: 本项目仅供个人学习和研究使用，不构成任何投资建议。投资有风险，入市需谨慎。