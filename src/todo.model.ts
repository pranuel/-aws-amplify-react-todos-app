import { observable } from "mobx";

export class Todo {
  public id = "";
  @observable public isDone = false;
  @observable public description = "";
}
