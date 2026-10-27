import type { Task, Priority, TaskStatus } from "../model";
import { useId, useState, type SubmitEvent } from "react";


type  TaskFormValues = Omit<Task, "id" | "createdAt">;
interface TaskFormProps {
    task?: Task,
    onSubmit: (values: TaskFormValues) => void,
    onCancel?: () => void;
}

const NAME_MIN = 3;
const NAME_MAX = 100;

function getInitialValues(task?: Task) : TaskFormValues {
    if(!task) {
        return { name: '', description: '', priority: 'medium', status: 'todo' };
    }

    return {
        name: task.name,
        description: task.description,
        priority: task.priority,
        status: task.status,
    };
}


function validateName(name: string) : string | null {
    const length = name.trim().length;
    if (length < NAME_MIN) return `Title must be at least ${NAME_MIN} characters`;
    if (length > NAME_MAX) return `Title must be at most ${NAME_MAX} characters`;
    return null;
}
export function TaskForm(
    {task, onSubmit, onCancel} : TaskFormProps
) {

    const isEditmode = task !== undefined;
    const id = useId();

    const [values, setValues] = useState<TaskFormValues>(() => getInitialValues(task));
    const [nameTouched, setNameTouched] = useState(false);  
    const [submitAttempted, setsubmitAttempted] = useState<boolean>(false);


    const nameError = validateName(values.name);
    const showNameError = nameError !== null && (nameTouched || submitAttempted);

    const reset = () => {
        setValues(getInitialValues(task));
        setNameTouched(false);
        setsubmitAttempted(false);
    }

    const updateField = <K extends keyof TaskFormValues>(field: K, value: TaskFormValues[K]) : void => {
        setValues((current) => ({...current, [field]: value}))
    }

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setsubmitAttempted(true);
        if (nameError !== null) return;
        onSubmit({...values, name:values.name.trim()});

        if(!isEditmode) reset();
    }


    const priority = ["low", "medium", "high"];
    const status = ["todo", "in_progress", "done"];

    return (
        <>
            <form onSubmit={handleSubmit} noValidate aria-label={isEditmode ? "Edit Task" : "Create Task"}>
                <div>
                    <label htmlFor={`${id}-name`}>Title</label>
                    <input 
                        id={`${id}-name`}
                        type="text" 
                        value={values.name}
                        onChange={(e) => updateField("name", e.target.value) } 
                        onBlur={() => setNameTouched(true)}
                        aria-invalid={showNameError}
                        aria-describedby={showNameError ? `${id}-name-error`: undefined}
                    />
                    {
                        showNameError && (
                            <p id={`${id}-name-error`} role="alert">
                                {nameError}
                            </p>
                        )
                    }
                </div>
                
                <div>
                    <label htmlFor={`${id}-description`}>Description</label>
                    <textarea 
                        id={`${id}-description`}
                        value={values.description}
                        onChange={(e) => updateField("description", e.target.value)}
                    >
                    </textarea>
                </div>

                <div>
                    <label htmlFor={`${id}-priority`}>Priority</label>
                    <select 
                        id={`${id}-priority`}
                        value={values.priority}
                        onChange={(e) => updateField("priority", e.target.value as Priority)}
                    >
                        {priority.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor={`${id}-status`}>Status</label>
                    <select 
                        id={`${id}-status`}
                        value={values.status}
                        onChange={(e) => updateField('status', e.target.value as TaskStatus)}
                    >
                        {status.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>


                <button type="submit">{isEditmode ? "Save changes" : "Add task"}</button>
                <button type="button" onClick={reset}>Reset</button>

                {onCancel && (<button type="button" onClick={onCancel}>Cancel</button>)}
            </form>
        </>
    )
}