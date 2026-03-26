# 开发工作流

## 任务依赖图

```text
#2 项目脚手架 ✓
    │
    ├── #3 数据库模型 ✓ ──→ #5 账户管理 ──→ #7 交易记录 ──→ #8 持仓计算
    │                           │               │               │
    │                           │               │               ├── #9 净值刷新 ──→ #10 收益曲线
    │                           │               │               │
    │                           └── #12 帮助    └── #11 CSV     │
    │                                                           │
    └── #4 Tushare API ──→ #6 基金信息 ────────────────────────┘

                                              └──→ #13 错误处理 ──→ #14 打包发布
```

## 任务状态

| # | 任务 | 状态 | 计划文件 |
|---|------|------|----------|
| 2 | 项目脚手架 | ✅ 已完成 | `.sisyphus/plans/02-项目脚手架.md` |
| 3 | 数据库模型 | ✅ 已完成 | `.sisyphus/plans/03-数据库模型.md` |
| 4 | Tushare API 集成 | 待开始 | `.sisyphus/plans/04-tushare-api-集成.md` |
| 5 | 账户管理全流程 | 待开始 | `.sisyphus/plans/05-账户管理全流程.md` |
| 6 | 基金信息管理 | 待开始 | `.sisyphus/plans/06-基金信息管理.md` |
| 7 | 交易记录全流程 | 待开始 | `.sisyphus/plans/07-交易记录全流程.md` |
| 8 | 持仓计算与展示 | 待开始 | `.sisyphus/plans/08-持仓计算与展示.md` |
| 9 | 净值刷新 | 待开始 | `.sisyphus/plans/09-净值刷新.md` |
| 10 | 收益曲线图 | 待开始 | `.sisyphus/plans/10-收益曲线图.md` |
| 11 | CSV 导入导出 | 待开始 | `.sisyphus/plans/11-csv-导入导出.md` |
| 12 | 帮助界面 | 待开始 | `.sisyphus/plans/12-帮助界面.md` |
| 13 | 错误处理完善 | 待开始 | `.sisyphus/plans/13-错误处理完善.md` |
| 14 | 打包发布 | 待开始 | `.sisyphus/plans/14-打包发布.md` |

## 并行开发路径

**路径 A: 账户 → 交易 → 持仓**

```text
#5 账户管理 → #7 交易记录 → #8 持仓计算 → #9 净值刷新 → #10 收益曲线
                      │
                      └── #11 CSV 导入导出
```

**路径 B: Tushare → 基金信息**

```text
#4 Tushare API → #6 基金信息 ──→ 汇入路径 A (#7 交易记录)
```

**可并行**:

- #4 和 #5 可同时开始（无依赖）
- #12 帮助界面在 #5 完成后即可开始
- #11 CSV 在 #7 完成后即可开始

## OMO 工作流程

项目使用 Oh-My-OpenAgent 的 Prometheus + Atlas 编排系统。

### 规划阶段 (Prometheus)

```text
@plan "任务描述"    # 或 Tab 切换到 Prometheus
```

Prometheus 会：

1. 访谈式收集需求
2. 生成详细计划到 `.sisyphus/plans/{name}.md`
3. 可选：Metis 分析遗漏点，Momus 审核计划质量

### 执行阶段 (Atlas)

```text
/start-work
```

Atlas 会：

1. 读取计划文件或 `boulder.json` 恢复进度
2. 分发任务给专业子代理
3. 积累学习到 `.sisyphus/notepads/`
4. 验证每个任务完成

### 快速模式 (ultrawork)

```text
ulw 或 ultrawork
```

一键启动，代理自主探索和执行，适合「不想解释太多」的场景。

### 状态存储

```text
.sisyphus/
├── plans/              # 详细计划文件
├── notepads/           # 跨任务学习积累
│   ├── learnings.md    # 发现的模式、约定
│   ├── decisions.md    # 架构决策及理由
│   ├── issues.md       # 遇到的问题
│   └── verification.md # 验证结果
└── boulder.json        # 当前活跃计划的执行进度
```

所有内容纳入 Git 版本控制。

### 跨机器切换

```bash
git pull          # 同步代码和状态
/start-work       # 继续执行（自动检测进度）
```

### 冲突处理

`boulder.json` 冲突时手动合并，保留更完整的进度。

---

**参考**: `AGENTS.md` 中的完整工作流说明
