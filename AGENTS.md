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

## 开发工作流

项目使用 Oh-My-OpenAgent 的 Prometheus + Atlas 编排系统，支持跨机器协作。

### 状态存储 (Git 同步)

```
.sisyphus/
├── plans/              # 详细计划文件
├── notepads/           # 跨任务学习积累
└── boulder.json        # 当前活跃计划的执行进度
```

所有内容纳入 Git 版本控制，跨机器自动同步。

### 工作流程

**1. 规划阶段 (Prometheus)**
```
@plan "任务描述"    # 或 Tab 切换到 Prometheus
```

**2. 执行阶段 (Atlas)**
```
/start-work
```

**3. 快速模式 (ultrawork)**
```
ulw 或 ultrawork
```

### 跨机器切换

```bash
# 1. 同步代码和状态
git pull

# 2. 继续执行
/start-work

# 3. 查看学习积累
ls .sisyphus/notepads/
```

**Notepad 系统** 记录：
- `learnings.md` — 发现的模式、约定
- `decisions.md` — 架构决策及理由
- `issues.md` — 遇到的问题
- `verification.md` — 验证结果

### 冲突处理

`boulder.json` 冲突时，手动合并保留更完整的进度。建议：每次 `/start-work` 前先 `git pull`。

## 重要文档
- 产品需求: `docs/prd.md`
- 实施方案: `docs/IMPLEMENTATION.md`

---

**项目作者**: 蔡涛 | **许可证**: MIT License
