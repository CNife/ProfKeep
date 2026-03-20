import { useState } from 'react'
import { Button, Card, Col, Descriptions, Form, Input, InputNumber, message, Modal, Row, Select, Switch, Typography, Flex } from 'antd'
import { ExportOutlined, ImportOutlined, DeleteOutlined, SettingOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons'
import { DataCard } from '../components/common'
import { colors, spacing } from '../config/theme'

const { Title, Text } = Typography

interface AccountOption {
  id: string
  name: string
}

const mockAccounts: AccountOption[] = [
  { id: '1', name: '招商银行账户' },
  { id: '2', name: '支付宝账户' },
  { id: '3', name: '天天基金账户' },
]

export function Settings() {
  const [tushareForm] = Form.useForm()
  const [displayForm] = Form.useForm()
  const [isTesting, setIsTesting] = useState(false)
  const [isTokenConfigured, setIsTokenConfigured] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)

  const handleTestConnection = async () => {
    try {
      setIsTesting(true)
      const values = await tushareForm.validateFields()
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (values.token && values.token.length > 10) {
        message.success('Token 验证成功！')
        setIsTokenConfigured(true)
      } else {
        message.error('Token 格式不正确，请检查')
        setIsTokenConfigured(false)
      }
    } catch {
      message.error('验证失败，请检查 Token 是否正确')
      setIsTokenConfigured(false)
    } finally {
      setIsTesting(false)
    }
  }

  const handleSaveTushare = async () => {
    try {
      await tushareForm.validateFields()
      await new Promise(resolve => setTimeout(resolve, 500))
      message.success('Tushare 配置已保存')
      setIsTokenConfigured(true)
    } catch {
      message.error('保存失败')
    }
  }

  const handleSaveDisplay = async () => {
    try {
      await displayForm.validateFields()
      await new Promise(resolve => setTimeout(resolve, 500))
      message.success('显示设置已保存')
    } catch {
      message.error('保存失败')
    }
  }

  const handleExport = () => {
    setIsExportModalOpen(true)
  }

  const handleImport = () => {
    setIsImportModalOpen(true)
  }

  const handleClear = () => {
    setIsClearModalOpen(true)
  }

  const handleConfirmClear = async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    message.success('数据已清空')
    setIsClearModalOpen(false)
  }

  const handleConfirmExport = () => {
    message.success('数据已导出为 JSON 文件')
    setIsExportModalOpen(false)
  }

  const handleConfirmImport = () => {
    message.success('数据已从 JSON 文件导入')
    setIsImportModalOpen(false)
  }

  return (
    <Flex vertical gap={spacing.lg}>
      <Title level={3} style={{ margin: 0, color: colors.neutral.title }}>
        设置
      </Title>

      <DataCard title="Tushare API 配置">
        <Form
          form={tushareForm}
          layout="vertical"
          initialValues={{
            token: '',
          }}
        >
          <Row gutter={[spacing.lg, spacing.md]}>
            <Col xs={24} lg={16}>
              <Form.Item
                label="API Token"
                name="token"
                rules={[{ required: true, message: '请输入 Tushare API Token' }]}
              >
                <Input.Password
                  placeholder="请输入 Tushare API Token"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item label="Token 状态">
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, height: '40px' }}>
                  {isTokenConfigured ? (
                    <>
                      <CheckCircleOutlined style={{ color: colors.success.main, fontSize: 20 }} />
                      <Text style={{ color: colors.success.main }}>已配置</Text>
                    </>
                  ) : (
                    <>
                      <SyncOutlined style={{ color: colors.neutral.secondary, fontSize: 20 }} />
                      <Text style={{ color: colors.neutral.secondary }}>未配置</Text>
                    </>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Flex gap={spacing.sm} wrap="wrap">
              <Button
                type="primary"
                onClick={handleSaveTushare}
                icon={<SettingOutlined />}
              >
                保存配置
              </Button>
              <Button
                onClick={handleTestConnection}
                loading={isTesting}
                icon={<CheckCircleOutlined />}
              >
                测试连接
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </DataCard>

      <DataCard title="数据显示设置">
        <Form
          form={displayForm}
          layout="vertical"
          initialValues={{
            defaultAccount: undefined,
            pageSize: 10,
            profitRateFormat: 'percentage',
            amountPrecision: 2,
          }}
        >
          <Row gutter={[spacing.lg, spacing.md]}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="默认账户"
                name="defaultAccount"
                tooltip="进入应用时默认显示的账户"
              >
                <Select
                  placeholder="选择默认账户"
                  allowClear
                  options={mockAccounts.map(acc => ({
                    label: acc.name,
                    value: acc.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="每页显示条数"
                name="pageSize"
                tooltip="表格每页显示的数据条数"
              >
                <Select
                  style={{ width: '100%' }}
                  options={[
                    { label: '10 条', value: 10 },
                    { label: '20 条', value: 20 },
                    { label: '50 条', value: 50 },
                  ]}
                  placeholder="选择每页条数"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="收益率显示方式"
                name="profitRateFormat"
                valuePropName="checked"
                tooltip="开启显示百分比，关闭显示小数"
              >
                <Switch
                  checkedChildren="百分比"
                  unCheckedChildren="小数"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[spacing.lg, spacing.md]}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="金额精度"
                name="amountPrecision"
                tooltip="金额显示的小数位数"
              >
                <Select
                  placeholder="选择精度"
                  options={[
                    { label: '2 位小数', value: 2 },
                    { label: '4 位小数', value: 4 },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" onClick={handleSaveDisplay}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </DataCard>

      <DataCard title="数据管理">
        <Flex gap={spacing.lg} wrap="wrap">
          <Button
            type="primary"
            size="large"
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出数据
          </Button>
          <Button
            size="large"
            icon={<ImportOutlined />}
            onClick={handleImport}
          >
            导入数据
          </Button>
          <Button
            danger
            size="large"
            icon={<DeleteOutlined />}
            onClick={handleClear}
          >
            清空数据
          </Button>
        </Flex>
        <div style={{ marginTop: spacing.md }}>
          <Text type="secondary">
            支持 JSON 格式的数据导入导出，方便备份和迁移
          </Text>
        </div>
      </DataCard>

      <Card>
        <Descriptions
          title={
            <Flex align="center" gap={spacing.xs}>
              <SettingOutlined />
              <Text>关于</Text>
            </Flex>
          }
          column={{ xs: 1, sm: 2, md: 2, lg: 2 }}
          bordered
        >
          <Descriptions.Item label="应用名称">基金账本</Descriptions.Item>
          <Descriptions.Item label="版本号">v1.0.0</Descriptions.Item>
          <Descriptions.Item label="前端框架">React 18 + TypeScript</Descriptions.Item>
          <Descriptions.Item label="UI 组件库">Ant Design 6.x</Descriptions.Item>
          <Descriptions.Item label="图表库">ECharts 6.x</Descriptions.Item>
          <Descriptions.Item label="状态管理">Zustand 5.x</Descriptions.Item>
          <Descriptions.Item label="HTTP 客户端">React Query 5.x</Descriptions.Item>
          <Descriptions.Item label="构建工具">Vite 8.x</Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="导出数据"
        open={isExportModalOpen}
        onOk={handleConfirmExport}
        onCancel={() => setIsExportModalOpen(false)}
        okText="导出"
        cancelText="取消"
      >
        <p>确定要导出所有数据为 JSON 文件吗？</p>
        <Text type="secondary">导出的文件将包含所有账户、持仓和交易记录。</Text>
      </Modal>

      <Modal
        title="导入数据"
        open={isImportModalOpen}
        onOk={handleConfirmImport}
        onCancel={() => setIsImportModalOpen(false)}
        okText="导入"
        cancelText="取消"
      >
        <p>确定要从 JSON 文件导入数据吗？</p>
        <Text type="secondary" style={{ display: 'block', marginTop: spacing.sm }}>
          注意：导入的数据将覆盖现有数据，请确保已备份重要数据。
        </Text>
      </Modal>

      <Modal
        title="清空数据"
        open={isClearModalOpen}
        onOk={handleConfirmClear}
        onCancel={() => setIsClearModalOpen(false)}
        okText="清空"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        <p style={{ color: colors.error.main }}>警告：此操作将删除所有数据，且无法恢复！</p>
        <Text type="secondary">请确认您已备份重要数据。</Text>
      </Modal>
    </Flex>
  )
}
