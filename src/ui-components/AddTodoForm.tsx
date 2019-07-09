import React from 'react';
import { Form, Button, Icon, FormProps } from "semantic-ui-react";

export interface AddTodoFormProps { 
    onSubmit: (event: React.FormEvent<HTMLFormElement>, data: FormProps) => void,
    todoName: string,
    onChangeTodoName: (event: React.ChangeEvent<HTMLInputElement>) => void,
    todoDescription?: string,
    onChangeTodoDescription: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function AddTodoForm(props: AddTodoFormProps) {
    return (
        <div>
            <Form onSubmit={props.onSubmit}>
                <Form.Field>
                    <label>Name</label>
                    <input placeholder='Name' type="text" value={props.todoName} onChange={props.onChangeTodoName} />
                </Form.Field>
                <Form.Field>
                    <label>Description (optional)</label>
                    <input placeholder='Description (optional)' type="text" value={props.todoDescription || ''} onChange={props.onChangeTodoDescription} />
                </Form.Field>
                <Button icon labelPosition='left' type='submit'>
                    <Icon name='add' />
                    Add Todo
              </Button>
            </Form>
        </div>
    );
}