import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../services/fetchUsers";

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
        staleTime: 1000 * 60 * 30
    });
}