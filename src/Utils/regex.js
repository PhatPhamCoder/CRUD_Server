//Định dạng số Điện thoại
exports.regexPhone = /^[0-9]+$/;
//Định dạng Email
exports.regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
// Định dạng tên tài khoản
exports.regexAccount =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{2,}$/;
// Định dạng mật khẩu
exports.regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
