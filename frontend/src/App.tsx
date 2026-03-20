import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Header, SideNav } from './components/Layout'
import { Layout } from 'antd'
import { colors, spacing } from './config/theme'

const { Content } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout>
        <SideNav />
        <Content
          style={{
            padding: spacing.lg,
            backgroundColor: colors.background.page,
            overflow: 'auto',
          }}
        >
          <RouterProvider router={router} />
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
