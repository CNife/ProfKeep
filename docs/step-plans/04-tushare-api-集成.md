# 04 - Tushare API 集成

> **状态**: 待开始
> **来源**: GitHub Issue #4

## Parent PRD

## 1

### What to build

封装 Tushare API 调用：

- 限流器（0.3 秒间隔）
- 基金净值获取（fund_nav）
- 基金基本信息获取（fund_basic）
- 指数日线获取（index_daily，沪深300）
- 错误处理（网络超时、Token 无效、限流）

### Acceptance criteria

- [ ] 限流器正确工作，不会超过每分钟 200 次限制
- [ ] 网络超时时重试 3 次
- [ ] Token 无效时抛出明确错误
- [ ] API 限流时等待重试
- [ ] 基金代码不存在时返回明确错误
- [ ] 服务层单元测试通过（Mock Tushare API）

### Blocked by

- #2

### User stories addressed

- User story 18: 输入基金代码时自动查询名称
- User story 19: 网络失败时友好提示
- User story 20: API 限流时等待重试
