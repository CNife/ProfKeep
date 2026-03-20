import { Row, Col, Typography, Statistic, Segmented, Table, Flex } from 'antd'
import type { TableProps } from 'antd'
import { useState, useMemo } from 'react'
import { DataCard } from '@/components/common/DataCard'
import { ProfitText } from '@/components/common/ProfitText'
import PieChart from '@/components/charts/PieChart'
import LineChart from '@/components/charts/LineChart'
import { colors, spacing } from '@/config/theme'
import { formatCurrency } from '@/utils/formatters'
import {
  createAssetOverview,
  createAssetAllocation,
  getProfitTrendByDays,
} from '@/mocks/data/dashboard'
import { createHoldings } from '@/mocks/data/holdings'

const { Title } = Typography

type TimeRange = '30' | '90' | '180'

interface FundRankingItem {
  id: string
  rank: number
  fundCode: string
  fundName: string
  profit: number
  profitRate: number
  holdingDays: number
}

export function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('90')

  const assetOverview = useMemo(() => createAssetOverview(), [])
  const assetAllocation = useMemo(() => createAssetAllocation(), [])
  const profitTrend = useMemo(() => getProfitTrendByDays(Number(timeRange)), [timeRange])
  const holdings = useMemo(() => createHoldings(), [])

  const fundRankings = useMemo<FundRankingItem[]>(() => {
    return holdings
      .map((holding, idx) => ({
        id: holding.id,
        rank: 0,
        fundCode: holding.fundCode,
        fundName: holding.fundName,
        profit: holding.profit,
        profitRate: holding.profitRate,
        holdingDays: (idx + 1) * 30 + 30,
      }))
      .sort((a, b) => b.profitRate - a.profitRate)
      .map((item, idx) => ({ ...item, rank: idx + 1 }))
  }, [holdings])

  const columns: TableProps<FundRankingItem>['columns'] = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <span
          style={{
            fontWeight: rank <= 3 ? 600 : 400,
            color: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : colors.neutral.text,
          }}
        >
          {rank}
        </span>
      ),
    },
    {
      title: '基金名称',
      key: 'fundName',
      render: (_, record) => (
        <Flex vertical gap={2}>
          <span style={{ fontWeight: 500 }}>{record.fundName}</span>
          <span style={{ fontSize: 12, color: colors.neutral.secondary }}>{record.fundCode}</span>
        </Flex>
      ),
    },
    {
      title: '持有收益',
      dataIndex: 'profit',
      key: 'profit',
      sorter: (a, b) => a.profit - b.profit,
      render: (profit: number) => <ProfitText value={profit} prefix="¥" />,
    },
    {
      title: '收益率',
      dataIndex: 'profitRate',
      key: 'profitRate',
      sorter: (a, b) => a.profitRate - b.profitRate,
      defaultSortOrder: 'descend',
      render: (profitRate: number) => <ProfitText value={profitRate} isRate />,
    },
    {
      title: '持有天数',
      dataIndex: 'holdingDays',
      key: 'holdingDays',
      sorter: (a, b) => a.holdingDays - b.holdingDays,
      render: (days: number) => `${days}天`,
    },
  ]

  return (
    <Flex vertical gap={spacing.lg}>
      <Flex justify="space-between" align="center">
        <Title level={3} style={{ margin: 0, color: colors.neutral.title }}>
          数据分析
        </Title>
      </Flex>

      <Row gutter={[spacing.lg, spacing.lg]}>
        <Col xs={24} sm={12} lg={8}>
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
        <Col xs={24} sm={12} lg={8}>
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
        <Col xs={24} sm={12} lg={8}>
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
      </Row>

      <Row gutter={[spacing.lg, spacing.lg]}>
        <Col xs={24} sm={24} lg={16}>
          <DataCard
            title="收益曲线"
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
              height={320}
            />
          </DataCard>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <DataCard title="资产配置">
            <PieChart
              data={assetAllocation}
              dataKey="value"
              nameKey="type"
              showPercent
              showLegend
              legendPosition="bottom"
              height={320}
            />
          </DataCard>
        </Col>
      </Row>

      <Row gutter={[spacing.lg, spacing.lg]}>
        <Col xs={24}>
          <DataCard title="基金收益排名">
            <Table<FundRankingItem>
              columns={columns}
              dataSource={fundRankings}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </DataCard>
        </Col>
      </Row>
    </Flex>
  )
}

export default Analytics