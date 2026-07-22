import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Button, Space, Tag, Input, Select, Modal, Form,
  Upload, message, Tooltip, Typography, Popconfirm, Switch, Drawer
} from 'antd';
import {
  UploadOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined,
  PlusOutlined, SearchOutlined, PushpinOutlined, PushpinFilled, ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getDocs, getCategories, uploadDoc, updateDoc, deleteDoc, toggleTop,
  downloadUrl
} from '../../api';
import { Document, Category } from '../../types';
import { formatSize, getFileIcon, getFileColor, FILE_TYPE_OPTIONS } from '../../utils';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;
const { Search } = Input;

export default function DocsPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // 查询参数
  const [q, setQ] = useState('');
  const [catId, setCatId] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [page, setPage] = useState(1);

  // 弹窗
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editOpen, setEditOpen]     = useState(false);
  const [editDoc, setEditDoc]       = useState<Document | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadForm] = Form.useForm();
  const [editForm]   = Form.useForm();

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const r: any = await getDocs({ q, category_id: catId, file_type: fileType, page, page_size: 20 });
      setDocs(r.data.list);
      setTotal(r.data.total);
    } finally { setLoading(false); }
  }, [q, catId, fileType, page]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  useEffect(() => {
    getCategories().then((r: any) => setCategories(r.data || []));
  }, []);

  const handleUpload = async (vals: any) => {
    if (!vals.file?.fileList?.length) { message.error('请选择文件'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', vals.file.fileList[0].originFileObj);
    fd.append('title', vals.title);
    fd.append('description', vals.description || '');
    fd.append('category_id', vals.category_id);
    fd.append('version', vals.version || 'v1.0');
    fd.append('tags', vals.tags || '');
    try {
      await uploadDoc(fd);
      message.success('上传成功');
      setUploadOpen(false);
      uploadForm.resetFields();
      fetchDocs();
    } catch (e: any) { message.error(e?.message || '上传失败'); }
    finally { setUploading(false); }
  };

  const handleEdit = async (vals: any) => {
    if (!editDoc) return;
    try {
      await updateDoc(editDoc.id, vals);
      message.success('更新成功');
      setEditOpen(false);
      fetchDocs();
    } catch { message.error('更新失败'); }
  };

  const openEdit = (doc: Document) => {
    setEditDoc(doc);
    editForm.setFieldsValue({
      title: doc.title, description: doc.description, category_id: doc.category_id,
      version: doc.version, tags: doc.tags, is_top: doc.is_top === 1
    });
    setEditOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDoc(id);
      message.success('已移入回收站');
      fetchDocs();
    } catch { message.error('删除失败'); }
  };

  const handleToggleTop = async (id: number) => {
    try {
      const r: any = await toggleTop(id);
      message.success(r.message || '操作成功');
      fetchDocs();
    } catch { message.error('操作失败'); }
  };

  const columns = [
    {
      title: '文件名称', dataIndex: 'title', key: 'title',
      render: (text: string, rec: Document) => (
        <Space>
          <span style={{ fontSize: 22 }}>{getFileIcon(rec.file_ext)}</span>
          <div>
            <Space>
              {rec.is_top === 1 && <PushpinFilled style={{ color: '#ff4d4f', fontSize: 12 }} />}
              <Text style={{ fontWeight: 500 }}>{text}</Text>
            </Space>
            {rec.tags && (
              <div style={{ marginTop: 2 }}>
                {rec.tags.split(',').filter(Boolean).map(t => (
                  <Tag key={t} style={{ fontSize: 11, padding: '0 4px' }}>{t}</Tag>
                ))}
              </div>
            )}
          </div>
        </Space>
      )
    },
    { title: '分类', dataIndex: 'category_name', key: 'cat', width: 110 },
    { title: '版本', dataIndex: 'version', key: 'ver', width: 80, render: (v: string) => <Tag color="blue">{v}</Tag> },
    {
      title: '类型', dataIndex: 'file_ext', key: 'ext', width: 70,
      render: (v: string) => (
        <Tag style={{ color: getFileColor(v), borderColor: getFileColor(v), background: '#fafafa', fontSize: 11 }}>
          {v.toUpperCase()}
        </Tag>
      )
    },
    { title: '大小', dataIndex: 'file_size', key: 'size', width: 90, render: (v: number) => formatSize(v) },
    { title: '下载', dataIndex: 'download_count', key: 'dl', width: 70, align: 'center' as const },
    { title: '上传时间', dataIndex: 'created_at', key: 'time', width: 120, render: (v: string) => dayjs(v).format('MM-DD HH:mm') },
    {
      title: '操作', key: 'action', width: 180, align: 'center' as const,
      render: (_: any, rec: Document) => (
        <Space size={4}>
          <Tooltip title={rec.is_top ? '取消置顶' : '置顶'}>
            <Button size="small" icon={rec.is_top ? <PushpinFilled style={{ color: '#ff4d4f' }} /> : <PushpinOutlined />}
              onClick={() => handleToggleTop(rec.id)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(rec)} />
          </Tooltip>
          <Tooltip title="查看">
            <Button size="small" icon={<EyeOutlined />} onClick={() => window.open(`/doc/${rec.id}`, '_blank')} />
          </Tooltip>
          <Tooltip title="下载">
            <Button size="small" icon={<DownloadOutlined />} href={downloadUrl(rec.id)} download />
          </Tooltip>
          <Popconfirm title="移入回收站？" onConfirm={() => handleDelete(rec.id)} okText="确认" cancelText="取消">
            <Tooltip title="删除">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    },
  ];

  const catOptions = [{ value: '', label: '全部分类' }, ...categories.map(c => ({ value: String(c.id), label: c.name }))];
  const typeOptions = [{ value: '', label: '全部类型' }, ...FILE_TYPE_OPTIONS];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 600 }}>文件管理</Text>
        <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadOpen(true)}>上传文件</Button>
      </div>

      <Card style={{ borderRadius: 8, marginBottom: 16 }} bodyStyle={{ padding: '12px 16px' }}>
        <Space wrap>
          <Search placeholder="搜索文件名..." value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
            onSearch={() => setPage(1)} style={{ width: 200 }} allowClear />
          <Select value={catId} options={catOptions} style={{ width: 130 }}
            onChange={v => { setCatId(v); setPage(1); }} />
          <Select value={fileType} options={typeOptions} style={{ width: 110 }}
            onChange={v => { setFileType(v); setPage(1); }} />
          <Button icon={<ReloadOutlined />} onClick={fetchDocs}>刷新</Button>
          <Text type="secondary" style={{ fontSize: 13 }}>共 {total} 个文件</Text>
        </Space>
      </Card>

      <Card style={{ borderRadius: 8 }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={docs}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{
            current: page,
            total,
            pageSize: 20,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: t => `共 ${t} 条`,
            onChange: p => setPage(p),
            style: { padding: '16px 24px' }
          }}
        />
      </Card>

      {/* 上传文件弹窗 */}
      <Modal title="上传文件" open={uploadOpen} onCancel={() => { setUploadOpen(false); uploadForm.resetFields(); }}
        onOk={() => uploadForm.submit()} confirmLoading={uploading} okText="上传" width={560}>
        <Form form={uploadForm} layout="vertical" onFinish={handleUpload} style={{ marginTop: 16 }}>
          <Form.Item name="file" label="选择文件" rules={[{ required: true, message: '请选择文件' }]}>
            <Upload beforeUpload={() => false} maxCount={1} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png">
              <Button icon={<UploadOutlined />}>选择文件（最大200MB）</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="title" label="文件名称" rules={[{ required: true }]}>
            <Input placeholder="请输入文件显示名称" />
          </Form.Item>
          <Form.Item name="category_id" label="所属分类" rules={[{ required: true }]}>
            <Select options={categories.map(c => ({ value: String(c.id), label: c.name }))} placeholder="请选择分类" />
          </Form.Item>
          <Form.Item name="version" label="版本号" initialValue="v1.0">
            <Input placeholder="如：v1.0、v2.3、2024版" />
          </Form.Item>
          <Form.Item name="description" label="文件说明">
            <Input.TextArea rows={3} placeholder="简要描述文件内容（可选）" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="多个标签用逗号分隔，如：合同,模板" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑弹窗 */}
      <Modal title="编辑文档信息" open={editOpen} onCancel={() => setEditOpen(false)}
        onOk={() => editForm.submit()} okText="保存">
        <Form form={editForm} layout="vertical" onFinish={handleEdit} style={{ marginTop: 16 }}>
          <Form.Item name="title" label="文件名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category_id" label="所属分类" rules={[{ required: true }]}>
            <Select options={categories.map(c => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="version" label="版本号">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="文件说明">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="多个标签用逗号分隔" />
          </Form.Item>
          <Form.Item name="is_top" label="置顶" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
