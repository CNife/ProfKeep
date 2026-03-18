# 产品需求文档(PRD) - 基金账本

**版本**: v1.0  
**创建日期**: 2026-03-18  
**产品类型**: Web App  
**目标用户**: 个人投资者

---

## 1. Executive Summary

### 问题陈述
个人投资者在管理多个基金账户时,缺乏一个简单易用的工具来统一记录交易、追踪持仓盈亏、自动获取净值数据。手动计算收益效率低且容易出错,不同账户间的资产配置情况难以直观掌握。

### 解决方案
开发一个轻量级基金账本Web应用,提供多账户管理、交易记录、净值自动获取、持仓盈亏计算、数据导入导出等核心功能。用户可以通过简洁的界面快速记录买卖操作,系统自动计算持仓成本、收益情况,并支持数据的导入导出以便备份和迁移。

### 成功标准
1. **数据准确性**: 所有计算(持仓成本、收益、收益率)准确率达到100%,无逻辑错误
2. **净值更新及时性**: 支持手动触发净值更新,响应时间 < 3秒/基金
3. **操作流畅性**: 核心操作(添加账户、记录交易、查看持仓)响应时间 < 500ms
4. **学习成本**: 新用户在无文档情况下,5分钟内完成首次账户创建和交易记录
5. **数据完整性**: 导入导出功能支持所有核心数据,数据无损转换

---

## 2. User Experience & Functionality

### 2.1 用户画像

**主要用户: 个人投资者**
- 年龄: 25-45岁
- 特征: 通过银行、券商、第三方平台等渠道购买公募基金,持有多个基金产品
- 痛点: 
  - 分散在多个平台的持仓难以统一管理
  - 手动计算收益费时费力
  - 缺乏直观的资产配置视图
- 需求: 
  - 快速记录交易
  - 自动更新净值
  - 清晰展示收益情况
  - 数据可备份迁移

### 2.2 用户故事与验收标准

#### US-1: 多账户管理
**作为** 用户,  
**我希望** 能够创建和管理多个投资账户,  
**以便** 区分不同平台或用途的投资组合。

**验收标准**:
- [ ] 可创建账户,填写账户名称、备注信息
- [ ] 可编辑账户信息
- [ ] 可删除账户(需确认,已有交易的账户删除时提示风险)
- [ ] 账户列表展示账户名称、总资产、总收益、持仓基金数量
- [ ] 支持账户排序(按名称、资产规模、收益率)

#### US-2: 基金持仓管理
**作为** 用户,  
**我希望** 在账户中添加和管理基金持仓,  
**以便** 跟踪每只基金的持有情况。

**验收标准**:
- [ ] 输入基金代码后自动获取基金名称、类型等基本信息(通过tushare)
- [ ] 显示当前持仓份额、持仓成本、当前净值、持仓市值、持仓收益、收益率
- [ ] 支持手动刷新单个基金净值
- [ ] 支持批量刷新账户内所有基金净值
- [ ] 显示基金基本信息(基金公司、基金经理、成立日期、基金类型)
- [ ] 支持删除基金持仓(需确认,已有交易的基金删除时提示风险)

#### US-3: 交易记录管理
**作为** 用户,  
**我希望** 记录基金的买入和卖出操作,  
**以便** 系统自动计算持仓和收益。

**验收标准**:
- [ ] 支持记录买入交易:日期、基金、份额、金额、手续费
- [ ] 支持记录卖出交易:日期、基金、份额、金额、手续费
- [ ] 支持记录分红:日期、基金、分红金额、分红方式(现金/红利再投)
- [ ] 自动计算成交净值(金额 ÷ 份额)
- [ ] 交易记录列表支持筛选(按账户、基金、日期范围、交易类型)
- [ ] 支持编辑和删除交易记录
- [ ] 自动更新持仓份额和成本(加权平均成本法)

#### US-4: 净值自动获取
**作为** 用户,  
**我希望** 系统能自动获取基金的最新净值,  
**以便** 实时了解持仓市值和收益情况。

