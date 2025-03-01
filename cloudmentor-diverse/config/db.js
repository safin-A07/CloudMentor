const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        mongoose.connection.db.collection('users').createIndex({ email: 1, role: 1 });
        mongoose.connection.db.collection('sessions').createIndex({ date: 1, tutor: 1 });
        mongoose.connection.db.collection('notifications').createIndex({ user: 1, createdAt: -1 });
    })
    .catch(err => console.error(err));