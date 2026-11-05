import  { type Task, PRIORITIES, STATUSES } from "../model";
import * as z from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId, useRef } from 'react';

const NAME_MIN = 3;
const NAME_MAX = 100;

const taskFormSchema = z.object({
    name: z
      .string()
      .trim()
      .min(NAME_MIN, `Title must be at least ${NAME_MIN} characters`)
      .max(NAME_MAX, `Title must be at most ${NAME_MAX} characters`),
    description: z.string(),
    priority: z.enum(PRIORITIES),
    status: z.enum(STATUSES),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
    task?: Task,
    isSubmitting? : boolean,
    error? : string | null,
    onSubmit: (values: TaskFormValues) => void,
    onCancel?: () => void;
}
  


function getInitialValues(task?: Task) : TaskFormValues {
    if(!task) {
        return { name: '', description: '', priority: 'medium', status: 'todo' };
    }

    return {
        name: task.name,
        description: task.description ?? "  ",
        priority: task.priority,
        status: task.status,
    };
}


export function TaskForm(
    {task, isSubmitting=false, error, onSubmit, onCancel} : TaskFormProps
) {

    const isEditmode = task !== undefined;
    const id = useId();

    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditmode) {
            titleRef.current?.focus();
        }
    }, [])

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
      } = useForm<TaskFormValues>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: getInitialValues(task),
        mode: 'onTouched',
      });

    const submit = handleSubmit((values) => {
        if(isSubmitting) return;
        onSubmit(values);
    })

      
    const nameError = errors.name?.message;


    return (
        <>
            <form onSubmit={submit} noValidate aria-label={isEditmode ? "Edit Task" : "Create Task"}>
                <h2>{task ?  "Edit task" : "Add a task"}</h2>
                <div>
                    <label htmlFor={`${id}-name`}>Title</label>
                    <input 
                        id={`${id}-name`}
                        type="text" 
                        {...register('name')}
                        ref={titleRef}
                        aria-invalid={nameError !== undefined}
                        aria-describedby={nameError ? `${id}-name-error` : undefined}
                    />
                    {nameError && (
                        <p id={`${id}-name-error`} role="alert">
                            {nameError}
                        </p>
                    )}
                </div>
                
                <div>
                    <label htmlFor={`${id}-description`}>Description</label>
                    <textarea 
                        id={`${id}-description`}
                        {...register("description")}
                    >
                    </textarea>
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