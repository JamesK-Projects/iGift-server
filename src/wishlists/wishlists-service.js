const WishlistsService = {
    getAllWishlists(knex){
        return knex.select('*').from('igift_wishlists')
    },
    insertWishlist(knex, newWishlist){
        return knex
            .insert(newWishlist)
            .into('igift_wishlists')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id){
        return knex.from('igift_wishlists').select('*').where('id', id).first()
    },
    deleteWishlist(knex, id){
        return knex('igift_wishlists')
            .where({ id })
            .delete()
    },
    updateWishlist(knex, id, newWishlistFields){
        return knex('igift_wishlists')
            .where({ id })
            .update(newWishlistFields)
    },
}

module.exports = WishlistsService;