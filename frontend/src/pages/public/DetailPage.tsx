import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Space, Descriptions, Typography, Spin, Breadcrumb, Divider, Modal } from 'antd';
import { DownloadOutlined, ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDoc, downloadUrl, previewUrl } from '../../api';
import { Document } from '../../types';
import { formatSize, getFileIcon, getFileColor } from '../../utils';

const { Title, Text, Paragraph } = Typography;

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDoc(Number(id)).then((r: any) => {
      setDoc(r.data);
      setLoading(false);
    }).catch(() => { setLoading(false); navigate('/'); });
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!doc) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <a onClick={() => navigate('/')}>首页</a> },
        { title: doc.category_name },
        { title: doc.title },
      ]} />

      <Card style={{ borderRadius: 8 }}>
        <Space align="start" style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 48 }}>{getFileIcon(doc.file_ext)}</span>
          <div>
            <Title level={3} style={{ margin: 0, marginBottom: 8 }}>{doc.title}</Title>
            <Space wrap>
              <Tag color="blue">{doc.version}</Tag>
              <Tag style={{ color: getFileColor(doc.file_ext), borderColor: getFileColor(doc.file_ext) }}>
                {doc.file_ext.toUpperCase()}
              </Tag>
              {doc.tags?.split(',').filter(Boolean).map(t => <Tag key={t}>{t}</Tag>)}
            </Space>
          </div>
        </Space>

        <Divider />

        <Descriptions column={2} labelStyle={{ color: '#8c8c8c', width: 100 }}>
          <Descriptions.Item label="所属分类">{doc.category_name}</Descriptions.Item>
          <Descriptions.Item label="文件大小">{formatSize(doc.file_size)}</Descriptions.Item>
          <Descriptions.Item label="版本号">{doc.version}</Descriptions.Item>
          <Descriptions.Item label="下载次数">{doc.download_count}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{dayjs(doc.updated_at).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="上传时间">{dayjs(doc.created_at).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
        </Descriptions>

        {doc.description && (
          <>
            <Divider />
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>文件说明</Text>
              <Paragraph style={{ margin: 0 }}>{doc.description}</Paragraph>
            </div>
          </>
        )}

        <Divider />

        <Space>
          <Button type="primary" size="large" icon={<DownloadOutlined />}
            href={downloadUrl(doc.id)} download style={{ borderRadius: 6 }}>
            下载文件
          </Button>
          {doc.file_ext === 'pdf' && (
            <Button size="large" icon={<EyeOutlined />} onClick={() => setPreviewOpen(true)} style={{ borderRadius: 6 }}>
              在线预览
            </Button>
          )}
          <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ borderRadius: 6 }}>
            返回列表
          </Button>
        </Space>
      </Card>

      {/* PDF 预览弹窗 */}
      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width="90vw"
        style={{ top: 20 }}
        bodyStyle={{ padding: 0, height: '85vh' }}
        title={doc.title}
      >
        <iframe
          src={previewUrl(doc.id)}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0 0 8px 8px' }}
          title="PDF预览"
        />
      </Modal>
    </div>
  );
}
