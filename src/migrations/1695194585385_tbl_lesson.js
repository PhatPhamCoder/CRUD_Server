module.exports = {
  up: `
  CREATE TABLE tbl_lesson (
    id int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    teacherId int(11) NOT NULL,
    classId int(11) NOT NULL,
    className varchar(255) DEFAULT NULL,
    numberOfLesson int(11) NOT NULL,
    topic varchar(255) NOT NULL,
    lessonObject varchar(255) NOT NULL,
    otherValue varchar(255) NOT NULL,
    notePreTask longtext DEFAULT NULL,
    notePostTask varchar(255) DEFAULT NULL,
    PreClass varchar(255) DEFAULT NULL,
    Homework varchar(255) DEFAULT NULL,
    Guidance varchar(255) DEFAULT NULL,
    Materials varchar(255) DEFAULT NULL,
    status int(11) NOT NULL,
    learnDate bigint(20) DEFAULT NULL,
    created_at bigint(20) DEFAULT NULL,
    updated_at bigint(20) DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  down: "DROP TABLE tbl_lesson",
};
