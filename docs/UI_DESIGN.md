# UI原型设计文档 - 基金账本

**版本**: v1.0  
**创建日期**: 2026-03-18  
**设计工具**: Figma / 手绘稿  
**技术栈**: React + TypeScript + Ant Design + ECharts

---

## 1. 设计方向

### 1.1 设计理念

**核心价值**: 清晰 · 专业 · 高效

**设计定位**: 为个人投资者打造的轻量级基金管理工具,强调数据的清晰展示和操作的高效便捷。

**差异化特色**:
- 实时数据可视化,一眼看清资产状况
- 流畅的交互体验,减少操作步骤
- 响应式设计,随时随地管理持仓
- 卡片式布局,信息层次分明

### 1.2 视觉风格

**设计风格**: 现代简约专业风格

**设计元素**:
- 清晰的数据展示
- 卡片式布局
- 微动效提升体验
- 色彩区分数据状态

**避免**:
- 过于花哨的装饰元素
- 复杂的动画效果
- 冗余的信息展示

---

## 2. 设计系统

### 2.1 色彩系统

#### 主色调

```
Primary Blue: #1890FF (主色 - 用于主要操作、强调)
  - Light: #40A9FF
  - Dark: #096DD9
  - Background: #E6F7FF
```

#### 辅助色

```
Success Green: #52C41A (盈利 - 用于收益、成功状态)
  - Light: #73D13D
  - Background: #F6FFED

Error Red: #FF4D4F (亏损 - 用于亏损、错误状态)
  - Light: #FF7875
  - Background: #FFF1F0

Warning Orange: #FAAD14 (警告 - 用于提示、警告)
  - Background: #FFFBE6

Neutral Gray: #8C8C8C (中性色 - 用于次要信息)
  - Title: #262626
  - Text: #595959
  - Secondary: #8C8C8C
  - Border: #D9D9D9
  - Background: #F0F0F0
  - White: #FFFFFF
```

#### 背景色

```
Page Background: #F5F7FA (页面背景)
Card Background: #FFFFFF (卡片背景)
Hover Background: #FAFAFA (悬停背景)
```

### 2.2 字体系统

#### 字体家族

```css
/* 主字体 - 中文和英文 */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 
             'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', 
             Helvetica, Arial, sans-serif;

/* 数字字体 - 用于金额、收益率 */
font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
```

#### 字体大小

```
H1 - 页面标题: 32px / 38px (font-size / line-height)
H2 - 区块标题: 24px / 32px
H3 - 卡片标题: 20px / 28px
H4 - 小标题: 16px / 24px

Body 1 - 正文: 14px / 22px
Body 2 - 辅助文字: 12px / 20px

Caption - 说明文字: 12px / 20px
```

#### 字重

```
Regular: 400 (正文)
Medium: 500 (小标题)
Semibold: 600 (标题、强调)
Bold: 700 (数据、重要信息)
```

### 2.3 间距系统

```
xs: 4px   - 紧凑间距
sm: 8px   - 小间距
md: 16px  - 标准间距
lg: 24px  - 大间距
xl: 32px  - 超大间距
xxl: 48px - 巨大间距
```

### 2.4 圆角

```
Small: 4px   - 小按钮、标签
Medium: 8px  - 卡片、按钮
Large: 12px  - 大卡片、弹窗
```

### 2.5 阴影

```css
/* 卡片阴影 */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

/* 悬停阴影 */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);

/* 弹窗阴影 */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
```

---

## 3. 布局系统

### 3.1 响应式断点

```css
/* 移动端 */
@media (max-width: 767px) { }

/* 平板 */
@media (min-width: 768px) and (max-width: 1023px) { }

/* 桌面 */
@media (min-width: 1024px) and (max-width: 1279px) { }

/* 大屏 */
@media (min-width: 1280px) { }
```

### 3.2 栅格系统

```
移动端: 24列,间距16px
平板: 24列,间距24px
桌面: 24列,间距24px
```

### 3.3 页面结构

```
┌─────────────────────────────────────────────────────┐
│                    Header (64px)                     │
│  Logo / Title          账户选择   用户设置          │
├─────────────────────────────────────────────────────┤
│         │                                             │
│         │                                             │
│  Side   │           Main Content                     │
│  Nav    │                                             │
│  (200px)│                                             │
│         │                                             │
│         │                                             │
└─────────────────────────────────────────────────────┘
         Footer (可选,40px)
```

