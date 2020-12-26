function makeUsersArray() {
    return [
        {
            id: 1,
            name: 'James test',
            username: 'jamesk10',
            email: 'jtkernan92@gmail.com',
            password: 'password123',
            budget: 500
        },
        {
            id: 2,
            name: 'Amy test',
            username: 'amyh505',
            email: 'amy505@gmail.com',
            password: 'winnifred101',
            budget: 250
        },
        {
            id: 3,
            name: 'Winston test',
            username: 'winston123',
            email: 'winston123@gmail.com',
            password: 'doodledog99',
            budget: 100
        }
    ];
}

function makeMaliciousUser(){
    const maliciousUser = {
        id: 555,
        name: '<script></script>',
        username: `<img></img>`,
        email: 'covid19@hotmail.com',
        password: 'mwahaha',
        budget: 0
    }

    const expectedUser = {
        ...maliciousUser,
        name: '&lt;script&gt;&lt;/script&gt;',
        username: `<img></img>`
    }
    return {
        maliciousUser,
        expectedUser
    }
}

function cleanTables(db) {
    return db.transaction(trx =>
      trx.raw(
        `TRUNCATE
          igift_users,
          igift_profiles,
          igift_wishlists
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE igift_users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE igift_profiles_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE igift_wishlists_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('igift_users_id_seq', 0)`),
          trx.raw(`SELECT setval('igift_profiles_id_seq', 0)`),
          trx.raw(`SELECT setval('igift_wishlists_id_seq', 0)`),
        ])
      )
    )
  }

module.exports = {
    makeUsersArray,
    makeMaliciousUser,
    cleanTables
}