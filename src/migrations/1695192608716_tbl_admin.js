module.exports = {
  up: `
    CREATE TABLE tbl_admin (
        id int(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY ,
        name varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        phoneNumber varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        email varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        avatar varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        password varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        refresh_token varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        active tinyint(1) NOT NULL,
        created_at bigint(22) DEFAULT NULL,
        updated_at bigint(22) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  down: `
    DROP TABLE tbl_admin
  `,
};
