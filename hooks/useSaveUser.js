import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveUser } from "../services/saveUser";

export const useSaveUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({userData, accessToken}) => saveUser(userData, accessToken),
        onSuccess: (data) =>{
            queryClient.invalidateQueries('users');
        }
    })
}