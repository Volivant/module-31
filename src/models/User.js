import { BaseModel } from "./BaseModel";
import { getFromStorage, addToStorage } from "../utils";

export class User extends BaseModel {
  constructor(login, password, role) {
    super();
    this.login = login;
    this.password = password;
    this.role = role;
  }
  get hasAccess() {
    let users = getFromStorage("users");
    if (users.length == 0) return false;
    for (let user of users) {
      if (user.login == this.login && user.password == this.password) {
        this.role = user.role;
        return true;
      }
        
    }
    return false;
  }

  static save(user) {
    try {
      addToStorage(user, "users");
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }
}
