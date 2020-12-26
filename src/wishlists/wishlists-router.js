const express = require('express')
const WishlistsService = require('./wishlists-service')
const xss = require('xss')
const path = require('path')
const { requireAuth } = require('../middleware/basic-auth')

const wishlistsRouter = express.Router()
const jsonParser = express.json()

const serializeWishlist = wishlist => ({
    id: wishlist.id,
    name: xss(wishlist.name),
    cost: wishlist.cost,
    checked: wishlist.checked,
    profile_id: wishlist.profile_id
})

wishlistsRouter
    .route(`/`)
    .get((req, res, next) => {
        WishlistsService.getAllWishlists(
            req.app.get('db')
        )
        .then(wishlists => {
            res.json(wishlists)
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, cost, checked, profile_id } = req.body
        const newWishlist = { name, cost, checked, profile_id }
        console.log('wishlist req.body')
        console.log(newWishlist)

        for (const [key, value] of Object.entries(newWishlist)) {
            if (value == null){
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body` }
                })
            }
        }
        console.log(newWishlist)
        WishlistsService.insertWishlist(
            req.app.get('db'),
            newWishlist
        )
        .then(wishlist => {
            WishlistsService.getAllWishlists(req.app.get('db'))
            .then((wishlists) => {
                return res.status(200).json(wishlists)
            })
            
        })
        .catch(next)
    })

wishlistsRouter
    .route('/:wishlist_id')
    .all((req, res, next) => {
        WishlistsService.getById(
            req.app.get('db'),
            req.params.wishlist_id
        )
        .then(wishlist => {
            if(!wishlist){
                return res.status(404).json({
                    error: { message: `Wishlist doesn't exist` }
                })
            }
            res.wishlist = wishlist
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeWishlist(res.wishlist))
    })

    .delete((req, res, next) => {
        WishlistsService.deleteWishlist(
            req.app.get('db'),
            req.params.wishlist_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

    .patch((req, res, next) => {
        const { name, cost, checked, profile_id, id } = req.body
        const wishlistToUpdate = { name, cost, checked, profile_id, id }

        // const numberOfValues = Object.values(wishlistToUpdate).filter(Boolean).length
        // if(numberOfValues === 0){
        //     return res.status(400).json({
        //         error: {
        //             message: `Request body must contain either 'name', 'cost', 'checked', or 'profile_id' `
        //         }
        //     })
        // }
        if(wishlistToUpdate == null){
            return res.status(400).json({
                error: {
                    message: 'Request is null'
                }
            })
        }
        WishlistsService.updateWishlist(
            req.app.get('db'),
            req.params.wishlist_id,
            wishlistToUpdate
        )
        .then(numRowsAffected => {
            WishlistsService.getById(req.app.get('db'), wishlistToUpdate.id)
            .then((updatedWishlist) => {
                return res.status(200).json(updatedWishlist)
            })
            
        })
        .catch(next)
    })

module.exports = wishlistsRouter