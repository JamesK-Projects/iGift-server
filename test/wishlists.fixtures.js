function makeWishlistsArray() {
    return [
        {
            id: 1,
            name: 'Bicycle',
            cost: 200,
            checked: true,
            profile_id: 1
        },
        {
            id: 2,
            name: 'Hat',
            cost: 20,
            checked: true,
            profile_id: 3
        },
        {
            id: 3,
            name: 'Book',
            cost: 18,
            checked: true,
            profile_id: 5
        },
        {
            id: 4,
            name: 'Gameboy',
            cost: 100,
            checked: true,
            profile_id: 7
        },
        {
            id: 5,
            name: 'Boots',
            cost: 100,
            checked: true,
            profile_id: 9
        }
    ];
}

function makeMaliciousWishlist(){
    const maliciousWishlist = {
        id: 555,
        name: '<script></script>',
        cost: 300,
        checked: true,
        profile_id: 5
    }

    const expectedWishlist = {
        ...maliciousWishlist,
        name: '&lt;script&gt;&lt;/script&gt;',
        cost: 300,
        checked: true,
        profile_id: 5
    }

    return {
        maliciousWishlist,
        expectedWishlist
    }
}

module.exports = {
    makeWishlistsArray,
    makeMaliciousWishlist
}