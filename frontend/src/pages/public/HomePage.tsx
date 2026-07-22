import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Row, Col, Menu, Card, Table, Tag, Button, Select, Space,
  Pagination, Empty, Spin, Typography, Badge, Tooltip, Statistic, Divider
} from 'antd';
import {
  DownloadOutlined, EyeOutlined, PushpinFilled, FireOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getCategories, getDocs, getTopDocs, getRecentDocs, downloadUrl } from '../../api';
import { Category, Document } from '../../types';
import { formatSize, getFileIcon, getFileColor, getCategoryIcon, FILE_TYPE_OPTIONS } from '../../utils';

const { Text, Title } = Typography;

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [topDocs, setTopDocs] = useState<Document[]>([]);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<'hot'|'recent'>('hot');

  const q           = searchParams.get('q') || '';
  const categoryId  = searchParams.get('category_id') || '';
  const fileType    = searchParams.get('file_type') || '';
  const page        = parseInt(searchParams.get('page') || '1');

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const resp: any = await getDocs({ q, category_id: categoryId, file_type: fileType, page, page_size: 20 });
      setDocs(resp.data.list);
      setTotal(resp.data.total);
    } finally {
      setLoading(false);
    }
  }, [q, categoryId, fileType, page]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  useEffect(() => {
    getCategories().then((r: any) => setCategories(r.data || []));
    getTopDocs().then((r: any) => setTopDocs((r.data || []).slice(0, 10)));
    getRecentDocs().then((r: any) => setRecentDocs((r.data || []).slice(0, 10)));
  }, []);

  const columns = [
    {
      title: '文件名称', dataIndex: 'title', key: 'title',
      render: (text: string, rec: Document) => (
        <Space>
          <span style={{ fontSize: 22 }}>{getFileIcon(rec.file_ext)}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {rec.is_top === 1 && <PushpinFilled style={{ color: '#ff4d4f', fontSize: 12 }} />}
              <a onClick={() => navigate(`/doc/${rec.id}`)} style={{ fontWeight: 500, color: '#262626', cursor:'pointer' }}>
                {text}
              </a>
            </div>
            {rec.tags && (
              <div style={{ marginTop: 2 }}>
                {rec.tags.split(',').filter(Boolean).map(t => (
                  <Tag key={t} style={{ fontSize: 11, marginRight: 4, padding: '0 4px' }}>{t}</Tag>
                ))}
              </div>
            )}
          </div>
        </Space>
      )
    },
    {
      title: '分类', dataIndex: 'category_name', key: 'cat', width: 110,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 13 }}>{v}</Text>
    },
    {
      title: '版本', dataIndex: 'version', key: 'ver', width: 80,
      render: (v: string) => <Tag color="blue" style={{ fontSize: 11 }}>{v}</Tag>
    },
    {
      title: '类型', dataIndex: 'file_ext', key: 'ext', width: 70,
      render: (v: string) => (
        <Tag style={{ color: getFileColor(v), borderColor: getFileColor(v), background: '#fafafa', fontSize: 11 }}>
          {v.toUpperCase()}
        </Tag>
      )
    },
    {
      title: '大小', dataIndex: 'file_size', key: 'size', width: 90,
      render: (v: number) => <Text type="secondary" style={{ fontSize: 13 }}>{formatSize(v)}</Text>
    },
    {
      title: '更新时间', dataIndex: 'updated_at', key: 'time', width: 120,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 13 }}>{dayjs(v).format('MM-DD HH:mm')}</Text>
    },
    {
      title: '下载', dataIndex: 'download_count', key: 'dl', width: 70, align: 'center' as const,
      render: (v: number) => <Text type="secondary" style={{ fontSize: 13 }}>{v}</Text>
    },
    {
      title: '操作', key: 'action', width: 120, align: 'center' as const,
      render: (_: any, rec: Document) => (
        <Space size={4}>
          <Tooltip title="查看详情">
            <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/doc/${rec.id}`)} />
          </Tooltip>
          <Tooltip title="下载文件">
            <Button size="small" type="primary" icon={<DownloadOutlined />}
              href={downloadUrl(rec.id)} download />
          </Tooltip>
        </Space>
      )
    },
  ];

  return (
    <Row gutter={[20, 20]}>
      {/* 左侧分类菜单 */}
      <Col xs={24} md={5} lg={4}>
        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, color: '#262626' }}>
            文档分类
          </div>
          <Menu
            mode="inline"
            selectedKeys={[categoryId || 'all']}
            style={{ border: 'none' }}
            onClick={({ key }) => updateParam('category_id', key === 'all' ? '' : key)}
            items={[
              { key: 'all', label: <span>全部文档</span>, icon: getCategoryIcon('AppstoreOutlined') },
              ...categories.map(c => ({
                key: String(c.id),
                label: <span>{c.name} {c.doc_count ? <Text type="secondary" style={{ fontSize: 11 }}>({c.doc_count})</Text> : null}</span>,
                icon: getCategoryIcon(c.icon),
              }))
            ]}
          />
        </Card>

        {/* 热门 / 最新 */}
        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 8, overflow: 'hidden', marginTop: 16 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
            {['hot','recent'].map(t => (
              <div key={t}
                onClick={() => setActiveTab(t as 'hot'|'recent')}
                style={{
                  flex: 1, padding: '10px 0', textAlign: 'center', cursor: 'pointer', fontSize: 13,
                  color: activeTab === t ? '#1677ff' : '#8c8c8c',
                  fontWeight: activeTab === t ? 600 : 400,
                  borderBottom: activeTab === t ? '2px solid #1677ff' : '2px solid transparent',
                  transition: 'all .2s'
                }}>
                {t === 'hot' ? <><FireOutlined /> 热门下载</> : <><ClockCircleOutlined /> 最新发布</>}
              </div>
            ))}
          </div>
          <div style={{ padding: '8px 0' }}>
            {(activeTab === 'hot' ? topDocs : recentDocs).map((doc, idx) => (
              <div key={doc.id}
                onClick={() => navigate(`/doc/${doc.id}`)}
                style={{
                  padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'background .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f5f6fa')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: 4, background: idx < 3 ? '#1677ff' : '#d9d9d9',
                  color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>{idx + 1}</span>
                <Text ellipsis style={{ fontSize: 13, flex: 1 }} title={doc.title}>{doc.title}</Text>
                <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>
                  {activeTab === 'hot' ? doc.download_count : dayjs(doc.created_at).format('MM-DD')}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      </Col>

      {/* 右侧文件列表 */}
      <Col xs={24} md={19} lg={20}>
        {/* 筛选栏 */}
        <Card style={{ borderRadius: 8, marginBottom: 16 }} bodyStyle={{ padding: '12px 16px' }}>
          <Space wrap>
            <span style={{ color: '#8c8c8c', fontSize: 13 }}>文件类型：</span>
            <Select
              value={fileType || undefined}
              placeholder="全部类型"
              allowClear
              style={{ width: 120 }}
              options={FILE_TYPE_OPTIONS}
              onChange={v => updateParam('file_type', v || '')}
            />
            {q && (
              <Tag color="blue" closable onClose={() => updateParam('q', '')}>
                搜索：{q}
              </Tag>
            )}
            {categoryId && (
              <Tag color="green" closable onClose={() => updateParam('category_id', '')}>
                {categories.find(c => String(c.id) === categoryId)?.name || '分类'}
              </Tag>
            )}
            <Text type="secondary" style={{ fontSize: 13 }}>共 {total} 个文件</Text>
          </Space>
        </Card>

        <Card style={{ borderRadius: 8 }} bodyStyle={{ padding: 0 }}>
          <Spin spinning={loading}>
            <Table
              dataSource={docs}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="middle"
              locale={{ emptyText: <Empty description="暂无文件" style={{ padding: '40px 0' }} /> }}
              style={{ borderRadius: 8 }}
            />
          </Spin>

          {total > 0 && (
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0' }}>
              <Pagination
                current={page}
                total={total}
                pageSize={20}
                showSizeChanger={false}
                showQuickJumper
                showTotal={t => `共 ${t} 条`}
                onChange={p => updateParam('page', String(p))}
              />
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
}
