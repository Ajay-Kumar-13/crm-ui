import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { fetchLeads, uploadLeads, assignLead } from "../services/leads";

export const useLeads = (accessToken) => {
    const query = useQuery({
        queryKey: ['leads'],
        queryFn: () => fetchLeads(),
        staleTime: 1000 * 60 * 30,
        enabled: !!accessToken
    });
    
    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error
    };
}

export const useUploadLeads = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ leadsData }) => await uploadLeads({ leadsData }),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['leads']);
        }
    })
}

export const useAssignLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ leadId, userId }) => await assignLead({ leadId, userId }),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['leads']);
        }
    })
}