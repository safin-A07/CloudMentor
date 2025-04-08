const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'tutor', 'admin'], default: 'student' },
    phone: { type: String, required: true },
    class: String,
    school: String,
    favoriteSubjects: [String],
    university: String,
    teachingSubjects: [String],
    hourlyRate: Number,
    bio: String,
    profilePicture: { type: String, default: '' }, // Add profile picture field
    isBlocked: { type: Boolean, default: false },
    earnings: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);