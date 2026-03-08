import { useQuery } from "@tanstack/react-query";
import { fetchRoles } from "../services/fetchRoles";

export const useRoles = (accessToken) => {
    const query = useQuery({
        queryKey: ['roles'],
        queryFn: () => fetchRoles(accessToken),
        staleTime: 1000 * 60 * 30,
        enabled: !!accessToken
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error
    };
}