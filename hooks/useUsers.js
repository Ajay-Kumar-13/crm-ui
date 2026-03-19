import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUsers } from "../services/fetchUsers";
import { saveUser } from "../services/saveUser";

export const useUsers = (accessToken) => {    
    const query = useQuery({
        queryKey: ['users'],
        queryFn: () => fetchUsers(accessToken),
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
        mutationFn: ({userData, accessToken}) => saveUser(userData, accessToken),
        onSuccess: (data) =>{
            queryClient.invalidateQueries('users');
        }
    })
}