const express = require('express');
const router = express.Router();
const { isAuthenticated, checkRole } = require('../middleware/auth');
const Session = require('../models/Session');
const Transaction = require('../models/Transaction'); // Add this line
const paymentController = require('../controllers/paymentController');
const tutorController = require('../controllers/tutorController');

router.use(isAuthenticated);
router.use(checkRole('tutor'));

router.get('/dashboard', async (req, res) => {
    const sessions = await Session.find({ tutor: req.session.user._id }).populate('student');
    const transactions = await Transaction.find({ user: req.session.user._id });
    res.render('tutor/dashboard', { user: req.session.user, sessions, transactions });
});

router.get('/edit-profile', (req, res) => res.render('tutor/edit-profile', { user: req.session.user }));
router.post('/update-profile', tutorController.updateProfile);
router.post('/delete-profile', tutorController.deleteProfile);
router.post('/withdraw', paymentController.withdrawEarnings);

module.exports = router;