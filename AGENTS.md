# AI Agent 工作指导 - 基金账本 TUI

## 项目概述

基于 Textual 的基金管理 TUI 应用，帮助个人投资者管理基金账户、追踪持仓盈亏、手动刷新净值数据。

**当前状态**: 开发核心功能中

## 代码规范
- **Python 版本**: 3.14
- **包名**: `profkeep`

## 数据库
- **ORM**: SQLModel
- **路径**: `~/.profkeep/data.db`
- **索引**: 暂不添加，有性能瓶颈时再加

## 核心约束
1. **数据安全**: SQLite 本地存储，用户完全控制
2. **API 限流**: Tushare 免费版每分钟 200 次，需实现 0.3 秒间隔限流

## 模块规则
- **数据库模型** → 参考 `src/profkeep/models/AGENTS.md`
- **UI/屏幕** → 参考 `src/profkeep/screens/AGENTS.md`
- **开发工作流** → 参考 `docs/WORKFLOW.md`

## 重要文档
- 产品需求: GitHub Issue #1
- 实施方案: `docs/IMPLEMENTATION.md`

---

**项目作者**: 蔡涛 | **许可证**: MIT License
