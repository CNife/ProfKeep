/**
 * HoldingTable - 持仓表格组件
 *
 * 展示持仓列表，支持排序和分页。
 */

import { Table, Button, Space, Pagination, Typography } from 'antd'
import { ShoppingCartOutlined, MinusCircleOutlined, EyeOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd'
import { useState, useMemo } from 'react'
import { ProfitText } from '../common/ProfitText'
import { formatCurrency, formatShares } from '../../utils/formatters'

const { Text } = Typography

export interface HoldingItem {
  /** 持仓ID */
  id: string
  /** 基金代码 */
  fundCode: string
  /** 基金名称 */
  fundName: string
  /** 持有份额 */
  shares: number
  /** 成本价 */
  costPrice: number
  /** 最新净值 */
  latestNetValue: number
  /** 持仓市值 */
  marketValue: number
  /** 持仓成本 */
  cost: number
  /** 收益 */
  profit: number
  /** 收益率 (小数) */
  profitRate: number
}

export interface HoldingTableProps {
  /** 持仓数据 */
  data: HoldingItem[]
  /** 买入回调 */
  onBuy?: (id: string) => void
  /** 卖出回调 */
  onSell?: (id: string) => void
  /** 查看详情回调 */
  onViewDetail?: (id: string) => void
  /** 自定义类名 */
  className?: string
  /** 每页条数 */
  pageSize?: number
}

type SortOrder = 'ascend' | 'descend' | null

interface SortState {
  columnKey: string
  order: SortOrder
}

export function HoldingTable({
  data,
  onBuy,
  onSell,
  onViewDetail,
  className,
  pageSize = 10,
}: HoldingTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortState, setSortState] = useState<SortState>({
    columnKey: '',
    order: null,
  })

  const sortedData = useMemo(() => {
    if (!sortState.columnKey || !sortState.order) {
      return data
    }

    const sorted = [...data].sort((a, b) => {
      const key = sortState.columnKey as keyof HoldingItem
      const aValue = a[key]
      const bValue = b[key]

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.order === 'ascend' ? aValue - bValue : bValue - aValue
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortState.order === 'ascend'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return 0
    })

    return sorted
  }, [data, sortState])

  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return sortedData.slice(start, end)
  }, [sortedData, currentPage, pageSize])

  const handleSort = (columnKey: string) => {
    let newOrder: SortOrder = 'ascend'

    if (sortState.columnKey === columnKey) {
      if (sortState.order === 'ascend') {
        newOrder = 'descend'
      } else if (sortState.order === 'descend') {
        newOrder = null
      }
    }

    setSortState({
      columnKey: newOrder ? columnKey : '',
      order: newOrder,
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const columns: TableProps<HoldingItem>['columns'] = [
    {
      title: '基金名称',
      dataIndex: 'fundName',
      key: 'fundName',
      width: 200,
      render: (text: string, record: HoldingItem) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.fundCode}
          </Text>
        </div>
      ),
    },
    {
      title: '份额',
      dataIndex: 'shares',
      key: 'shares',
      width: 120,
      align: 'right',
      sorter: true,
      sortOrder: sortState.columnKey === 'shares' ? sortState.order : null,
      onHeaderCell: () => ({
        onClick: () => handleSort('shares'),
        style: { cursor: 'pointer' },
      }),
      render: (shares: number) => formatShares(shares),
    },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 100,
      align: 'right',
      sorter: true,
      sortOrder: sortState.columnKey === 'costPrice' ? sortState.order : null,
      onHeaderCell: () => ({
        onClick: () => handleSort('costPrice'),
        style: { cursor: 'pointer' },
      }),
      render: (costPrice: number) => formatCurrency(costPrice),
    },
    {
      title: '最新净值',
      dataIndex: 'latestNetValue',
      key: 'latestNetValue',
      width: 100,
      align: 'right',
      sorter: true,
      sortOrder: sortState.columnKey === 'latestNetValue' ? sortState.order : null,
      onHeaderCell: () => ({
        onClick: () => handleSort('latestNetValue'),
        style: { cursor: 'pointer' },
      }),
      render: (netValue: number) => formatCurrency(netValue),
    },
    {
      title: '市值',
      dataIndex: 'marketValue',
      key: 'marketValue',
      width: 120,
      align: 'right',
      sorter: true,
      sortOrder: sortState.columnKey === 'marketValue' ? sortState.order : null,
      onHeaderCell: () => ({
        onClick: () => handleSort('marketValue'),
        style: { cursor: 'pointer' },
      }),
      render: (marketValue: number) => (
        <Text strong>{formatCurrency(marketValue)}</Text>
      ),
    },
    {
      title: '收益',
      dataIndex: 'profit',
      key: 'profit',
      width: 120,
      align: 'right',
      sorter: true,
      sortOrder: sortState.columnKey === 'profit' ? sortState.order : null,
      onHeaderCell: () => ({
        onClick: () => handleSort('profit'),
        style: { cursor: 'pointer' },
      }),
      render: (profit: number) => <ProfitText value={profit} prefix="¥" />,
    },
    {
      title: '收益率',
      dataIndex: 'profitRate',
      key: 'profitRate',
      width: 100,
      align: 'right',
      sorter: true,
      sortOrder: sortState.columnKey === 'profitRate' ? sortState.order : null,
      onHeaderCell: () => ({
        onClick: () => handleSort('profitRate'),
        style: { cursor: 'pointer' },
      }),
      render: (profitRate: number) => <ProfitText value={profitRate} isRate />,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: unknown, record: HoldingItem) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<ShoppingCartOutlined />}
            onClick={() => onBuy?.(record.id)}
          >
            买入
          </Button>
          <Button
            type="link"
            size="small"
            icon={<MinusCircleOutlined />}
            onClick={() => onSell?.(record.id)}
          >
            卖出
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail?.(record.id)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className={className}>
      <Table
        columns={columns}
        dataSource={currentPageData}
        rowKey="id"
        pagination={false}
        scroll={{ x: 1000 }}
        style={{
          borderRadius: 8,
          overflow: 'hidden',
        }}
      />
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={data.length}
          onChange={handlePageChange}
          showSizeChanger={false}
          showTotal={(total) => `共 ${total} 条`}
        />
      </div>
    </div>
  )
}

export default HoldingTable