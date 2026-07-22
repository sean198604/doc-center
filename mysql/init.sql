-- 企业文档下载中心 数据库初始化脚本
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS doc_center DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE doc_center;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'super_admin') NOT NULL DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT 'FolderOutlined',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文档表
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT NOT NULL,
  version VARCHAR(32) DEFAULT 'v1.0',
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_ext VARCHAR(20) NOT NULL,
  tags VARCHAR(255) DEFAULT '',
  download_count INT NOT NULL DEFAULT 0,
  is_top TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('active', 'trash') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 下载日志表
CREATE TABLE IF NOT EXISTS download_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document_id INT NOT NULL,
  ip_address VARCHAR(64),
  user_agent VARCHAR(512),
  downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 索引
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_title ON documents(title);
CREATE INDEX idx_download_logs_doc ON download_logs(document_id);
CREATE INDEX idx_download_logs_time ON download_logs(downloaded_at);

-- ==================================================
-- 初始化数据
-- ==================================================

-- 默认管理员账号: admin / 1234
INSERT INTO users (username, password, role) VALUES
('admin', '$2a$10$8z5S7DmOp4H7pYO64nUyb.Euzc0YMMrZHjHn.BN8Exay3JRjQsWSa', 'super_admin');

-- 分类数据
INSERT INTO categories (name, icon, sort_order) VALUES
('合同模板', 'FileTextOutlined', 1),
('财务表单', 'AccountBookOutlined', 2),
('采购表单', 'ShoppingCartOutlined', 3),
('人事行政', 'TeamOutlined', 4),
('质量管理', 'SafetyCertificateOutlined', 5),
('制度文件', 'BookOutlined', 6),
('产品资料', 'AppstoreOutlined', 7),
('培训资料', 'ReadOutlined', 8),
('其他资料', 'FolderOutlined', 9);

-- 测试文档数据（无实际文件，仅演示）
INSERT INTO documents (title, description, category_id, version, file_name, file_path, file_size, file_ext, tags, download_count, is_top) VALUES
('采购合同模板（标准版）', '适用于一般采购业务的标准合同模板，含条款说明', 1, 'v2.3', 'purchase_contract_v2.3.docx', 'uploads/purchase_contract_v2.3.docx', 102400, 'docx', '合同,采购,模板', 128, 1),
('销售合同模板', '标准销售合同，适用于国内贸易', 1, 'v1.5', 'sales_contract_v1.5.docx', 'uploads/sales_contract_v1.5.docx', 98304, 'docx', '合同,销售', 95, 0),
('保密协议模板（NDA）', '员工及合作方保密协议标准格式', 1, 'v1.0', 'nda_template.docx', 'uploads/nda_template.docx', 51200, 'docx', '合同,保密', 67, 0),
('费用报销申请单', '差旅及日常费用报销申请表格', 2, 'v3.1', 'expense_reimbursement.xlsx', 'uploads/expense_reimbursement.xlsx', 35840, 'xlsx', '财务,报销', 312, 1),
('付款申请单', '对外付款申请审批表', 2, 'v2.0', 'payment_request.xlsx', 'uploads/payment_request.xlsx', 28672, 'xlsx', '财务,付款', 256, 1),
('出差申请单', '员工出差申请及费用预算表', 2, 'v1.2', 'business_trip_application.xlsx', 'uploads/business_trip_application.xlsx', 30720, 'xlsx', '财务,出差', 188, 0),
('采购申请单', '物料及服务采购申请表格', 3, 'v2.1', 'purchase_request.xlsx', 'uploads/purchase_request.xlsx', 32768, 'xlsx', '采购,申请', 143, 0),
('供应商评估表', '供应商资质及综合评估评分表', 3, 'v1.0', 'supplier_evaluation.xlsx', 'uploads/supplier_evaluation.xlsx', 45056, 'xlsx', '采购,供应商', 89, 0),
('员工手册（2024版）', '公司员工行为规范及福利制度完整版', 4, 'v2024.1', 'employee_handbook_2024.pdf', 'uploads/employee_handbook_2024.pdf', 2097152, 'pdf', '人事,手册', 421, 1),
('入职申请表', '新员工入职信息填写表', 4, 'v1.0', 'onboarding_form.docx', 'uploads/onboarding_form.docx', 40960, 'docx', '人事,入职', 176, 0),
('离职申请表', '员工离职流程申请表格', 4, 'v1.0', 'resignation_form.docx', 'uploads/resignation_form.docx', 38912, 'docx', '人事,离职', 92, 0),
('质量检验报告模板', '产品质量检验标准报告格式', 5, 'v1.3', 'quality_inspection_report.docx', 'uploads/quality_inspection_report.docx', 61440, 'docx', '质量,检验', 74, 0),
('不合格品处理流程', '不合格品判定及处置标准流程', 5, 'v2.0', 'nonconformance_procedure.pdf', 'uploads/nonconformance_procedure.pdf', 512000, 'pdf', '质量,流程', 58, 0),
('公司规章制度汇编', '公司各项管理制度正式文件', 6, 'v2024.2', 'company_rules_2024.pdf', 'uploads/company_rules_2024.pdf', 1048576, 'pdf', '制度,规章', 389, 1),
('会议管理规定', '公司会议组织及管理规范', 6, 'v1.0', 'meeting_management.docx', 'uploads/meeting_management.docx', 45056, 'docx', '制度,会议', 112, 0),
('产品规格书模板', '产品技术规格说明书标准格式', 7, 'v1.1', 'product_spec_template.docx', 'uploads/product_spec_template.docx', 73728, 'docx', '产品,规格', 67, 0),
('新员工入职培训PPT', '公司文化及岗位培训演示材料', 8, 'v2024.1', 'new_employee_training.pptx', 'uploads/new_employee_training.pptx', 5242880, 'pptx', '培训,入职', 234, 0),
('安全生产培训材料', '年度安全生产法规及操作培训', 8, 'v2024.1', 'safety_training.pdf', 'uploads/safety_training.pdf', 3145728, 'pdf', '培训,安全', 156, 0);
