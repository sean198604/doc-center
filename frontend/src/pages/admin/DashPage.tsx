import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Space, Spin } from 'antd';
import { FileOutlined, DownloadOutlined, UploadOutlined, FireOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getStats } from '../../api';
import { StatsData, Document } from '../../types';
import { formatSize, getFileIcon } from '../../utils';

const { Text } = Typography;

export default function DashPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then((r: any) => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!data) return null;

  const statCards = [
    { title: '总文件数', value: data.total_docs, icon: <FileOutlined />, color: '#1677ff', bg: '#e6f4ff' },
    { title: '总下载次数', value: data.total_downloads, icon: <DownloadOutlined />, color: '#52c41a', bg: '#f6ffed' },
    { title: '本月上传', value: data.monthly_uploads, icon: <UploadOutlined />, color: '#fa8c16', bg: '#fff7e6' },
    { title: '热门排行', value: data.top_downloads[0]?.download_count || 0, icon: <FireOutlined />, color: '#ff4d4f', bg: '#fff1f0', suffix: '次' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: 600 }}>仪表盘</Text>
        <Text type="secondary" style={{ marginLeft: 12, fontSize: 13 }}>欢迎回来，数据更新至 {dayjs().format('HH:mm')}</Text>
      </div>

      <Row gutter={[16, 16]}>
        {statCards.map(c => (
          <Col xs={12} sm={6} key={c.title}>
            <Card style={{ borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: c.color }}>
                  {c.icon}
                </div>
                <Statistic title={<Text type="secondary" style={{ fontSize: 13 }}>{c.title}</Text>}
                  value={c.value} suffix={c.suffix}
                  valueStyle={{ fontSize: 24, fontWeight: 700, color: c.color }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 最近上传 */}
        <Col xs={24} lg={12}>
          <Card title="最近上传" style={{ borderRadius: 8 }}>
            {data.recent_docs.map(doc => (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <span style={{ fontSize: 24 }}>{getFileIcon(doc.file_ext)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text ellipsis style={{ display: 'block', fontWeight: 500 }}>{doc.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{doc.category_name} · {formatSize(doc.file_size)}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>{dayjs(doc.created_at).format('MM-DD')}</Text>
              </div>
            ))}
          </Card>
        </Col>

        {/* 分类统计 */}
        <Col xs={24} lg={12}>
          <Card title="分类统计" style={{ borderRadius: 8 }}>
            <Table
              dataSource={data.category_stats}
              rowKey="name"
              size="small"
              pagination={false}
              columns={[
                { title: '分类', dataIndex: 'name', key: 'name' },
                { title: '文件数', dataIndex: 'doc_count', key: 'cnt', width: 80, align: 'center' as const },
                {
                  title: '下载量', dataIndex: 'total_downloads', key: 'dl', width: 100, align: 'right' as const,
                  render: v => <Text type="secondary">{v}</Text>
                },
              ]}
            />
          </Card>
        </Col>

        {/* TOP10 下载排行 */}
        <Col xs={24}>
          <Card title={<><FireOutlined style={{ color: '#ff4d4f', marginRight: 6 }} />下载排行 TOP10</>} style={{ borderRadius: 8 }}>
            <Table
              dataSource={data.top_downloads}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: '排名', key: 'rank', width: 60, align: 'center' as const,
                  render: (_: any, __: any, i: number) => (
                    <span style={{
                      width: 24, height: 24, borderRadius: 6, background: i < 3 ? '#1677ff' : '#f0f0f0',
                      color: i < 3 ? '#fff' : '#8c8c8c', fontWeight: 700, fontSize: 12,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                    }}>{i + 1}</span>
                  )
                },
                {
                  title: '文件名称', dataIndex: 'title', key: 'title',
                  render: (t: string, r: Document) => (
                    <Space><span>{getFileIcon(r.file_ext)}</span><Text>{t}</Text></Space>
                  )
                },
                { title: '分类', dataIndex: 'category_name', key: 'cat', width: 120 },
                { title: '版本', dataIndex: 'version', key: 'ver', width: 80, render: (v: string) => <Tag color="blue">{v}</Tag> },
                {
                  title: '下载次数', dataIndex: 'download_count', key: 'dl', width: 100, align: 'right' as const,
                  render: (v: number) => <Text style={{ color: '#ff4d4f', fontWeight: 600 }}>{v}</Text>
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
