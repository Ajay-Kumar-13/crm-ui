import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchAuthorities, saveAuthority } from "../services/authorities";

export const useAuthorities = (accessToken) => {
    const query = useQuery({
        queryKey: ['authorities'],
        queryFn: () => fetchAuthorities(),
        staleTime: 1000 * 60 * 30,
        enabled: !!accessToken
    })

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error
    };
}

export const useSaveAuthority = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ authority }) => saveAuthority({ authority }),
        onSuccess: (data => {
            queryClient.invalidateQueries(['authorities']);
        })
    });
}