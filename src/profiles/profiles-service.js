const ProfilesService = {
    getAllProfiles(knex){
        return knex.select('*').from('igift_profiles')
    },
    insertProfile(knex, newProfile){
        return knex
            .insert(newProfile)
            .into('igift_profiles')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id){
        return knex.from('igift_profiles').select('*').where('id', id).first()
    },
    deleteProfile(knex, id){
        return knex('igift_profiles')
            .where({ id })
            .delete()
    },
    updateProfile(knex, id, newProfileFields){
        return knex('igift_profiles')
            .where({ id })
            .update(newProfileFields)
    },
}

module.exports = ProfilesService;