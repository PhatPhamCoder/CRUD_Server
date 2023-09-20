module.exports = {
  up: `
    INSERT INTO tbl_admin (id, name, phoneNumber, email, avatar, password, refresh_token, active, created_at, updated_at) VALUES
        (4, 'Moderator', '0704634919', 'phamhoangminhphat@gmail.com', 'avatar_3389014784876.png', '$2b$10$48I/5xFA0qJs5ZRZ2h7ucOeDg8IX20M32pvnQMlonYPMz4NkxXE1G', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsIm5hbWUiOiJQaOG6oW0gUGjDoXQiLCJpYXQiOjE2OTQ0NDA5ODQsImV4cCI6MTY5NTA0NTc4NH0.l0ZvcHHRVViFsH37eDpk2j0JvY3fv82hG_7hGlXDZ_U', 1, 1694406781873, 1694570037265),
        (7, 'Phạm Huy Hoàng', '0123456789', 'huyphamhoang@gmail.com', 'avatar_3389011445158.png', '$2b$10$Wop6PVRvSGzh4Le0rae0zetPAWi/L8CAtNCbVDSrc/fEim3wCTub2', NULL, 1, 1694416127621, 1694568976219),
        (8, 'Tuấn Phan', '07382936471', 'tuanpham@gmail.com', 'avatar_3389137990063.png', '$2b$10$3U4WjL25G/TPxvTVwB4Bq.m3O32CMCHqJrheMPZvcB.P/.bhhfxbm', NULL, 1, 1694416187383, 1694568995934),
        (9, 'Ngoc Pham', '0864738291', 'ngocpham@gmail.com', 'avatar_3389011905616.png', '$2b$10$5Rb40dtBn6ZV8Sf1CmWsVeydUHPW4Mo39JsUL/JatS4mZR9snJuT6', NULL, 1, 1694416208050, 1694505954418),
        (12, 'Ngoc Lieu', '09876543212', 'ngoclieu@gmail.com', 'avatar_3389005098922.png', '$2b$10$kG5rYoaxGPDxmkPtkADU5unnQ.nEkgxPT5BoEoNyESVKKsJnAtO1C', NULL, 1, 1694418667453, 1694502549495),
        (13, 'Nguyễn Ngọc Thảo Nhi', '0123456789', 'thaonhi@gmail.com', 'avatar_3389004533790.png', '$2b$10$eH9kf7hu2PzjhLPzK3v3BenEEi9.p9laAqFUhaVVigXYz0/0JJXVu', NULL, 1, 1694418682956, 1694502266930),
        (14, 'Nguyễn Ngọc Thùy Vân', '0738273647', 'thuyvannguyen@gmail.com', 'avatar_3389007980690.png', '$2b$10$HESJ7HjZMVYyextdF9ky3.HA00USkybqmshB.P3vG8DxOHXkgygqC', NULL, 1, 1694418705133, 1694503990380),
        (15, 'Phan Thị Thùy Dung', '0782736471', 'quanpha@gmail.com', NULL, '$2b$10$5iCOw4ORVKHe69yliOr4sOld8xsF.yUwJMLbA6WqWoRcGdjyggk4G', NULL, 1, 1694418730205, 1694424212415),
        (17, 'Trần Quốc Công', '0982674817', 'congtran@gmail.com', 'avatar_3389137036439.png', '$2b$10$YBHeC3q1xHFIUYaQHEfhFOBQzpZCt5exCth4lqJC9BiyzFz1Z0nEO', NULL, 0, 1694421433960, 1694568518251),
        (20, 'Nguyên Thanh Nam', '0987654213', 'thanhnam@gmail.com', 'avatar_3389002566474.png', '$2b$10$VXg.BulGALM7YObg9dOwzOdjDIbqYoaN47KBywkHOW931HxUTwFl2', NULL, 1, 1694483115633, 1694570010787),
        (75, 'Hoài Thu', '0928172632', 'hoaithu@gmail.com', 'avatar_3390006869938.jpg', '$2b$10$jisH0wyoXfnwN44S3v15Re5S8k.lcYlBR1lXMlixK1.7aYk1SrLDm', NULL, 1, 1694486662299, 1695003434983),
        (81, 'Admin', '0987654321', 'admin@gmail.com', 'avatar_3389007626658.png', '$2b$10$.h1UqAZWzFc/pGW5nmwFcup2d9Xn9/bWEa8097Yjsj6iSFEEOPgOS', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgxLCJuYW1lIjoiQWRtaW4iLCJpYXQiOjE2OTUxNzQyMjYsImV4cCI6MTY5NjQ3MDIyNn0.daxN2Q3miwS3QV_L-3l6zPcN7dpcATy7iEYrF6-_oq8', 1, 1694488866537, 1694594748185),
        (82, 'Phan Công Vinh', '0937284637', 'phancongvinh@gmail.com', 'avatar_3389140778719.jpg', '$2b$10$CC2G5d562h3oVMh3T.Et.eBY7/cuA.Z6Ee1eGLjcQbcBB79s06SEi', NULL, 1, 1694503010270, 1694570389380),
        (88, 'Nguyễn Thành Công', '0987654321', 'nguyenthanhcong@gmail.com', 'avatar_3389014010958.png', '$2b$10$nefKGl7Zqu0eJxO9JiPifu7qmWnO3/aBkNyOgy2QoG0CtJ/rrwwmO', NULL, 1, 1694505379110, 1694507005516),
        (100, 'Nguyễn Thành Nam', '0782973648', 'nguyenthanhnam@gmail.com', 'avatar_3390365125738.png', '$2b$10$S/xjSFeZma1ZBML8E2/NgukoU1KU2QTH2phzIm5ESb2gNLfht7wpm', NULL, 1, 1694568843603, 1695182562883),
        (101, 'Phạm Minh Trí', '0827364718', 'phamminhtri@gmail.com', 'avatar_3389140807257.jpg', '$2b$10$4au9a2rupNfwdtJaRvIuVOjr3I1IrgDQZIjs98.N2lbbT7275sWM6', NULL, 1, 1694568843664, 1694570403646),
        (102, 'Nguyễn Cao Cường', '0928347618', 'nguyencaocuong@gmail.com', 'avatar_3389140649729.png', '$2b$10$GSyG.gfLvZg5FotlKapj6.YQAKTFwvKkq..OOiOJvevqe81TRUQuO', NULL, 1, 1694568843547, 1695003392360),
        (261, 'Nguyễn Thanh Lộc', '0728374659', 'nguyenthanhloc@gmail.com', 'avatar_3390358502750', '$2b$10$wsS86niA/Aa.5FXUTUG3X.PUkIin0FTvyiBaVZv2CoF46b7HaVseS', NULL, 1, 1694576807923, 1695179251416);
    `,
  down: "",
};
