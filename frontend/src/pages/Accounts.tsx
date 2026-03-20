/**
 * Accounts - 账户管理页面
 *
 * 支持账户的创建、查看、编辑和删除操作。
 */

import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Row,
  Col,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Empty,
  Skeleton,
  Flex,
  message,
} from 'antd'
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { AccountCard } from '@/components/business/AccountCard'
import { colors, spacing } from '@/config/theme'
import { mockAccounts } from '@/mocks/handlers'

const { Title } = Typography
const { confirm } = Modal

/** 账户数据接口 */
interface Account {
  id: string
  name: string
  description?: string
  totalAssets: number
  totalProfit: number
  profitRate: number
  fundCount: number
  created_at: string
  updated_at: string
}

/** 表单字段接口 */
interface AccountFormValues {
  name: string
  description?: string
}

export function Accounts() {
  const navigate = useNavigate()
  const [form] = Form.useForm<AccountFormValues>()
  const [accounts, setAccounts] = useState<Account[]>(() =>
    mockAccounts.map((acc) => ({
      ...acc,
      id: String(acc.id),
      totalAssets: Math.random() * 50000 + 10000,
      totalProfit: Math.random() * 5000 - 2000,
      profitRate: Math.random() * 0.3 - 0.1,
      fundCount: Math.floor(Math.random() * 5) + 1,
    })),
  )
  const [loading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = () => {
    setEditingAccount(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = useCallback(
    (id: string) => {
      const account = accounts.find((a) => a.id === id)
      if (account) {
        setEditingAccount(account)
        form.setFieldsValue({
          name: account.name,
          description: account.description,
        })
        setModalOpen(true)
      }
    },
    [accounts, form],
  )

  const handleDelete = useCallback(
    (id: string) => {
      const account = accounts.find((a) => a.id === id)
      if (!account) return

      if (account.fundCount > 0) {
        message.warning('该账户有持仓基金，无法删除')
        return
      }

      confirm({
        title: '确认删除',
        icon: <ExclamationCircleOutlined />,
        content: `确定要删除账户「${account.name}」吗？此操作不可恢复。`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          setAccounts((prev) => prev.filter((a) => a.id !== id))
          message.success('账户已删除')
        },
      })
    },
    [accounts],
  )

  const handleViewHoldings = useCallback(
    (id: string) => {
      navigate(`/holdings?accountId=${id}`)
    },
    [navigate],
  )

  const handleRecordTransaction = useCallback(
    (id: string) => {
      navigate(`/transactions?accountId=${id}`)
    },
    [navigate],
  )

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      await new Promise((resolve) => setTimeout(resolve, 500))

      if (editingAccount) {
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === editingAccount.id
              ? { ...acc, ...values, updated_at: new Date().toISOString() }
              : acc,
          ),
        )
        message.success('账户已更新')
      } else {
        const newAccount: Account = {
          id: String(Date.now()),
          name: values.name,
          description: values.description,
          totalAssets: 0,
          totalProfit: 0,
          profitRate: 0,
          fundCount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setAccounts((prev) => [...prev, newAccount])
        message.success('账户已创建')
      }

      setModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('表单验证失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleModalCancel = () => {
    setModalOpen(false)
    form.resetFields()
  }

  const accountCards = useMemo(
    () =>
      accounts.map((account) => (
        <Col key={account.id} xs={24} sm={12} lg={8}>
          <AccountCard
            id={account.id}
            name={account.name}
            totalAssets={account.totalAssets}
            totalProfit={account.totalProfit}
            profitRate={account.profitRate}
            fundCount={account.fundCount}
            onViewHoldings={handleViewHoldings}
            onRecordTransaction={handleRecordTransaction}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Col>
      )),
    [accounts, handleDelete, handleEdit, handleRecordTransaction, handleViewHoldings],
  )

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
          账户管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建账户
        </Button>
      </Flex>

      {accounts.length === 0 ? (
        <Empty
          description="暂无账户"
          style={{ padding: spacing.xxl }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建第一个账户
          </Button>
        </Empty>
      ) : (
        <Row gutter={[spacing.lg, spacing.lg]}>{accountCards}</Row>
      )}

      <Modal
        title={editingAccount ? '编辑账户' : '新建账户'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form<AccountFormValues>
          form={form}
          layout="vertical"
          autoComplete="off"
          style={{ marginTop: spacing.md }}
        >
          <Form.Item
            name="name"
            label="账户名称"
            rules={[
              { required: true, message: '请输入账户名称' },
              { min: 2, message: '账户名称至少 2 个字符' },
              { max: 50, message: '账户名称最多 50 个字符' },
            ]}
          >
            <Input placeholder="请输入账户名称" maxLength={50} />
          </Form.Item>

          <Form.Item name="description" label="账户描述">
            <Input.TextArea
              placeholder="请输入账户描述（可选）"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  )
}

export default Accounts