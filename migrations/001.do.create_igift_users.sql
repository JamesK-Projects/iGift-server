DROP TABLE IF EXISTS igift_users;

CREATE TABLE igift_users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    username VARCHAR(20) NOT NULL,
    email VARCHAR NOT NULL,
    password VARCHAR(20) NOT NULL,
    budget INTEGER
);