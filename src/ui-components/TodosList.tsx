import React from 'react';
import { Todo } from "../todo.model";
import { Message, List } from "semantic-ui-react";

export interface TodosListProps {
  todos: Todo[]
}

export function TodosList(props: TodosListProps) {
  return (
    <div>
      {
        props.todos.length < 1 ?
          (
            <Message>
              <Message.Header>No todos exist...</Message.Header>
            </Message>
          )
          :
          (
            <List celled>
              {props.todos.map(todo => (
                <List.Item>
                  <List.Content>
                    <List.Header>{todo.name}</List.Header>
                    {todo.description || '/'}
                  </List.Content>
                </List.Item>
              ))}
            </List>
          )
      }
    </div>
  )
}