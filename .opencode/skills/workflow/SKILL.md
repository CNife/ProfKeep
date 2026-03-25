# OMO 编排系统工作流

项目使用 Oh-My-OpenAgent 的 Prometheus + Atlas 编排系统，支持跨机器协作。

## 状态存储 (Git 同步)

```
.sisyphus/
├── plans/              # 详细计划文件
├── notepads/           # 跨任务学习积累
└── boulder.json        # 当前活跃计划的执行进度
```

所有内容纳入 Git 版本控制，跨机器自动同步。

## 工作流程

### 1. 规划阶段 (Prometheus)

```
@plan "任务描述"    # 或 Tab 切换到 Prometheus
```

### 2. 执行阶段 (Atlas)

```
/start-work
```

### 3. 快速模式 (ultrawork)

```
ulw 或 ultrawork
```

## 跨机器切换

```bash
# 1. 同步代码和状态
git pull

# 2. 继续执行
/start-work

# 3. 查看学习积累
ls .sisyphus/notepads/
```

## Notepad 系统

| 文件 | 用途 |
|------|------|
| `learnings.md` | 发现的模式、约定 |
| `decisions.md` | 架构决策及理由 |
| `issues.md` | 遇到的问题 |
| `verification.md` | 验证结果 |

## 冲突处理

`boulder.json` 冲突时，手动合并保留更完整的进度。

建议：每次 `/start-work` 前先 `git pull`。
