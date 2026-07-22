import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { LockOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { login } from '../../api';

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (vals: { password: string }) => {
    setLoading(true);
    try {
      const res: any = await login(vals.password);
      localStorage.setItem('token', res.data.token);
      message.success('登录成功');
      navigate('/admin');
    } catch (e: any) {
      message.error(e?.message || '密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Card style={{ width: 380, borderRadius: 12, boxShadow: '0 8px 32px rgba(22,119,255,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
            borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16
          }}>
            <FolderOpenOutlined style={{ color: '#fff', fontSize: 26 }} />
          </div>
          <Title level={4} style={{ margin: 0 }}>企业文档下载中心</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>管理员登录</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="password" rules={[{ required: true, message: '请输入管理密码' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="请输入管理密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44, borderRadius: 8 }}>
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: -8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>默认密码：1234</Text>
        </div>
      </Card>
    </div>
  );
}
