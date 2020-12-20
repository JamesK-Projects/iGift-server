const express = require('express')
const UsersService = require('./users-service')
const xss = require('xss')
const path = require('path')

const usersRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
    id: user.id,
    name: xss(user.name),
    username: xss(user.username),
    email: xss(user.email),
    password: xss(user.password),
    budget: user.budget
})

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
                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                .json(user)
        })
        .catch(next)
    })

usersRouter
    .route('/:user_id')
    .all((req, res, next) => {
        UsersService.getById(
            req.app.get('db'),
            req.params.user_id
        )
        .then(user => {
            if(!user){
                return res.status(404).json({
                    error: { message: `User doesn't exist` }
                })
            }
            res.user = user
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeUser(res.user))
    })
    .patch(jsonParser, (req, res, next) => {
        const { name, username, email, password, budget } = req.body
        const userToUpdate = { name, username, email, password, budget }

        const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
        if(numberOfValues === 0){
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'name', 'username', 'email', 'password', or 'budget'`
                }
            })
        }
        UsersService.updateUser(
            req.app.get('db'),
            req.params.user_id,
            userToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = usersRouter