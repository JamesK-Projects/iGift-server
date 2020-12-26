const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeUsersArray, makeMaliciousUser, cleanTables } = require('./users.fixtures')

describe.only('Users Endpoints', () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    // before('clean the table', () => cleanTables(db))

    // afterEach('cleanup', () => cleanTables(db))

    before('clean the table', () => db.raw('TRUNCATE igift_users, igift_profiles, igift_wishlists RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE igift_users, igift_profiles, igift_wishlists RESTART IDENTITY CASCADE'))

    describe('GET /api/users', () => {
        context('Given no users', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/users')
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

            it('GET /api/users responds with 200 and all of the users', () => {
                return supertest(app)
                    .get('/api/users')
                    .expect(200, testUsers)
            })
        })
    })

    describe('GET /api/users/:user_id', () => {
        context('Given no users', () => {
            it('responds with 404', () => {
                const userId = 12345
                return supertest(app)
                    .get(`/api/users/${userId}`)
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
                .get(`/api/users/${userId}`)
                .expect(200, expectedUser)
            })
        })

        context('Given an XSS attack user', () => {
            const testUsers = makeUsersArray();
            const { maliciousUser, expectedUser } = makeMaliciousUser()
                
            beforeEach('insert malicious user', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('igift_users')
                            .insert([maliciousUser])
                    })
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/users/${maliciousUser.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.name).to.eql(expectedUser.name)
                        expect(res.body.username).to.eql(expectedUser.username)
                    })
            })
        })
    })

    describe('POST /api/users', () => {
        it('creates a user, responding in 201 and the new user', () => {
            const newUser = {
                name: 'Test new name',
                username: 'Test new username',
                email: 'Test new email',
                password: 'Test new password',
                budget: 500
            }
            return supertest(app)
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newUser.name)
                    expect(res.body.username).to.eql(newUser.username)
                    expect(res.body.email).to.eql(newUser.email)
                    expect(res.body.password).to.eql(newUser.password)
                    expect(res.body.budget).to.eql(newUser.budget)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
                })
                .then(postRes => {
                    supertest(app)
                        .get(`/api/users/${postRes.body.id}`)
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
                    .post('/api/users')
                    .send(newUser)
                    .expect(400, {
                        error: { message: `Missing ${field} in request body` }
                    })
            })
        })
    })

    describe('PATCH /api/users/:user_id', () => {
        context('Given no users', () => {
            it('responds with 404', () => {
                const userId = 123456
                return supertest(app)
                    .patch(`/api/users/${userId}`)
                    .expect(404, {error: { message: `User doesn't exist` } })
            })
        })

        context('Given there are users in the database', () => {
            const testUsers = makeUsersArray()

            beforeEach('insert users', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
            })

            it('responds with 204 and updates the user', () => {
                const idToUpdate = 2
                const updateUser = {
                    name: 'updated name',
                    username: 'updated username',
                    email: 'updated email',
                    password: 'updated password',
                    budget: 1000
                }
                const expectedUser = {
                    ...testUsers[idToUpdate - 1],
                    ...updateUser
                }
                return supertest(app)
                    .patch(`/api/users/${idToUpdate}`)
                    .send(updateUser)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/users/${idToUpdate}`)
                            .expect(expectedUser)
                    })
            })

            it('responds 400 when no required fields are supplied', () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/users/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain either 'name', 'username', 'email', 'password', or 'budget'`
                        }
                    })
            })

            it('responds with 204 when only updating a subset of fields', () => {
                const idToUpdate = 2
                const updateUser = {
                    name: 'updated user name'
                }
                const expectedUser = {
                    ...testUsers[idToUpdate - 1],
                    ...updateUser
                }

                return supertest(app)
                    .patch(`/api/users/${idToUpdate}`)
                    .send({
                        ...updateUser,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res => {
                        supertest(app)
                        .get(`/api/users/${idToUpdate}`)
                        .expect(expectedUser)
                    })
            })
        })
    })

})