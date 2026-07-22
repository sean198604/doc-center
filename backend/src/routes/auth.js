const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../utils/db');

// POST /api/auth/login — 只需输入密码即可登录
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ code: 400, message: '请输入密码' });
    }
    // 取第一个管理员账号进行比对
    const [rows] = await db.query('SELECT * FROM users WHERE role IN (\'admin\',\'super_admin\') ORDER BY id LIMIT 1');
    if (!rows.length) {
      return res.status(500).json({ code: 500, message: '系统未配置管理员账号' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ code: 401, message: '密码错误' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
    res.json({ code: 200, message: 'ok', data: { token, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/auth/me
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ code: 200, data: { id: req.user.id, username: req.user.username, role: req.user.role } });
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ code: 404, message: '用户不存在' });
    const match = await bcrypt.compare(oldPassword, rows[0].password);
    if (!match) return res.status(400).json({ code: 400, message: '原密码错误' });
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ code: 200, message: '密码修改成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
