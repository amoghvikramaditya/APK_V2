const request = require('supertest');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const app = require('../backend/server');
const dataService = require('../backend/dataService');
const Database = require('better-sqlite3');

describe('APK Portal API Integration Tests', () => {
    let teacherToken;
    let studentToken;
    let assignmentId;

    before(async () => {
        // Switch to an in-memory database for testing
        const testDb = new Database(':memory:');
        dataService.db = testDb;
        dataService.initTables();
    });

    describe('Authentication Module', () => {
        it('should register a new teacher', async () => {
            const res = await request(app)
                .post('/register')
                .send({
                    name: 'Test Teacher',
                    username: 'teacher1',
                    role: 'teacher',
                    password: 'password123',
                    teacherCode: 'TEACHER123'
                });
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Registration successful');
        });

        it('should login as teacher and return a JWT', async () => {
            const res = await request(app)
                .post('/login')
                .send({
                    username: 'teacher1',
                    password: 'password123'
                });
            expect(res.status).to.equal(200);
            expect(res.body.token).to.be.a('string');
            teacherToken = res.body.token;
        });

        it('should register a new student', async () => {
            const res = await request(app)
                .post('/register')
                .send({
                    name: 'Test Student',
                    username: 'student1',
                    role: 'student',
                    password: 'password123'
                });
            expect(res.status).to.equal(200);
        });

        it('should login as student', async () => {
            const res = await request(app)
                .post('/login')
                .send({
                    username: 'student1',
                    password: 'password123'
                });
            expect(res.status).to.equal(200);
            studentToken = res.body.token;
        });
    });

    describe('Classroom & Assignment Module', () => {
        it('should allow teacher to create a class', async () => {
            const res = await request(app)
                .post('/classes')
                .set('Authorization', teacherToken)
                .send({
                    courseCode: 'CS101',
                    password: 'classpassword'
                });
            expect(res.status).to.equal(200);
            expect(res.body.courseCode).to.equal('CS101');
        });

        it('should allow student to join a class with password', async () => {
            const res = await request(app)
                .post('/classes/join')
                .set('Authorization', studentToken)
                .send({
                    courseCode: 'CS101',
                    password: 'classpassword'
                });
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Joined class successfully');
        });

        it('should fail if student joins with wrong password', async () => {
            const res = await request(app)
                .post('/classes/join')
                .set('Authorization', studentToken)
                .send({
                    courseCode: 'CS101',
                    password: 'wrongpassword'
                });
            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal('Incorrect class password');
        });
    });

    describe('Security & Logic (Regression)', () => {
        it('should prevent student from creating a class', async () => {
            const res = await request(app)
                .post('/classes')
                .set('Authorization', studentToken)
                .send({
                    courseCode: 'HACKED101'
                });
            expect(res.status).to.equal(403);
            expect(res.body.error).to.equal('Only teachers can create classes');
        });

        it('should return 401 if accessing protected route without token', async () => {
            const res = await request(app).get('/classes');
            expect(res.status).to.equal(401);
        });
    });
});
