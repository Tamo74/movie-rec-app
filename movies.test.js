const request = require('supertest');
const app = require('../app');

describe('Movie Endpoints', () => {
    let adminToken;
    let userToken;
    
    beforeAll(async () => {
        // Login as admin
        const adminRes = await request(app)
            .post('/auth/login')
            .send({ email: 'admin@example.com', password: 'AdminPass123!' });
        adminToken = adminRes.body.token;
        
        // Login as regular user
        const userRes = await request(app)
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'SecurePass123!' });
        userToken = userRes.body.token;
    });
    
    describe('GET /movies', () => {
        it('should return list of movies with pagination', async () => {
            const response = await request(app)
                .get('/movies?page=1&limit=10');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('movies');
            expect(response.body).toHaveProperty('total');
            expect(Array.isArray(response.body.movies)).toBe(true);
        });
    });
    
    describe('GET /movies/:id', () => {
        it('should return movie details for valid ID', async () => {
            const response = await request(app)
                .get('/movies/1');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('title');
            expect(response.body).toHaveProperty('description');
        });
        
        it('should return 404 for invalid movie ID', async () => {
            const response = await request(app)
                .get('/movies/99999');
            
            expect(response.status).toBe(404);
        });
    });
    
    describe('POST /movies (Admin only)', () => {
        it('should allow admin to add a movie', async () => {
            const response = await request(app)
                .post('/movies')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Test Movie',
                    description: 'This is a test movie',
                    releaseDate: '2024-01-01',
                    genres: ['Action', 'Drama']
                });
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
        
        it('should block regular users from adding movies', async () => {
            const response = await request(app)
                .post('/movies')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'Test Movie',
                    description: 'This is a test movie'
                });
            
            expect(response.status).toBe(403);
        });
    });
});
