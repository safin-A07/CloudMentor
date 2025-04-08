const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');

router.get('/', async (req, res) => {
    const { subject, maxRate } = req.query;
    let query = { role: 'tutor', isBlocked: false };

    if (subject) {
        query.teachingSubjects = { $in: [new RegExp(subject, 'i')] };
    }
    if (maxRate) {
        query.hourlyRate = { $lte: parseInt(maxRate) };
    }

    const tutors = await User.find(query).limit(6); // Increased to 6 tutors
    const notifications = req.session.user ? await Notification.find({ user: req.session.user._id }).sort({ createdAt: -1 }).limit(5) : [];

    res.render('index', { 
        user: req.session.user || null, 
        tutors,
        notifications,
        query: req.query || {}
    });
});

module.exports = router;