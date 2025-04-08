const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.register = async (req, res) => {
    const { name, email, password, role, phone, class: className, school, favoriteSubjects, university, teachingSubjects, hourlyRate, bio } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name, email, password: hashedPassword, role, phone,
            ...(role === 'student' && { class: className, school, favoriteSubjects: favoriteSubjects?.split(',') }),
            ...(role === 'tutor' && { university, teachingSubjects: teachingSubjects?.split(','), hourlyRate, bio }),
        });
        await user.save();
        res.redirect('/auth/login');
    } catch (err) {
        res.status(400).send('Error registering user');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password)) || user.isBlocked) {
            return res.status(401).send('Invalid credentials or account blocked');
        }
        req.session.user = user;
        const redirectTo = user.role === 'student' ? '/student/dashboard' :
                          user.role === 'tutor' ? '/tutor/dashboard' : '/admin/dashboard';
        res.redirect(redirectTo);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => res.redirect('/'));
};