module.exports = {
  up: `
    CREATE TABLE tbl_student (
        id int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        coursesId int(11) DEFAULT NULL,
        classId int(11) NOT NULL,
        firstName varchar(255) NOT NULL,
        lastName varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        password varchar(255) DEFAULT NULL,
        role_id int(11) NOT NULL,
        refresh_token varchar(255) DEFAULT NULL,
        OTP varchar(255) DEFAULT NULL,
        phoneNumber varchar(11) NOT NULL,
        avatar varchar(255) DEFAULT NULL,
        active tinyint(1) NOT NULL,
        created_at bigint(20) DEFAULT NULL,
        created_ON bigint(20) DEFAULT NULL,
        updated_at bigint(20) DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
  down: "DROP TABLE tbl_student",
};
