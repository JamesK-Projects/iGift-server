# iGift

Link to live app: https://igift-app.vercel.app/

## Summary of App

iGift is designed to help consumers track their holiday gift-spending. 

After creating an account and logging in, the user will first set their budget. They will have the option to go back and adjust this budget whenever they want.

Then, the user can create a profile for each person on their shopping list. The list of the user's profiles will be shown on the main budget page, and clicking on a profile will take the user to the profile's page. 

Screenshot of the main budget page:

![alt text](./src/images/budget-page-screenshot-border.png "Budget Page Screenshot")

Each profile's page includes a 'Wishlist' section where the user can add or remove gift items and their prices, and a 'Gifts Purchased' section that lists each of the gifts that have been purchased along with their costs. When a user purchases an item on their wishlist, they can check the box next to that item and it will be added to the 'Gifts Purchased' section below. The total spent on each person will be shown at the bottom of their profile.

Screenshot of a profile page:

![alt text](./src/images/profile-page-screenshot-border.png "Profile Page Screenshot")

As more gifts are purchased, the cost of each gift will be deducted from the user's budget. At the bottom of the main budget page the user can see how much they have spent, as well as how much of their budget remains. 

## Technology Used

### Frontend

- HTML
- CSS
- Javascript
- React
- Hosted on Vercel

### Backend

- Node.js
- PostgreSql
- Hosted on Heroku

## API Documentation

### Endpoints

#### /api/users

The /users endpoint houses the login information of each user who makes an account, as well as the user's budget that they set.

example user:

{

    id: 1,

    name: 'John Smith',

    username: 'JSmith10',

    email: 'JSmith@exapmle.com',

    password: 'Smith123',

    budget: 500

},

GET /users - gets the list of all users

POST /users - adds a new user to the list of users

GET /users/:userId - gets the specified user

PATCH /users/:userId - updates the specified user with new data

#### /api/profiles

The /profiles endpoint contains the data for all of the profiles that are created by users. Each profile has a user_id which references the id of the user that created it.

example profile:

{

    id: 2,

    name: 'Jimmy',

    user_id: 1

}

GET /profiles - gets the list of all profiles

POST /profiles - adds a new profile to the list of profiles

GET /profiles/:profileId - gets the specified profile

DELETE /profiles/:profileId - deletes the specified profile from the list

PATCH /profiles/:profileId - updates the specified profile with new data

#### /api/wishlists

The /wishlists endpoint contains the data for each item that is added under a specific profile. Each wishlist had a profile_id which references the id of its profile.

example wishlist:

{

    id: 3,

    name: 'Bicycle',

    cost: 200,

    checked: true,

    profile_id: 2

}

GET /wishlists - gets the list of all wishlists

POST /wishlists - adds a new wishlist to the list of wishlists

GET /wishlists/:wishlistId - gets the specified wishlist

DELETE /wishlists/:wishlistId - deletes the specified wishlist from the list

PATCH /wishlists/:wishlistId - updates the specified wishlist with new data





