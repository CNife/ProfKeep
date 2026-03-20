import { useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Typography,
  Select,
  DatePicker,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Flex,
  Row,
  Col,
} from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { DataCard } from '@/components/common/DataCard'
import { TransactionForm, type TransactionFormValues } from '@/components/business/TransactionForm'
import { colors, spacing } from '@/config/theme'
import { formatCurrency, formatShares, formatDate } from '@/utils/formatters'
import { mockAccounts, mockFunds, mockTransactions } from '@/mocks/handlers'

const { Title } = Typography
const { RangePicker } = DatePicker

type TransactionType = 'buy' | 'sell' | 'dividend'

interface TransactionItem {
  id: number
  date: string
  accountName: string
  fundCode: string
  fundName: string
  type: TransactionType
  shares: number
  amount: number
  fee: number
  netValue: number
  notes?: string
}

const transactionTypeMap: Record<TransactionType, { label: string; color: string }> = {
  buy: { label: '买入', color: 'green' },
  sell: { label: '卖出', color: 'red' },
  dividend: { label: '分红', color: 'blue' },
}

export function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlAccountId = searchParams.get('accountId')
  const urlFundCode = searchParams.get('fundCode')
  const urlType = searchParams.get('type') as TransactionType | null

  const [selectedAccountId, setSelectedAccountId] = useState<string>(urlAccountId ?? '')
  const [selectedFundCode, setSelectedFundCode] = useState<string>(urlFundCode ?? '')
  const [selectedType, setSelectedType] = useState<string>(urlType ?? '')
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const accountOptions = useMemo(
    () => [
      { label: '全部账户', value: '' },
      ...mockAccounts.map((acc) => ({
        label: acc.name,
        value: String(acc.id),
      })),
    ],
    [],
  )

  const fundOptions = useMemo(
    () => [
      { label: '全部基金', value: '' },
      ...mockFunds.map((fund) => ({
        label: `${fund.code} - ${fund.name}`,
        value: fund.code,
      })),
    ],
    [],
  )

  const typeOptions = useMemo(
    () => [
      { label: '全部类型', value: '' },
      { label: '买入', value: 'buy' },
      { label: '卖出', value: 'sell' },
      { label: '分红', value: 'dividend' },
    ],
    [],
  )

  const filteredTransactions = useMemo<TransactionItem[]>(() => {
    let transactions = mockTransactions.map((t) => {
      const account = mockAccounts.find((a) => a.id === t.account_id)
      const fund = mockFunds.find((f) => f.id === t.fund_id)

      return {
        id: t.id,
        date: t.date,
        accountName: account?.name ?? '未知账户',
        fundCode: fund?.code ?? '未知代码',
        fundName: fund?.name ?? '未知基金',
        type: t.type,
        shares: t.shares ?? 0,
        amount: t.amount ?? 0,
        fee: t.fee,
        netValue: t.net_value ?? 0,
        notes: t.notes,
      }
    })

    if (selectedAccountId) {
      const accountId = Number(selectedAccountId)
      transactions = transactions.filter((t) => {
        const account = mockAccounts.find((a) => a.name === t.accountName)
        return account?.id === accountId
      })
    }

    if (selectedFundCode) {
      transactions = transactions.filter((t) => t.fundCode === selectedFundCode)
    }

    if (selectedType) {
      transactions = transactions.filter((t) => t.type === selectedType)
    }

    if (dateRange) {
      const [start, end] = dateRange
      transactions = transactions.filter((t) => {
        const transactionDate = dayjs(t.date)
        return transactionDate.isAfter(start.subtract(1, 'day')) && transactionDate.isBefore(end.add(1, 'day'))
      })
    }

    return transactions
  }, [selectedAccountId, selectedFundCode, selectedType, dateRange])

  const handleReset = useCallback(() => {
    setSelectedAccountId('')
    setSelectedFundCode('')
    setSelectedType('')
    setDateRange(null)
    setSearchParams({})
  }, [setSearchParams])

  const handleCreateTransaction = useCallback(async (values: TransactionFormValues) => {
    console.log('新建交易:', values)
    setModalVisible(false)
  }, [])

  const columns: TableProps<TransactionItem>['columns'] = [
    {
      title: '交易日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: 'descend',
      render: (date: string) => formatDate(date),
    },
    {
      title: '账户',
      dataIndex: 'accountName',
      key: 'accountName',
      width: 150,
    },
    {
      title: '基金',
      key: 'fund',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.fundCode}</span>
          <span style={{ fontSize: 12, color: colors.neutral.secondary }}>{record.fundName}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: TransactionType) => {
        const config = transactionTypeMap[type]
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '份额',
      dataIndex: 'shares',
      key: 'shares',
      width: 120,
      align: 'right',
      render: (shares: number) => formatShares(shares),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '手续费',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      align: 'right',
      render: (fee: number) => formatCurrency(fee),
    },
    {
      title: '净值',
      dataIndex: 'netValue',
      key: 'netValue',
      width: 100,
      align: 'right',
      render: (netValue: number) => netValue.toFixed(4),
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes?: string) => notes || '-',
    },
  ]

  return (
    <Flex vertical gap={spacing.lg}>
      <Flex justify="space-between" align="center">
        <Title level={3} style={{ margin: 0, color: colors.neutral.title }}>
          交易记录
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          新建交易
        </Button>
      </Flex>

      <DataCard title="筛选条件">
        <Row gutter={[spacing.md, spacing.md]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={selectedAccountId}
              onChange={setSelectedAccountId}
              options={accountOptions}
              style={{ width: '100%' }}
              placeholder="选择账户"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={selectedFundCode}
              onChange={setSelectedFundCode}
              options={fundOptions}
              style={{ width: '100%' }}
              placeholder="选择基金"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={selectedType}
              onChange={setSelectedType}
              options={typeOptions}
              style={{ width: '100%' }}
              placeholder="选择类型"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
        </Row>
        <Flex justify="flex-end" style={{ marginTop: spacing.md }}>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置筛选
          </Button>
        </Flex>
      </DataCard>

      <DataCard title={`交易记录 (${filteredTransactions.length} 条)`}>
        <Table<TransactionItem>
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </DataCard>

      <Modal
        title="新建交易"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <TransactionForm
          onSubmit={handleCreateTransaction}
          onCancel={() => setModalVisible(false)}
          accounts={mockAccounts.map((acc) => ({
            id: String(acc.id),
            name: acc.name,
          }))}
          initialValues={{
            accountId: selectedAccountId || undefined,
            fundCode: selectedFundCode || undefined,
            type: (selectedType as TransactionType) || undefined,
          }}
        />
      </Modal>
    </Flex>
  )
}

export default Transactions