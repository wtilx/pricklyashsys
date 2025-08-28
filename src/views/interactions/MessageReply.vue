<template>
  <div class="customer-service-container">
    <!-- 头部 -->
    <div class="header">
      <div class="header-info">
        <div class="avatar">
          <img src="../../assets/headset.png" alt="客服头像" />
        </div>
        <div class="info">
          <h3>在线客服</h3>
          <span class="status">{{ isOnline ? '在线' : '离线' }}</span>
        </div>
      </div>
      <div class="actions">
        <button @click="clearMessages" class="clear-btn">清空对话</button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesContainer">
      <div class="messages-list">
        <div 
          v-for="message in messages" 
          :key="message.id"
          :class="['message', message.senderType == '1' ? 'service' : 'user']"
        >
          <div class="message-avatar">
            <img 
              :src="message.senderType == '1' ? serviceAvatar : userAvatar" 
              :alt="message.senderType == '1' ? '客服头像' : '用户头像'"
            />
          </div>
          <div class="message-content">
            <div class="message-info">
              <span class="sender">{{ message.senderType === '1' ? '客服小助手' : '' }}</span>
              <span class="time">{{ formatTime(message.createTime) }}</span>
            </div>
            <div class="message-text">{{ message.content }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-container">
        <textarea
          v-model="newMessage"
          @keydown.enter.prevent="handleEnterKey"
          placeholder="请输入回复内容..."
          class="message-input"
          rows="3"
        ></textarea>
        <div class="input-actions">
          <div class="quick-replies">
            <button 
              v-for="reply in quickReplies" 
              :key="reply"
              @click="insertQuickReply(reply)"
              class="quick-reply-btn"
            >
              {{ reply }}
            </button>
          </div>
          <div class="send-area">
            <button @click="sendMessage" :disabled="!newMessage.trim()" class="send-btn">
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import serviceAvatar from '../../assets/headset.png'
import userAvatar from '../../assets/user.png'
import { csApi } from '@/api'

// 响应式数据
const messages = ref([
  {
    id: 1,
    type: 'user',
    content: '你好，我想咨询一下产品相关问题',
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: 2,
    type: 'service',
    content: '您好！很高兴为您服务，请问您想了解哪方面的产品信息呢？',
    timestamp: new Date(Date.now() - 240000)
  },
  {
    id: 3,
    type: 'user',
    content: '我想了解一下价格和功能特点',
    timestamp: new Date(Date.now() - 180000)
  }
])

onMounted(() => {
 getMessageList(1)
})

const getMessageList = (id) => {
  csApi.getMessageList({sessionId: id}).then(res => {
    messages.value = res.data.data.list
  })
}



const newMessage = ref('')
const isOnline = ref(true)
const messagesContainer = ref(null)

// 快捷回复
const quickReplies = ref([
  '感谢您的咨询',
  '请稍等，我为您查询',
  '还有其他问题吗？',
  '祝您生活愉快',
  '如需进一步帮助，请随时联系我们'
])

// 方法
const sendMessage = () => {
  if (!newMessage.value.trim()) return
  csApi.sendMessage(1,{
    content: newMessage.value.trim()
  }).then(res => {
    getMessageList(1)
  })

  // const message = {
  //   id: Date.now(),
  //   type: 'service',
  //   content: newMessage.value.trim(),
  //   timestamp: new Date()
  // }

  // messages.value.push(message)
  // newMessage.value = ''
  
  // // 滚动到底部
  // nextTick(() => {
  //   scrollToBottom()
  // })

  // // 模拟用户回复
  // setTimeout(() => {
  //   simulateUserReply()
  // }, 2000)
}

const handleEnterKey = (event) => {
  if (event.ctrlKey || event.metaKey) {
    // Ctrl+Enter 或 Cmd+Enter 发送消息
    sendMessage()
  } else {
    // 普通 Enter 换行
    return true
  }
}

const insertQuickReply = (reply) => {
  newMessage.value = reply
}

const clearMessages = () => {
  if (confirm('确定要清空所有对话记录吗？')) {
    messages.value = []
  }
}

const formatTime = (timestamp) => {
  const now = new Date()
  const messageTime = new Date(timestamp)
  const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60))
  
  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`
  
  return messageTime.toLocaleDateString() + ' ' + messageTime.toLocaleTimeString().slice(0, 5)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const simulateUserReply = () => {
  const userReplies = [
    '好的，谢谢您的回复',
    '我明白了',
    '还想再了解一下其他方面',
    '这个解答很有帮助',
    '请问还有优惠活动吗？'
  ]
  
  const randomReply = userReplies[Math.floor(Math.random() * userReplies.length)]
  
  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: randomReply,
    timestamp: new Date()
  }
  
  messages.value.push(userMessage)
  
  nextTick(() => {
    scrollToBottom()
  })
}

// 组件挂载时滚动到底部
onMounted(() => {
  nextTick(() => {
    scrollToBottom()
  })
})
</script>

<style scoped>
.customer-service-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.info h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.status {
  font-size: 12px;
  color: #52c41a;
}

.clear-btn {
  padding: 6px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #666;
}

.clear-btn:hover {
  background: #e6e6e6;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
}

.message.service {
  flex-direction: row-reverse;
}

.message-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
}

.message.service .message-content {
  text-align: right;
}

.message-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.message.service .message-info {
  justify-content: flex-end;
}

.sender {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.time {
  font-size: 11px;
  color: #999;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  color: #333;
  line-height: 1.4;
  word-wrap: break-word;
}

.message.service .message-text {
  background: #1890ff;
  color: #fff;
}

.input-area {
  background: #fff;
  border-top: 1px solid #e5e5e5;
  padding: 16px 20px;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
}

.message-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-reply-btn {
  padding: 4px 8px;
  background: #f0f0f0;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.quick-reply-btn:hover {
  background: #e6e6e6;
}

.send-area {
  display: flex;
  gap: 8px;
}

.send-btn {
  padding: 8px 24px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.send-btn:hover:not(:disabled) {
  background: #40a9ff;
}

.send-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .customer-service-container {
    height: 100vh;
    border-radius: 0;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .quick-replies {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .input-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .send-area {
    justify-content: flex-end;
  }
}
</style>