import { getSupabaseAdmin } from "../config/supabase.js";

interface DbError {
  message: string;
  code?: string | null;
}

function assertNoError(error: DbError | null): void {
  if (error) {
    throw Object.assign(new Error(error.message), { code: error.code ?? undefined });
  }
}

export interface ChatConversationRecord {
  id: string;
  type: "direct" | "system";
  created_at: string;
  updated_at: string;
}

export interface ChatParticipantRecord {
  conversation_id: string;
  profile_id: string;
  joined_at: string;
}

export interface ChatMessageRecord {
  id: string;
  conversation_id: string;
  sender_profile_id: string | null;
  content: string;
  message_type: "text" | "system";
  created_at: string;
}

export interface ChatReadStateRecord {
  conversation_id: string;
  profile_id: string;
  last_read_message_id: string | null;
  updated_at: string;
}

export interface BasicProfileRecord {
  id: string;
  name: string;
  avatar_url: string;
}

export async function listConversationIdsForProfile(profileId: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("chat_participants")
    .select("conversation_id")
    .eq("profile_id", profileId);

  assertNoError(error);
  return (data ?? []).map((row) => row.conversation_id as string);
}

export async function listConversationsByIds(ids: string[]): Promise<ChatConversationRecord[]> {
  if (ids.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("id,type,created_at,updated_at")
    .in("id", ids)
    .order("updated_at", { ascending: false });

  assertNoError(error);
  return (data ?? []) as ChatConversationRecord[];
}

export async function listParticipantsByConversationIds(ids: string[]): Promise<ChatParticipantRecord[]> {
  if (ids.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("chat_participants")
    .select("conversation_id,profile_id,joined_at")
    .in("conversation_id", ids);

  assertNoError(error);
  return (data ?? []) as ChatParticipantRecord[];
}

export async function listMessagesByConversationIds(ids: string[]): Promise<ChatMessageRecord[]> {
  if (ids.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id,conversation_id,sender_profile_id,content,message_type,created_at")
    .in("conversation_id", ids)
    .order("created_at", { ascending: true });

  assertNoError(error);
  return (data ?? []) as ChatMessageRecord[];
}

export async function listReadStatesForProfile(
  profileId: string,
  conversationIds: string[]
): Promise<ChatReadStateRecord[]> {
  if (conversationIds.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("chat_read_states")
    .select("conversation_id,profile_id,last_read_message_id,updated_at")
    .eq("profile_id", profileId)
    .in("conversation_id", conversationIds);

  assertNoError(error);
  return (data ?? []) as ChatReadStateRecord[];
}

export async function listProfilesByIds(ids: string[]): Promise<BasicProfileRecord[]> {
  if (ids.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("profiles").select("id,name,avatar_url").in("id", ids);
  assertNoError(error);
  return (data ?? []) as BasicProfileRecord[];
}

export async function getConversationById(id: string): Promise<ChatConversationRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("id,type,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  assertNoError(error);
  return (data as ChatConversationRecord | null) ?? null;
}

export async function getMessageById(id: string): Promise<ChatMessageRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id,conversation_id,sender_profile_id,content,message_type,created_at")
    .eq("id", id)
    .maybeSingle();

  assertNoError(error);
  return (data as ChatMessageRecord | null) ?? null;
}

export async function isParticipant(conversationId: string, profileId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("chat_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", profileId)
    .maybeSingle();

  assertNoError(error);
  return Boolean(data);
}

export async function createConversation(type: "direct" | "system"): Promise<ChatConversationRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({
      type,
      updated_at: new Date().toISOString()
    })
    .select("id,type,created_at,updated_at")
    .single();

  assertNoError(error);
  return data as ChatConversationRecord;
}

export async function addConversationParticipants(conversationId: string, profileIds: string[]): Promise<void> {
  const rows = profileIds.map((profileId) => ({
    conversation_id: conversationId,
    profile_id: profileId
  }));

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("chat_participants").insert(rows);
  assertNoError(error);
}

export async function upsertReadStates(
  rows: Array<{
    conversation_id: string;
    profile_id: string;
    last_read_message_id: string | null;
    updated_at?: string;
  }>
): Promise<void> {
  if (rows.length === 0) {
    return;
  }

  const payload = rows.map((row) => ({
    ...row,
    updated_at: row.updated_at ?? new Date().toISOString()
  }));

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("chat_read_states")
    .upsert(payload, { onConflict: "conversation_id,profile_id" });

  assertNoError(error);
}

export async function listMessagesForConversation(input: {
  conversationId: string;
  limit: number;
  cursor?: string;
}): Promise<ChatMessageRecord[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("chat_messages")
    .select("id,conversation_id,sender_profile_id,content,message_type,created_at")
    .eq("conversation_id", input.conversationId)
    .order("created_at", { ascending: false })
    .limit(input.limit);

  if (input.cursor) {
    query = query.lt("created_at", input.cursor);
  }

  const { data, error } = await query;
  assertNoError(error);

  const rows = (data ?? []) as ChatMessageRecord[];
  return rows.reverse();
}

export async function insertMessage(input: {
  conversation_id: string;
  sender_profile_id: string | null;
  content: string;
  message_type: "text" | "system";
}): Promise<ChatMessageRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert(input)
    .select("id,conversation_id,sender_profile_id,content,message_type,created_at")
    .single();

  assertNoError(error);
  return data as ChatMessageRecord;
}

export async function touchConversation(conversationId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("chat_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  assertNoError(error);
}