---

## 4. 核心页面设计

### 4.1 页面清单

1. **首页/仪表盘** - 资产概览
2. **账户管理** - 账户列表
3. **持仓详情** - 持仓列表和详情
4. **交易记录** - 交易历史
5. **数据分析** - 图表展示
6. **设置** - 系统设置

---

### 4.2 页面1: 首页/仪表盘

#### 4.2.1 页面目标
- 一眼看清资产状况
- 快速了解收益情况
- 直达常用功能

#### 4.2.2 页面布局

```
┌────────────────────────────────────────────────────────────┐
│  Header                                                      │
│  基金账本              [账户选择 ▼]        [设置] [帮助]   │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  资产总览                    [刷新净值] [导出数据]   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐     │  │
│  │  │ 总资产 │  │ 总收益 │  │ 总成本 │  │ 收益率 │     │  │
│  │  │        │  │        │  │        │  │        │     │  │
│  │  │ ¥50万  │  │ +2.5万 │  │ ¥47.5万│  │ +5.2%  │     │  │
│  │  │        │  │ 绿色   │  │        │  │ 绿色   │     │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘     │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────┐  ┌────────────────────────────┐  │
│  │  资产配置           │  │  收益趋势                   │  │
│  ├─────────────────────┤  ├────────────────────────────┤  │
│  │                     │  │                             │  │
│  │    [饼图]           │  │    [折线图]                │  │
│  │                     │  │                             │  │
│  │  - 股票型 60%      │  │                             │  │
│  │  - 债券型 30%      │  │                             │  │
│  │  - 混合型 10%      │  │                             │  │
│  │                     │  │                             │  │
│  └─────────────────────┘  └────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  持仓列表                        [+添加持仓]          │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  基金名称   持仓份额   持仓成本   持仓市值   收益率   │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │  招商中证白酒  1000   ¥1.2万    ¥1.3万   +8.3%  🟢  │  │
│  │  易方达蓝筹    2000   ¥3.5万    ¥3.4万   -2.9%  🔴  │  │
│  │  ...                                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

#### 4.2.3 核心组件

**1. 资产总览卡片组**

```jsx
<Card className="overview-card">
  <Statistic
    title="总资产"
    value={500000}
    precision={2}
    prefix="¥"
    valueStyle={{ color: '#262626', fontSize: '32px' }}
  />
</Card>

<Card className="profit-card">
  <Statistic
    title="总收益"
    value={25000}
    precision={2}
    prefix={profit >= 0 ? '+' : ''}
    suffix="元"
    valueStyle={{ 
      color: profit >= 0 ? '#52C41A' : '#FF4D4F',
      fontSize: '28px'
    }}
  />
