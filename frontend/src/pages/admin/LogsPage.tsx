import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Space, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDownloadLogs } from '../../api';
import { DownloadLog } from '../../types';

const { Text } = Typography;

export default function LogsPage() {
  const [logs, setLogs] = useState<DownloadLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetch = async (p = page) => {
    setLoading(true);
    const r: any = await getDownloadLogs({ page: p, page_size: 20 }).finally(() => setLoading(false));
    setLogs(r.data?.list || []);
    setTotal(r.data?.total || 0);
  };

  useEffect(() => { fetch(page); }, [page]);

  const columns = [
    { title: '#', dataIndex: 'id', key: 'id', width: 70 },
    { title: '文件名称', dataIndex: 'doc_title', key: 'title' },
    {
      title: 'IP地址', dataIndex: 'ip_address', key: 'ip', width: 140,
      render: (v: string) => <Text type="secondary" style={{ fontFamily: 'monospace' }}>{v || '-'}</Text>
    },
    {
      title: 'User-Agent', dataIndex: 'user_agent', key: 'ua',
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 12 }} ellipsis={{ tooltip: v }}>{v || '-'}</Text>
      )
    },
    {
      title: '下载时间', dataIndex: 'downloaded_at', key: 'time', width: 160,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Text style={{ fontSize: 20, fontWeight: 600 }}>下载日志</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>共 {total} 条记录</Text>
        </Space>
        <Button icon={<ReloadOutlined />} onClick={() => fetch(page)}>刷新</Button>
      </div>

      <Card style={{ borderRadius: 8 }}>
        <Table
          dataSource={logs}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{
            current: page, total, pageSize: 20, showSizeChanger: false,
            showTotal: t => `共 ${t} 条`, onChange: p => setPage(p),
          }}
        />
      </Card>
    </div>
  );
}
