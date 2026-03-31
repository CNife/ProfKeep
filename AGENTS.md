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
| UI 组件 | `src/profkeep/widgets/AGENTS.md` |
| 工具函数 | `src/profkeep/utils/AGENTS.md` |

## 文档与进度

| 内容 | 位置 |
|------|------|
| 产品需求 | `docs/PRD.md` |
| 实施方案 | `docs/IMPLEMENTATION.md` |
| 开发工作流 | `docs/WORKFLOW.md` |
| 文档规范 | `docs/AGENTS.md` |
| 进度追踪 | `docs/step-plans/AGENTS.md` |

## 测试规范

### TDD 工作流程

遵循 **RED → GREEN → REFACTOR** 循环：

1. **RED**: 先写失败的测试（明确期望行为）
2. **GREEN**: 编写最少代码让测试通过
3. **REFACTOR**: 重构代码，保持测试通过

### pytest 配置

- **版本要求**: pytest >= 8.0.0
- **异步支持**: `asyncio_mode = "auto"`（pytest-asyncio）
- **测试数据库隔离**: 每个测试使用独立数据库实例

### 测试数据库隔离

```python
@pytest.fixture(autouse=True)
def setup_db(tmp_path):
    """为每个测试创建独立的 SQLite 数据库"""
    db_path = tmp_path / "test.db"
    # 创建测试数据库并返回路径
    yield db_path
    # 清理测试数据库
```

## 样式文件

- **位置**: `src/profkeep/styles.tcss`
- **用途**: Textual CSS 样式定义，包含所有屏幕和组件的视觉样式

---

**项目作者**: 蔡涛 | **许可证**: MIT License
