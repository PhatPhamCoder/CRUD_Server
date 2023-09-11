//Định dạng số Điện thoại
exports.regexPhone = /^[0-9]+$/;
//Định dạng Email
exports.regexEmail =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
// Định dạng tên tài khoản
// exports.regexAccount = /^[a-z0-9](?=.*[A-Z])+$/;
exports.regexAccount =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{2,}$/;
// Định dạng mật khẩu
exports.regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
