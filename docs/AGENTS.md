# AI Agent 工作指导 - 文档管理

本目录存放项目文档资料，包括设计文档等。

## 文档结构

```text
docs/
├── AGENTS.md          # 文档目录说明
├── IMPLEMENTATION.md  # 实施方案
├── WORKFLOW.md        # 开发工作流（依赖图 + OMO 流程）
├── prd.md             # 产品需求文档
└── step-plans/        # 分步实施计划
    └── AGENTS.md      # 进度追踪（渐进式披露）
```

## 渐进式披露结构

| 层级 | 文件 | 内容 | 加载时机 |
|------|------|------|----------|
| 1. 目录索引 | `docs/AGENTS.md` | 文档结构、维护要点 | 需要时加载 |
| 2. 进度追踪 | `docs/step-plans/AGENTS.md` | 分步计划状态表格 | 进入该目录时加载 |
| 3. 计划详情 | `docs/step-plans/*.md` | 具体计划内容 | 需要时读取 |

## 核心文档

- **产品需求**: `docs/prd.md`
- **实施方案**: `docs/IMPLEMENTATION.md`
- **工作流程**: `docs/WORKFLOW.md`
- **进度追踪**: `docs/step-plans/AGENTS.md`

## 文档维护要点

1. **同步更新**: 代码变更时同步更新相关文档
2. **保持一致**: 确保文档与实际实现一致
3. **清晰准确**: 避免歧义，结构完整

---

**文档维护**: 全体开发人员共同维护文档的准确性和及时性。

## 测试规范

### TDD 工作流程

- **RED → GREEN → REFACTOR** 循环
- 先写测试，再实现功能
- 测试失败后才编写实现代码
- 测试通过后进行重构优化

### pytest 配置

- pytest >= 8.0.0
- pytest-asyncio 配置：`asyncio_mode = "auto"`

### 测试数据库隔离

- 使用 `setup_db` fixture 创建独立测试数据库
- 每个测试用例独立，不依赖其他测试
- 使用 `pytest.fixture(autouse=True)` 自动应用隔离

---

> **注意**: Textual 测试模式、服务层测试模式、代码质量工具配置详见各模块 AGENTS.md 或用户全局配置。
