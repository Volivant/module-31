import { BaseModel } from "./BaseModel";
import { getFromStorage, addToStorage } from "../utils";

export class Task extends BaseModel {
    constructor(name, user) {
        super();
        this.name = name; //название задачи
        this.user = user; //владелец задачи
        this.state = "backlog"; //статус задачи
    }

    static save(task) {
        try {
          addToStorage(task, "tasks");
          return true;
        } catch (e) {
          throw new Error(e);
        }
    }
}