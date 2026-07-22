import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api';
import { Category } from '../../types';
import { CATEGORY_ICON_MAP, getCategoryIcon } from '../../utils';

const { Text } = Typography;

const ICON_OPTIONS = Object.keys(CATEGORY_ICON_MAP).map(k => ({ value: k, label: k }));

export default function CatsPage() {
  const [cats, setCats]         = useState<Category[]>([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [editing, setEditing]   = useState<Category | null>(null);
  const [form]                  = Form.useForm();

  const fetch = async () => {
    setLoading(true);
    const r: any = await getCategories().finally(() => setLoading(false));
    setCats(r.data || []);
  };
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); form.resetFields(); setOpen(true); };
  const openEdit = (c: Category) => {
    setEditing(c);
    form.setFieldsValue({ name: c.name, icon: c.icon, sort_order: c.sort_order });
    setOpen(true);
  };

  const handleSubmit = async (vals: any) => {
    try {
      if (editing) { await updateCategory(editing.id, vals); message.success('更新成功'); }
      else          { await createCategory(vals); message.success('创建成功'); }
      setOpen(false);
      fetch();
    } catch (e: any) { message.error(e?.message || '操作失败'); }
  };

  const handleDelete = async (id: number) => {
    try { await deleteCategory(id); message.success('删除成功'); fetch(); }
    catch (e: any) { message.error(e?.message || '删除失败'); }
  };

  const columns = [
    {
      title: '图标', dataIndex: 'icon', key: 'icon', width: 60,
      render: (v: string) => <span style={{ fontSize: 18 }}>{getCategoryIcon(v)}</span>
    },
    { title: '分类名称', dataIndex: 'name', key: 'name' },
    { title: '排序', dataIndex: 'sort_order', key: 'sort', width: 80, align: 'center' as const },
    { title: '文件数', dataIndex: 'doc_count', key: 'cnt', width: 80, align: 'center' as const,
      render: (v: number) => <Tag color="blue">{v || 0}</Tag> },
    { title: '创建时间', dataIndex: 'created_at', key: 'time', width: 160,
      render: (v: string) => new Date(v).toLocaleDateString('zh-CN') },
    {
      title: '操作', key: 'action', width: 120, align: 'center' as const,
      render: (_: any, rec: Category) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(rec)} />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(rec.id)} okText="确认" cancelText="取消">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 600 }}>分类管理</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增分类</Button>
      </div>

      <Card style={{ borderRadius: 8 }}>
        <Table dataSource={cats} columns={columns} rowKey="id" loading={loading} pagination={false} size="middle" />
      </Card>

      <Modal title={editing ? '编辑分类' : '新增分类'} open={open}
        onCancel={() => setOpen(false)} onOk={() => form.submit()} okText="保存">
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}>
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="icon" label="图标" initialValue="FolderOutlined">
            <Select options={ICON_OPTIONS}
              optionRender={o => (
                <Space><span>{getCategoryIcon(String(o.value))}</span>{o.label}</Space>
              )} />
          </Form.Item>
          <Form.Item name="sort_order" label="排序" initialValue={0}>
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
