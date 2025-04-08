const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Session = require('../models/Session');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.createPayment = async (req, res) => {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId).populate('tutor');
    try {
        const paymentSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Session with ${session.tutor.name}` },
                    unit_amount: session.tutor.hourlyRate * session.duration * 100,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/student/dashboard`,
            cancel_url: `${req.protocol}://${req.get('host')}/student/dashboard`,
        });
        session.payment = session.tutor.hourlyRate * session.duration;
        session.status = 'completed';
        await session.save();
        const tutor = await User.findById(session.tutor._id);
        tutor.earnings += session.payment;
        await tutor.save();
        await new Transaction({ user: session.student, amount: session.payment, type: 'payment' }).save();
        res.redirect(paymentSession.url);
    } catch (err) {
        res.status(500).send('Payment error');
    }
};

exports.withdrawEarnings = async (req, res) => {
    const { amount } = req.body;
    const tutor = await User.findById(req.session.user._id);
    if (tutor.earnings < amount) return res.status(400).send('Insufficient earnings');
    tutor.earnings -= amount;
    await tutor.save();
    await new Transaction({ user: tutor._id, amount, type: 'withdrawal', status: 'completed' }).save();
    res.redirect('/tutor/dashboard');
};