const request = require('supertest');
const app = require('../app');

describe('Auth Routes', () => {
    it('should render login page', async () => {
        const res = await request(app).get('/auth/login');
        expect(res.statusCode).toBe(200);
    });
});