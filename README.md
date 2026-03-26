# 基金账本 TUI

基于 Textual 的基金管理终端应用，帮助个人投资者管理基金账户、追踪持仓盈亏、手动刷新净值数据。

## 项目状态

🚧 **开发中** - PRD 已完成，正在实施

- [PRD 文档](https://github.com/CNife/ProfKeep/issues/1)
- [实施方案](docs/IMPLEMENTATION.md)

## 功能特性

- **多账户管理** - 支持创建和管理多个投资账户
- **基金持仓管理** - 添加基金持仓，实时查看持仓市值和收益
- **交易记录管理** - 记录买入、卖出、分红等交易操作
- **净值手动刷新** - 通过 Tushare API 获取基金净值数据
- **持仓盈亏计算** - 自动计算持仓收益、收益率
- **收益曲线图** - Canvas 实现的收益趋势图表
- **数据导入导出** - 支持 CSV 格式

## 技术栈

- **框架**: Textual (Python TUI)
- **数据库**: SQLite + SQLAlchemy
- **数据源**: Tushare

## 安装

```bash
# 使用 uv 安装
uv tool install profkeep

# 或从源码安装
git clone https://github.com/CNife/ProfKeep.git
cd ProfKeep
uv sync
uv pip install -e .
```

## 配置

1. 注册 [Tushare](https://tushare.pro/) 账号并获取 Token
2. 创建 `~/.tushare/token` 文件，写入 Token

```bash
mkdir -p ~/.tushare
echo "your_token_here" > ~/.tushare/token
```

## 使用

```bash
profkeep
```

## 快捷键

| 按键 | 功能 |
|------|------|
| `a` | 账户管理 |
| `h` | 持仓列表 |
| `t` | 交易记录 |
| `c` | 收益曲线 |
| `n` | 新增 |
| `e` | 编辑 |
| `d` | 删除 |
| `r` | 刷新净值 |
| `i` | 导入 CSV |
| `x` | 导出 CSV |
| `?` | 帮助 |
| `q` | 退出 |
| `j/k` | 上下移动 |
| `Tab` | 切换时间范围（图表页面） |
| `Enter` | 确认 |
| `Esc` | 取消 |

## 数据存储

所有数据存储在本地：

```text
~/.profkeep/
├── data.db      # SQLite 数据库
```

## 开发

```bash
# 安装开发依赖
uv sync

# 运行测试
uv run pytest

# 格式化代码
ruff format src/

# 类型检查
uv run mypy src/
```

## 许可证

MIT License

---

**注意**: 本项目仅供个人学习和研究使用，不构成任何投资建议。投资有风险，入市需谨慎。
