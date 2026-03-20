import { Row, Col, Typography, Statistic, Segmented, Skeleton, Flex } from 'antd'
import { useState, useMemo } from 'react'
import { DataCard } from '@/components/common/DataCard'
import { ProfitText } from '@/components/common/ProfitText'
import { HoldingTable, type HoldingItem } from '@/components/business/HoldingTable'
import { NetValueRefresh } from '@/components/business/NetValueRefresh'
import PieChart from '@/components/charts/PieChart'
import LineChart from '@/components/charts/LineChart'
import { colors, spacing } from '@/config/theme'
import { formatCurrency } from '@/utils/formatters'
import {
  createAssetOverview,
  createAssetAllocation,
  createHoldings,
  getProfitTrendByDays,
} from '@/mocks/data/dashboard'

const { Title } = Typography

type TimeRange = '30' | '90' | '180'

export function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('90')
  const [loading] = useState(false)

  const assetOverview = useMemo(() => createAssetOverview(), [])
  const assetAllocation = useMemo(() => createAssetAllocation(), [])
  const holdings = useMemo<HoldingItem[]>(() => createHoldings(), [])
  const profitTrend = useMemo(() => getProfitTrendByDays(Number(timeRange)), [timeRange])

  const handleBuy = (id: string) => {
    console.log('买入:', id)
  }

  const handleSell = (id: string) => {
    console.log('卖出:', id)
  }

  const handleViewDetail = (id: string) => {
    console.log('查看详情:', id)
  }

  const handleRefreshNetValue = async () => {
    console.log('刷新净值')
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
      <Flex justify="space-between" align="center">
        <Title level={3} style={{ margin: 0, color: colors.neutral.title }}>
          资产总览
        </Title>
      </Flex>

      <Row gutter={[spacing.lg, spacing.lg]}>
        <Col xs={24} sm={12} lg={6}>
          <DataCard title="总资产">
            <Statistic
              value={assetOverview.totalAssets}
              precision={2}
              prefix="¥"
              valueStyle={{
                color: colors.neutral.title,
                fontFamily: "'DIN Alternate', 'Helvetica Neue', Arial, sans-serif",
                fontSize: 28,
              }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </DataCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DataCard title="总收益">
            <Statistic
              value={assetOverview.totalProfit}
              precision={2}
              prefix="¥"
              valueStyle={{
                fontFamily: "'DIN Alternate', 'Helvetica Neue', Arial, sans-serif",
                fontSize: 28,
              }}
              formatter={(value) => (
                <ProfitText value={Number(value)} prefix="¥" fontSize={28} fontWeight={600} />
              )}
            />
          </DataCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DataCard title="总收益率">
            <Statistic
              value={assetOverview.totalProfitRate}
              precision={2}
              suffix="%"
              valueStyle={{
                fontFamily: "'DIN Alternate', 'Helvetica Neue', Arial, sans-serif",
                fontSize: 28,
              }}
              formatter={(value) => (
                <ProfitText value={Number(value)} isRate fontSize={28} fontWeight={600} />
              )}
            />
          </DataCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DataCard title="持仓基金数">
            <Statistic
              value={assetOverview.fundCount}
              suffix="只"
              valueStyle={{
                color: colors.neutral.title,
                fontFamily: "'DIN Alternate', 'Helvetica Neue', Arial, sans-serif",
                fontSize: 28,
              }}
            />
          </DataCard>
        </Col>
      </Row>

      <Row gutter={[spacing.lg, spacing.lg]}>
        <Col xs={24} lg={8}>
          <DataCard title="资产配置">
            <PieChart
              data={assetAllocation}
              dataKey="value"
              nameKey="type"
              showPercent
              showLegend
              legendPosition="bottom"
              height={280}
            />
          </DataCard>
        </Col>

        <Col xs={24} lg={16}>
          <DataCard
            title="收益趋势"
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
              data={profitTrend}
              xKey="date"
              series={[
                { dataKey: 'profit', name: '累计收益', smooth: true, areaStyle: true },
                { dataKey: 'cost', name: '累计成本', smooth: true },
              ]}
              showLegend
              legendPosition="top"
              showTooltip
              yAxisUnit="元"
              height={280}
            />
          </DataCard>
        </Col>
      </Row>

      <Row gutter={[spacing.lg, spacing.lg]}>
        <Col xs={24} lg={18}>
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
        <Col xs={24} lg={6}>
          <DataCard title="净值刷新" disableHover>
            <NetValueRefresh
              value={1.2345}
              date="2026-03-19"
              updatedAt="2026-03-19 15:00:00"
              onRefresh={handleRefreshNetValue}
            />
          </DataCard>
        </Col>
      </Row>
    </Flex>
  )
}

export default Dashboard