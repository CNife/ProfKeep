# AI Agent 工作指导 - 基金账本 TUI

## 项目概述

基于 Textual 的基金管理 TUI 应用，帮助个人投资者管理基金账户、追踪持仓盈亏、手动刷新净值数据。

**当前状态**: 核心功能开发中

## 已完成功能

- ✅ **账户管理**: 多账户 CRUD 操作
- ✅ **基金持仓**: 持仓列表、盈亏计算、净值刷新
- ✅ **交易记录**: 4 种交易类型（买入/卖出/现金分红/红利再投资）、T+1 自动确认、持仓重算联动
- ✅ **全局快捷键**: a(账户)、h(持仓)、t(交易)、c(收益曲线)、n/e/d(增删改)、j/k(导航)

## 代码规范

- **Python 版本**: 3.14
- **包名**: `profkeep`

## 数据库

- **ORM**: SQLModel
- **路径**: `~/.profkeep/data.db`
- **索引**: 暂不添加，有性能瓶颈时再加

## 核心约束

1. **数据安全**: SQLite 本地存储，用户完全控制
2. **Tushare API**: 付费版，无需限流处理

## 模块规则

| 模块 | 规则文件 |
|------|----------|
| 数据库模型 | `src/profkeep/models/AGENTS.md` |
| 数据服务 | `src/profkeep/services/AGENTS.md` |
| UI/屏幕 | `src/profkeep/screens/AGENTS.md` |

## 开发工作流

OMO 编排系统工作流 → 参考 `.opencode/skills/workflow/SKILL.md`

## 重要文档

- 产品需求: `docs/prd.md`
- 实施方案: `docs/IMPLEMENTATION.md`

---

**项目作者**: 蔡涛 | **许可证**: MIT License
