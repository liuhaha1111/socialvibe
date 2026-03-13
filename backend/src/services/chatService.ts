import { parseEnv } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import {
  addConversationParticipants,
  createConversation,
  getConversationById,
  getMessageById,
  insertMessage,
  isParticipant,
  listConversationIdsForProfile,
  listConversationsByIds,
  listMessagesByConversationIds,
  listMessagesForConversation,
  listParticipantsByConversationIds,
  listProfilesByIds,
  listReadStatesForProfile,
  touchConversation,
  upsertReadStates,
  type BasicProfileRecord,
  type ChatMessageRecord
} from "../repositories/chatRepository.js";

interface ConversationSummaryDto {
  id: string;
  type: "direct" | "system";
  title: string;
  avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  other_profile_id: string | null;
}

interface MessageDto {
  id: string;
  conversation_id: string;
  sender_profile_id: string | null;
  sender_name: string | null;
  sender_avatar_url: string | null;
  content: string;
  message_type: "text" | "system";
  created_at: string;
}

function getCurrentProfileId(): string {
  const env = parseEnv(process.env);
  return env.TEST_PROFILE_ID;
}

function groupByConversation<T extends { conversation_id: string }>(rows: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const bucket = map.get(row.conversation_id);
    if (bucket) {
      bucket.push(row);
    } else {
      map.set(row.conversation_id, [row]);
    }
  }
  return map;
}

function toUnreadCount(messages: ChatMessageRecord[], lastReadMessageId: string | null, currentProfileId: string): number {
  if (messages.length === 0) {
    return 0;
  }

  let unreadCandidates = messages;
  if (lastReadMessageId) {
    const idx = messages.findIndex((message) => message.id === lastReadMessageId);
    if (idx >= 0) {
      unreadCandidates = messages.slice(idx + 1);
    }
  }

  return unreadCandidates.filter((message) => message.sender_profile_id !== currentProfileId).length;
}

function resolveConversationTitle(input: {
  type: "direct" | "system";
  currentProfileId: string;
  participantIds: string[];
  profilesById: Map<string, BasicProfileRecord>;
}): { title: string; avatarUrl: string | null; otherProfileId: string | null } {
  if (input.type === "system") {
    return {
      title: "System Notifications",
      avatarUrl: null,
      otherProfileId: null
    };
  }

  const otherProfileId = input.participantIds.find((id) => id !== input.currentProfileId) ?? null;
  if (!otherProfileId) {
    return {
      title: "Direct Chat",
      avatarUrl: null,
      otherProfileId: null
    };
  }

  const profile = input.profilesById.get(otherProfileId);
  return {
    title: profile?.name ?? "Direct Chat",
    avatarUrl: profile?.avatar_url ?? null,
    otherProfileId
  };
}

async function buildConversationSummaries(profileId: string): Promise<ConversationSummaryDto[]> {
  const conversationIds = await listConversationIdsForProfile(profileId);
  if (conversationIds.length === 0) {
    return [];
  }

  const [conversations, participants, messages, readStates] = await Promise.all([
    listConversationsByIds(conversationIds),
    listParticipantsByConversationIds(conversationIds),
    listMessagesByConversationIds(conversationIds),
    listReadStatesForProfile(profileId, conversationIds)
  ]);

  const participantsByConversation = groupByConversation(participants);
  const messagesByConversation = groupByConversation(messages);
  const readMap = new Map(readStates.map((state) => [state.conversation_id, state.last_read_message_id] as const));

  const profileIds = Array.from(new Set(participants.map((x) => x.profile_id)));
  const profiles = await listProfilesByIds(profileIds);
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile] as const));

  return conversations.map((conversation) => {
    const members = participantsByConversation.get(conversation.id) ?? [];
    const memberIds = members.map((member) => member.profile_id);
    const conversationMessages = messagesByConversation.get(conversation.id) ?? [];
    const lastMessage = conversationMessages[conversationMessages.length - 1] ?? null;
    const titleMeta = resolveConversationTitle({
      type: conversation.type,
      currentProfileId: profileId,
      participantIds: memberIds,
      profilesById
    });

    return {
      id: conversation.id,
      type: conversation.type,
      title: titleMeta.title,
      avatar_url: titleMeta.avatarUrl,
      last_message: lastMessage?.content ?? null,
      last_message_at: lastMessage?.created_at ?? null,
      unread_count: toUnreadCount(conversationMessages, readMap.get(conversation.id) ?? null, profileId),
      other_profile_id: titleMeta.otherProfileId
    };
  });
}

export async function getMyConversations() {
  return buildConversationSummaries(getCurrentProfileId());
}

