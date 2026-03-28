# AI Agent 工作指导 - 基金账本 TUI

## 项目概述

基于 Textual 的基金管理 TUI 应用，帮助个人投资者管理基金账户、追踪持仓盈亏、手动刷新净值数据。

## 代码规范

- **Python 版本**: 3.14
- **包名**: `profkeep`

## 数据库

- **ORM**: SQLModel
- **路径**: `~/.profkeep/data.db`

## 核心约束

1. **数据安全**: SQLite 本地存储，用户完全控制
2. **Tushare API**: 付费版，无需限流处理

## 模块规则

| 模块 | 规则文件 |
|------|----------|
| 数据库模型 | `src/profkeep/models/AGENTS.md` |
| 数据服务 | `src/profkeep/services/AGENTS.md` |
| UI/屏幕 | `src/profkeep/screens/AGENTS.md` |

## 文档与进度

| 内容 | 位置 |
|------|------|
| 产品需求 | `docs/prd.md` |
| 实施方案 | `docs/IMPLEMENTATION.md` |
| 开发工作流 | `docs/WORKFLOW.md` |
| 文档规范 | `docs/AGENTS.md` |
| 进度追踪 | `docs/step-plans/AGENTS.md` |

---

**项目作者**: 蔡涛 | **许可证**: MIT License
