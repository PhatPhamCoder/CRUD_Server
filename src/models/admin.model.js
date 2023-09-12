const Admin = function (admin) {
  (this.name = admin.name),
    (this.email = admin.email),
    (this.phoneNumber = admin.phoneNumber),
    (this.avatar = admin.avatar),
    (this.password = admin.password),
    (this.refresh_token = admin.refresh_token),
    (this.active = admin.active),
    (this.created_at = admin.created_at),
    (this.updated_at = admin.updated_at);
};

module.exports = Admin;
