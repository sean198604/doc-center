const express  = require('express');
const router   = express.Router();
const path     = require('path');
const fs       = require('fs');
const db       = require('../utils/db');
const auth     = require('../middleware/auth');
const upload   = require('../middleware/upload');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const TRASH_DIR  = path.join(UPLOAD_DIR, 'trash');

// ────────────────────────────────────────────────
//  公开接口
// ────────────────────────────────────────────────

// GET /api/documents  — 列表查询（支持搜索+分页）
router.get('/', async (req, res) => {
  try {
    const { q, category_id, file_type, page = 1, page_size = 20, sort = 'updated_at', order = 'desc' } = req.query;
    let where = ["d.status = 'active'"];
    let params = [];

    if (q) {
      where.push('(d.title LIKE ? OR d.description LIKE ? OR d.tags LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (category_id) { where.push('d.category_id = ?'); params.push(category_id); }
    if (file_type)   { where.push('d.file_ext = ?');    params.push(file_type.toLowerCase()); }

    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const allowed  = ['updated_at','created_at','download_count','title'];
    const sortCol  = allowed.includes(sort) ? sort : 'updated_at';
    const orderDir = order === 'asc' ? 'ASC' : 'DESC';

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM documents d ${whereStr}`, params);

    const limit  = Math.min(parseInt(page_size) || 20, 100);
    const offset = (Math.max(parseInt(page) || 1, 1) - 1) * limit;

    const [rows] = await db.query(
      `SELECT d.*, c.name AS category_name
       FROM documents d LEFT JOIN categories c ON c.id = d.category_id
       ${whereStr}
       ORDER BY d.is_top DESC, d.${sortCol} ${orderDir}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ code: 200, data: { total, page: parseInt(page), page_size: limit, list: rows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/documents/top  — 热门下载 TOP10
router.get('/top', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, c.name AS category_name FROM documents d
       LEFT JOIN categories c ON c.id = d.category_id
       WHERE d.status = 'active' ORDER BY d.download_count DESC LIMIT 10`
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/documents/recent  — 最新发布
router.get('/recent', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, c.name AS category_name FROM documents d
       LEFT JOIN categories c ON c.id = d.category_id
       WHERE d.status = 'active' ORDER BY d.created_at DESC LIMIT 10`
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/documents/trash  — 回收站 (管理员)
router.get('/trash', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, c.name AS category_name FROM documents d
       LEFT JOIN categories c ON c.id = d.category_id
       WHERE d.status = 'trash' ORDER BY d.updated_at DESC`
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/documents/:id  — 详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, c.name AS category_name FROM documents d
       LEFT JOIN categories c ON c.id = d.category_id
       WHERE d.id = ? AND d.status = 'active'`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ code: 404, message: '文档不存在' });
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/documents/:id/download  — 下载文件
router.get('/:id/download', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM documents WHERE id = ? AND status = 'active'`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ code: 404, message: '文档不存在' });
    const doc      = rows[0];
    const filePath = path.join(__dirname, '../../', doc.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ code: 404, message: '文件不存在，请联系管理员' });
    }

    // 记录下载日志 + 累加次数（异步）
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';
    db.query('UPDATE documents SET download_count = download_count + 1 WHERE id = ?', [doc.id]).catch(console.error);
    db.query('INSERT INTO download_logs (document_id, ip_address, user_agent) VALUES (?, ?, ?)',
      [doc.id, ip, ua]).catch(console.error);

    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(doc.file_name)}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/documents/:id/preview  — PDF预览
router.get('/:id/preview', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM documents WHERE id = ? AND status = 'active'`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ code: 404, message: '文档不存在' });
    const doc      = rows[0];
    const filePath = path.join(__dirname, '../../', doc.file_path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ code: 404, message: '文件不存在' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(doc.file_name)}`);
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/documents/:id/logs  — 下载日志 (管理员)
router.get('/:id/logs', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM download_logs WHERE document_id = ? ORDER BY downloaded_at DESC LIMIT 100`,
      [req.params.id]
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// ────────────────────────────────────────────────
//  管理员接口
// ────────────────────────────────────────────────

// POST /api/documents  — 上传文件
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ code: 400, message: '请选择文件' });
    const { title, description, category_id, version, tags } = req.body;
    if (!title || !category_id) {
      return res.status(400).json({ code: 400, message: '标题和分类不能为空' });
    }
    const ext       = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const filePath  = `uploads/${req.file.filename}`;
    const fileSize  = req.file.size;
    const [result]  = await db.query(
      `INSERT INTO documents (title, description, category_id, version, file_name, file_path, file_size, file_ext, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || '', category_id, version || 'v1.0', req.file.originalname, filePath, fileSize, ext, tags || '']
    );
    res.json({ code: 200, message: '上传成功', data: { id: result.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: err.message || '服务器错误' });
  }
});

// PUT /api/documents/:id  — 编辑文档信息
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, category_id, version, tags, is_top } = req.body;
    await db.query(
      `UPDATE documents SET title=?, description=?, category_id=?, version=?, tags=?, is_top=? WHERE id=?`,
      [title, description, category_id, version, tags, is_top ? 1 : 0, req.params.id]
    );
    res.json({ code: 200, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// PATCH /api/documents/:id/top  — 切换置顶
router.patch('/:id/top', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT is_top FROM documents WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ code: 404, message: '文档不存在' });
    const newVal = rows[0].is_top ? 0 : 1;
    await db.query('UPDATE documents SET is_top=? WHERE id=?', [newVal, req.params.id]);
    res.json({ code: 200, message: newVal ? '已置顶' : '已取消置顶', data: { is_top: newVal } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// DELETE /api/documents/:id  — 移入回收站
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query("UPDATE documents SET status='trash' WHERE id=?", [req.params.id]);
    res.json({ code: 200, message: '已移入回收站' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// POST /api/documents/:id/restore  — 从回收站恢复
router.post('/:id/restore', auth, async (req, res) => {
  try {
    await db.query("UPDATE documents SET status='active' WHERE id=?", [req.params.id]);
    res.json({ code: 200, message: '恢复成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// DELETE /api/documents/:id/permanent  — 永久删除
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM documents WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ code: 404, message: '文档不存在' });
    const doc = rows[0];
    const filePath = path.join(__dirname, '../../', doc.file_path);
    if (fs.existsSync(filePath)) {
      const dest = path.join(TRASH_DIR, path.basename(filePath));
      fs.renameSync(filePath, dest);
    }
    await db.query('DELETE FROM documents WHERE id=?', [req.params.id]);
    res.json({ code: 200, message: '永久删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