export async function createDirectConversationForCurrentProfile(partnerProfileId: string) {
  const currentProfileId = getCurrentProfileId();
  if (partnerProfileId === currentProfileId) {
    throw new AppError(400, "BAD_REQUEST", "Cannot create direct conversation with self");
  }

  const partnerProfiles = await listProfilesByIds([partnerProfileId]);
  if (partnerProfiles.length === 0) {
    throw new AppError(404, "NOT_FOUND", "Partner profile not found");
  }

  const myConversationIds = await listConversationIdsForProfile(currentProfileId);
  if (myConversationIds.length > 0) {
    const [candidateConversations, candidateParticipants] = await Promise.all([
      listConversationsByIds(myConversationIds),
      listParticipantsByConversationIds(myConversationIds)
    ]);

    const participantsByConversation = groupByConversation(candidateParticipants);
    const existing = candidateConversations.find((conversation) => {
      if (conversation.type !== "direct") {
        return false;
      }

      const ids = (participantsByConversation.get(conversation.id) ?? []).map((x) => x.profile_id);
      if (ids.length !== 2) {
        return false;
      }

      return ids.includes(currentProfileId) && ids.includes(partnerProfileId);
    });

    if (existing) {
      const summaries = await buildConversationSummaries(currentProfileId);
      return {
        created: false,
        conversation: summaries.find((summary) => summary.id === existing.id) ?? {
          id: existing.id,
          type: existing.type,
          title: partnerProfiles[0].name,
          avatar_url: partnerProfiles[0].avatar_url,
          last_message: null,
          last_message_at: null,
          unread_count: 0,
          other_profile_id: partnerProfileId
        }
      };
    }
  }

  const created = await createConversation("direct");
  await addConversationParticipants(created.id, [currentProfileId, partnerProfileId]);
  await upsertReadStates([
    {
      conversation_id: created.id,
      profile_id: currentProfileId,
      last_read_message_id: null
    },
    {
      conversation_id: created.id,
      profile_id: partnerProfileId,
      last_read_message_id: null
    }
  ]);

  const summaries = await buildConversationSummaries(currentProfileId);
  const summary = summaries.find((item) => item.id === created.id);
  if (!summary) {
    throw new AppError(500, "INTERNAL_ERROR", "Failed to load created conversation");
  }

  return {
    created: true,
    conversation: summary
  };
}

async function ensureConversationAccess(conversationId: string, profileId: string) {
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    throw new AppError(404, "NOT_FOUND", "Conversation not found");
  }

  const allowed = await isParticipant(conversationId, profileId);
  if (!allowed) {
    throw new AppError(403, "FORBIDDEN", "Not a participant of this conversation");
  }

  return conversation;
}

function toMessageDtos(messages: ChatMessageRecord[], profiles: BasicProfileRecord[]): MessageDto[] {
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile] as const));
  return messages.map((message) => {
    const sender = message.sender_profile_id ? profileMap.get(message.sender_profile_id) : undefined;
    return {
      id: message.id,
      conversation_id: message.conversation_id,
      sender_profile_id: message.sender_profile_id,
      sender_name: sender?.name ?? null,
      sender_avatar_url: sender?.avatar_url ?? null,
      content: message.content,
      message_type: message.message_type,
      created_at: message.created_at
    };
  });
}

export async function listConversationMessagesForCurrentProfile(input: {
  conversationId: string;
  limit: number;
  cursor?: string;
}) {
  const currentProfileId = getCurrentProfileId();
  await ensureConversationAccess(input.conversationId, currentProfileId);

  const messages = await listMessagesForConversation({
    conversationId: input.conversationId,
    limit: input.limit,
    cursor: input.cursor
  });

  const senderIds = Array.from(new Set(messages.map((message) => message.sender_profile_id).filter(Boolean))) as string[];
  const profiles = await listProfilesByIds(senderIds);

  return toMessageDtos(messages, profiles);
}

export async function sendMessageForCurrentProfile(input: { conversationId: string; content: string }) {
  const currentProfileId = getCurrentProfileId();
  await ensureConversationAccess(input.conversationId, currentProfileId);

  const content = input.content.trim();
  if (content.length === 0) {
    throw new AppError(400, "BAD_REQUEST", "Message content is required");
  }

  const inserted = await insertMessage({
    conversation_id: input.conversationId,
    sender_profile_id: currentProfileId,
    content,
    message_type: "text"
  });
  await touchConversation(input.conversationId);

  const profile = await listProfilesByIds([currentProfileId]);
  return toMessageDtos([inserted], profile)[0];
}

export async function markConversationReadForCurrentProfile(input: {
  conversationId: string;
  lastReadMessageId?: string;
}) {
  const currentProfileId = getCurrentProfileId();
  await ensureConversationAccess(input.conversationId, currentProfileId);

  let lastReadMessageId = input.lastReadMessageId ?? null;
  if (lastReadMessageId) {
    const message = await getMessageById(lastReadMessageId);
    if (!message || message.conversation_id !== input.conversationId) {
      throw new AppError(400, "BAD_REQUEST", "last_read_message_id does not belong to this conversation");
    }
  } else {
    const latest = await listMessagesForConversation({
      conversationId: input.conversationId,
      limit: 1
    });
    lastReadMessageId = latest[0]?.id ?? null;
  }

  await upsertReadStates([
    {
      conversation_id: input.conversationId,
      profile_id: currentProfileId,
      last_read_message_id: lastReadMessageId
    }
  ]);

  return {
    conversation_id: input.conversationId,
    last_read_message_id: lastReadMessageId
  };
}

export async function listNotificationsForCurrentProfile() {
  const currentProfileId = getCurrentProfileId();
  const summaries = await buildConversationSummaries(currentProfileId);
  const systemConversations = summaries.filter((summary) => summary.type === "system");

  if (systemConversations.length === 0) {
    return [];
  }

  const conversationIds = systemConversations.map((summary) => summary.id);
  const [messages, readStates] = await Promise.all([
    listMessagesByConversationIds(conversationIds),
    listReadStatesForProfile(currentProfileId, conversationIds)
  ]);

  const readMap = new Map(readStates.map((state) => [state.conversation_id, state.last_read_message_id] as const));
  const messagesByConversation = groupByConversation(messages);

  return systemConversations.flatMap((conversation) => {
    const convMessages = messagesByConversation.get(conversation.id) ?? [];
    const lastReadMessageId = readMap.get(conversation.id) ?? null;
    const readIndex = lastReadMessageId ? convMessages.findIndex((message) => message.id === lastReadMessageId) : -1;

    return convMessages.map((message, index) => ({
      id: message.id,
      conversation_id: conversation.id,
      content: message.content,
      created_at: message.created_at,
      is_read: readIndex >= 0 && index <= readIndex
    }));
  });
}
