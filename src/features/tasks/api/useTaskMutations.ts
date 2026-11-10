import { useMutation, useQueryClient  } from "@tanstack/react-query";
import { createTask, updateTask, deleteTask } from "./tasksApi";
import { taskKeys } from "./useTasksQuery";
import type { Task, TaskStatus, TaskChanges } from "../model/types";

export function useCreateTask() { 
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTask,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: taskKeys.all });
        }
    })
}

export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, changes} : {id: number; changes : TaskChanges}) => updateTask(id, changes),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: taskKeys.all });
        }
    })
}

export function useDeleteTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteTask(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: taskKeys.all });
        }
    })
}

export function useMoveTaskStatus() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
        updateTask(id, { status }),
  
      onMutate: async ({ id, status }) => {
        await queryClient.cancelQueries({ queryKey: taskKeys.all });
  
        const snapshot = queryClient.getQueriesData<Task[]>({
          queryKey: taskKeys.lists(),
        });
  

        queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.lists() }, (old) =>
          old?.map((task) => (task.id === id ? { ...task, status } : task)),
        );
  
        return { snapshot };
      },
  
      onError: (_error, _variables, onMutateResult) => {
        onMutateResult?.snapshot.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      },
  
      onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
    });
  }