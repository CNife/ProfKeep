# 11 - CSV 导入导出

> **状态**: 待开始
> **来源**: GitHub Issue #11

## Parent PRD

#1

## What to build

实现交易记录的 CSV 导入导出：
- CsvHandler（CSV 解析和生成）
- 导出当前账户所有交易记录
- 导入固定格式 CSV 文件
- 导入时校验格式和数据

### CSV 格式

```csv
日期,基金代码,交易类型,份额,金额,手续费,净值,确认状态,备注
2024-01-15,000001,buy,1000.00,1500.00,0,1.500,已确认,定投
```

## Acceptance criteria

- [ ] 导出 CSV 包含当前账户所有交易记录
- [ ] 导入时校验：表头、列数、数据类型、基金代码存在性
- [ ] 导入错误时显示具体行号和错误原因
- [ ] 快捷键 i(导入)、x(导出)
- [ ] 单元测试通过

## Blocked by

- #7

## User stories addressed

- User story 28: 导出 CSV
- User story 29: 导入 CSV
- User story 30: 导入格式错误提示
