import  { type Task, PRIORITIES, STATUSES } from "../model/types";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId } from 'react';
import type { FieldErrors } from "../../../shared/lib/http";
import  { type TaskFormValues, taskFormSchema } from "../api/schema";




interface TaskFormProps {
    task?: Task,
    isSubmitting? : boolean,
    error? : string | null,
    onSubmit: (values: TaskFormValues) => void,
    onCancel?: () => void;
    serverErrors?: FieldErrors
}
  


function getInitialValues(task?: Task) : TaskFormValues {
    if(!task) {
        return { name: '', description: '', priority: 'medium', status: 'todo' };
    }

    return {
        name: task.name,
        description: task.description ?? "",
        priority: task.priority,
        status: task.status,
    };
}


export function TaskForm(
    {task, isSubmitting=false, error, onSubmit, onCancel, serverErrors} : TaskFormProps
) {

    const isEditmode = task !== undefined;
    const id = useId();


    

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setFocus,
        setError
      } = useForm<TaskFormValues>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: getInitialValues(task),
        mode: 'onTouched',
    });
    
    useEffect(() => {
        if (isEditmode) {
            setFocus('name');
        }
    }, [isEditmode, setFocus])

    useEffect(() => {
        if(!serverErrors) return;
        for (const [field, message] of Object.entries(serverErrors)) {
            if (field === 'name' || field === 'description' || field === 'priority' || field === 'status') {
              setError(field, { type: 'server', message });
            }
        }
    }, [serverErrors, setError])

    const submit = handleSubmit((values) => {
        if (isSubmitting) return;
      
        const { due_date, ...rest } = values;
      
        onSubmit({
          ...rest,
          ...(due_date ? { due_date } : {}),
        });
      });
      
    const nameError = errors.name?.message;
    const descriptionError = errors.description?.message;

    return (
        <>
            <form onSubmit={submit} noValidate aria-label={isEditmode ? "Edit Task" : "Create Task"}>
                <h2>{task ?  "Edit task" : "Add a task"}</h2>
                <div>
                    <label htmlFor={`${id}-name`}>Task Title (required)</label>
                    <input 
                        id={`${id}-name`}
                        type="text" 
                        {...register('name')}
                        aria-invalid={nameError !== undefined}
                        aria-describedby={nameError ? `${id}-name-error ${id}-name-hint` : `${id}-name-hint`}
                    />
                    <p id={`${id}-name-hint`}>3–100 characters</p>
                    {nameError && (
                        <p id={`${id}-name-error`} role="alert">
                            {nameError}
                        </p>
                    )}
                </div>
                <label htmlFor={`${id}-due_date`}>Due Date</label>
                <input id={`${id}-due_date`} {...register('due_date')} type="date"/>
                
                <div>
                    <label htmlFor={`${id}-description`}>Description</label>
                    <textarea 
                        id={`${id}-description`}
                        {...register("description")}
                        aria-invalid={descriptionError !== undefined}
                        aria-describedby={descriptionError ? `${id}-description-error` : undefined}
                    >
                    </textarea>
                    {descriptionError && (
                        <p id={`${id}-description-error`} role="alert">
                            {descriptionError}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor={`${id}-priority`}>Priority</label>
                    <select 
                        id={`${id}-priority`}
                        {...register("priority")}
                    >
                        {PRIORITIES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor={`${id}-status`}>Status</label>
                    <select 
                        id={`${id}-status`}
                        {...register("status")}
                    >
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>


                <button type="submit" disabled={isSubmitting}>{isSubmitting? "Saving..." : isEditmode ? "Save changes" : "Add task"}</button>
                <button type="button" onClick={() => reset(getInitialValues(task))}>Reset</button>

                {onCancel && (<button type="button" onClick={onCancel}>Cancel</button>)}
                {error && <p role="alert">{error}</p>}
            </form>
        </>
    )
}