const express = require('express');
const router  = express.Router();
const db      = require('../utils/db');
const auth    = require('../middleware/auth');

// GET /api/stats  — 仪表盘统计（管理员）
router.get('/', auth, async (req, res) => {
  try {
    const [[{ total_docs }]]      = await db.query("SELECT COUNT(*) AS total_docs FROM documents WHERE status='active'");
    const [[{ total_downloads }]] = await db.query("SELECT COALESCE(SUM(download_count),0) AS total_downloads FROM documents WHERE status='active'");
    const [[{ monthly_uploads }]] = await db.query(
      "SELECT COUNT(*) AS monthly_uploads FROM documents WHERE status='active' AND MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())"
    );
    const [recent_docs] = await db.query(
      `SELECT d.*, c.name AS category_name FROM documents d LEFT JOIN categories c ON c.id=d.category_id
       WHERE d.status='active' ORDER BY d.created_at DESC LIMIT 5`
    );
    const [top_downloads] = await db.query(
      `SELECT d.*, c.name AS category_name FROM documents d LEFT JOIN categories c ON c.id=d.category_id
       WHERE d.status='active' ORDER BY d.download_count DESC LIMIT 10`
    );
    const [category_stats] = await db.query(
      `SELECT c.name, COUNT(d.id) AS doc_count, COALESCE(SUM(d.download_count),0) AS total_downloads
       FROM categories c LEFT JOIN documents d ON d.category_id=c.id AND d.status='active'
       GROUP BY c.id ORDER BY c.sort_order ASC`
    );
    res.json({ code: 200, data: { total_docs, total_downloads, monthly_uploads, recent_docs, top_downloads, category_stats } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/stats/download-logs  — 近期下载日志（管理员）
router.get('/download-logs', auth, async (req, res) => {
  try {
    const { page = 1, page_size = 20 } = req.query;
    const limit  = Math.min(parseInt(page_size) || 20, 100);
    const offset = (Math.max(parseInt(page) || 1, 1) - 1) * limit;
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM download_logs');
    const [rows] = await db.query(
      `SELECT l.*, d.title AS doc_title FROM download_logs l
       LEFT JOIN documents d ON d.id = l.document_id
       ORDER BY l.downloaded_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({ code: 200, data: { total, page: parseInt(page), page_size: limit, list: rows } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
