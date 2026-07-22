import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography, Modal, Form, Input, message, Space } from 'antd';
import {
  DashboardOutlined, FileOutlined, AppstoreOutlined, DeleteOutlined,
  UnorderedListOutlined, LogoutOutlined, UserOutlined, LockOutlined,
  FolderOpenOutlined, HomeOutlined
} from '@ant-design/icons';
import { changePassword } from '../../api';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

export default function AdminLayout() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const username = 'Admin';
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [form] = Form.useForm();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const handleChangePwd = async (vals: any) => {
    if (vals.newPassword !== vals.confirm) { message.error('两次密码不一致'); return; }
    setPwdLoading(true);
    try {
      await changePassword(vals.oldPassword, vals.newPassword);
      message.success('密码修改成功，请重新登录');
      setPwdOpen(false);
      logout();
    } catch (e: any) { message.error(e?.message || '修改失败'); }
    finally { setPwdLoading(false); }
  };

  const selected = location.pathname.replace('/admin', '').replace(/^\//, '') || 'index';

  const menuItems = [
    { key: 'index',      icon: <DashboardOutlined />,    label: '仪表盘',   path: '/admin' },
    { key: 'docs',       icon: <FileOutlined />,          label: '文件管理', path: '/admin/docs' },
    { key: 'categories', icon: <AppstoreOutlined />,      label: '分类管理', path: '/admin/categories' },
    { key: 'trash',      icon: <DeleteOutlined />,        label: '回收站',   path: '/admin/trash' },
    { key: 'logs',       icon: <UnorderedListOutlined />, label: '下载日志', path: '/admin/logs' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        width={220}
        style={{ borderRight: '1px solid #f0f0f0', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 200 }}
      >
        {/* LOGO */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FolderOpenOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#262626', lineHeight: '1.2' }}>文档中心</div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>管理后台</div>
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selected === '' ? 'index' : selected]}
          style={{ border: 'none', padding: '8px 0' }}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => navigate(item.path)
          }))}
        />

        {/* 底部：回前台 */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
          <Link to="/" style={{ color: '#8c8c8c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <HomeOutlined /> 返回前台
          </Link>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 220 }}>
        <Header style={{
          background: '#fff', padding: '0 24px',
          borderBottom: '1px solid #f0f0f0', display: 'flex',
          alignItems: 'center', justifyContent: 'flex-end', height: 56,
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <Dropdown menu={{
            items: [
              { key: 'pwd', icon: <LockOutlined />, label: '修改密码', onClick: () => setPwdOpen(true) },
              { type: 'divider' as const },
              { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: logout },
            ]
          }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar size={28} icon={<UserOutlined />} style={{ background: '#1677ff' }} />
              <Text style={{ fontSize: 14 }}>{username}</Text>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ padding: 24, background: '#f5f6fa', minHeight: 'calc(100vh - 56px)' }}>
          <Outlet />
        </Content>
      </Layout>

      {/* 修改密码弹窗 */}
      <Modal title="修改密码" open={pwdOpen} onCancel={() => setPwdOpen(false)}
        onOk={() => form.submit()} confirmLoading={pwdLoading} okText="确认修改">
        <Form form={form} layout="vertical" onFinish={handleChangePwd} style={{ marginTop: 16 }}>
          <Form.Item name="oldPassword" label="原密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirm" label="确认新密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
