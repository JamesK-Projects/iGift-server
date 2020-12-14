const express = require('express')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonParser = express.json()

usersRouter
    .route('/')
    .get((req, res, next) => {
        UsersService.getAllUsers(
            req.app.get('db')
        )
        .then(users => {
            res.json(users)
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, username, email, password, budget } = req.body
        const newUser = { name, username, email, password, budget }

        for (const [key, value] of Object.entries(newUser)) {
            if (value == null){
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body` }
                })
            }
        }

        UsersService.insertUser(
            req.app.get('db'),
            newUser
        )
        .then(user => {
            res 
                .status(201)
                .location(`/users/${user.id}`)
                .json(user)
        })
        .catch(next)
    })

usersRouter
    .route('/:user_id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        UsersService.getById(knexInstance, req.params.user_id)
            .then(user => {
                if(!user){
                    return res.status(404).json({
                        error: { message: `User doesn't exist` }
                    })
                }
                res.json(user)
            })
            .catch(next)
    })

module.exports = usersRouter