</Card>
```

**2. 资产配置饼图**

```jsx
<Card title="资产配置">
  <PieChart>
    <Pie
      data={assetAllocation}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={120}
      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
    >
      {assetAllocation.map((entry, index) => (
        <Cell key={index} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
  </PieChart>
</Card>
```

**3. 持仓列表表格**

```jsx
<Table
  dataSource={holdings}
  columns={[
    {
      title: '基金名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.code}
          </Text>
        </Space>
      )
    },
    {
      title: '持仓份额',
      dataIndex: 'shares',
      key: 'shares',
      align: 'right',
      render: value => value.toFixed(2)
    },
    {
      title: '持仓成本',
      dataIndex: 'cost',
      key: 'cost',
      align: 'right',
      render: value => `¥${value.toFixed(2)}`
    },
    {
      title: '持仓市值',
      dataIndex: 'marketValue',
      key: 'marketValue',
      align: 'right',
      render: value => `¥${value.toFixed(2)}`
    },
    {
      title: '收益率',
      dataIndex: 'profitRate',
      key: 'profitRate',
      align: 'right',
      render: value => (
        <Text style={{ color: value >= 0 ? '#52C41A' : '#FF4D4F' }}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
        </Text>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Space>
          <Button type="link" size="small">买入</Button>
          <Button type="link" size="small">卖出</Button>
          <Button type="link" size="small">详情</Button>
        </Space>
      )
    }
  ]}
  pagination={{ pageSize: 10 }}
/>
```

---

### 4.3 页面2: 账户管理

#### 4.3.1 页面布局

```
┌────────────────────────────────────────────────────────────┐
│  Header                                                      │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  账户管理                           [+ 新建账户]           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  账户卡片 1                                            │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  账户名称: 招商银行账户                                │  │
│  │  总资产: ¥25万    总收益: +1.2万    收益率: +4.8%     │  │
│  │  持仓基金: 5只                                         │  │
│  │                                                        │  │
│  │  [查看持仓] [记录交易] [编辑] [删除]                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  账户卡片 2                                            │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  账户名称: 支付宝账户                                  │  │
│  │  总资产: ¥15万    总收益: +8千      收益率: +5.3%     │  │
│  │  持仓基金: 3只                                         │  │
│  │                                                        │  │
│  │  [查看持仓] [记录交易] [编辑] [删除]                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [+] 添加新账户                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

#### 4.3.2 核心组件

**账户卡片**

```jsx
<Card className="account-card" hoverable>
  <div className="account-header">
    <Title level={4}>招商银行账户</Title>
    <Tag color="blue">5只基金</Tag>
  </div>
  
  <div className="account-stats">
    <Statistic title="总资产" value={250000} prefix="¥" />
    <Statistic 
      title="总收益" 
      value={12000} 
      prefix="+" 
      valueStyle={{ color: '#52C41A' }}
    />
    <Statistic 
      title="收益率" 
      value={4.8} 
      suffix="%" 
      prefix="+"
      valueStyle={{ color: '#52C41A' }}
    />
  </div>
  
  <div className="account-actions">
    <Button type="primary">查看持仓</Button>
    <Button>记录交易</Button>
    <Button type="text" icon={<EditOutlined />}>编辑</Button>
    <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
  </div>
</Card>
```

**新建账户表单**

```jsx
<Modal title="新建账户" visible={visible} onOk={handleSubmit}>
  <Form layout="vertical">
    <Form.Item 
      label="账户名称" 
      name="name"
      rules={[{ required: true, message: '请输入账户名称' }]}
    >
      <Input placeholder="例如: 招商银行账户" />
    </Form.Item>
    
    <Form.Item label="备注" name="description">
      <TextArea rows={3} placeholder="可选备注信息" />
    </Form.Item>
  </Form>
</Modal>
```

---

### 4.4 页面3: 持仓详情

#### 4.4.1 页面布局

```
┌────────────────────────────────────────────────────────────┐
│  Header                                                      │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  < 返回    招商中证白酒指数 (161725)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  持仓概况                                              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  持仓份额    持仓成本    当前净值    持仓市值         │  │
│  │  1000份     ¥1.2万     1.35       ¥1.35万          │  │
│  │                                                        │  │
│  │  持仓收益    收益率      更新时间                      │  │
│  │  +¥1500    +12.5%     2026-03-18 15:00              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────┐  ┌────────────────────────────┐  │
│  │  净值走势           │  │  收益趋势                   │  │
│  ├─────────────────────┤  ├────────────────────────────┤  │
│  │  [时间选择]         │  │  [时间选择]                │  │
│  │  ○ 1月 ○ 3月       │  │  ○ 1月 ○ 3月              │  │
│  │  ○ 6月 ○ 1年       │  │  ○ 6月 ○ 1年              │  │
│  │                     │  │                             │  │
│  │  [折线图]           │  │  [折线图]                  │  │
│  │                     │  │                             │  │
│  └─────────────────────┘  └────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  交易记录                        [+ 买入] [+ 卖出]    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  日期       类型   份额    金额    净值    手续费    │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │  2026-03-15  买入   500   ¥5000   1.20    ¥10      │  │
│  │  2026-02-20  买入   500   ¥4800   1.18    ¥10      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

#### 4.4.2 核心组件

**持仓概况卡片**

```jsx
<Card className="holding-summary">
  <Row gutter={[24, 24]}>
    <Col span={6}>
      <Statistic title="持仓份额" value={1000} suffix="份" />
    </Col>
    <Col span={6}>
      <Statistic title="持仓成本" value={12000} prefix="¥" />
    </Col>
    <Col span={6}>
      <Statistic 
        title="当前净值" 
        value={1.35}
        precision={4}
        suffix={
          <Button type="link" size="small" icon={<ReloadOutlined />}>
            刷新
          </Button>
        }
      />
    </Col>
    <Col span={6}>
      <Statistic title="持仓市值" value={13500} prefix="¥" />
    </Col>
  </Row>
  
  <Divider />
  
  <Row gutter={[24, 24]}>
    <Col span={8}>
      <Statistic 
        title="持仓收益" 
        value={1500}
        prefix="+"
        suffix="元"
        valueStyle={{ color: '#52C41A', fontSize: '24px' }}
      />
    </Col>
    <Col span={8}>
      <Statistic 
        title="收益率" 
        value={12.5}
        precision={2}
        prefix="+"
        suffix="%"
        valueStyle={{ color: '#52C41A', fontSize: '24px' }}
      />
    </Col>
    <Col span={8}>
      <Text type="secondary">更新时间: 2026-03-18 15:00</Text>
    </Col>
  </Row>
</Card>
```

---

### 4.5 页面4: 交易记录

#### 4.5.1 页面布局

```
┌────────────────────────────────────────────────────────────┐
│  Header                                                      │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  交易记录                           [+ 记录交易]           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  筛选条件                                              │  │
│  │  账户: [全部账户 ▼]  基金: [全部基金 ▼]              │  │
│  │  类型: [全部 ▼]      时间: [2026-01-01] 至 [今天]    │  │
│  │                               [重置] [查询]           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  交易列表                                              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  日期       账户      基金          类型  份额   金额│  │
│  │  ─────────────────────────────────────────────────  │  │
│  │  2026-03-18 招商账户  招商白酒       买入  500  ¥5000│  │
│  │  2026-03-17 支付宝    易方达蓝筹     卖出  300  ¥4500│  │
│  │  2026-03-15 招商账户  招商白酒       分红  -    ¥200 │  │
│  │  ...                                                 │  │
│  │                                                        │  │
│  │  [上一页] 1 / 10 [下一页]                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

#### 4.5.2 核心组件

**交易记录表单**

```jsx
<Modal title="记录交易" visible={visible} onOk={handleSubmit}>
  <Form layout="vertical">
    <Form.Item label="交易类型" name="type" rules={[{ required: true }]}>
      <Radio.Group>
        <Radio.Button value="buy">买入</Radio.Button>
        <Radio.Button value="sell">卖出</Radio.Button>
        <Radio.Button value="dividend">分红</Radio.Button>
      </Radio.Group>
    </Form.Item>
    
    <Form.Item label="账户" name="accountId" rules={[{ required: true }]}>
      <Select placeholder="选择账户">
        {accounts.map(acc => (
          <Select.Option key={acc.id} value={acc.id}>
            {acc.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
    
    <Form.Item label="基金代码" name="fundCode" rules={[{ required: true }]}>
      <Input 
        placeholder="输入基金代码" 
        onBlur={handleFetchFundInfo}
        suffix={loading ? <LoadingOutlined /> : null}
      />
    </Form.Item>
    
    <Form.Item label="基金名称">
      <Input value={fundName} disabled />
    </Form.Item>
    
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item label="交易日期" name="date" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="份额" name="shares" rules={[{ required: true }]}>
          <InputNumber 
            style={{ width: '100%' }} 
            min={0} 
            precision={2}
            placeholder="输入份额"
          />
        </Form.Item>
      </Col>
    </Row>
    
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item label="金额" name="amount" rules={[{ required: true }]}>
          <InputNumber 
            style={{ width: '100%' }} 
            min={0} 
            precision={2}
            prefix="¥"
            placeholder="输入金额"
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="手续费" name="fee">
          <InputNumber 
            style={{ width: '100%' }} 
            min={0} 
            precision={2}
            prefix="¥"
            placeholder="可选"
          />
        </Form.Item>
      </Col>
    </Row>
    
    <Form.Item label="备注" name="notes">
      <TextArea rows={2} placeholder="可选备注" />
    </Form.Item>
  </Form>
</Modal>
```

---

### 4.6 页面5: 数据分析

#### 4.6.1 页面布局

```
┌────────────────────────────────────────────────────────────┐
│  Header                                                      │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  数据分析                                                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  收益曲线                                              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  [账户选择 ▼]  [时间范围: 近1年 ▼]                   │  │
│  │                                                        │  │
│  │  [折线图]                                             │  │
│  │  Y轴: 收益率%                                         │  │
│  │  X轴: 时间                                            │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────┐  ┌────────────────────────────┐  │
│  │  资产配置           │  │  基金类型分布               │  │
│  ├─────────────────────┤  ├────────────────────────────┤  │
│  │  [饼图]             │  │  [饼图]                    │  │
│  │                     │  │                             │  │
│  │  按基金名称         │  │  按基金类型                │  │
│  └─────────────────────┘  └────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  收益排名                                              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  排名  基金名称           收益率    持仓市值         │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │   1    招商中证白酒       +12.5%    ¥1.35万         │  │
│  │   2    易方达中小盘       +8.2%     ¥2.1万          │  │
│  │   3    嘉实沪深300        +5.6%     ¥1.8万          │  │
│  │  ...                                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

### 4.7 页面6: 设置

#### 4.7.1 页面布局

```
┌────────────────────────────────────────────────────────────┐
│  Header                                                      │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  设置                                                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  数据管理                                              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  [导出数据]  导出所有数据为JSON或CSV格式              │  │
│  │  [导入数据]  从备份文件恢复数据                       │  │
│  │  [清空数据]  删除所有账户和交易记录(危险操作)        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tushare配置                                           │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  API Token: [*********************] [测试连接]       │  │
│  │                                                        │  │
│  │  状态: ✓ 连接正常                                     │  │
│  │  最后测试: 2026-03-18 15:30                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  显示设置                                              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  主题: ○ 浅色  ○ 深色  ○ 跟随系统                    │  │
│  │  语言: ○ 中文  ○ English                             │  │
│  │  默认账户: [招商银行账户 ▼]                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  关于                                                  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  版本: v1.0.0                                         │  │
│  │  作者: [作者信息]                                     │  │
│  │  反馈: [GitHub Issues链接]                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

## 5. 组件设计

### 5.1 通用组件

#### 5.1.1 Header组件

```jsx
<Header className="app-header">
  <div className="logo">
    <FundOutlined />
    <Title level={3} style={{ margin: 0 }}>基金账本</Title>
  </div>
  
  <div className="account-selector">
    <Select 
      style={{ width: 200 }} 
      placeholder="选择账户"
      value={currentAccount}
      onChange={handleAccountChange}
    >
      {accounts.map(acc => (
        <Select.Option key={acc.id} value={acc.id}>
          {acc.name}
        </Select.Option>
      ))}
    </Select>
  </div>
  
  <div className="header-actions">
    <Button type="text" icon={<SettingOutlined />} />
    <Button type="text" icon={<QuestionCircleOutlined />} />
  </div>
</Header>
```

#### 5.1.2 SideNav组件

```jsx
<Sider width={200} className="app-sider">
  <Menu
    mode="inline"
    selectedKeys={[currentPath]}
    style={{ height: '100%', borderRight: 0 }}
  >
    <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
      仪表盘
    </Menu.Item>
    <Menu.Item key="/accounts" icon={<AccountBookOutlined />}>
      账户管理
    </Menu.Item>
    <Menu.Item key="/holdings" icon={<PieChartOutlined />}>
      持仓详情
    </Menu.Item>
    <Menu.Item key="/transactions" icon={<TransactionOutlined />}>
      交易记录
    </Menu.Item>
    <Menu.Item key="/analytics" icon={<BarChartOutlined />}>
      数据分析
    </Menu.Item>
    <Menu.Item key="/settings" icon={<SettingOutlined />}>
      设置
    </Menu.Item>
  </Menu>
</Sider>
```

#### 5.1.3 数据卡片组件

```jsx
<Card className="data-card" hoverable>
  <div className="data-card-header">
    <Text type="secondary">{title}</Text>
    {action && <div className="data-card-action">{action}</div>}
  </div>
  <div className="data-card-body">
    <Statistic
      value={value}
      prefix={prefix}
      suffix={suffix}
      precision={precision}
      valueStyle={{ 
        color: valueColor,
        fontSize: '28px',
        fontWeight: 600
      }}
    />
    {trend && (
      <div className="data-card-trend">
        <ArrowUpOutlined style={{ color: trend >= 0 ? '#52C41A' : '#FF4D4F' }} />
        <Text style={{ color: trend >= 0 ? '#52C41A' : '#FF4D4F' }}>
          {Math.abs(trend)}%
        </Text>
      </div>
    )}
  </div>
</Card>
```

### 5.2 业务组件

#### 5.2.1 基金选择器组件

```jsx
<Space direction="vertical" style={{ width: '100%' }}>
  <Input
    placeholder="输入基金代码"
    prefix={<SearchOutlined />}
    value={fundCode}
    onChange={e => setFundCode(e.target.value)}
    onBlur={handleSearchFund}
  />
  {fundInfo && (
    <Card size="small">
      <Space direction="vertical" size="small">
        <Text strong>{fundInfo.name}</Text>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {fundInfo.type} | {fundInfo.company}
        </Text>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          基金经理: {fundInfo.manager}
        </Text>
      </Space>
    </Card>
  )}
</Space>
```

#### 5.2.2 收益显示组件

```jsx
<Text 
  className="profit-text"
  style={{ 
    color: profit >= 0 ? '#52C41A' : '#FF4D4F',
    fontWeight: 600
  }}
>
  {profit >= 0 ? '+' : ''}{profit.toFixed(2)}元
  <span style={{ marginLeft: '8px', fontSize: '12px' }}>
    ({profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%)
  </span>
</Text>
```

#### 5.2.3 净值刷新按钮组件

```jsx
<Space>
  <Text type="secondary">净值: {netValue}</Text>
  <Button 
    type="link" 
    size="small"
    icon={<ReloadOutlined spin={loading} />}
    onClick={handleRefresh}
  >
    {loading ? '刷新中...' : '刷新'}
  </Button>
  <Tooltip title={`更新时间: ${updateTime}`}>
    <InfoCircleOutlined style={{ color: '#8C8C8C' }} />
  </Tooltip>
</Space>
```

---

## 6. 交互设计

### 6.1 页面跳转流程

```
首页/仪表盘
  ├─> 点击账户卡片 -> 账户持仓详情
  ├─> 点击持仓行 -> 持仓详情页
  ├─> 点击[买入/卖出] -> 交易记录表单
  └─> 点击[添加持仓] -> 持仓添加表单

账户管理
  ├─> 点击[新建账户] -> 账户创建表单
  ├─> 点击[查看持仓] -> 账户持仓详情
  ├─> 点击[编辑] -> 账户编辑表单
  └─> 点击[删除] -> 删除确认对话框

持仓详情
  ├─> 点击[买入/卖出] -> 交易记录表单
  ├─> 点击交易记录行 -> 交易编辑表单
  └─> 点击[刷新净值] -> 净值更新

交易记录
  ├─> 点击[记录交易] -> 交易记录表单
  ├─> 点击筛选 -> 筛选面板展开
  └─> 点击交易行 -> 交易详情/编辑

数据分析
  ├─> 切换账户 -> 图表更新
  ├─> 切换时间范围 -> 图表更新
  └─> 点击图表 -> 详情弹窗

设置
  ├─> 点击[导出数据] -> 导出对话框
  ├─> 点击[导入数据] -> 导入对话框
  └─> 点击[清空数据] -> 危险操作确认
```

### 6.2 关键交互细节

#### 6.2.1 添加持仓流程

```
1. 点击[+ 添加持仓]按钮
   ↓
2. 弹出持仓添加对话框
   - 输入基金代码
   - 自动获取基金信息(显示loading)
   - 显示基金基本信息
   - 输入初始份额和成本
   ↓
3. 点击[确定]
   - 表单验证
   - 提交数据
   - 成功提示
   - 关闭对话框
   - 刷新持仓列表
```

#### 6.2.2 记录交易流程

```
1. 点击[+ 记录交易]按钮
   ↓
2. 弹出交易记录表单
   - 选择交易类型(买入/卖出/分红)
   - 选择账户
   - 输入基金代码
   - 自动获取基金信息
   - 输入交易详情(日期、份额、金额、手续费)
   ↓
3. 点击[确定]
   - 表单验证
   - 自动计算净值(金额÷份额)
   - 提交数据
   - 更新持仓份额和成本
   - 成功提示
   - 关闭对话框
   - 刷新持仓和交易记录
```

#### 6.2.3 刷新净值流程

```
1. 点击[刷新净值]按钮
   ↓
2. 显示loading状态
   ↓
3. 调用Tushare API获取最新净值
   ↓
4. 更新数据库
   ↓
5. 重新计算持仓市值和收益
   ↓
6. 更新页面显示
   - 更新净值显示
   - 更新持仓市值
   - 更新收益数据
   - 显示更新时间
   ↓
7. 成功提示
```

### 6.3 错误处理

#### 6.3.1 表单验证

```jsx
// 基金代码验证
rules: [
  { required: true, message: '请输入基金代码' },
  { pattern: /^\d{6}$/, message: '基金代码为6位数字' }
]

// 份额验证
rules: [
  { required: true, message: '请输入份额' },
  { type: 'number', min: 0.01, message: '份额必须大于0' }
]

// 金额验证
rules: [
  { required: true, message: '请输入金额' },
  { type: 'number', min: 1, message: '金额必须大于0' }
]
```

#### 6.3.2 错误提示

```jsx
// API错误
message.error('获取基金信息失败,请检查基金代码是否正确')

// 网络错误
message.error('网络连接失败,请检查网络设置')

// 数据验证错误
message.error('数据格式错误,请检查输入')

// 操作成功
message.success('操作成功')
```

### 6.4 加载状态

```jsx
// 页面加载
<Spin spinning={loading}>
  <Table dataSource={data} />
</Spin>

// 按钮加载
<Button type="primary" loading={submitting}>
  提交
</Button>

// 骨架屏
<Skeleton active />
```

---

## 7. 响应式设计

### 7.1 移动端适配

#### 7.1.1 导航调整

```jsx
// 移动端: 底部Tab导航
<div className="mobile-nav">
  <TabBar>
    <TabBar.Item icon={<DashboardOutlined />} title="首页" />
    <TabBar.Item icon={<AccountBookOutlined />} title="账户" />
    <TabBar.Item icon={<PieChartOutlined />} title="持仓" />
    <TabBar.Item icon={<UserOutlined />} title="我的" />
  </TabBar>
</div>

// 桌面端: 侧边导航
<Sider>
  <Menu>...</Menu>
</Sider>
```

#### 7.1.2 布局调整

```css
/* 移动端: 单列布局 */
@media (max-width: 767px) {
  .overview-cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .charts-row {
    display: block;
  }
  
  .chart-card {
    margin-bottom: 16px;
  }
}

/* 桌面端: 多列布局 */
@media (min-width: 768px) {
  .overview-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  
  .charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}
```

#### 7.1.3 表格调整

```jsx
// 移动端: 卡片式列表
<List
  dataSource={holdings}
  renderItem={item => (
    <List.Item>
      <Card size="small" style={{ width: '100%' }}>
        <Row>
          <Col span={12}>{item.name}</Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            {item.profitRate}%
          </Col>
        </Row>
      </Card>
    </List.Item>
  )}
/>

// 桌面端: 标准表格
<Table dataSource={holdings} columns={columns} />
```

---

## 8. 微动效设计

### 8.1 页面过渡

```css
/* 路由切换动画 */
.page-enter {
  opacity: 0;
  transform: translateX(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 0.3s ease-in-out;
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transform: translateX(-20px);
  transition: all 0.3s ease-in-out;
}
```

### 8.2 卡片悬停

```css
.data-card {
  transition: all 0.3s ease;
}

.data-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}
```

### 8.3 数据更新动画

```jsx
// 数字滚动动画
import CountUp from 'react-countup';

<Statistic
  title="总资产"
  value={500000}
  formatter={value => (
    <CountUp end={value} duration={0.8} separator="," prefix="¥" />
  )}
/>
```

### 8.4 加载动画

```css
/* 骨架屏渐变 */
@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}
```

---

## 9. 无障碍设计

### 9.1 键盘导航

- Tab键: 按顺序聚焦可交互元素
- Enter键: 激活按钮和链接
- Esc键: 关闭对话框和下拉菜单

### 9.2 屏幕阅读器支持

```jsx
<Button 
  aria-label="添加新账户"
  icon={<PlusOutlined />}
>
  新建账户
</Button>

<Table
  aria-label="持仓列表"
  dataSource={holdings}
/>
```

### 9.3 对比度

- 文本对比度: 至少4.5:1
- 大文本对比度: 至少3:1
- 链接和按钮: 明确的视觉区分

---

## 10. 设计资源

### 10.1 设计工具

- **Figma**: UI设计稿
- **Sketch**: 备选设计工具
- **Adobe XD**: 交互原型

### 10.2 图标库

- **Ant Design Icons**: 主要图标库
- **Font Awesome**: 备选图标

### 10.3 参考设计

- **Ant Design Pro**: 后台管理系统模板
- **Ant Financial**: 金融产品设计规范
- **Material Design**: 通用设计规范

### 10.4 字体资源

- **Google Fonts**: Roboto, Open Sans
- **Adobe Fonts**: Source Sans Pro
- **系统字体**: PingFang SC, Microsoft YaHei

---

## 11. 开发规范

### 11.1 组件命名

```
组件名: PascalCase (例如: AccountCard, TransactionTable)
样式类名: kebab-case (例如: account-card, transaction-table)
变量名: camelCase (例如: accountList, transactionData)
```

### 11.2 样式组织

```
src/
  styles/
    variables.css    # CSS变量
    mixins.css       # 混入样式
    reset.css        # 重置样式
    global.css       # 全局样式
    
  components/
    AccountCard/
      index.jsx
      styles.css
      index.test.jsx
```

### 11.3 代码示例

```jsx
// AccountCard/index.jsx
import React from 'react';
import { Card, Statistic, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './styles.css';

const AccountCard = ({ account, onEdit, onDelete, onViewHoldings }) => {
  const { name, totalAsset, totalProfit, profitRate, fundCount } = account;
  
  return (
    <Card className="account-card" hoverable>
      <div className="account-card-header">
        <h3>{name}</h3>
        <span className="fund-count">{fundCount}只基金</span>
      </div>
      
      <div className="account-card-stats">
        <Statistic title="总资产" value={totalAsset} prefix="¥" />
        <Statistic 
          title="总收益" 
          value={totalProfit} 
          valueStyle={{ 
            color: totalProfit >= 0 ? '#52C41A' : '#FF4D4F' 
          }}
        />
        <Statistic 
          title="收益率" 
          value={profitRate} 
          suffix="%" 
          precision={2}
          valueStyle={{ 
            color: profitRate >= 0 ? '#52C41A' : '#FF4D4F' 
          }}
        />
      </div>
      
      <div className="account-card-actions">
        <Button type="primary" onClick={onViewHoldings}>
          查看持仓
        </Button>
        <Button icon={<EditOutlined />} onClick={onEdit}>
          编辑
        </Button>
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={onDelete}
        >
          删除
        </Button>
      </div>
    </Card>
  );
};

export default AccountCard;
```

```css
/* AccountCard/styles.css */
.account-card {
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.account-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.account-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.account-card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.fund-count {
  padding: 2px 8px;
  background: #E6F7FF;
  color: #1890FF;
  border-radius: 4px;
  font-size: 12px;
}

.account-card-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.account-card-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 767px) {
  .account-card-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .account-card-actions {
    flex-direction: column;
  }
}
```

---

## 12. 设计检查清单

### 12.1 视觉一致性

- [ ] 所有页面使用统一的色彩系统
- [ ] 字体大小和字重符合设计规范
- [ ] 间距使用标准间距值
- [ ] 圆角和阴影统一

### 12.2 交互一致性

- [ ] 按钮样式和行为一致
- [ ] 表单验证和错误提示统一
- [ ] 加载状态展示统一
- [ ] 成功/失败提示统一

### 12.3 响应式适配

- [ ] 移动端布局合理
- [ ] 平板端布局合理
- [ ] 桌面端布局合理
- [ ] 图表在各尺寸下可读

### 12.4 无障碍

- [ ] 键盘导航可用
- [ ] 屏幕阅读器支持
- [ ] 颜色对比度符合标准
- [ ] 焦点状态清晰

### 12.5 性能

- [ ] 首屏加载时间 < 2秒
- [ ] 图片优化(压缩、懒加载)
- [ ] 代码分割和懒加载
- [ ] 虚拟滚动(大数据量)

---

## 13. 下一步行动

### 13.1 设计评审

1. 与开发团队评审设计可行性
2. 与产品经理确认需求覆盖
3. 与用户测试可用性

### 13.2 开发准备

1. 创建Figma设计稿
2. 导出设计资源(图标、图片)
3. 编写组件库文档
4. 搭建前端项目框架

### 13.3 原型测试

1. 创建交互原型
2. 用户测试关键流程
3. 收集反馈并迭代

---

**文档结束**

---

## 附录: 快速参考

### A. 色彩速查表

```
主色: #1890FF
成功: #52C41A
错误: #FF4D4F
警告: #FAAD14
标题: #262626
正文: #595959
次要: #8C8C8C
边框: #D9D9D9
背景: #F5F7FA
卡片: #FFFFFF
```

### B. 间距速查表

```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
xxl: 48px
```

### C. 字体速查表

```
H1: 32px / 38px
H2: 24px / 32px
H3: 20px / 28px
H4: 16px / 24px
Body: 14px / 22px
Caption: 12px / 20px
```

### D. 组件速查

- 按钮: Ant Design Button
- 表单: Ant Design Form
- 表格: Ant Design Table
- 图表: ECharts
- 卡片: Ant Design Card
- 对话框: Ant Design Modal
- 提示: Ant Design Message