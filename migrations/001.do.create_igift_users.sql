DROP TABLE IF EXISTS igift_users;
DROP TABLE IF EXISTS igift_profiles;
DROP TABLE IF EXISTS igift_wishlists;

CREATE TABLE igift_users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    username VARCHAR(20) NOT NULL,
    email VARCHAR NOT NULL,
    password VARCHAR(20) NOT NULL,
    budget INTEGER
);

INSERT INTO igift_users (name, username, email, password, budget)
VALUES
    ('James', 'jamesk10', 'jtkernan92@gmail.com', 'password123', 500),
    ('Amy', 'amyh505', 'amy505@gmail.com', 'winnifred101', 250),
    ('Winston', 'winston123', 'winston123@gmail.com', 'doodledog99', 100);

--ALTER SEQUENCE igift_users_id_sequence RESTART WITH 1;