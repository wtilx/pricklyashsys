<template>
  <div class="profile">
    <el-card>
      <template #header>
        <span>个人中心</span>
      </template>

      <el-tabs v-model="activeTab" tab-position="left">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <div class="profile-section">
            <h3>个人信息</h3>
            <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="100px">
              <div class="avatar-section">
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="false"
                  :auto-upload="false"
                  :before-upload="beforeAvatarUpload"
                >
                  <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="avatar-info">
                  <h4>{{ profileForm.name }}</h4>
                  <p>{{ profileForm.role === 'admin' ? '系统管理员' : '普通用户' }}</p>
                  <el-button size="small" @click="handleAvatarUpload">更换头像</el-button>
                </div>
              </div>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="profileForm.username" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="姓名" prop="name">
                    <el-input v-model="profileForm.name" placeholder="请输入姓名" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="手机号" prop="phone">
                    <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="部门">
                    <el-input v-model="profileForm.department" placeholder="请输入部门" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="职位">
                    <el-input v-model="profileForm.position" placeholder="请输入职位" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="个人简介">
                <el-input
                  v-model="profileForm.bio"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入个人简介"
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleUpdateProfile">保存修改</el-button>
                <el-button @click="handleResetProfile">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <div class="profile-section">
            <h3>修改密码</h3>
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px">
              <el-form-item label="当前密码" prop="currentPassword">
                <el-input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  placeholder="请输入当前密码"
                  show-password
                />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
                <el-button @click="handleResetPassword">重置</el-button>
              </el-form-item>
            </el-form>

            <h3>登录设备管理</h3>
            <el-table :data="loginDevices" stripe>
              <el-table-column prop="device" label="设备类型" width="120" />
              <el-table-column prop="browser" label="浏览器" width="150" />
              <el-table-column prop="ip" label="IP地址" width="150" />
              <el-table-column prop="location" label="登录地点" width="150" />
              <el-table-column prop="loginTime" label="登录时间" width="180" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'online' ? 'success' : 'info'">
                    {{ row.status === 'online' ? '在线' : '离线' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button 
                    v-if="!row.current" 
                    type="danger" 
                    size="small" 
                    @click="handleLogoutDevice(row)"
                  >
                    强制下线
                  </el-button>
                  <el-tag v-else type="primary" size="small">当前设备</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 操作日志 -->
        <el-tab-pane label="操作日志" name="logs">
          <div class="profile-section">
            <h3>操作记录</h3>
            
            <div class="logs-filter">
              <el-form :model="logsFilter" inline>
                <el-form-item label="操作类型">
                  <el-select v-model="logsFilter.type" placeholder="请选择类型" clearable style="width: 150px">
                    <el-option label="登录" value="login" />
                    <el-option label="登出" value="logout" />
                    <el-option label="创建" value="create" />
                    <el-option label="编辑" value="edit" />
                    <el-option label="删除" value="delete" />
                  </el-select>
                </el-form-item>
                <el-form-item label="时间范围">
                  <el-date-picker
                    v-model="logsFilter.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    size="default"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSearchLogs">查询</el-button>
                  <el-button @click="handleResetLogs">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <el-table :data="operationLogs" stripe v-loading="logsLoading">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="type" label="操作类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getLogType(row.type)">
                    {{ getLogTypeName(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="module" label="操作模块" width="120" />
              <el-table-column prop="description" label="操作描述" min-width="200" />
              <el-table-column prop="ip" label="IP地址" width="130" />
              <el-table-column prop="userAgent" label="用户代理" width="200" show-overflow-tooltip />
              <el-table-column prop="createTime" label="操作时间" width="180" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                    {{ row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination">
              <el-pagination
                v-model:current-page="logsPagination.currentPage"
                v-model:page-size="logsPagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="logsPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleLogsSizeChange"
                @current-change="handleLogsCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 系统偏好 -->
        <el-tab-pane label="系统偏好" name="preferences">
          <div class="profile-section">
            <h3>界面设置</h3>
            <el-form :model="preferencesForm" label-width="120px">
              <el-form-item label="主题模式">
                <el-radio-group v-model="preferencesForm.theme">
                  <el-radio label="light">浅色模式</el-radio>
                  <el-radio label="dark">深色模式</el-radio>
                  <el-radio label="auto">跟随系统</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="语言设置">
                <el-select v-model="preferencesForm.language" style="width: 200px">
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                </el-select>
              </el-form-item>

              <el-form-item label="侧边栏折叠">
                <el-switch v-model="preferencesForm.sidebarCollapsed" />
              </el-form-item>

              <el-form-item label="页面动画">
                <el-switch v-model="preferencesForm.pageAnimation" />
              </el-form-item>
            </el-form>

            <h3>通知设置</h3>
            <el-form :model="preferencesForm" label-width="120px">
              <el-form-item label="邮件通知">
                <el-switch v-model="preferencesForm.emailNotification" />
              </el-form-item>

              <el-form-item label="短信通知">
                <el-switch v-model="preferencesForm.smsNotification" />
              </el-form-item>

              <el-form-item label="浏览器通知">
                <el-switch v-model="preferencesForm.browserNotification" />
              </el-form-item>

              <el-form-item label="系统消息">
                <el-switch v-model="preferencesForm.systemMessage" />
              </el-form-item>
            </el-form>

            <el-form-item>
              <el-button type="primary" @click="handleSavePreferences">保存设置</el-button>
              <el-button @click="handleResetPreferences">恢复默认</el-button>
            </el-form-item>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const activeTab = ref('basic')
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const logsLoading = ref(false)

// 个人信息表单
const profileForm = reactive({
  username: 'admin',
  name: '系统管理员',
  email: 'admin@legal.com',
  phone: '13800138000',
  department: '技术部',
  position: '系统管理员',
  bio: '负责系统的日常维护和管理工作',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
  role: 'admin'
})

const profileRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  currentPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 登录设备
const loginDevices = ref([
  {
    id: 1,
    device: 'Windows PC',
    browser: 'Chrome 120.0',
    ip: '192.168.1.100',
    location: '北京市',
    loginTime: '2024-01-18 09:30:00',
    status: 'online',
    current: true
  },
  {
    id: 2,
    device: 'iPhone',
    browser: 'Safari 17.0',
    ip: '192.168.1.101',
    location: '北京市',
    loginTime: '2024-01-17 18:20:00',
    status: 'offline',
    current: false
  }
])

// 操作日志
const logsFilter = reactive({
  type: '',
  dateRange: null
})

const logsPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const operationLogs = ref([
  {
    id: 1,
    type: 'login',
    module: '系统登录',
    description: '用户登录系统',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createTime: '2024-01-18 09:30:00',
    status: 'success'
  },
  {
    id: 2,
    type: 'edit',
    module: '用户管理',
    description: '编辑用户信息',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createTime: '2024-01-18 10:15:00',
    status: 'success'
  },
  {
    id: 3,
    type: 'create',
    module: '内容管理',
    description: '创建法律资讯',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createTime: '2024-01-18 11:20:00',
    status: 'success'
  }
])

// 系统偏好设置
const preferencesForm = reactive({
  theme: 'light',
  language: 'zh-CN',
  sidebarCollapsed: false,
  pageAnimation: true,
  emailNotification: true,
  smsNotification: false,
  browserNotification: true,
  systemMessage: true
})

const getLogTypeName = (type: string) => {
  const map: Record<string, string> = {
    login: '登录',
    logout: '登出',
    create: '创建',
    edit: '编辑',
    delete: '删除'
  }
  return map[type] || type
}

const getLogType = (type: string) => {
  const map: Record<string, string> = {
    login: 'success',
    logout: 'info',
    create: 'primary',
    edit: 'warning',
    delete: 'danger'
  }
  return map[type] || 'primary'
}

const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

const handleAvatarUpload = () => {
  ElMessage.info('头像上传功能开发中...')
}

const handleUpdateProfile = async () => {
  if (!profileFormRef.value) return
  
  await profileFormRef.value.validate((valid) => {
    if (valid) {
      // 更新用户信息
      Object.assign(userStore.userInfo, profileForm)
      ElMessage.success('个人信息更新成功')
    }
  })
}

const handleResetProfile = () => {
  profileFormRef.value?.resetFields()
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟密码修改
      if (passwordForm.currentPassword !== '123456') {
        ElMessage.error('当前密码不正确')
        return
      }
      
      ElMessage.success('密码修改成功，请重新登录')
      // 重置表单
      Object.assign(passwordForm, {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  })
}

const handleResetPassword = () => {
  passwordFormRef.value?.resetFields()
}

const handleLogoutDevice = async (device: any) => {
  try {
    await ElMessageBox.confirm('确认强制该设备下线吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    device.status = 'offline'
    ElMessage.success('设备已强制下线')
  } catch {
    // 用户取消
  }
}

const handleSearchLogs = () => {
  logsLoading.value = true
  setTimeout(() => {
    logsLoading.value = false
    ElMessage.success('查询完成')
  }, 1000)
}

const handleResetLogs = () => {
  Object.assign(logsFilter, {
    type: '',
    dateRange: null
  })
}

const handleLogsSizeChange = (size: number) => {
  logsPagination.pageSize = size
}

const handleLogsCurrentChange = (page: number) => {
  logsPagination.currentPage = page
}

const handleSavePreferences = () => {
  ElMessage.success('偏好设置保存成功')
}

const handleResetPreferences = () => {
  Object.assign(preferencesForm, {
    theme: 'light',
    language: 'zh-CN',
    sidebarCollapsed: false,
    pageAnimation: true,
    emailNotification: true,
    smsNotification: false,
    browserNotification: true,
    systemMessage: true
  })
  ElMessage.success('已恢复默认设置')
}

onMounted(() => {
  logsPagination.total = operationLogs.value.length
})
</script>

<style scoped>
.profile {
  padding: 0;
}

.profile-section {
  padding: 20px;
}

.profile-section h3 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
}

.avatar-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
}

.avatar-info p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.logs-filter {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .profile :deep(.el-tabs--left .el-tabs__header) {
    width: 100%;
  }
  
  .profile :deep(.el-tabs--left .el-tabs__content) {
    padding-left: 0;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
  
  .logs-filter :deep(.el-form) {
    flex-direction: column;
  }
  
  .logs-filter :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>