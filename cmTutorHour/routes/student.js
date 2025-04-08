const express = require('express');
const router = express.Router();
const { isAuthenticated, checkRole } = require('../middleware/auth');
const Session = require('../models/Session');
const User = require('../models/User');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const paymentController = require('../controllers/paymentController');
const tutorController = require('../controllers/tutorController');

router.use(isAuthenticated);
router.use(checkRole('student'));

router.get('/dashboard', async (req, res) => {
    const sessions = await Session.find({ student: req.session.user._id }).populate('tutor');
    const tutors = await User.find({ role: 'tutor', isBlocked: false });
    const reviews = await Review.find({ student: req.session.user._id }).populate('tutor');
    const notifications = await Notification.find({ user: req.session.user._id }).sort({ createdAt: -1 }).limit(5);
    res.render('student/dashboard', { user: req.session.user, sessions, tutors, reviews, notifications });
});

router.post('/book-session', async (req, res) => {
    const { tutorId, date, duration } = req.body;
    const session = new Session({ student: req.session.user._id, tutor: tutorId, date, duration });
    await session.save();

    // Send notification to tutor
    await new Notification({
        user: tutorId,
        message: `New session booked by ${req.session.user.name} on ${new Date(date).toLocaleDateString()}`,
        type: 'info',
    }).save();

    // Send notification to student
    await new Notification({
        user: req.session.user._id,
        message: `Session booked with tutor on ${new Date(date).toLocaleDateString()}`,
        type: 'success',
    }).save();

    res.redirect('/student/dashboard');
});

router.post('/pay', paymentController.createPayment);
router.post('/review', tutorController.addReview);
router.get('/tutor/:id', async (req, res) => {
    const tutor = await User.findById(req.params.id);
    const reviews = await Review.find({ tutor: req.params.id }).populate('student');
    const notifications = await Notification.find({ user: req.session.user._id }).sort({ createdAt: -1 }).limit(5);
    res.render('student/tutor-profile', { tutor, reviews, user: req.session.user, notifications });
});

module.exports = router;