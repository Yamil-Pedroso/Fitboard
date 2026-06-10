import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteCoachConversation,
  getCoachConversation,
  listCoachConversations,
  sendCoachMessage,
  type SendCoachMessageInput,
} from "@/services/coachService";

export function useCoachConversations(enabled = true) {
  return useQuery({
    queryKey: ["coach", "conversations"],
    queryFn: listCoachConversations,
    enabled,
    staleTime: 30_000,
  });
}

export function useCoachConversation(conversationId?: string) {
  return useQuery({
    queryKey: ["coach", "conversation", conversationId],
    queryFn: () => getCoachConversation(conversationId as string),
    enabled: !!conversationId,
    staleTime: 30_000,
  });
}

export function useSendCoachMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: SendCoachMessageInput) => sendCoachMessage(input),
    onSuccess: (data) => {
      qc.setQueryData(
        ["coach", "conversation", data.conversationId],
        data.conversation,
      );
      qc.invalidateQueries({ queryKey: ["coach", "conversations"] });
    },
  });
}

export function useDeleteCoachConversation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      deleteCoachConversation(conversationId),
    onSuccess: (_data, conversationId) => {
      qc.removeQueries({ queryKey: ["coach", "conversation", conversationId] });
      qc.invalidateQueries({ queryKey: ["coach", "conversations"] });
    },
  });
}
