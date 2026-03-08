import { useQuery } from "@tanstack/react-query"
import { fetchAuthorities } from "../services/fetchAuthorities";

export const useAuthorities = (accessToken) => {
    const query = useQuery({
        queryKey: ['authorities'],
        queryFn: () => fetchAuthorities(accessToken),
        staleTime: 1000 * 60 * 30,
        enabled: !!accessToken
    })

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error
    };
}