**验收标准**:
- [ ] 调用tushare API获取基金净值历史数据
- [ ] 支持手动触发刷新单个基金净值
- [ ] 支持批量刷新所有持仓基金净值
- [ ] 显示净值更新时间和数据来源
- [ ] 处理API失败情况(网络错误、API限流),显示错误提示
- [ ] 支持净值历史查询和图表展示

#### US-5: 持仓盈亏计算
**作为** 用户,  
**我希望** 系统自动计算持仓盈亏,  
**以便** 快速了解投资收益情况。

**验收标准**:
- [ ] 持仓成本 = Σ(买入金额 - 卖出金额) ÷ 当前持仓份额
- [ ] 持仓市值 = 当前持仓份额 × 最新净值
- [ ] 持仓收益 = 持仓市值 - 持仓成本
- [ ] 收益率 = 持仓收益 ÷ 持仓成本 × 100%
- [ ] 账户总资产 = Σ账户内所有基金持仓市值
- [ ] 账户总收益 = Σ账户内所有基金持仓收益
- [ ] 显示收益金额和收益率,使用红绿配色区分盈亏
- [ ] 支持查看收益曲线图(按日期)

#### US-6: 数据导入导出
**作为** 用户,  
**我希望** 能够导入和导出持仓和交易记录,  
**以便** 备份数据或迁移到其他设备。

**验收标准**:
- [ ] 导出功能支持JSON和CSV两种格式
- [ ] 导出内容包括:账户信息、基金持仓、交易记录、净值历史
- [ ] 导入功能支持JSON格式,自动校验数据完整性
- [ ] 导入时提供冲突处理策略:跳过、覆盖、合并
- [ ] 显示导入进度和结果统计
- [ ] 支持部分导入(仅导入账户/持仓/交易)

#### US-7: 数据可视化
**作为** 用户,  
**我希望** 通过图表直观了解资产配置和收益情况,  
**以便** 做出更好的投资决策。

**验收标准**:
- [ ] 账户资产配置饼图(按基金类型或单只基金)
- [ ] 收益曲线折线图(支持选择时间范围)
- [ ] 持仓列表表格,支持排序和筛选
- [ ] 基金净值走势图(近1月、3月、6月、1年、全部)
- [ ] 移动端适配,图表可交互(缩放、tooltip)

### 2.3 非功能需求

**性能要求**:
- 页面首屏加载时间 < 2秒
- 数据库查询响应时间 < 100ms(1000条记录以内)
- 净值API请求超时设置:5秒

**可用性要求**:
- 界面简洁直观,遵循Material Design或Ant Design设计规范
- 关键操作提供确认对话框和撤销功能
- 错误提示清晰友好,提供解决建议

**兼容性要求**:
- 支持Chrome、Firefox、Safari、Edge主流浏览器最新两个版本
- 响应式设计,支持桌面和移动端访问

**数据安全**:
- 本地SQLite数据库存储,数据完全在用户控制之下
- 导出文件可选择加密存储(后续版本)
- 无需联网即可使用核心功能(除净值获取外)

### 2.4 非目标

**v1.0版本不包含以下功能**:
- 多用户系统和权限管理(单用户自用)
- 实时行情推送(手动刷新净值即可)
- 复杂的技术分析指标(MACD、KDJ等)
- 交易策略回测功能
- 社区交流和分享功能
- 支持股票、债券、期货等其他投资品种
- 移动App(仅Web端)

---

## 3. Technical Specifications

### 3.1 技术栈

**后端**:
- 框架: FastAPI (Python)
- 数据库: SQLite
- 数据源: tushare库(基金信息和净值历史)
- ORM: SQLAlchemy
- 异步处理: async/await

**前端**:
- 框架: React 18 + TypeScript
- UI组件库: Ant Design 5.x
- 状态管理: Zustand 或 React Context
- 图表库: ECharts 或 Recharts
- HTTP客户端: Axios
- 路由: React Router v6
- 构建工具: Vite

**开发工具**:
- 包管理: pnpm
- 代码规范: ESLint + Prettier
- 类型检查: TypeScript strict mode
- API文档: FastAPI自动生成(Swagger UI)

