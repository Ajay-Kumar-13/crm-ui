import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, updateUser } from "../services/users";
import { saveUser } from "../services/users";

export const useUsers = (accessToken) => {    
    const query = useQuery({
        queryKey: ['users'],
        queryFn: () => fetchUsers(),
        staleTime: 1000 * 60 * 30,
        enabled: !!accessToken
    });
    
    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error
    };
}

export const useSaveUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({userData}) => saveUser(userData),
        onSuccess: (data) =>{
            queryClient.invalidateQueries('users');
        }
    })
}

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({userId, userData}) => updateUser(userId, userData),
        onSuccess: (data) =>{
            queryClient.invalidateQueries('users');
        }
    })
}