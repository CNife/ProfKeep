/**
 * BaseChart - ECharts 基础图表组件
 * 封装 ReactECharts，支持主题集成、响应式、loading 状态
 */

import { Spin } from 'antd'
import type { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import type { EChartsReactProps } from 'echarts-for-react'
import { memo } from 'react'

import { colors } from '@/config/theme'

/** ECharts opts 配置 */
type ChartOpts = {
  renderer?: 'canvas' | 'svg'
  devicePixelRatio?: number
  width?: number | 'auto'
  height?: number | 'auto'
  locale?: string
}

/**
 * BaseChart Props
 */
export interface BaseChartProps
  extends Omit<EChartsReactProps, 'option' | 'loading'> {
  /** ECharts 配置选项 */
  option: EChartsOption
  /** 是否显示 loading 状态 */
  loading?: boolean
  /** 图表高度 */
  height?: number | string
  /** 图表宽度 */
  width?: number | string
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * 获取 ECharts 主题色配置
 * 与 Ant Design 主题色保持一致
 */
const getChartTheme = () => ({
  color: [
    colors.primary.main,
    colors.success.main,
    colors.warning.main,
    colors.error.main,
    '#722ED1', // Purple
    '#13C2C2', // Cyan
    '#EB2F96', // Magenta
    '#FA8C16', // Orange
  ],
  backgroundColor: 'transparent',
  textStyle: {
    color: colors.neutral.text,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
})

/**
 * BaseChart 基础图表组件
 *
 * @example
 * ```tsx
 * <BaseChart
 *   option={{
 *     xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
 *     yAxis: { type: 'value' },
 *     series: [{ data: [120, 200, 150], type: 'line' }],
 *   }}
 *   height={300}
 * />
 * ```
 */
const BaseChart = memo<BaseChartProps>(
  ({
    option,
    loading = false,
    height = 300,
    width = '100%',
    className,
    style,
    ...restProps
  }) => {
    const theme = getChartTheme()

    // 合并主题色到 option
    const mergedOption: EChartsOption = {
      ...option,
      color: option.color ?? theme.color,
      textStyle: {
        ...theme.textStyle,
        ...(option.textStyle as object),
      },
    }

    // ECharts 响应式配置
    const chartOpts: ChartOpts = {
      renderer: 'canvas',
    }

    // ECharts 事件配置
    const onEvents: EChartsReactProps['onEvents'] = {}

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
      <ReactECharts
        option={mergedOption}
        opts={chartOpts}
        onEvents={onEvents}
        notMerge={true}
        lazyUpdate={true}
        style={{ height, width, ...style }}
        className={className}
        {...restProps}
      />
    )
  },
)

BaseChart.displayName = 'BaseChart'

export default BaseChart