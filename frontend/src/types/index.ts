export interface Category {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
  doc_count?: number;
  created_at: string;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category_name?: string;
  version: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_ext: string;
  tags: string;
  download_count: number;
  is_top: number;
  status: 'active' | 'trash';
  created_at: string;
  updated_at: string;
}

export interface DocListResp {
  total: number;
  page: number;
  page_size: number;
  list: Document[];
}

export interface StatsData {
  total_docs: number;
  total_downloads: number;
  monthly_uploads: number;
  recent_docs: Document[];
  top_downloads: Document[];
  category_stats: { name: string; doc_count: number; total_downloads: number }[];
}

export interface DownloadLog {
  id: number;
  document_id: number;
  doc_title?: string;
  ip_address: string;
  user_agent: string;
  downloaded_at: string;
}
