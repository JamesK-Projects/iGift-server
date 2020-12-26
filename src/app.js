require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const usersRouter = require('./users/users-router')
const profilesRouter = require('./profiles/profiles-router')
const wishlistsRouter = require('./wishlists/wishlists-router')
const jsonParser = express.json()

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(
    cors(
        {
        origin: "http://localhost:3000"
    }
    )
);

app.use(jsonParser, (req, res, next) => {
    next()
})

app.use('/api/users', usersRouter)
app.use('/api/profiles', profilesRouter)
app.use('/api/wishlists', wishlistsRouter)



// app.use(function validateBearerToken(req, res, next){
//     const apiToken = process.env.API_TOKEN
//     const authToken = req.get('Authorization')
//     console.log(apiToken)
//     console.log(authToken)

//     if(!authToken || authToken.split(' ')[1] !== apiToken){
//         console.log(authToken)
//         console.log(apiToken)
//         return res.status(401).json({ error: 'Unauthorized request' })
//     }
//     next()
// })

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

// (req, res, next => {
//     console.log(req)
// })

app.use(function errorHandler(error, req, res, next) {
    let response
    console.error(error)
    response = { message: error.message, error }
    
    res.status(500).json(response)
})

module.exports = app