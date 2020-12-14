DROP TABLE IF EXISTS igift_profiles;

CREATE TABLE igift_profiles (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    user_id INTEGER
        REFERENCES igift_users(id) ON DELETE CASCADE NOT NULL
);