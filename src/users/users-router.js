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
            res.json(users.map(serializeUser))
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
        console.log('req.body all() middleware:')
        console.log(req.body)
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
        // console.log('req.body')
        // console.log(req.body)
        // console.log('req.params')
        // console.log(req.params)

    })
    .patch(jsonParser, (req, res, next) => {
        const { name, username, email, password, budget, id } = req.body
        // console.log('req.body')
        // console.log(req.body)
        // console.log('req.params')
        // console.log(req.params)
        const userToUpdate = { name, username, email, password, budget, id }
        // console.log('userToUpdate')
        // console.log(userToUpdate)
        // const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
        if(userToUpdate == null){
            return res.status(400).json({
                error: {
                    message: `Budget is null`
                }
            })
        }
        
        UsersService.updateUser(
            req.app.get('db'),
            req.body.id,
            //userToUpdate
            userToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch((error) => {console.log(error)})
    })

module.exports = usersRouter