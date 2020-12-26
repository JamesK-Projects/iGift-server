const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeWishlistsArray, makeMaliciousWishlist } = require('./wishlists.fixtures')
const { makeProfilesArray } = require('./profiles.fixtures')
const { makeUsersArray } = require('./users.fixtures')

describe('Wishlists Endpoints', () => {
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

    describe('GET /api/wishlists', () => {
        context('Given no wishlists', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/wishlists')
                    .expect(200, [])
            })
        })

        context('Given there are wishlists in the database', () => {
            const testProfiles = makeProfilesArray();
            const testWishlists = makeWishlistsArray();
            const testUsers = makeUsersArray();

            beforeEach('insert wishlists', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('igift_profiles')
                            .insert(testProfiles)
                            .then(() => {
                                return db
                                    .into('igift_wishlists')
                                    .insert(testWishlists)
                            })
                    })
                    
            })

            it('GET /api/wishlists responds with 200 and all of the wishlists', () => {
                return supertest(app)
                    .get('/api/wishlists')
                    .expect(200, testWishlists)
            })
        })
    })

    describe('GET /api/wishlists/:wishlist_id', () => {
        context('Given no wishlists', () => {
            it('responds with 404', () => {
                const wishlistId = 12345
                return supertest(app)
                    .get(`/api/wishlists/${wishlistId}`)
                    .expect(404, { error: { message: `Wishlist doesn't exist` } })
            })
        })

        context('Given there are wishlists in the database', () => {
            const testProfiles = makeProfilesArray();
            const testWishlists = makeWishlistsArray();
            const testUsers = makeUsersArray();

            beforeEach('insert wishlists', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('igift_profiles')
                            .insert(testProfiles)
                            .then(() => {
                                return db
                                    .into('igift_wishlists')
                                    .insert(testWishlists)
                            })
                    })
                    
            })

            it('responds with 200 and the specified wishlist', () => {
            const wishlistId = 2
            const expectedWishlist = testWishlists[wishlistId - 1]
            return supertest(app)
                .get(`/api/wishlists/${wishlistId}`)
                .expect(200, expectedWishlist)
            })
        })

        context('Given an XSS attack wishlist', () => {
            const testProfiles = makeProfilesArray();
            const testUsers = makeUsersArray();
            const { maliciousWishlist, expectedWishlist } = makeMaliciousWishlist()
                
            beforeEach('insert malicious wishlist', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('igift_profiles')
                            .insert(testProfiles)
                            .then(() => {
                                return db
                                    .into('igift_wishlists')
                                    .insert([maliciousWishlist])
                            })
                    })
                    
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/wishlists/${maliciousWishlist.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.name).to.eql(expectedWishlist.name)
                        expect(res.body.cost).to.eql(expectedWishlist.cost)
                        expect(res.body.checked).to.eql(expectedWishlist.checked)
                        expect(res.body.profile_id).to.eql(expectedWishlist.profile_id)
                    })
            })
        })
    })

    describe('POST /api/wishlists', () => {
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

            it('creates a wishlist, responding in 201 and the new wishlist', () => {
                const newWishlist = {
                    name: 'Test new item name',
                    cost: 200,
                    checked: true,
                    profile_id: 3
                }
                
                return supertest(app)
                    
                    .post('/api/wishlists/')
                    .send(newWishlist)
                    .expect(201)
                    .expect(res => {
                        //console.log('Hello')
                        expect(res.body.name).to.eql(newWishlist.name)
                        expect(res.body.cost).to.eql(newWishlist.cost)
                        expect(res.body.checked).to.eql(newWishlist.checked)
                        expect(res.body.profile_id).to.eql(newWishlist.profile_id)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/wishlists/${res.body.id}`)
                    })
                    .then(postRes => {
                        //console.log(postRes.body)
                        supertest(app)
                            .get(`/api/wishlists/${postRes.body.id}`)
                            .expect(postRes.body)
                    })
            })
        // })


        const requiredFields = ['name', 'cost', 'checked', 'profile_id']
        requiredFields.forEach(field => {
            const newWishlist = {
                name: 'test new item name',
                cost: 200,
                checked: true,
                profile_id: 5
            }
        
            it(`responds with 400 and an error message when the ${field} is missing`, () => {
                delete newWishlist[field]
                return supertest(app)
                    .post('/api/wishlists')
                    .send(newWishlist)
                    .expect(400, {
                        error: { message: `Missing ${field} in request body` }
                    })
            })
        })
    })

    describe('DELETE /api/wishlists/:wishlist_id', () => {
        context('Given there are wishlists in the database', () => {
            const testProfiles = makeProfilesArray();
            const testWishlists = makeWishlistsArray();
            const testUsers = makeUsersArray();

            beforeEach('insert wishlists', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('igift_profiles')
                            .insert(testProfiles)
                            .then(() => {
                                return db
                                    .into('igift_wishlists')
                                    .insert(testWishlists)
                            })
                    })
                    
            })

            it('responds with 204 and removes the wishlist', () => {
                const idToRemove = 2
                const expectedWishlists = testWishlists.filter(wishlist => wishlist.id !== idToRemove)
                return supertest(app)
                    .delete(`/wishlists/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/wishlists`)
                            .expect(expectedWishlists)
                    })
            })
        })
    })

    describe('PATCH /api/wishlists/:wishlist_id', () => {
        context('Given no wishlists', () => {
            it('responds with 404', () => {
                const wishlistId = 123456
                return supertest(app)
                    .patch(`/api/wishlists/${wishlistId}`)
                    .expect(404, {error: { message: `Wishlist doesn't exist` } })
            })
        })

        context('Given there are wishlists in the database', () => {
            const testProfiles = makeProfilesArray();
            const testWishlists = makeWishlistsArray();
            const testUsers = makeUsersArray();

            beforeEach('insert wishlists', () => {
                return db
                    .into('igift_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('igift_profiles')
                            .insert(testProfiles)
                            .then(() => {
                                return db
                                    .into('igift_wishlists')
                                    .insert(testWishlists)
                            })
                    })
                    
            })

            it('responds with 204 and updates the wishlist', () => {
                const idToUpdate = 2
                const updateWishlist = {
                    name: 'updated name',
                    cost: 200,
                    checked: true,
                    profile_id: 5
                }
                const expectedWishlist = {
                    ...testWishlists[idToUpdate - 1],
                    ...updateWishlist
                }
                return supertest(app)
                    .patch(`/api/wishlists/${idToUpdate}`)
                    .send(updateWishlist)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/wishlists/${idToUpdate}`)
                            .expect(expectedWishlist)
                    })
            })

            it('responds 400 when no required fields are supplied', () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/wishlists/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain either 'name', 'cost', 'checked', or 'profile_id'`
                        }
                    })
            })

            it('responds with 204 when only updating a subset of fields', () => {
                const idToUpdate = 2
                const updateWishlist = {
                    name: 'updated wishlist name'
                }
                const expectedWishlist = {
                    ...testWishlists[idToUpdate - 1],
                    ...updateWishlist
                }

                return supertest(app)
                    .patch(`/api/wishlists/${idToUpdate}`)
                    .send({
                        ...updateWishlist,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res => {
                        supertest(app)
                        .get(`/api/wishlists/${idToUpdate}`)
                        .expect(expectedWishlist)
                    })
            })
        })
    })

})