import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Input, Button, Typography, Space } from 'antd';
import { SearchOutlined, SettingOutlined, FolderOpenOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

export default function PublicLayout() {
  const navigate = useNavigate();
  const [q, setQ] = React.useState('');

  const handleSearch = () => {
    navigate(`/?q=${encodeURIComponent(q)}`);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <Header style={{
        background: '#fff',
        padding: '0 24px',
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FolderOpenOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#262626', lineHeight: '1.2' }}>
              企业文档下载中心
            </div>
            <div style={{ fontSize: 11, color: '#8c8c8c', lineHeight: '1.2' }}>Document Center</div>
          </div>
        </Link>

        {/* 搜索框 */}
        <div style={{ flex: 1, maxWidth: 480 }}>
          <Input.Search
            placeholder="搜索文件名称或描述..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onSearch={handleSearch}
            onPressEnter={handleSearch}
            size="large"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            style={{ borderRadius: 8 }}
          />
        </div>

        <div style={{ flex: 1 }} />

        <Link to="/admin">
          <Button icon={<SettingOutlined />} type="text" style={{ color: '#8c8c8c' }}>
            管理后台
          </Button>
        </Link>
      </Header>

      <Content style={{ maxWidth: 1400, margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', background: '#f5f6fa', color: '#bfbfbf', padding: '16px 0', fontSize: 12 }}>
        企业文档下载中心 &copy; {new Date().getFullYear()} &nbsp;|&nbsp; 仅供内部使用
      </Footer>
    </Layout>
  );
}