### 3.2 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Account Mgmt │  │ Portfolio    │  │ Transaction  │  │
│  │   Module     │  │   Module     │  │   Module     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Data Import/ │  │ Net Value    │  │ Analytics &  │  │
│  │   Export     │  │   Fetcher    │  │   Charts     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/REST API
                           │
┌─────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │            API Layer (REST Endpoints)             │  │
│  │  /accounts  /funds  /transactions  /net-values    │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Business Logic Layer                  │  │
│  │  - Account Service                                │  │
│  │  - Fund Service                                   │  │
│  │  - Transaction Service                            │  │
│  │  - Calculation Service (Profit/Loss)              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Data Access Layer (SQLAlchemy)        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
┌───────┴────────┐                  ┌─────────┴─────────┐
│  SQLite DB     │                  │  Tushare API      │
│  - accounts    │                  │  - Fund info      │
│  - funds       │                  │  - Net value hist │
│  - transactions│                  │  - Fund companies │
│  - net_values  │                  │                    │
└────────────────┘                  └────────────────────┘
```

### 3.3 数据库设计

#### 表结构

**accounts (账户表)**
```sql
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**funds (基金信息表)**
```sql
CREATE TABLE funds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50),
    company VARCHAR(200),
    manager VARCHAR(100),
    establish_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**holdings (持仓表)**
```sql
CREATE TABLE holdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    fund_id INTEGER NOT NULL,
    shares DECIMAL(15, 4) NOT NULL,
    cost_price DECIMAL(10, 4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (fund_id) REFERENCES funds(id),
    UNIQUE(account_id, fund_id)
);
```

**transactions (交易记录表)**
```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    fund_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'buy', 'sell', 'dividend'
    date DATE NOT NULL,
    shares DECIMAL(15, 4),
    amount DECIMAL(15, 2),
    fee DECIMAL(10, 2) DEFAULT 0,
    net_value DECIMAL(10, 4),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (fund_id) REFERENCES funds(id)
);
```

**net_values (净值历史表)**
```sql
CREATE TABLE net_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fund_id INTEGER NOT NULL,
    date DATE NOT NULL,
    net_value DECIMAL(10, 4) NOT NULL,
    accumulated_value DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fund_id) REFERENCES funds(id),
    UNIQUE(fund_id, date)
);
```

**索引**:
```sql
CREATE INDEX idx_holdings_account ON holdings(account_id);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_fund ON transactions(fund_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_net_values_fund_date ON net_values(fund_id, date);
```

### 3.4 API设计

#### 账户管理 API

```
POST   /api/accounts                 # 创建账户
GET    /api/accounts                 # 获取账户列表
GET    /api/accounts/{id}            # 获取账户详情
PUT    /api/accounts/{id}            # 更新账户信息
DELETE /api/accounts/{id}            # 删除账户
GET    /api/accounts/{id}/summary    # 获取账户汇总(总资产、总收益)
```

#### 基金管理 API

```
POST   /api/funds                    # 添加基金(输入基金代码,自动获取信息)
GET    /api/funds                    # 获取基金列表
GET    /api/funds/{id}               # 获取基金详情
GET    /api/funds/search?code={code} # 按代码搜索基金
POST   /api/funds/{id}/refresh       # 刷新基金净值
POST   /api/funds/refresh-all        # 批量刷新所有基金净值
GET    /api/funds/{id}/history       # 获取净值历史
```

#### 持仓管理 API

```
POST   /api/holdings                 # 添加持仓(账户+基金)
GET    /api/holdings?account={id}    # 获取账户下的持仓列表
GET    /api/holdings/{id}            # 获取持仓详情
PUT    /api/holdings/{id}            # 更新持仓信息
DELETE /api/holdings/{id}            # 删除持仓
GET    /api/holdings/{id}/profit     # 计算持仓收益
```

#### 交易记录 API

```
POST   /api/transactions             # 创建交易记录
GET    /api/transactions?account={id}&fund={id}&type={type}&start={date}&end={date}
PUT    /api/transactions/{id}        # 更新交易记录
DELETE /api/transactions/{id}        # 删除交易记录
```

#### 数据导入导出 API

```
POST   /api/export                   # 导出数据(支持JSON/CSV)
POST   /api/import                   # 导入数据(JSON)
POST   /api/import/validate          # 校验导入数据
```

#### 统计分析 API

```
GET    /api/stats/asset-allocation?account={id}  # 资产配置统计
GET    /api/stats/profit-curve?account={id}&start={date}&end={date}  # 收益曲线
```

### 3.5 核心业务逻辑

#### 持仓成本计算(加权平均法)

```python
def calculate_cost_price(transactions):
    """
    计算持仓成本价
    """
    total_cost = 0  # 总成本
    total_shares = 0  # 总份额
    
    for tx in transactions:
        if tx.type == 'buy':
            total_cost += tx.amount
            total_shares += tx.shares
        elif tx.type == 'sell':
            # 卖出按比例减少成本
            cost_reduction = (tx.shares / total_shares) * total_cost
            total_cost -= cost_reduction
            total_shares -= tx.shares
        elif tx.type == 'dividend':
            if tx.dividend_type == 'reinvest':
                # 红利再投,增加份额,不增加成本
                total_shares += tx.shares
    
    if total_shares == 0:
        return 0
    
    return total_cost / total_shares
```

#### 收益计算

```python
def calculate_profit(holding, latest_net_value):
    """
    计算持仓收益
    """
    market_value = holding.shares * latest_net_value
    cost = holding.shares * holding.cost_price
    profit = market_value - cost
    profit_rate = (profit / cost) * 100 if cost > 0 else 0
    
    return {
        'market_value': market_value,
        'cost': cost,
        'profit': profit,
        'profit_rate': profit_rate
    }
```

### 3.6 集成点

#### Tushare API集成

**基金信息获取**:
```python
import tushare as ts

def get_fund_info(fund_code):
    """
    获取基金基本信息
    """
    pro = ts.pro_api('your_token')
    df = pro.fund_basic(ts_code=fund_code)
    return {
        'code': df['ts_code'][0],
        'name': df['name'][0],
        'type': df['fund_type'][0],
        'company': df['management'][0],
        'manager': df['manager'][0],
        'establish_date': df['found_date'][0]
    }
```

**净值历史获取**:
```python
def get_net_value_history(fund_code, start_date=None, end_date=None):
    """
    获取净值历史数据
    """
    pro = ts.pro_api('your_token')
    df = pro.fund_nav(ts_code=fund_code, start_date=start_date, end_date=end_date)
    return df.to_dict('records')
```

**错误处理**:
- API限流:Tushare免费版有调用频率限制,需要实现请求队列和重试机制
- 网络错误:捕获异常,提示用户重试
- 数据缺失:某些基金可能缺少历史数据,需要友好提示

### 3.7 安全与隐私

**数据存储安全**:
- SQLite数据库文件存储在本地,用户完全控制
- 敏感操作(删除账户、清空数据)需要二次确认
- 数据库文件可备份到用户指定位置

**API安全**:
- Tushare API Token存储在环境变量或配置文件中,不硬编码
- 后端API无需认证(单用户本地应用)
- 如需对外提供服务,需添加JWT认证

**前端安全**:
- 输入校验:基金代码格式、数值范围、日期有效性
- XSS防护:React默认转义,Ant Design组件安全

---

## 4. Risks & Roadmap

### 4.1 技术风险

| 风险 | 影响 | 可能性 | 缓解策略 |
|------|------|--------|----------|
| Tushare API限流或不可用 | 无法获取基金信息和净值 | 中 | 实现本地缓存机制;提供手动输入净值选项;使用备用数据源(天天基金等) |
| SQLite数据库损坏 | 数据丢失 | 低 | 定期自动备份;提供手动备份功能;实现数据库健康检查 |
| 净值计算逻辑错误 | 收益数据不准确 | 中 | 编写完整的单元测试覆盖所有计算场景;提供计算明细查看功能 |
| 前端性能问题(大量数据) | 页面卡顿 | 中 | 实现虚拟滚动;分页加载;数据压缩存储 |
| 浏览器兼容性问题 | 部分用户无法使用 | 低 | 使用Babel转译;Polyfill关键API;明确浏览器支持列表 |

### 4.2 产品风险

| 风险 | 影响 | 可能性 | 缓解策略 |
|------|------|--------|----------|
| 用户不理解持仓成本计算逻辑 | 误以为计算错误 | 高 | 提供详细的帮助文档;显示计算明细;支持多种成本计算方法切换 |
| 基金分红处理不当 | 收益计算偏差 | 中 | 明确支持现金分红和红利再投两种方式;提供分红记录功能 |
| 数据导入格式错误 | 导入失败 | 中 | 提供数据校验和错误提示;提供标准模板下载;实现智能字段映射 |
| 移动端体验差 | 用户使用不便 | 中 | 采用响应式设计;关键功能移动端优化;考虑PWA |

### 4.3 分阶段发布计划

#### MVP (v1.0) - 2周

**核心功能**:
- [ ] 账户管理(CRUD)
- [ ] 基金持仓管理
- [ ] 交易记录(买入、卖出)
- [ ] 净值手动刷新
- [ ] 基本收益计算
- [ ] 数据导出(JSON)

**目标**: 完成最小可用产品,满足基本记录和查看需求。

#### v1.1 - 1周

**功能增强**:
- [ ] 分红记录功能
- [ ] 净值历史图表
- [ ] 资产配置饼图
- [ ] 收益曲线图
- [ ] 数据导入(JSON)
- [ ] 移动端适配优化

**目标**: 提升用户体验,增加数据可视化。

#### v1.2 - 1周

**功能完善**:
- [ ] 批量净值刷新
- [ ] 导出CSV格式
- [ ] 交易记录筛选和排序
- [ ] 持仓详情页优化
- [ ] 帮助文档和FAQ
- [ ] 性能优化(虚拟滚动)

**目标**: 完善细节,提升性能。

#### v2.0 - 未来规划

**高级功能**:
- [ ] 多币种支持
- [ ] 定投计划管理
- [ ] 收益归因分析
- [ ] 基金对比功能
- [ ] 邮件/微信通知(净值异动)
- [ ] 云端同步(可选)
- [ ] 移动App

**目标**: 满足进阶用户需求,提升产品竞争力。

---

## 5. Appendix

### 5.1 术语表

- **公募基金**: 向社会公众公开发行的基金,通过净值申购赎回
- **净值**: 基金单位净值,表示每份基金的价值
- **累计净值**: 基金自成立以来的累计价值(考虑分红)
- **持仓成本**: 购买基金的平均成本价
- **持仓份额**: 当前持有的基金份数
- **持仓市值**: 持仓份额 × 当前净值
- **持仓收益**: 持仓市值 - 持仓成本
- **收益率**: 持仓收益 ÷ 持仓成本 × 100%
- **分红**: 基金向投资者分配收益的方式(现金分红/红利再投)

### 5.2 参考资料

- [Tushare API文档](https://tushare.pro/document/2)
- [FastAPI官方文档](https://fastapi.tiangolo.com/)
- [React官方文档](https://react.dev/)
- [Ant Design组件库](https://ant.design/)
- [基金基础知识](https://www.howbuy.com/fund/)

### 5.3 成功指标监控

**数据准确性验证**:
- 手动测试20+交易场景,验证计算逻辑
- 对比主流基金平台(天天基金、蛋卷基金)的计算结果

**性能监控**:
- 使用Chrome DevTools监控页面加载时间
- 使用FastAPI自带的性能监控工具追踪API响应时间
- 数据库查询使用SQLAlchemy的SQL日志优化

**用户体验评估**:
- 邀请3-5位个人投资者试用,收集反馈
- 关键任务完成率测试(创建账户 → 添加持仓 → 记录交易 → 查看收益)
- 收集用户满意度评分(NPS)

---

## 6. 联系方式

**产品负责人**: [待定]  
**技术负责人**: [待定]  
**文档版本**: v1.0  
**最后更新**: 2026-03-18

---

**文档结束**