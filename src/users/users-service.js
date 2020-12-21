const UsersService = {
    getAllUsers(knex){
        return knex.select('*').from(igift_users)
    },
    insertUser(knex, newUser){
        return knex
            .insert(newUser)
            .into('igift_users')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id){
        return knex.from('igift_users').select('*').where('id', id).first()
    },
    deleteUser(knex, id){
        return knex('igift_users')
            .where({ id })
            .delete()
    },
    updateUser(knex, id, newUserFields){
        return knex('igift_users')
            .where({ id })
            .update(newUserFields)
    },
}

module.exports = UsersService;