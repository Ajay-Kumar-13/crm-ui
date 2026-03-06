import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../services/fetchUsers";

export const useUsers = (accessToken) => {
    console.log(accessToken);
    
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