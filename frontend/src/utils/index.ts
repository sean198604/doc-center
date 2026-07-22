import { FileTextOutlined, AccountBookOutlined, ShoppingCartOutlined, TeamOutlined,
  SafetyCertificateOutlined, BookOutlined, AppstoreOutlined, ReadOutlined,
  FolderOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined,
  FilePptOutlined, FileZipOutlined, FileImageOutlined, FileOutlined } from '@ant-design/icons';
import React from 'react';

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(ext: string): React.ReactNode {
  const e = ext.toLowerCase();
  if (e === 'pdf')  return React.createElement(FilePdfOutlined,   { style: { color: '#ff4d4f' } });
  if (e === 'doc' || e === 'docx') return React.createElement(FileWordOutlined, { style: { color: '#1677ff' } });
  if (e === 'xls' || e === 'xlsx') return React.createElement(FileExcelOutlined, { style: { color: '#52c41a' } });
  if (e === 'ppt' || e === 'pptx') return React.createElement(FilePptOutlined,  { style: { color: '#fa8c16' } });
  if (e === 'zip' || e === 'rar')  return React.createElement(FileZipOutlined,  { style: { color: '#722ed1' } });
  if (['jpg','jpeg','png'].includes(e)) return React.createElement(FileImageOutlined, { style: { color: '#13c2c2' } });
  return React.createElement(FileOutlined, { style: { color: '#8c8c8c' } });
}

export function getFileColor(ext: string): string {
  const e = ext.toLowerCase();
  if (e === 'pdf') return '#ff4d4f';
  if (e === 'doc' || e === 'docx') return '#1677ff';
  if (e === 'xls' || e === 'xlsx') return '#52c41a';
  if (e === 'ppt' || e === 'pptx') return '#fa8c16';
  if (e === 'zip' || e === 'rar')  return '#722ed1';
  if (['jpg','jpeg','png'].includes(e)) return '#13c2c2';
  return '#8c8c8c';
}

export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<any>> = {
  FileTextOutlined, AccountBookOutlined, ShoppingCartOutlined, TeamOutlined,
  SafetyCertificateOutlined, BookOutlined, AppstoreOutlined, ReadOutlined, FolderOutlined,
};

export function getCategoryIcon(iconName: string): React.ReactNode {
  const Comp = CATEGORY_ICON_MAP[iconName] || FolderOutlined;
  return React.createElement(Comp);
}

export const FILE_TYPE_OPTIONS = [
  { label: 'PDF',  value: 'pdf'  },
  { label: 'Word', value: 'docx' },
  { label: 'Excel',value: 'xlsx' },
  { label: 'PPT',  value: 'pptx' },
  { label: 'ZIP',  value: 'zip'  },
  { label: 'RAR',  value: 'rar'  },
  { label: '图片',  value: 'jpg'  },
];
