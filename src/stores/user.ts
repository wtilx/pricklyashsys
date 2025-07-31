import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({
    id: 1,
    username: 'admin',
    name: '系统管理员',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    role: 'admin',
    permissions: ['all']
  })

  const isLoggedIn = ref(true)

  const login = async (credentials: { username: string; password: string }) => {
    // 模拟登录
    if (credentials.username === 'admin' && credentials.password === '123456') {
      isLoggedIn.value = true
      return { success: true }
    }
    return { success: false, message: '用户名或密码错误' }
  }

  const logout = async () => {
    isLoggedIn.value = false
    userInfo.value = {} as any
    await userApi.logout().then(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    })
  }

  return {
    userInfo,
    isLoggedIn,
    login,
    logout
  }
})