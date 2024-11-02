<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

interface Message {
  id: string;
  sender: string;
  content: string;
}

interface Conversation {
  userId: string;
  username: string;
  avatar: string;
  messages: Message[];
}

const conversations = ref<Conversation[]>([]);
const { currentUsername } = storeToRefs(useUserStore());
const currentUserId = ref("");
const route = useRoute();
const router = useRouter();
const newMessage = ref("");
const showNewConversationModal = ref(false);
const newUsername = ref("");

// Fetch the logged-in user's ID
const fetchUserId = async () => {
  try {
    const result = await fetchy(`/api/users/${currentUsername.value}`, "GET");
    currentUserId.value = result._id;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

// Fetch conversations for the inbox
const fetchConversations = async () => {
  const fetchedConversationUsers = await fetchy("/api/conversations", "GET");
  for (const conversationUser of fetchedConversationUsers) {
    const convUser = await fetchy(`/api/userById/${conversationUser}`, "GET");
    const conversation: Conversation = {
      userId: conversationUser,
      username: convUser.username,
      avatar: "https://path-to-default-avatar.jpg",
      messages: [],
    };
    const messages = await fetchy(`/api/messages/${conversationUser}`, "GET");
    conversation.messages = messages;
    conversations.value.push(conversation);
  }
};

// Computed property to find the active conversation based on the userId in the URL
const activeConversation = computed(() => {
  const userId = route.params.id as string;
  return conversations.value.find((conversation) => conversation.userId === userId);
});

// Function to set active conversation and update URL with userId
const setActiveConversation = (userId: string) => {
  router.replace(`/inbox/${userId}`);
};

// Function to send a message
function sendMessage() {
  if (newMessage.value.trim() === "" || !activeConversation.value) return;

  const newMsg = {
    id: `m${Date.now()}`,
    sender: currentUserId.value,
    content: newMessage.value,
  };

  activeConversation.value.messages.push(newMsg);
  newMessage.value = "";

  fetchy(`/api/messages/`, "POST", {
    body: {
      recipient: activeConversation.value.userId,
      content: newMsg.content,
    },
  });
}

// Function to start a new conversation
const startNewConversation = async () => {
  if (!newUsername.value.trim()) return;
  const user = await fetchy(`/api/users/${newUsername.value.trim()}`, "GET");
  const userId = user._id;

  const newConversation = {
    userId: userId,
    username: newUsername.value,
    avatar: "https://path-to-default-avatar.jpg",
    messages: [],
  };
  conversations.value.push(newConversation);
  setActiveConversation(userId); // Navigate to the new conversation
  newUsername.value = "";
  showNewConversationModal.value = false;
};

// Watch for route changes to load conversations dynamically
watch(
  () => route.params.id,
  async (newUserId) => {
    if (newUserId && !conversations.value.find((conv) => conv.userId === newUserId)) {
      const convUser = await fetchy(`/api/userById/${newUserId}`, "GET");
      const messages = await fetchy(`/api/messages/${newUserId}`, "GET");
      const newConversation = {
        userId: newUserId as string,
        username: convUser.username,
        avatar: "https://path-to-default-avatar.jpg",
        messages: messages,
      };
      conversations.value.push(newConversation);
    }
  },
  { immediate: true },
);

onBeforeMount(async () => {
  await fetchConversations();
  await fetchUserId();
});
</script>

<template>
  <div class="inbox-container">
    <!-- Sidebar for Conversations -->
    <aside class="sidebar">
      <h2>Inbox</h2>
      <ul class="conversation-list">
        <li v-for="conversation in conversations" :key="conversation.userId" :class="{ active: conversation.userId === route.params.userId }" @click="setActiveConversation(conversation.userId)">
          <span class="username">{{ conversation.username }}</span>
        </li>
      </ul>
      <button class="new-conversation-btn" @click="showNewConversationModal = true">New Conversation</button>
    </aside>

    <!-- Main Chat Area -->
    <section class="chat-area" v-if="activeConversation">
      <div class="chat-header">
        <span class="username">{{ activeConversation.username }}</span>
      </div>

      <div class="messages">
        <div v-for="message in activeConversation.messages" :key="message.id" :class="['message', { 'message--sent': message.sender === currentUserId }]">
          <p>{{ message.content }}</p>
        </div>
      </div>

      <!-- Message Input -->
      <div class="message-input">
        <input type="text" v-model="newMessage" placeholder="Type a message..." @keyup.enter="sendMessage" />
        <button @click="sendMessage">Send</button>
      </div>
    </section>

    <!-- New Conversation Modal -->
    <div v-if="showNewConversationModal" class="modal-overlay">
      <div class="modal">
        <h3>Start New Conversation</h3>
        <input class="input-text" type="text" v-model="newUsername" placeholder="Enter username..." />
        <div class="modal-buttons">
          <button @click="startNewConversation" class="start-button">Start</button>
          <button @click="showNewConversationModal = false" class="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inbox-container {
  display: flex;
  height: 92vh;
  background-color: var(--color-ash-gray);
  font-family: Arial, sans-serif;
}

/* Sidebar Styling */
.sidebar {
  width: 250px;
  background-color: var(--color-moss-green);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.sidebar h2 {
  margin: 0 0 20px;
  font-size: 1.5em;
  color: #333;
  font-weight: bold;
  text-align: center;
}

.conversation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.conversation-list li {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background-color 0.3s;
}

.conversation-list li.active,
.conversation-list li:hover {
  background-color: #d0d0d0;
}

.username {
  font-weight: bold;
  color: #333;
}

.new-conversation-btn {
  margin-top: auto;
  padding: 10px;
  background-color: #6c7a46;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  font-size: 1em;
  font-weight: bold;
  transition: background-color 0.3s;
}

.new-conversation-btn:hover {
  background-color: #0056b3;
}

/* Chat Area Styling */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #dbe4c2;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: var(--color-sage-2);
  border-bottom: 1px solid #d0d0d0;
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
}

.messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message {
  max-width: 70%;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 10px;
  background-color: var(--color-tan);
  word-wrap: break-word;
}

.message--sent {
  align-self: flex-end;
  background-color: #abcb90;
}

.message-input {
  display: flex;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background-color: var(--color-sage-2);
}

.message-input input {
  flex: 1;
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-right: 10px;
}

.message-input button {
  padding: 10px 15px;
  font-size: 1em;
  background-color: var(--color-moss-green);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.message-input button:hover {
  background-color: #0056b3;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  max-width: 90%;
  text-align: center;
}

.modal h3 {
  margin-top: 0;
  font-size: 1.3em;
  color: #333;
  font-weight: bold;
}

.modal input {
  width: 80%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.start-button {
  padding: 10px 20px;
  font-size: 1em;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.start-button:hover {
  background-color: #0056b3;
}

.cancel-button {
  padding: 10px 20px;
  font-size: 1em;
  background-color: #ccc;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.cancel-button:hover {
  background-color: #999;
}
</style>
