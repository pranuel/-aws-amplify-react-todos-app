import React from 'react';
import { Todo } from "../todo.model";
import { Message, List, Icon, Button, Grid } from "semantic-ui-react";

export interface TodosListProps {
  todos: Todo[],
  onDeleteTodo: (todo: Todo) => void,
  onEditTodo: (todo: Todo) => void,
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
                    <Grid>
                      <Grid.Column floated='left' width={9}>
                        {todo.description || '/'}
                      </Grid.Column>
                      <Grid.Column floated='right'>
                        <Button.Group icon>
                          <Button onClick={() => props.onEditTodo(todo)}>
                            <Icon name='edit' />
                          </Button>
                          <Button onClick={() => props.onDeleteTodo(todo)}>
                            <Icon name='delete' />
                          </Button>
                        </Button.Group>
                      </Grid.Column>
                    </Grid>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          )
      }
    </div>
  )
}