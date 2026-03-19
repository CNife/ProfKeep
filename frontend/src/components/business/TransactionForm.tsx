/**
 * TransactionForm - 交易记录表单组件
 *
 * 用于记录买入、卖出、分红等交易操作。
 *
 * @example
 * ```tsx
 * <TransactionForm
 *   onSubmit={(values) => console.log('提交:', values)}
 *   onCancel={() => console.log('取消')}
 * />
 * ```
 */

import { Form, Radio, Select, DatePicker, InputNumber, Input, Button, Space, message } from 'antd'
import { PlusOutlined, MinusOutlined, DollarOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { FormInstance } from 'antd'
import dayjs from 'dayjs'
import { FundSelector } from '../common/FundSelector'
import type { FundInfo } from '../common/FundSelector'

const { TextArea } = Input

/** 交易类型 */
export type TransactionType = 'buy' | 'sell' | 'dividend'

/** 交易记录表单值 */
export interface TransactionFormValues {
  /** 交易类型 */
  type: TransactionType
  /** 账户 ID */
  accountId: string
  /** 基金代码 */
  fundCode: string
  /** 交易日期 */
  date: string
  /** 份额 */
  shares: number
  /** 金额 */
  amount: number
  /** 手续费 */
  fee: number
  /** 备注 */
  remark?: string
}

export interface TransactionFormProps {
  /** 提交回调 */
  onSubmit: (values: TransactionFormValues) => void | Promise<void>
  /** 取消回调 */
  onCancel?: () => void
  /** 表单实例（用于外部控制） */
  form?: FormInstance<TransactionFormValues>
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 提交按钮文本 */
  submitText?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 初始值 */
  initialValues?: Partial<TransactionFormValues>
  /** 账户列表 */
  accounts?: Array<{ id: string; name: string }>
}

/**
 * TransactionForm 组件
 *
 * 特性：
 * - 交易类型选择（买入/卖出/分红）
 * - 账户选择
 * - 基金代码输入（带 FundSelector）
 * - 交易日期选择
 * - 份额、金额、手续费输入
 * - 备注输入
 * - 完整的表单验证
 * - 提交 loading 状态
 */
export function TransactionForm({
  onSubmit,
  onCancel,
  form: externalForm,
  showCancel = true,
  submitText = '提交',
  disabled = false,
  initialValues,
  accounts = [
    { id: '1', name: '招商银行账户' },
    { id: '2', name: '支付宝账户' },
    { id: '3', name: '天天基金账户' },
  ],
}: TransactionFormProps) {
  const [internalForm] = Form.useForm<TransactionFormValues>()
  const form = externalForm ?? internalForm
  const [loading, setLoading] = useState(false)

  // 交易类型选项
  const transactionTypes = [
    { label: '买入', value: 'buy', icon: <PlusOutlined /> },
    { label: '卖出', value: 'sell', icon: <MinusOutlined /> },
    { label: '分红', value: 'dividend', icon: <DollarOutlined /> },
  ]

  // 表单提交处理
  const handleSubmit = async (values: TransactionFormValues) => {
    setLoading(true)
    try {
      await onSubmit(values)
      message.success('交易记录已保存')
      form.resetFields()
    } catch (error) {
      message.error('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleFundSelect = (fund: FundInfo) => {
    form.setFieldValue('fundCode', fund.code)
  }

  // 交易类型变化处理
  const handleTypeChange = (value: TransactionType) => {
    // 分红类型时，金额和手续费可能不需要
    if (value === 'dividend') {
      form.setFieldsValue({ fee: 0 })
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        type: 'buy',
        fee: 0,
        ...initialValues,
      }}
      onFinish={handleSubmit}
      disabled={disabled}
    >
      {/* 交易类型 */}
      <Form.Item
        name="type"
        label="交易类型"
        rules={[{ required: true, message: '请选择交易类型' }]}
      >
        <Radio.Group onChange={(e) => handleTypeChange(e.target.value)}>
          {transactionTypes.map((item) => (
            <Radio.Button key={item.value} value={item.value}>
              <Space size={4}>
                {item.icon}
                {item.label}
              </Space>
            </Radio.Button>
          ))}
        </Radio.Group>
      </Form.Item>

      {/* 账户选择 */}
      <Form.Item
        name="accountId"
        label="账户"
        rules={[{ required: true, message: '请选择账户' }]}
      >
        <Select
          placeholder="请选择账户"
          showSearch
          options={accounts.map((account) => ({
            label: account.name,
            value: account.id,
          }))}
        />
      </Form.Item>

      {/* 基金代码 */}
      <Form.Item
        name="fundCode"
        label="基金代码"
        rules={[
          { required: true, message: '请输入基金代码' },
          { pattern: /^\d{6}$/, message: '基金代码为 6 位数字' },
        ]}
      >
        <FundSelector onSelect={handleFundSelect} disabled={disabled} />
      </Form.Item>

      {/* 交易日期 */}
      <Form.Item
        name="date"
        label="交易日期"
        rules={[{ required: true, message: '请选择交易日期' }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          placeholder="请选择日期"
          format="YYYY-MM-DD"
          disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
        />
      </Form.Item>

      {/* 份额 */}
      <Form.Item
        name="shares"
        label="份额"
        rules={[
          { required: true, message: '请输入份额' },
          { type: 'number', min: 0.01, message: '份额必须大于 0' },
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="请输入份额"
          min={0}
          precision={2}
          suffix="份"
        />
      </Form.Item>

      {/* 金额 */}
      <Form.Item
        name="amount"
        label="金额"
        rules={[
          { required: true, message: '请输入金额' },
          { type: 'number', min: 0.01, message: '金额必须大于 0' },
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="请输入金额"
          min={0}
          precision={2}
          prefix="¥"
        />
      </Form.Item>

      {/* 手续费 */}
      <Form.Item
        name="fee"
        label="手续费"
        rules={[{ type: 'number', min: 0, message: '手续费不能为负数' }]}
        initialValue={0}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="请输入手续费"
          min={0}
          precision={2}
          prefix="¥"
        />
      </Form.Item>

      {/* 备注 */}
      <Form.Item name="remark" label="备注">
        <TextArea
          placeholder="请输入备注信息（可选）"
          rows={3}
          maxLength={200}
          showCount
        />
      </Form.Item>

      {/* 操作按钮 */}
      <Form.Item style={{ marginBottom: 0 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          {showCancel && (
            <Button onClick={onCancel} disabled={loading}>
              取消
            </Button>
          )}
          <Button type="primary" htmlType="submit" loading={loading}>
            {submitText}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default TransactionForm