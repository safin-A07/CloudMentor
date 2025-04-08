const express = require('express');
const router = express.Router();
const { isAuthenticated, checkRole } = require('../middleware/auth');
const User = require('../models/User');
const Session = require('../models/Session');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcrypt');

router.use(isAuthenticated);
router.use(checkRole('admin'));

router.get('/dashboard', async (req, res) => {
    const users = await User.find();
    const sessions = await Session.find().populate('student tutor');
    const transactions = await Transaction.find().populate('user');
    res.render('admin/dashboard', { user: req.session.user, users, sessions, transactions });
});

router.post('/block-user/:id', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: true });
    res.redirect('/admin/dashboard');
});

router.post('/reset-password/:id', async (req, res) => {
    const newPassword = await bcrypt.hash('newpassword123', 10);
    await User.findByIdAndUpdate(req.params.id, { password: newPassword });
    res.redirect('/admin/dashboard');
});

module.exports = router;