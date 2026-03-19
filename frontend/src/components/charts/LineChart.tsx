/**
 * LineChart - 收益曲线/净值走势折线图组件
 * 用于展示时间序列数据，如收益趋势、净值走势等
 */

import { Spin } from 'antd'
import type { EChartsOption, LineSeriesOption } from 'echarts'
import { memo, useMemo } from 'react'

import { colors } from '@/config/theme'
import BaseChart from './BaseChart'

/**
 * LineChart 数据项
 */
export interface LineChartDataItem {
  [key: string]: string | number
}

/**
 * LineChart 系列配置
 */
export interface LineChartSeries {
  /** 数据字段名 */
  dataKey: string
  /** 系列名称 */
  name: string
  /** 是否平滑曲线 */
  smooth?: boolean
  /** 是否显示面积图 */
  areaStyle?: boolean
}

/**
 * LineChart Props
 */
export interface LineChartProps {
  /** 数据源 */
  data: LineChartDataItem[]
  /** X 轴字段名（通常是时间字段） */
  xKey: string
  /** 系列配置 */
  series: LineChartSeries[]
  /** 是否显示图例 */
  showLegend?: boolean
  /** 图例位置 */
  legendPosition?: 'top' | 'bottom'
  /** 是否显示 tooltip */
  showTooltip?: boolean
  /** Y 轴单位 */
  yAxisUnit?: string
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
  position: LineChartProps['legendPosition'],
  show: boolean,
): EChartsOption['legend'] => {
  if (!show) return undefined

  const baseConfig = {
    show: true,
    textStyle: { color: colors.neutral.text },
  }

  return position === 'bottom'
    ? { ...baseConfig, bottom: 0, left: 'center' }
    : { ...baseConfig, top: 0, left: 'center' }
}

/**
 * LineChart 折线图组件
 *
 * @example
 * ```tsx
 * <LineChart
 *   data={[
 *     { date: '2024-01', profit: 1000, cost: 5000 },
 *     { date: '2024-02', profit: 1500, cost: 5500 },
 *   ]}
 *   xKey="date"
 *   series={[
 *     { dataKey: 'profit', name: '收益', smooth: true },
 *     { dataKey: 'cost', name: '成本' },
 *   ]}
 *   showLegend
 *   showTooltip
 * />
 * ```
 */
const LineChart = memo<LineChartProps>(
  ({
    data,
    xKey,
    series: seriesConfig,
    showLegend = true,
    legendPosition = 'top',
    showTooltip = true,
    yAxisUnit = '',
    height = 300,
    width = '100%',
    loading = false,
    className,
    style,
  }) => {
    const option = useMemo<EChartsOption>(() => {
      // 提取 X 轴数据
      const xAxisData = data.map((item) => String(item[xKey]))

      // 构建系列数据
      const series: LineSeriesOption[] = seriesConfig.map((config, index) => {
        const seriesData = data.map((item) => Number(item[config.dataKey]))

        // 使用 Ant Design 色板
        const chartColors = [
          colors.primary.main,
          colors.success.main,
          colors.warning.main,
          colors.error.main,
        ]

        return {
          name: config.name,
          type: 'line',
          data: seriesData,
          smooth: config.smooth ?? true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 2,
          },
          itemStyle: {
            color: chartColors[index % chartColors.length],
          },
          areaStyle: config.areaStyle
            ? {
                opacity: 0.1,
              }
            : undefined,
          emphasis: {
            focus: 'series',
          },
        }
      })

      return {
        tooltip: showTooltip
          ? {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
                label: {
                  backgroundColor: colors.neutral.white,
                  color: colors.neutral.text,
                },
              },
              formatter: (params) => {
                if (!Array.isArray(params)) return ''
                const [first] = params
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const axisValue = (first as { axisValue?: string }).axisValue ?? ''
                let result = `<div style="font-weight: bold; margin-bottom: 4px;">${axisValue}</div>`
                params.forEach((param) => {
                  const value = param.value as number
                  result += `<div style="display: flex; align-items: center; gap: 8px;">
                    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${param.color};"></span>
                    <span>${param.seriesName}: ${value.toLocaleString('zh-CN')}${yAxisUnit}</span>
                  </div>`
                })
                return result
              },
            }
          : undefined,
        legend: getLegendConfig(legendPosition, showLegend),
        grid: {
          left: '3%',
          right: '4%',
          bottom: showLegend && legendPosition === 'bottom' ? '15%' : '3%',
          top: showLegend && legendPosition === 'top' ? '15%' : '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData,
          axisLine: {
            lineStyle: { color: colors.neutral.border },
          },
          axisLabel: {
            color: colors.neutral.text,
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: colors.neutral.secondary,
            formatter: `{value}${yAxisUnit}`,
          },
          splitLine: {
            lineStyle: {
              color: colors.neutral.background,
            },
          },
        },
        series,
      }
    }, [data, xKey, seriesConfig, showLegend, legendPosition, showTooltip, yAxisUnit])

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

LineChart.displayName = 'LineChart'

export default LineChart