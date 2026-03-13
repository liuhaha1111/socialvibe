import { AppError } from "../lib/errors.js";
import { getActivityById } from "../repositories/activityRepository.js";
import {
  createMessage,
  ensureConversationMember,
  getLatestMessage,
  getOrCreateActivityConversation,
  getOrCreateDirectConversation,
  isConversationMember,
  listConversationMembers,
  listConversationsForProfile,
  listMessages
} from "../repositories/chatRepository.js";
import { getProfileById } from "../repositories/profileRepository.js";
import { assertAreFriends } from "./friendService.js";
import { ensureProfileForAuthUser } from "./profileService.js";

export async function ensureActivityGroupConversation(activityId: string, hostProfileId: string) {
  const conversation = await getOrCreateActivityConversation(activityId);
  await ensureConversationMember(conversation.id, hostProfileId, "owner");
  return conversation;
}

export async function addProfileToActivityGroup(activityId: string, profileId: string) {
  const conversation = await getOrCreateActivityConversation(activityId);
  await ensureConversationMember(conversation.id, profileId, "member");
  return conversation;
}

export async function getOrCreateDirectConversationForAuthUser(
  authUserId: string,
  friendProfileId: string,
  email?: string
) {
  const me = await ensureProfileForAuthUser(authUserId, email);
  if (me.id === friendProfileId) {
    throw new AppError(400, "BAD_REQUEST", "Cannot chat with yourself");
  }
  await assertAreFriends(me.id, friendProfileId);

  const conversation = await getOrCreateDirectConversation(me.id, friendProfileId);
  await Promise.all([
    ensureConversationMember(conversation.id, me.id, "member"),
    ensureConversationMember(conversation.id, friendProfileId, "member")
  ]);
  return conversation;
}

export async function listConversationsForAuthUser(authUserId: string, email?: string) {
  const me = await ensureProfileForAuthUser(authUserId, email);
  const conversations = await listConversationsForProfile(me.id);

  return Promise.all(
    conversations.map(async (conversation) => {
      const [latestMessage, members] = await Promise.all([
        getLatestMessage(conversation.id),
        listConversationMembers(conversation.id)
      ]);

      if (conversation.type === "direct") {
        const peerMember = members.find((member) => member.profile_id !== me.id);
        const peer = peerMember ? await getProfileById(peerMember.profile_id) : null;
        return {
          id: conversation.id,
          type: conversation.type,
          title: peer?.name ?? "好友聊天",
          avatar_url: peer?.avatar_url ?? null,
          latest_message: latestMessage
        };
      }

      const activity = conversation.activity_id ? await getActivityById(conversation.activity_id) : null;
      return {
        id: conversation.id,
        type: conversation.type,
        title: activity?.title ?? "活动群聊",
        avatar_url: null,
        activity_id: conversation.activity_id,
        latest_message: latestMessage
      };
    })
  );
}

export async function getConversationMessagesForAuthUser(authUserId: string, conversationId: string, email?: string) {
  const me = await ensureProfileForAuthUser(authUserId, email);
  if (!(await isConversationMember(conversationId, me.id))) {
    throw new AppError(403, "FORBIDDEN", "Not a conversation member");
  }
  return listMessages(conversationId, 200);
}

export async function sendMessageForAuthUser(
  authUserId: string,
  conversationId: string,
  content: string,
  email?: string
) {
  const me = await ensureProfileForAuthUser(authUserId, email);
  if (!(await isConversationMember(conversationId, me.id))) {
    throw new AppError(403, "FORBIDDEN", "Not a conversation member");
  }
  const trimmed = content.trim();
  if (!trimmed) {
    throw new AppError(400, "BAD_REQUEST", "Message content is required");
  }
  return createMessage(conversationId, me.id, trimmed);
}
