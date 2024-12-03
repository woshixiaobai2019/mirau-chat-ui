<template>
  <div
    class="character-info-drawer"
    :class="{ 'drawer-visible': visible }"
    :style="{ width }"
  >
    <div class="drawer-header">
      <h3>Character Settings</h3>
      <el-button
        type="text"
        class="close-btn"
        @click="handleClose"
      >
        <el-icon :size="20"><Close /></el-icon>
      </el-button>
    </div>

    <div class="drawer-content">
      <!-- 角色信息 -->
      <div class="character-profile">
        <p class="section-title">Avatar</p>
          <div class="avatar-wrapper" v-if="characterConfig.avatar" >
            <el-avatar 
              :size="60" 
              :src="characterConfig.avatar"
              class="uploaded-avatar"
            />
          </div>
            <div class="upload-placeholder">
            <el-input
              v-model="characterConfig.avatar"
              placeholder="input avatar url"
              resize="none"
              :maxlength="200"
              show-word-limit
            />
        </div>
        <h4>{{characterConfig.name}}</h4>
      </div>

      <!-- 对话设置 -->
      <div class="conversation-settings">
        <h5>Conversation Settings</h5>
        
        <!-- Temperature 控制 -->
        <div class="setting-item">
          <div class="setting-header">
            <span>Temperature</span>
            <span class="setting-value">{{ characterConfig.temperature }}</span>
          </div>
          <el-slider
            v-model="characterConfig.temperature"
            :min="0"
            :max="1"
            :step="0.1"
            show-stops
          />
          <p class="setting-description">
            Higher values make the output more random, while lower values make it more focused and deterministic.
          </p>
        </div>

        <!-- Top P 控制 -->
        <div class="setting-item">
          <div class="setting-header">
            <span>Top P</span>
            <span class="setting-value">{{ characterConfig.topP }}</span>
          </div>
          <el-slider
            v-model="characterConfig.topP"
            :min="0"
            :max="1"
            :step="0.1"
            show-stops
          />
          <p class="setting-description">
            Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered.
          </p>
        </div>
      </div>

      <!-- 系统提示词 -->
      <div class="system-prompt">
        <h5>System Prompt</h5>
        <el-input
          v-model="characterConfig.systemPrompt"
          type="textarea"
          :rows="4"
          placeholder="Enter system prompt..."
        />
      </div>
            <!-- 系统提示词 -->
      <div class="system-prompt">
        <h5>Model</h5>
        <el-input
          v-model="characterConfig.model"
          :rows="1"
          placeholder="Enter model name..."
        />
      </div>
    </div>
  </div>
</template>

<script setup lang=ts>
import { ref, watch ,PropType} from 'vue'
import { Close } from '@element-plus/icons-vue'
import type { CharacterConfig } from '../types'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  width: {
    type: String, 
    default: '300px'
  },
  characterConfig: {
    type: Object as PropType<CharacterConfig>,
    default: () => ({
      model: "qwen2_5-instruct-14b",
      systemPrompt: "You are a helpful assistant.",
      temperature: 0.8,
      topP: 0.7,
      avatar: "https://a.520gexing.com/uploads/allimg/2021042109/uqaqhuvavt0.jpg",
      name: "mirau"
    })
  }
})

const emit = defineEmits(['update:visible',"saveCharater"])


const handleClose = () => {
  emit('update:visible', { visible: false})
  emit("saveCharater")
}

// 监听可见性变化，可以在这里处理动画
watch(() => props.visible, (newValue) => {
  // 可以在这里添加动画相关的逻辑
})
</script>

<style scoped>
.character-info-drawer {
  position: fixed;
  top: 0;
  right: -100%;
  height: 100vh;
  background-color: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  transition: right 0.3s ease-in-out;
  z-index: 1000;
}

.drawer-visible {
  right: 0;
}

.drawer-header {
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.close-btn {
  padding: 8px;
}

.drawer-content {
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 60px);
}

.character-profile {
  text-align: center;
  margin-bottom: 24px;
}

.character-avatar {
  margin-bottom: 12px;
}

.character-profile h4 {
  margin: 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.character-description {
  color: #666;
  font-size: 14px;
  margin: 8px 0;
}

.conversation-settings {
  margin-bottom: 24px;
}

h5 {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 16px 0;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.setting-value {
  color: #666;
}

.setting-description {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.system-prompt {
  margin-bottom: 24px;
}
</style>
