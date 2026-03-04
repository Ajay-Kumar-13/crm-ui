import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../services/fetchUsers";

export const useUsers = (accessToken) => {
    return useQuery({
        queryKey: ['users'],
        queryFn: () => fetchUsers(accessToken),
        staleTime: 1000 * 60 * 30,
        enabled: !!accessToken
    });
}