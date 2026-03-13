import { getSupabaseAdmin } from "../config/supabase.js";
function normalizePair(a, b) {
    return a < b ? { low: a, high: b } : { low: b, high: a };
}
export async function getDirectConversationId(profileA, profileB) {
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
    return data?.conversation_id ?? null;
}
export async function createConversation(type, activityId) {
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
    return data;
}
export async function bindDirectConversationPair(profileA, profileB, conversationId) {
    const supabase = getSupabaseAdmin();
    const pair = normalizePair(profileA, profileB);
    const { data, error } = await supabase
        .from("direct_conversation_pairs")
        .upsert({
        profile_low: pair.low,
        profile_high: pair.high,
        conversation_id: conversationId
    }, { onConflict: "profile_low,profile_high" })
        .select("conversation_id")
        .single();
    if (error) {
        throw new Error(error.message);
    }
    return data.conversation_id;
}
export async function getOrCreateDirectConversation(profileA, profileB) {
    const existingId = await getDirectConversationId(profileA, profileB);
    if (existingId) {
        return getConversationById(existingId);
    }
    const created = await createConversation("direct");
    const boundId = await bindDirectConversationPair(profileA, profileB, created.id);
    return getConversationById(boundId);
}
export async function getConversationById(conversationId) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("conversations").select("*").eq("id", conversationId).single();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}
export async function getOrCreateActivityConversation(activityId) {
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
        return data;
    }
    return createConversation("activity_group", activityId);
}
export async function ensureConversationMember(conversationId, profileId, role = "member") {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("conversation_members").upsert({
        conversation_id: conversationId,
        profile_id: profileId,
        role
    }, { onConflict: "conversation_id,profile_id" });
    if (error) {
        throw new Error(error.message);
    }
}
export async function isConversationMember(conversationId, profileId) {
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
export async function listConversationsForProfile(profileId) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("conversation_members")
        .select("conversations(*)")
        .eq("profile_id", profileId);
    if (error) {
        throw new Error(error.message);
    }
    return (data ?? [])
        .map((row) => {
        if (Array.isArray(row.conversations)) {
            return row.conversations[0] ?? null;
        }
        return row.conversations;
    })
        .filter((row) => Boolean(row));
}
export async function listMessages(conversationId, limit = 100) {
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
    return (data ?? []);
}
export async function createMessage(conversationId, senderProfileId, content) {
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
    return data;
}
export async function getLatestMessage(conversationId) {
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
    return data ?? null;
}
export async function listConversationMembers(conversationId) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("conversation_members")
        .select("profile_id,role")
        .eq("conversation_id", conversationId);
    if (error) {
        throw new Error(error.message);
    }
    return (data ?? []);
}
