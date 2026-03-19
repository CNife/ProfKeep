/**
 * PieChart - 资产配置饼图组件
 * 用于展示资产分布、持仓占比等数据
 */

import { Spin } from 'antd'
import type { EChartsOption, PieSeriesOption } from 'echarts'
import { memo, useMemo } from 'react'

import { colors } from '@/config/theme'
import BaseChart from './BaseChart'

/**
 * PieChart 数据项
 */
export interface PieChartDataItem {
  [key: string]: string | number
}

/**
 * PieChart Props
 */
export interface PieChartProps {
  /** 数据源 */
  data: PieChartDataItem[]
  /** 数据字段名（用于显示数值） */
  dataKey: string
  /** 名称字段名（用于显示标签） */
  nameKey: string
  /** 是否显示百分比标签 */
  showPercent?: boolean
  /** 是否显示图例 */
  showLegend?: boolean
  /** 图例位置 */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  /** 图表高度 */
  height?: number | string
  /** 图表宽度 */
  width?: number | string
  /** 是否显示 loading 状态 */
  loading?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * 获取图例位置配置
 */
const getLegendConfig = (
  position: PieChartProps['legendPosition'],
  show: boolean,
): EChartsOption['legend'] => {
  if (!show) return undefined

  const baseConfig = {
    show: true,
    textStyle: { color: colors.neutral.text },
  }

  switch (position) {
    case 'top':
      return { ...baseConfig, top: 0, left: 'center' }
    case 'bottom':
      return { ...baseConfig, bottom: 0, left: 'center' }
    case 'left':
      return { ...baseConfig, left: 0, top: 'middle', orient: 'vertical' }
    case 'right':
      return { ...baseConfig, right: 0, top: 'middle', orient: 'vertical' }
    default:
      return { ...baseConfig, top: 0, left: 'center' }
  }
}

/**
 * PieChart 饼图组件
 *
 * @example
 * ```tsx
 * <PieChart
 *   data={[
 *     { name: '股票型', value: 50000 },
 *     { name: '债券型', value: 30000 },
 *     { name: '货币型', value: 20000 },
 *   ]}
 *   dataKey="value"
 *   nameKey="name"
 *   showPercent
 * />
 * ```
 */
const PieChart = memo<PieChartProps>(
  ({
    data,
    dataKey,
    nameKey,
    showPercent = true,
    showLegend = true,
    legendPosition = 'top',
    height = 300,
    width = '100%',
    loading = false,
    className,
    style,
  }) => {
    const option = useMemo<EChartsOption>(() => {
      // 转换数据格式
      const pieData = data.map((item) => ({
        name: String(item[nameKey]),
        value: Number(item[dataKey]),
      }))

      // 计算总值用于百分比
      const total = pieData.reduce((sum, item) => sum + item.value, 0)

      // 饼图系列配置
      const series: PieSeriesOption = {
        type: 'pie',
        radius: ['40%', '70%'], // 环形图
        center: ['50%', '55%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: colors.neutral.white,
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: (params) => {
            const percent = total > 0 ? ((params.value as number) / total) * 100 : 0
            if (showPercent) {
              return `${params.name}\n${percent.toFixed(1)}%`
            }
            return params.name
          },
          color: colors.neutral.text,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
        data: pieData,
      }

      return {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            if (Array.isArray(params)) return ''
            const percent = total > 0 ? ((params.value as number) / total) * 100 : 0
            return `${params.name}<br/>${params.value} (${percent.toFixed(1)}%)`
          },
        },
        legend: getLegendConfig(legendPosition, showLegend),
        series,
      }
    }, [data, dataKey, nameKey, showPercent, showLegend, legendPosition])

    if (loading) {
      return (
        <div
          className={className}
          style={{
            height,
            width,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style,
          }}
        >
          <Spin spinning />
        </div>
      )
    }

    return (
      <BaseChart
        option={option}
        height={height}
        width={width}
        className={className}
        style={style}
      />
    )
  },
)

PieChart.displayName = 'PieChart'

export default PieChart