const User = require('../models/User');
const Review = require('../models/Review');

exports.updateProfile = async (req, res) => {
    const { university, teachingSubjects, hourlyRate, bio } = req.body;
    await User.findByIdAndUpdate(req.session.user._id, {
        university, teachingSubjects: teachingSubjects.split(','), hourlyRate, bio,
    });
    req.session.user = await User.findById(req.session.user._id);
    res.redirect('/tutor/dashboard');
};

exports.deleteProfile = async (req, res) => {
    await User.findByIdAndDelete(req.session.user._id);
    req.session.destroy(() => res.redirect('/'));
};

exports.addReview = async (req, res) => {
    const { tutorId, rating, comment } = req.body;
    await new Review({ student: req.session.user._id, tutor: tutorId, rating, comment }).save();
    res.redirect('/student/dashboard');
};