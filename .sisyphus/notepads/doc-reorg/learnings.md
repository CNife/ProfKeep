# Learnings - Doc Reorg

## 2026-03-31 Task 2: IMPLEMENTATION.md fixes

### 发现

1. **项目结构差异**: 文档中的项目结构与实际代码有较大差异
   - screens/ 没有 charts.py
   - widgets/ 只有 __init__.py（没有 chart.py, fund_input.py）
   - services/ 文件命名从 `*_service.py` 改为 `*.py`
   - utils/ 只有 __init__.py（没有 calculators.py, formatters.py, csv_handler.py）

2. **pyproject.toml 配置差异**:
   - Python 版本从 3.11 升级到 3.14
   - ORM 从 SQLAlchemy 改为 SQLModel
   - 构建系统从 hatchling 改为 uv_build
   - 添加了完整的 ruff lint 配置

3. **限流处理**: Tushare 付费版无需限流处理，相关代码已删除

4. **测试范围**: 实际测试覆盖 screens/，不再声明"不测试 UI 层"

### 注意事项

- 实施计划（§11）中的 charts.py、calculators.py 等引用保留为历史计划记录
- 仅更新项目结构（§10）和配置（§10.1），不修改实施计划历史记录