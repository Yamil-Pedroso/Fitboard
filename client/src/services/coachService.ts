import axiosInstance from "@/api/axiosConfig";

export type CoachRole = "user" | "assistant";

export interface CoachMessage {
  role: CoachRole;
  content: string;
  responseId?: string;
  createdAt: string;
}

export interface CoachConversation {
  _id: string;
  userId: string;
  title: string;
  messages: CoachMessage[];
  lastResponseId?: string;
  modelName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoachConversationSummary {
  _id: string;
  title: string;
  modelName?: string;
  messagesCount: number;
  lastMessage?: CoachMessage | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendCoachMessageInput {
  message: string;
  conversationId?: string;
}

export interface SendCoachMessageResponse {
  conversationId: string;
  message: CoachMessage;
  conversation: CoachConversation;
}

export async function sendCoachMessage(
  input: SendCoachMessageInput,
): Promise<SendCoachMessageResponse> {
  const { data } = await axiosInstance.post<SendCoachMessageResponse>(
    "/coach/chat",
    input,
  );

  return data;
}

export async function listCoachConversations(): Promise<{
  items: CoachConversationSummary[];
}> {
  const { data } = await axiosInstance.get<{
    items: CoachConversationSummary[];
  }>("/coach/conversations");

  return data;
}

export async function getCoachConversation(
  conversationId: string,
): Promise<CoachConversation> {
  const { data } = await axiosInstance.get<CoachConversation>(
    `/coach/conversations/${conversationId}`,
  );

  return data;
}

export async function deleteCoachConversation(
  conversationId: string,
): Promise<{ ok: true }> {
  const { data } = await axiosInstance.delete<{ ok: true }>(
    `/coach/conversations/${conversationId}`,
  );

  return data;
}
