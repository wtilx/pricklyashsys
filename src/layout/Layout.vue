<template>
  <div class="layout">
    <el-container style="height: 100%">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar">
        <div class="logo">
          <img src="https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1" alt="Logo" />
          <span v-show="!isCollapse" class="logo-text">法律花椒说</span>
        </div>
        
        <el-menu
          :default-active="$route.path"
          :collapse="isCollapse"
          :unique-opened="true"
          router
          class="sidebar-menu"
        >
          <template v-for="route in menuRoutes" :key="route.path">
            <el-sub-menu v-if="route.children" :index="route.path">
              <template #title>
                <el-icon><component :is="route.meta?.icon" /></el-icon>
                <span>{{ route.meta?.title }}</span>
              </template>
              <el-menu-item
                v-for="child in route.children"
                :key="child.path"
                :index="child.path"
              >
                <el-icon><component :is="child.meta?.icon" /></el-icon>
                <span>{{ child.meta?.title }}</span>
              </el-menu-item>
            </el-sub-menu>
            
            <el-menu-item v-else :index="route.path">
              <el-icon><component :is="route.meta?.icon" /></el-icon>
              <span>{{ route.meta?.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航 -->
        <el-header class="header">
          <div class="header-left">
            <el-button
              :icon="isCollapse ? Expand : Fold"
              @click="toggleCollapse"
              text
              size="large"
            />
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRoute.meta?.title">
                {{ currentRoute.meta.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <el-badge :value="5" class="notification-badge">
              <el-button :icon="Bell" text size="large" />
            </el-badge>
            
            <el-dropdown @command="handleCommand">
              <div class="user-info">
                <el-avatar :src="userStore.userInfo.avatar" :size="32" />
                <span class="username">{{ userStore.userInfo.name }}</span>
                <el-icon class="arrow-down"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="settings">设置</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主要内容 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { Fold, Expand, Bell, ArrowDown } from '@element-plus/icons-vue'


const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)

const currentRoute = computed(() => route)

const menuRoutes = computed(() => {
  return router.getRoutes()
    .find(r => r.path === '/')
    ?.children?.filter(child => child.meta?.title) || []
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // 跳转到个人中心
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.layout {
  height: 100vh;
}

.sidebar {
  background: #001529;
  transition: width 0.3s;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid #1f1f1f;
}

.logo img {
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.logo-text {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-left: 12px;
}
.el-menu-item{
  background: #001529;
}
.sidebar-menu {
  border: none;
  background: #001529;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.65);
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.2);
}

.header {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge {
  margin-right: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #333;
}

.arrow-down {
  font-size: 12px;
  color: #999;
}

.main-content {
  background: #f5f5f5;
  padding: 24px;
}
</style>