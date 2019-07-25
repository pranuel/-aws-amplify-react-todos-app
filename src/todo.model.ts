import { observable } from "mobx";

export class Todo {
    id = '';
    @observable isDone = false;
    @observable description = '';
}