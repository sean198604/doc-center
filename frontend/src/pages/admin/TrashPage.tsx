import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Popconfirm, message, Typography, Empty } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getTrashDocs, restoreDoc, permanentDeleteDoc } from '../../api';
import { Document } from '../../types';
import { formatSize, getFileIcon } from '../../utils';

const { Text } = Typography;

export default function TrashPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const r: any = await getTrashDocs().finally(() => setLoading(false));
    setDocs(r.data || []);
  };
  useEffect(() => { fetch(); }, []);

  const handleRestore = async (id: number) => {
    try { await restoreDoc(id); message.success('已恢复'); fetch(); }
    catch { message.error('恢复失败'); }
  };

  const handlePermanent = async (id: number) => {
    try { await permanentDeleteDoc(id); message.success('已永久删除'); fetch(); }
    catch { message.error('删除失败'); }
  };

  const columns = [
    {
      title: '文件名称', dataIndex: 'title', key: 'title',
      render: (text: string, rec: Document) => (
        <Space>
          <span style={{ fontSize: 22 }}>{getFileIcon(rec.file_ext)}</span>
          <Text>{text}</Text>
        </Space>
      )
    },
    { title: '分类', dataIndex: 'category_name', key: 'cat', width: 110 },
    { title: '大小', dataIndex: 'file_size', key: 'size', width: 90, render: (v: number) => formatSize(v) },
    {
      title: '删除时间', dataIndex: 'updated_at', key: 'time', width: 150,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作', key: 'action', width: 160, align: 'center' as const,
      render: (_: any, rec: Document) => (
        <Space size={4}>
          <Popconfirm title="恢复该文件？" onConfirm={() => handleRestore(rec.id)} okText="确认" cancelText="取消">
            <Button size="small" type="primary" ghost>恢复</Button>
          </Popconfirm>
          <Popconfirm title="永久删除？此操作不可恢复！" onConfirm={() => handlePermanent(rec.id)}
            okText="确认删除" okButtonProps={{ danger: true }} cancelText="取消">
            <Button size="small" danger>永久删除</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 600 }}>回收站</Text>
        <Button icon={<ReloadOutlined />} onClick={fetch}>刷新</Button>
      </div>

      <Card style={{ borderRadius: 8 }}>
        <Table dataSource={docs} columns={columns} rowKey="id" loading={loading}
          pagination={false} size="middle"
          locale={{ emptyText: <Empty description="回收站为空" style={{ padding: '40px 0' }} /> }} />
      </Card>
    </div>
  );
}
