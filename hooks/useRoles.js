import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchRoles } from "../services/fetchRoles";
import { saveRole } from "../services/fetchRoles";

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

export const useSaveRole  = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ accessToken, roleData }) => await saveRole({ accessToken, roleData }),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['roles']);
        }
    })
}