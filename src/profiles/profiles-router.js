const express = require('express')
const ProfilesService = require('./profiles-service')
const xss = require('xss')
const path = require('path')

const profilesRouter = express.Router()
const jsonParser = express.json()

const serializeProfile = profile => ({
    id: profile.id,
    name: xss(profile.name),
    user_id: profile.user_id
})

profilesRouter
    .route('/')
    .get((req, res, next) => {
        ProfilesService.getAllProfiles(
            req.app.get('db')
        )
        .then(profiles => {
            res.json(profiles)
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, user_id } = req.body
        const newProfile = { name, user_id }

        for (const [key, value] of Object.entries(newProfile)) {
            if (value == null){
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body` }
                })
            }
        }

        ProfilesService.insertProfile(
            req.app.get('db'),
            newProfile
        )
        .then(profile => {
            res 
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${profile.id}`))
                .json(serializeProfile(profile))
        })
        .catch(next)
    })

profilesRouter
    .route('/:profile_id')
    .all((req, res, next) => {
        ProfilesService.getById(
            req.app.get('db'),
            req.params.profile_id
        )
        .then(profile => {
            if(!profile){
                return res.status(404).json({
                    error: { message: `Profile doesn't exist` }
                })
            }
            res.profile = profile
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeProfile(res.profile))
    })
    .patch(jsonParser, (req, res, next) => {
        const { name, user_id } = req.body
        const profileToUpdate = { name, user_id }

        const numberOfValues = Object.values(profileToUpdate).filter(Boolean).length
        if(numberOfValues === 0){
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'name' or 'user_id'`
                }
            })
        }
        ProfilesService.updateProfile(
            req.app.get('db'),
            req.params.profile_id,
            profileToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = profilesRouter