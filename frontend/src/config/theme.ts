/**
 * 基金账本设计系统 Tokens
 * 基于 UI_DESIGN.md 定义的色彩、字体、间距、圆角系统
 */

import type { ThemeConfig } from 'antd'

/**
 * 色彩系统
 * 主色调：Primary Blue #1890FF
 * 辅助色：Success Green #52C41A, Error Red #FF4D4F, Warning Orange #FAAD14
 */
export const colors = {
  // 主色
  primary: {
    main: '#1890FF',
    light: '#40A9FF',
    dark: '#096DD9',
    background: '#E6F7FF',
  },
  // 成功色 (盈利)
  success: {
    main: '#52C41A',
    light: '#73D13D',
    background: '#F6FFED',
  },
  // 错误色 (亏损)
  error: {
    main: '#FF4D4F',
    light: '#FF7875',
    background: '#FFF1F0',
  },
  // 警告色
  warning: {
    main: '#FAAD14',
    background: '#FFFBE6',
  },
  // 中性色
  neutral: {
    title: '#262626',
    text: '#595959',
    secondary: '#8C8C8C',
    border: '#D9D9D9',
    background: '#F0F0F0',
    white: '#FFFFFF',
  },
  // 背景色
  background: {
    page: '#F5F7FA',
    card: '#FFFFFF',
    hover: '#FAFAFA',
  },
} as const

/**
 * 字体系统
 */
export const typography = {
  // 字体家族
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  // 数字字体 (用于金额、收益率)
  fontFamilyNumber: "'DIN Alternate', 'Helvetica Neue', Arial, sans-serif",

  // 字体大小
  fontSize: {
    h1: 32, // 页面标题
    h2: 24, // 区块标题
    h3: 20, // 卡片标题
    h4: 16, // 小标题
    body1: 14, // 正文
    body2: 12, // 辅助文字
    caption: 12, // 说明文字
  },

  // 行高
  lineHeight: {
    h1: 38,
    h2: 32,
    h3: 28,
    h4: 24,
    body1: 22,
    body2: 20,
    caption: 20,
  },

  // 字重
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const

/**
 * 间距系统
 */
export const spacing = {
  xs: 4, // 紧凑间距
  sm: 8, // 小间距
  md: 16, // 标准间距
  lg: 24, // 大间距
  xl: 32, // 超大间距
  xxl: 48, // 巨大间距
} as const

/**
 * 圆角系统
 */
export const borderRadius = {
  small: 4, // 小按钮、标签
  medium: 8, // 卡片、按钮
  large: 12, // 大卡片、弹窗
} as const

/**
 * 阴影系统
 */
export const shadows = {
  card: '0 2px 8px rgba(0, 0, 0, 0.08)', // 卡片阴影
  hover: '0 4px 12px rgba(0, 0, 0, 0.12)', // 悬停阴影
  modal: '0 8px 24px rgba(0, 0, 0, 0.16)', // 弹窗阴影
} as const

/**
 * Ant Design 主题配置
 * 使用 Ant Design 5.x 的 theme token API
 */
export const antdTheme: ThemeConfig = {
  token: {
    // 主色
    colorPrimary: colors.primary.main,

    // 成功色
    colorSuccess: colors.success.main,

    // 警告色
    colorWarning: colors.warning.main,

    // 错误色
    colorError: colors.error.main,

    // 信息色
    colorInfo: colors.primary.main,

    // 圆角
    borderRadius: borderRadius.medium,
    borderRadiusLG: borderRadius.large,
    borderRadiusSM: borderRadius.small,

    // 字体
    fontFamily: typography.fontFamily,

    // 字体大小
    fontSize: typography.fontSize.body1,
    fontSizeLG: typography.fontSize.h3,
    fontSizeXL: typography.fontSize.h2,

    // 行高
    lineHeight: 1.5715,

    // 间距
    margin: spacing.md,
    marginSM: spacing.sm,
    marginLG: spacing.lg,
    padding: spacing.md,
    paddingSM: spacing.sm,
    paddingLG: spacing.lg,

    // 阴影
    boxShadow: shadows.card,
    boxShadowSecondary: shadows.hover,

    // 背景色
    colorBgLayout: colors.background.page,
    colorBgContainer: colors.background.card,
    colorBgElevated: colors.background.card,

    // 边框
    colorBorder: colors.neutral.border,
    colorBorderSecondary: colors.neutral.background,
  },
  components: {
    // 按钮组件
    Button: {
      borderRadius: borderRadius.medium,
      borderRadiusSM: borderRadius.small,
      borderRadiusLG: borderRadius.large,
    },
    // 卡片组件
    Card: {
      borderRadius: borderRadius.medium,
      borderRadiusLG: borderRadius.large,
      boxShadow: shadows.card,
    },
    // 表格组件
    Table: {
      borderRadius: borderRadius.medium,
    },
    // 输入框组件
    Input: {
      borderRadius: borderRadius.medium,
      borderRadiusSM: borderRadius.small,
      borderRadiusLG: borderRadius.large,
    },
    // 选择器组件
    Select: {
      borderRadius: borderRadius.medium,
      borderRadiusSM: borderRadius.small,
      borderRadiusLG: borderRadius.large,
    },
  },
}

export default antdTheme
