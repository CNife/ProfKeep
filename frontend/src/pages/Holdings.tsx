/**
 * Holdings - 持仓详情页面
 *
 * 展示用户所有基金的持仓详情，包括持仓列表、净值走势图表和基金详情。
 */

import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Row,
  Col,
  Typography,
  Select,
  Segmented,
  Skeleton,
  Flex,
  Descriptions,
  Empty,
  Button,
} from 'antd'
import { DataCard } from '@/components/common/DataCard'
import { ProfitText } from '@/components/common/ProfitText'
import { HoldingTable, type HoldingItem } from '@/components/business/HoldingTable'
import LineChart from '@/components/charts/LineChart'
import { colors, spacing } from '@/config/theme'
import { formatCurrency, formatShares, formatDate } from '@/utils/formatters'
import {
  createHoldings,
  createFundDetail,
  getNetValueTrendByDays,
  type FundDetail,
} from '@/mocks/data/holdings'
import { mockAccounts } from '@/mocks/handlers'

const { Title, Text } = Typography

type TimeRange = '30' | '90' | '180'

export function Holdings() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const accountId = searchParams.get('accountId') ?? undefined

  const [timeRange, setTimeRange] = useState<TimeRange>('90')
  const [selectedFundCode, setSelectedFundCode] = useState<string | null>(null)
  const [loading] = useState(false)

  const holdings = useMemo<HoldingItem[]>(() => createHoldings(accountId), [accountId])

  const selectedFundDetail = useMemo<FundDetail | null>(() => {
    if (!selectedFundCode && holdings.length > 0) {
      return createFundDetail(holdings[0].fundCode)
    }
    return selectedFundCode ? createFundDetail(selectedFundCode) : null
  }, [selectedFundCode, holdings])

  const netValueTrend = useMemo(
    () => getNetValueTrendByDays(Number(timeRange)),
    [timeRange],
  )

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

  const handleAccountChange = (value: string) => {
    if (value) {
      navigate(`/holdings?accountId=${value}`)
    } else {
      navigate('/holdings')
    }
  }

  const handleBuy = (id: string) => {
    const holding = holdings.find((h) => h.id === id)
    if (holding) {
      navigate(`/transactions?fundCode=${holding.fundCode}&type=buy`)
    }
  }

  const handleSell = (id: string) => {
    const holding = holdings.find((h) => h.id === id)
    if (holding) {
      navigate(`/transactions?fundCode=${holding.fundCode}&type=sell`)
    }
  }

  const handleViewDetail = (id: string) => {
    const holding = holdings.find((h) => h.id === id)
    if (holding) {
      setSelectedFundCode(holding.fundCode)
    }
  }

  if (loading) {
    return (
      <Flex vertical gap={spacing.lg}>
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </Flex>
    )
  }

  return (
    <Flex vertical gap={spacing.lg}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={spacing.sm}>
        <Title level={3} style={{ margin: 0, color: colors.neutral.title }}>
          持仓详情
        </Title>
        <Select
          value={accountId ?? ''}
          onChange={handleAccountChange}
          options={accountOptions}
          style={{ minWidth: 200 }}
          placeholder="选择账户"
        />
      </Flex>

      {holdings.length === 0 ? (
        <Empty
          description="暂无持仓"
          style={{ padding: spacing.xxl }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/transactions?type=buy')}>
            记录第一笔交易
          </Button>
        </Empty>
      ) : (
        <>
          <Row gutter={[spacing.lg, spacing.lg]}>
            <Col xs={24} sm={24} lg={16}>
              <DataCard title="持仓列表">
                <HoldingTable
                  data={holdings}
                  onBuy={handleBuy}
                  onSell={handleSell}
                  onViewDetail={handleViewDetail}
                  pageSize={10}
                />
              </DataCard>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <DataCard title="基金详情">
                {selectedFundDetail ? (
                  <Flex vertical gap={spacing.md}>
                    <div>
                      <Text strong style={{ fontSize: 16 }}>
                        {selectedFundDetail.name}
                      </Text>
                      <br />
                      <Text type="secondary">{selectedFundDetail.code}</Text>
                    </div>

                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="基金类型">
                        {selectedFundDetail.type}
                      </Descriptions.Item>
                      <Descriptions.Item label="基金公司">
                        {selectedFundDetail.company}
                      </Descriptions.Item>
                      <Descriptions.Item label="基金经理">
                        {selectedFundDetail.manager}
                      </Descriptions.Item>
                      <Descriptions.Item label="成立日期">
                        {formatDate(selectedFundDetail.establishDate)}
                      </Descriptions.Item>
                      <Descriptions.Item label="当前净值">
                        <Flex align="center" gap={8}>
                          <Text strong>{selectedFundDetail.netValue.toFixed(4)}</Text>
                          <ProfitText
                            value={selectedFundDetail.dayChange}
                            isRate
                            fontSize={12}
                          />
                        </Flex>
                      </Descriptions.Item>
                      <Descriptions.Item label="持仓份额">
                        {formatShares(selectedFundDetail.shares)}
                      </Descriptions.Item>
                      <Descriptions.Item label="成本价">
                        {formatCurrency(selectedFundDetail.costPrice)}
                      </Descriptions.Item>
                      <Descriptions.Item label="持仓市值">
                        <Text strong>{formatCurrency(selectedFundDetail.marketValue)}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="持仓收益">
                        <ProfitText
                          value={selectedFundDetail.profit}
                          prefix="¥"
                          fontSize={14}
                          fontWeight={600}
                        />
                      </Descriptions.Item>
                      <Descriptions.Item label="收益率">
                        <ProfitText
                          value={selectedFundDetail.profitRate}
                          isRate
                          fontSize={14}
                          fontWeight={600}
                        />
                      </Descriptions.Item>
                    </Descriptions>

                    <Flex gap={spacing.sm}>
                      <Button
                        type="primary"
                        onClick={() =>
                          navigate(`/transactions?fundCode=${selectedFundDetail.code}&type=buy`)
                        }
                      >
                        买入
                      </Button>
                      <Button
                        onClick={() =>
                          navigate(`/transactions?fundCode=${selectedFundDetail.code}&type=sell`)
                        }
                      >
                        卖出
                      </Button>
                    </Flex>
                  </Flex>
                ) : (
                  <Empty
                    description="请选择基金查看详情"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </DataCard>
            </Col>
          </Row>

          <Row gutter={[spacing.lg, spacing.lg]}>
            <Col xs={24}>
              <DataCard
                title="净值走势"
                extra={
                  <Segmented
                    value={timeRange}
                    onChange={(value) => setTimeRange(value as TimeRange)}
                    options={[
                      { label: '近30天', value: '30' },
                      { label: '近90天', value: '90' },
                      { label: '近180天', value: '180' },
                    ]}
                  />
                }
              >
                <LineChart
                  data={netValueTrend}
                  xKey="date"
                  series={[{ dataKey: 'netValue', name: '净值', smooth: true }]}
                  showLegend={false}
                  showTooltip
                  yAxisUnit=""
                  height={300}
                />
              </DataCard>
            </Col>
          </Row>
        </>
      )}
    </Flex>
  )
}

export default Holdings