import { getSupabaseAdmin } from "../config/supabase.js";

export interface ConversationRecord {
  id: string;
  type: "direct" | "activity_group";
  activity_id: string | null;
  created_at: string;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  content: string;
  message_type: "text";
  created_at: string;
}

interface ConversationJoinRow {
  conversations: ConversationRecord | ConversationRecord[] | null;
}

function normalizePair(a: string, b: string): { low: string; high: string } {
  return a < b ? { low: a, high: b } : { low: b, high: a };
}

export async function getDirectConversationId(profileA: string, profileB: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const pair = normalizePair(profileA, profileB);
  const { data, error } = await supabase
    .from("direct_conversation_pairs")
    .select("conversation_id")
    .eq("profile_low", pair.low)
    .eq("profile_high", pair.high)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return (data?.conversation_id as string | undefined) ?? null;
}

export async function createConversation(type: "direct" | "activity_group", activityId?: string): Promise<ConversationRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      type,
      activity_id: activityId ?? null
    })
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data as ConversationRecord;
}

export async function bindDirectConversationPair(
  profileA: string,
  profileB: string,
  conversationId: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const pair = normalizePair(profileA, profileB);
  const { data, error } = await supabase
    .from("direct_conversation_pairs")
    .upsert(
      {
        profile_low: pair.low,
        profile_high: pair.high,
        conversation_id: conversationId
      },
      { onConflict: "profile_low,profile_high" }
    )
    .select("conversation_id")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data.conversation_id as string;
}

export async function getOrCreateDirectConversation(profileA: string, profileB: string): Promise<ConversationRecord> {
  const existingId = await getDirectConversationId(profileA, profileB);
  if (existingId) {
    return getConversationById(existingId);
  }

  const created = await createConversation("direct");
  const boundId = await bindDirectConversationPair(profileA, profileB, created.id);
  return getConversationById(boundId);
}

export async function getConversationById(conversationId: string): Promise<ConversationRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("conversations").select("*").eq("id", conversationId).single();
  if (error) {
    throw new Error(error.message);
  }
  return data as ConversationRecord;
}

export async function getOrCreateActivityConversation(activityId: string): Promise<ConversationRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("type", "activity_group")
    .eq("activity_id", activityId)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (data) {
    return data as ConversationRecord;
  }
  return createConversation("activity_group", activityId);
}

export async function ensureConversationMember(conversationId: string, profileId: string, role: "owner" | "member" = "member") {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("conversation_members").upsert(
    {
      conversation_id: conversationId,
      profile_id: profileId,
      role
    },
    { onConflict: "conversation_id,profile_id" }
  );
  if (error) {
    throw new Error(error.message);
  }
}

export async function isConversationMember(conversationId: string, profileId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return Boolean(data);
}

export async function listConversationsForProfile(profileId: string): Promise<ConversationRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("conversation_members")
    .select("conversations(*)")
    .eq("profile_id", profileId);
  if (error) {
    throw new Error(error.message);
  }
  return ((data ?? []) as ConversationJoinRow[])
    .map((row) => {
      if (Array.isArray(row.conversations)) {
        return row.conversations[0] ?? null;
      }
      return row.conversations;
    })
    .filter((row): row is ConversationRecord => Boolean(row));
}

export async function listMessages(conversationId: string, limit = 100): Promise<MessageRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as MessageRecord[];
}

export async function createMessage(conversationId: string, senderProfileId: string, content: string): Promise<MessageRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_profile_id: senderProfileId,
      content: content.trim(),
      message_type: "text"
    })
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data as MessageRecord;
}

export async function getLatestMessage(conversationId: string): Promise<MessageRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return (data as MessageRecord | null) ?? null;
}

export async function listConversationMembers(conversationId: string): Promise<Array<{ profile_id: string; role: string }>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("conversation_members")
    .select("profile_id,role")
    .eq("conversation_id", conversationId);
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as Array<{ profile_id: string; role: string }>;
}
