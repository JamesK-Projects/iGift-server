const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures')

describe('Users Endpoints', () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE igift_users, igift_profiles, igift_wishlists RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE igift_users, igift_profiles, igift_wishlists RESTART IDENTITY CASCADE'))

    describe('GET /users', () => {
        context('Given no users', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/users')
                    .expect(200, [])
            })
        })

        context('Given there are users in the database', () => {
            const testUsers = makeUsersArray();

            beforeEach('insert users', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
            })

            it('GET /users responds with 200 and all of the users', () => {
                return supertest(app)
                    .get('/users')
                    .expect(200, testUsers)
            })
        })
    })

    describe('GET /users/:user_id', () => {
        context('Given no users', () => {
            it('responds with 404', () => {
                const userId = 12345
                return supertest(app)
                    .get(`/users/${userId}`)
                    .expect(404, { error: { message: `User doesn't exist` } })
            })
        })

        context('Given there are users in the database', () => {
            const testUsers = makeUsersArray();

            beforeEach('insert users', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
            })

            it('responds with 200 and the specified user', () => {
            const userId = 2
            const expectedUser = testUsers[userId - 1]
            return supertest(app)
                .get(`/users/${userId}`)
                .expect(200, expectedUser)
            })

        })
    })

    describe('POST /users', () => {
        it('creates a user, responding in 201 and the new user', () => {
            const newUser = {
                name: 'Test new name',
                username: 'Test new username',
                email: 'Test new email',
                password: 'Test new password',
                budget: 500
            }
            return supertest(app)
                .post('/users')
                .send(newUser)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newUser.name)
                    expect(res.body.username).to.eql(newUser.username)
                    expect(res.body.email).to.eql(newUser.email)
                    expect(res.body.password).to.eql(newUser.password)
                    expect(res.body.budget).to.eql(newUser.budget)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/users/${res.body.id}`)
                })
                .then(postRes => {
                    supertest(app)
                        .get(`/users/${postRes.body.id}`)
                        .expect(postRes.body)
                })
        })


        const requiredFields = ['name', 'username', 'email', 'password', 'budget']
        requiredFields.forEach(field => {
            const newUser = {
                name: 'test new name',
                username: 'test new username',
                email: 'test new email',
                password: 'test new password',
                budget: 100
            }
        
            it(`responds with 400 and an error message when the ${field} is missing`, () => {
                delete newUser[field]
                return supertest(app)
                    .post('/users')
                    .send(newUser)
                    .expect(400, {
                        error: { message: `Missing ${field} in request body` }
                    })
            })
        })
    })

})