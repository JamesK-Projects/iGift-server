const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeProfilesArray, makeMaliciousProfile } = require('./profiles.fixtures')
const { makeUsersArray } = require('./users.fixtures')

describe('Profiles Endpoints', () => {
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

    describe.only('Protected endpoints', () => {
        beforeEach('insert profiles', () => {
            helpers.seedProfilesTables()
        })
    })

    describe('GET /api/profiles', () => {
        context('Given no profiles', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/profiles')
                    .expect(200, [])
            })
        })

        context('Given there are profiles in the database', () => {
            const testUsers = makeUsersArray();
            const testProfiles = makeProfilesArray();

            beforeEach('insert profiles', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('igift_profiles')
                            .insert(testProfiles)
                    })
            })

            it('GET /api/profiles responds with 200 and all of the profiles', () => {
                return supertest(app)
                    .get('/api/profiles')
                    .expect(200, testProfiles)
            })
        })
    })

    describe.only('GET /api/profiles/:profile_id', () => {
        context('Given no profiles', () => {
            it('responds with 404', () => {
                const profileId = 12345
                return supertest(app)
                    .get(`/api/profiles/${profileId}`)
                    .expect(404, { error: { message: `Profile doesn't exist` } })
            })
        })

        context('Given there are profiles in the database', () => {
            const testUsers = makeUsersArray();
            const testProfiles = makeProfilesArray();

            beforeEach('insert profiles', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('igift_profiles')
                            .insert(testProfiles)
                    })
                    
            })

            it('responds with 200 and the specified profile', () => {
            const profileId = 2
            const expectedProfile = testProfiles[profileId - 1]
            return supertest(app)
                .get(`/api/profiles/${profileId}`)
                .expect(200, expectedProfile)
            })
        })

        context('Given an XSS attack profile', () => {
            const testUsers = makeUsersArray();
            const { maliciousProfile, expectedProfile } = makeMaliciousProfile()
                
            beforeEach('insert malicious profile', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('igift_profiles')
                            .insert([maliciousProfile])
                    })
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/profiles/${maliciousProfile.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.name).to.eql(expectedProfile.name)
                        expect(res.body.user_id).to.eql(expectedProfile.user_id)
                    })
            })
        })
    })

    describe('POST /api/profiles', () => {
        // context('Given there are profiles in the database', () => {
        //     const testUsers = makeUsersArray();
        //     const testProfiles = makeProfilesArray();

        //     beforeEach('insert profiles', () => {
        //         return db
        //             .into('igift_users')
        //             .insert(testUsers)
        //             .then(() => {
        //                 return db
        //                     .into('igift_profiles')
        //                     .insert(testProfiles)
        //             })
        //     })

            it('creates a profile, responding in 201 and the new profile', () => {
                const newProfile = {
                    name: 'Test new name',
                    user_id: 2
                }
                
                return supertest(app)
                    
                    .post('/api/profiles/')
                    .send(newProfile)
                    .expect(201)
                    .expect(res => {
                        console.log('Hello')
                        expect(res.body.name).to.eql(newProfile.name)
                        expect(res.body.user_id).to.eql(newProfile.user_id)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/profiles/${res.body.id}`)
                    })
                    .then(postRes => {
                        console.log(postRes.body)
                        supertest(app)
                            .get(`/api/profiles/${postRes.body.id}`)
                            .expect(postRes.body)
                    })
            })
        // })


        const requiredFields = ['name', 'user_id']
        requiredFields.forEach(field => {
            const newProfile = {
                name: 'test new name',
                user_id: 2
            }
        
            it(`responds with 400 and an error message when the ${field} is missing`, () => {
                delete newProfile[field]
                return supertest(app)
                    .post('/api/profiles')
                    .send(newProfile)
                    .expect(400, {
                        error: { message: `Missing ${field} in request body` }
                    })
            })
        })
    })

    describe('DELETE /api/profiles/:profile_id', () => {
        context('Given there are profiles in the database', () => {
            const testUsers = makeUsersArray();
            const testProfiles = makeProfilesArray()

            beforeEach('insert profiles', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('igift_profiles')
                            .insert(testProfiles)
                    })
            })

            it('responds with 204 and removes the profile', () => {
                const idToRemove = 2
                const expectedProfiles = testProfiles.filter(profile => profile.id !== idToRemove)
                return supertest(app)
                    .delete(`/profiles/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/profiles`)
                            .expect(expectedProfiles)
                    })
            })
        })
    })

    describe('PATCH /api/profiles/:profile_id', () => {
        context('Given no profiles', () => {
            it('responds with 404', () => {
                const profileId = 123456
                return supertest(app)
                    .patch(`/api/profiles/${profileId}`)
                    .expect(404, {error: { message: `Profile doesn't exist` } })
            })
        })

        context('Given there are profiles in the database', () => {
            const testUsers = makeUsersArray();
            const testProfiles = makeProfilesArray()

            beforeEach('insert profiles', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('igift_profiles')
                            .insert(testProfiles)
                    })
            })

            it('responds with 204 and updates the profile', () => {
                const idToUpdate = 2
                const updateProfile = {
                    name: 'updated name',
                    user_id: 2
                }
                const expectedProfile = {
                    ...testProfiles[idToUpdate - 1],
                    ...updateProfile
                }
                return supertest(app)
                    .patch(`/api/profiles/${idToUpdate}`)
                    .send(updateProfile)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/profiles/${idToUpdate}`)
                            .expect(expectedProfile)
                    })
            })

            it('responds 400 when no required fields are supplied', () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/profiles/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain either 'name' or 'user_id'`
                        }
                    })
            })

            it('responds with 204 when only updating a subset of fields', () => {
                const idToUpdate = 2
                const updateProfile = {
                    name: 'updated profile name'
                }
                const expectedProfile = {
                    ...testProfiles[idToUpdate - 1],
                    ...updateProfile
                }

                return supertest(app)
                    .patch(`/api/profiles/${idToUpdate}`)
                    .send({
                        ...updateProfile,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res => {
                        supertest(app)
                        .get(`/api/profiles/${idToUpdate}`)
                        .expect(expectedProfile)
                    })
            })
        })
    })

})