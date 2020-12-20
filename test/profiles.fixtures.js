function makeProfilesArray() {
    return [
        {
            id: 1,
            name: 'Ted',
            user_id: 1
        },
        {
            id: 2,
            name: 'Robin',
            user_id: 1
        },
        {
            id: 3,
            name: 'Barney',
            user_id: 2
        },
        {
            id: 4,
            name: 'Marshall',
            user_id: 2
        },
        {
            id: 5,
            name: 'Lily',
            user_id: 3
        }
    ];
}

function makeMaliciousProfile(){
    const maliciousProfile = {
        id: 555,
        name: '<script></script>',
        user_id: 3
    }

    const expectedProfile = {
        ...maliciousProfile,
        name: '&lt;script&gt;&lt;/script&gt;',
        user_id: 3
    }

    return {
        maliciousProfile,
        expectedProfile
    }
}

module.exports = {
    makeProfilesArray,
    makeMaliciousProfile
}