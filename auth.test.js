const request = require('supertest');
const app = require('../app');
const db = require('../db');

describe('Authentication Endpoints', () => {
    beforeAll(async () => {
        await db.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    });
    
    afterAll(async () => {
        await db.end();
    });
    
    describe('POST /auth/register', () => {
        it('should create a new user with valid data', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'SecurePass123!',
                    username: 'testuser'
                });
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('test@example.com');
            expect(response.body.user).not.toHaveProperty('password');
        });
        
        it('should reject duplicate email', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'SecurePass123!',
                    username: 'anotheruser'
                });
            
            expect(response.status).toBe(409);
            expect(response.body.error).toContain('already exists');
        });
        
        it('should reject invalid email format', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'SecurePass123!',
                    username: 'testuser2'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('valid email');
        });
        
        it('should reject weak password', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: 'weak@example.com',
                    password: '123',
                    username: 'weakuser'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('password');
        });
    });
    
    describe('POST /auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'SecurePass123!'
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
        });
        
        it('should reject invalid password', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });
            
            expect(response.status).toBe(401);
            expect(response.body.error).toContain('Invalid');
        });
        
        it('should reject non-existent user', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'anypassword'
                });
            
            expect(response.status).toBe(401);
        });
    });
});
