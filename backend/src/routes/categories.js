const express = require('express');
const router  = express.Router();
const db      = require('../utils/db');
const auth    = require('../middleware/auth');

// GET /api/categories  (公开)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, COUNT(d.id) AS doc_count
       FROM categories c
       LEFT JOIN documents d ON d.category_id = c.id AND d.status = 'active'
       GROUP BY c.id ORDER BY c.sort_order ASC`
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// POST /api/categories  (管理员)
router.post('/', auth, async (req, res) => {
  try {
    const { name, icon, sort_order } = req.body;
    if (!name) return res.status(400).json({ code: 400, message: '分类名称不能为空' });
    const [result] = await db.query(
      'INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)',
      [name, icon || 'FolderOutlined', sort_order || 0]
    );
    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// PUT /api/categories/:id  (管理员)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, icon, sort_order } = req.body;
    await db.query('UPDATE categories SET name=?, icon=?, sort_order=? WHERE id=?',
      [name, icon, sort_order, req.params.id]);
    res.json({ code: 200, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// DELETE /api/categories/:id  (管理员)
router.delete('/:id', auth, async (req, res) => {
  try {
    const [docs] = await db.query('SELECT COUNT(*) AS cnt FROM documents WHERE category_id=? AND status="active"', [req.params.id]);
    if (docs[0].cnt > 0) return res.status(400).json({ code: 400, message: '该分类下还有文件，无法删除' });
    await db.query('DELETE FROM categories WHERE id=?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// PATCH /api/categories/sort  (管理员) — 批量排序
router.patch('/sort', auth, async (req, res) => {
  try {
    const { orders } = req.body; // [{id, sort_order}]
    for (const item of orders) {
      await db.query('UPDATE categories SET sort_order=? WHERE id=?', [item.sort_order, item.id]);
    }
    res.json({ code: 200, message: '排序更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
