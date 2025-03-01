exports.isAuthenticated = (req, res, next) => {
    if (!req.session.user) return res.redirect('/auth/login');
    next();
};

exports.checkRole = (role) => (req, res, next) => {
    if (req.session.user.role !== role) return res.status(403).send('Access denied');
    next();
};