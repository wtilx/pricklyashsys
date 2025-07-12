<template>
  <div class="settings">
    <el-card>
      <template #header>
        <span>系统设置</span>
      </template>

      <el-tabs v-model="activeTab" tab-position="left">
        <!-- 基础设置 -->
        <el-tab-pane label="基础设置" name="basic">
          <div class="settings-section">
            <h3>网站基本信息</h3>
            <el-form :model="basicSettings" label-width="120px">
              <el-form-item label="网站名称">
                <el-input v-model="basicSettings.siteName" placeholder="请输入网站名称" />
              </el-form-item>
              <el-form-item label="网站描述">
                <el-input
                  v-model="basicSettings.siteDescription"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入网站描述"
                />
              </el-form-item>
              <el-form-item label="网站LOGO">
                <el-upload
                  class="logo-uploader"
                  action="#"
                  :show-file-list="false"
                  :auto-upload="false"
                >
                  <img v-if="basicSettings.siteLogo" :src="basicSettings.siteLogo" class="logo-preview" />
                  <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
                </el-upload>
              </el-form-item>
              <el-form-item label="联系电话">
                <el-input v-model="basicSettings.contactPhone" placeholder="请输入联系电话" />
              </el-form-item>
              <el-form-item label="联系邮箱">
                <el-input v-model="basicSettings.contactEmail" placeholder="请输入联系邮箱" />
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input v-model="basicSettings.companyAddress" placeholder="请输入公司地址" />
              </el-form-item>
              <el-form-item label="版权信息">
                <el-input v-model="basicSettings.copyright" placeholder="请输入版权信息" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveBasic">保存设置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 权限管理 -->
        <el-tab-pane label="权限管理" name="permissions">
          <div class="settings-section">
            <h3>角色权限配置</h3>
            <div class="roles-management">
              <div class="roles-header">
                <el-button type="primary" @click="handleAddRole">添加角色</el-button>
              </div>
              
              <el-table :data="rolesData" stripe>
                <el-table-column prop="name" label="角色名称" width="150" />
                <el-table-column prop="description" label="角色描述" min-width="200" />
                <el-table-column prop="userCount" label="用户数量" width="100" />
                <el-table-column prop="createTime" label="创建时间" width="150" />
                <el-table-column label="操作" width="200">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="handleEditRole(row)">编辑</el-button>
                    <el-button type="info" size="small" @click="handleSetPermissions(row)">权限</el-button>
                    <el-button type="danger" size="small" @click="handleDeleteRole(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <div class="settings-section">
            <h3>账号安全设置</h3>
            <el-form :model="securitySettings" label-width="150px">
              <el-form-item label="密码强度要求">
                <el-checkbox-group v-model="securitySettings.passwordRequirements">
                  <el-checkbox label="minLength" value="minLength8">最少8位字符</el-checkbox>
                  <el-checkbox label="uppercase" value="uppercase">包含大写字母</el-checkbox>
                  <el-checkbox label="lowercase" value="lowercase">包含小写字母</el-checkbox>
                  <el-checkbox label="numbers" value="numbers">包含数字</el-checkbox>
                  <el-checkbox label="symbols" value="symbols">包含特殊字符</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="登录验证方式">
                <el-checkbox-group v-model="securitySettings.loginVerification">
                  <el-checkbox label="sms" value="sms">短信验证</el-checkbox>
                  <el-checkbox label="email" value="email">邮箱验证</el-checkbox>
                  <el-checkbox label="captcha" value="captcha">图形验证码</el-checkbox>
                  <el-checkbox label="twoFactor" value="twoFactor">双因子认证</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="会话超时时间">
                <el-select v-model="securitySettings.sessionTimeout" placeholder="请选择超时时间">
                  <el-option label="30分钟" value="30" />
                  <el-option label="1小时" value="60" />
                  <el-option label="2小时" value="120" />
                  <el-option label="4小时" value="240" />
                  <el-option label="8小时" value="480" />
                </el-select>
              </el-form-item>
              <el-form-item label="登录失败限制">
                <el-input-number v-model="securitySettings.maxLoginAttempts" :min="3" :max="10" />
                <span class="form-tip">连续登录失败次数超过此值将锁定账号</span>
              </el-form-item>
              <el-form-item label="IP白名单">
                <el-input
                  v-model="securitySettings.ipWhitelist"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入IP地址，每行一个"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveSecurity">保存设置</el-button>
              </el-form-item>
            </el-form>

            <h3>内容安全设置</h3>
            <el-form :model="contentSecurity" label-width="150px">
              <el-form-item label="敏感词过滤">
                <el-switch v-model="contentSecurity.enableSensitiveFilter" />
              </el-form-item>
              <el-form-item label="敏感词库" v-if="contentSecurity.enableSensitiveFilter">
                <el-input
                  v-model="contentSecurity.sensitiveWords"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入敏感词，用逗号分隔"
                />
              </el-form-item>
              <el-form-item label="内容审核">
                <el-radio-group v-model="contentSecurity.contentReview">
                  <el-radio label="auto" value="auto">自动审核</el-radio>
                  <el-radio label="manual" value="manual">人工审核</el-radio>
                  <el-radio label="mixed" value="mixed">混合审核</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="文件上传限制">
                <el-input-number v-model="contentSecurity.maxFileSize" :min="1" :max="100" />
                <span class="form-tip">MB</span>
              </el-form-item>
              <el-form-item label="允许的文件类型">
                <el-checkbox-group v-model="contentSecurity.allowedFileTypes">
                  <el-checkbox label="pdf" value="pdf">PDF</el-checkbox>
                  <el-checkbox label="doc" value="doc">DOC/DOCX</el-checkbox>
                  <el-checkbox label="image" value="image">图片</el-checkbox>
                  <el-checkbox label="video" value="video">视频</el-checkbox>
                  <el-checkbox label="audio" value="audio">音频</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveContentSecurity">保存设置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notifications">
          <div class="settings-section">
            <h3>消息通知配置</h3>
            <el-form :model="notificationSettings" label-width="150px">
              <el-form-item label="邮件通知">
                <el-switch v-model="notificationSettings.emailEnabled" />
              </el-form-item>
              <div v-if="notificationSettings.emailEnabled" class="email-config">
                <el-form-item label="SMTP服务器">
                  <el-input v-model="notificationSettings.smtpHost" placeholder="请输入SMTP服务器地址" />
                </el-form-item>
                <el-form-item label="SMTP端口">
                  <el-input-number v-model="notificationSettings.smtpPort" :min="1" :max="65535" />
                </el-form-item>
                <el-form-item label="发件人邮箱">
                  <el-input v-model="notificationSettings.senderEmail" placeholder="请输入发件人邮箱" />
                </el-form-item>
                <el-form-item label="邮箱密码">
                  <el-input v-model="notificationSettings.emailPassword" type="password" placeholder="请输入邮箱密码" />
                </el-form-item>
              </div>

              <el-form-item label="短信通知">
                <el-switch v-model="notificationSettings.smsEnabled" />
              </el-form-item>
              <div v-if="notificationSettings.smsEnabled" class="sms-config">
                <el-form-item label="短信平台">
                  <el-select v-model="notificationSettings.smsProvider" placeholder="请选择短信平台">
                    <el-option label="阿里云" value="aliyun" />
                    <el-option label="腾讯云" value="tencent" />
                    <el-option label="华为云" value="huawei" />
                  </el-select>
                </el-form-item>
                <el-form-item label="AccessKey">
                  <el-input v-model="notificationSettings.smsAccessKey" placeholder="请输入AccessKey" />
                </el-form-item>
                <el-form-item label="SecretKey">
                  <el-input v-model="notificationSettings.smsSecretKey" type="password" placeholder="请输入SecretKey" />
                </el-form-item>
              </div>

              <el-form-item label="通知模板">
                <el-table :data="notificationTemplates" stripe>
                  <el-table-column prop="name" label="模板名称" width="150" />
                  <el-table-column prop="type" label="通知类型" width="100" />
                  <el-table-column prop="title" label="标题" min-width="200" />
                  <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                      <el-button type="primary" size="small" @click="handleEditTemplate(row)">编辑</el-button>
                      <el-button type="info" size="small" @click="handlePreviewTemplate(row)">预览</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleSaveNotifications">保存设置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 系统维护 -->
        <el-tab-pane label="系统维护" name="maintenance">
          <div class="settings-section">
            <h3>系统维护工具</h3>
            
            <div class="maintenance-tools">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-card class="tool-card">
                    <template #header>
                      <span>数据备份</span>
                    </template>
                    <p>定期备份系统数据，确保数据安全</p>
                    <el-button type="primary" @click="handleBackupData">立即备份</el-button>
                  </el-card>
                </el-col>
                
                <el-col :span="8">
                  <el-card class="tool-card">
                    <template #header>
                      <span>缓存清理</span>
                    </template>
                    <p>清理系统缓存，提升系统性能</p>
                    <el-button type="warning" @click="handleClearCache">清理缓存</el-button>
                  </el-card>
                </el-col>
                
                <el-col :span="8">
                  <el-card class="tool-card">
                    <template #header>
                      <span>日志管理</span>
                    </template>
                    <p>查看和管理系统运行日志</p>
                    <el-button type="info" @click="handleViewLogs">查看日志</el-button>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <h3>系统信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
              <el-descriptions-item label="数据库版本">MySQL 8.0</el-descriptions-item>
              <el-descriptions-item label="服务器系统">Linux Ubuntu 20.04</el-descriptions-item>
              <el-descriptions-item label="PHP版本">PHP 8.1</el-descriptions-item>
              <el-descriptions-item label="运行时间">15天 8小时 32分钟</el-descriptions-item>
              <el-descriptions-item label="内存使用">2.1GB / 8GB</el-descriptions-item>
              <el-descriptions-item label="磁盘使用">45GB / 100GB</el-descriptions-item>
              <el-descriptions-item label="最后更新">2024-01-15 10:30:00</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 角色编辑对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="roleDialogTitle"
      width="600px"
    >
      <el-form :model="roleForm" label-width="100px">
        <el-form-item label="角色名称" required>
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRole">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限设置对话框 -->
    <el-dialog
      v-model="permissionsDialogVisible"
      title="权限设置"
      width="800px"
    >
      <div class="permissions-tree">
        <el-tree
          ref="permissionsTreeRef"
          :data="permissionsData"
          :props="{ children: 'children', label: 'name' }"
          node-key="id"
          show-checkbox
          :default-checked-keys="selectedPermissions"
        />
      </div>
      
      <template #footer>
        <el-button @click="permissionsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions">保存权限</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const activeTab = ref('basic')
const roleDialogVisible = ref(false)
const permissionsDialogVisible = ref(false)
const roleDialogTitle = ref('添加角色')
const selectedRole = ref<any>(null)
const selectedPermissions = ref<string[]>([])

const basicSettings = reactive({
  siteName: '法律花椒说',
  siteDescription: '专业的法律服务平台，为用户提供优质的法律咨询和服务',
  siteLogo: 'https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
  contactPhone: '400-123-4567',
  contactEmail: 'contact@legal.com',
  companyAddress: '北京市朝阳区xxx大厦xxx室',
  copyright: '© 2024 法律花椒说 版权所有'
})

const securitySettings = reactive({
  passwordRequirements: ['minLength', 'uppercase', 'numbers'],
  loginVerification: ['captcha'],
  sessionTimeout: '120',
  maxLoginAttempts: 5,
  ipWhitelist: ''
})

const contentSecurity = reactive({
  enableSensitiveFilter: true,
  sensitiveWords: '违法,诈骗,暴力,色情',
  contentReview: 'mixed',
  maxFileSize: 10,
  allowedFileTypes: ['pdf', 'doc', 'image']
})

const notificationSettings = reactive({
  emailEnabled: true,
  smtpHost: 'smtp.qq.com',
  smtpPort: 587,
  senderEmail: 'noreply@legal.com',
  emailPassword: '',
  smsEnabled: false,
  smsProvider: 'aliyun',
  smsAccessKey: '',
  smsSecretKey: ''
})

const roleForm = reactive({
  name: '',
  description: ''
})

const rolesData = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '拥有系统所有权限',
    userCount: 2,
    createTime: '2024-01-01 10:00'
  },
  {
    id: 2,
    name: '内容管理员',
    description: '负责内容审核和管理',
    userCount: 5,
    createTime: '2024-01-02 14:30'
  },
  {
    id: 3,
    name: '专家',
    description: '法律专家，可回复咨询',
    userCount: 15,
    createTime: '2024-01-03 09:15'
  }
])

const permissionsData = ref([
  {
    id: 1,
    name: '内容管理',
    children: [
      { id: 11, name: '法律资讯管理' },
      { id: 12, name: '知识库管理' },
      { id: 13, name: '热门话题管理' }
    ]
  },
  {
    id: 2,
    name: '用户管理',
    children: [
      { id: 21, name: '会员管理' },
      { id: 22, name: '专家管理' }
    ]
  },
  {
    id: 3,
    name: '业务管理',
    children: [
      { id: 31, name: '活动管理' },
      { id: 32, name: '课程管理' },
      { id: 33, name: '项目管理' }
    ]
  },
  {
    id: 4,
    name: '互动管理',
    children: [
      { id: 41, name: '法律咨询' },
      { id: 42, name: '互助问答' }
    ]
  },
  {
    id: 5,
    name: '系统管理',
    children: [
      { id: 51, name: '数据统计' },
      { id: 52, name: '系统设置' }
    ]
  }
])

const notificationTemplates = ref([
  {
    id: 1,
    name: '用户注册',
    type: '邮件',
    title: '欢迎注册法律花椒说'
  },
  {
    id: 2,
    name: '咨询回复',
    type: '短信',
    title: '您的法律咨询已有专家回复'
  },
  {
    id: 3,
    name: '活动通知',
    type: '邮件',
    title: '法律讲座活动邀请'
  }
])

const handleSaveBasic = () => {
  ElMessage.success('基础设置保存成功')
}

const handleSaveSecurity = () => {
  ElMessage.success('安全设置保存成功')
}

const handleSaveContentSecurity = () => {
  ElMessage.success('内容安全设置保存成功')
}

const handleSaveNotifications = () => {
  ElMessage.success('通知设置保存成功')
}

const handleAddRole = () => {
  roleDialogTitle.value = '添加角色'
  Object.assign(roleForm, {
    name: '',
    description: ''
  })
  roleDialogVisible.value = true
}

const handleEditRole = (row: any) => {
  roleDialogTitle.value = '编辑角色'
  selectedRole.value = row
  Object.assign(roleForm, { ...row })
  roleDialogVisible.value = true
}

const handleDeleteRole = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该角色吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = rolesData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      rolesData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleSaveRole = () => {
  if (!roleForm.name) {
    ElMessage.warning('请输入角色名称')
    return
  }
  
  if (selectedRole.value) {
    // 编辑
    const index = rolesData.value.findIndex(item => item.id === selectedRole.value.id)
    if (index > -1) {
      Object.assign(rolesData.value[index], { ...roleForm })
    }
    ElMessage.success('角色更新成功')
  } else {
    // 新增
    const newRole = {
      ...roleForm,
      id: Date.now(),
      userCount: 0,
      createTime: new Date().toLocaleString().slice(0, -3)
    }
    rolesData.value.push(newRole)
    ElMessage.success('角色添加成功')
  }
  
  roleDialogVisible.value = false
}

const handleSetPermissions = (row: any) => {
  selectedRole.value = row
  // 模拟获取角色权限
  selectedPermissions.value = ["11", "12", "21", "31"]
  permissionsDialogVisible.value = true
}

const handleSavePermissions = () => {
  ElMessage.success('权限设置保存成功')
  permissionsDialogVisible.value = false
}

const handleEditTemplate = (row: any) => {
  ElMessage.info('编辑模板功能开发中...')
}

const handlePreviewTemplate = (row: any) => {
  ElMessage.info('预览模板功能开发中...')
}

const handleBackupData = () => {
  ElMessage.success('数据备份已开始，请稍候...')
}

const handleClearCache = () => {
  ElMessage.success('缓存清理完成')
}

const handleViewLogs = () => {
  ElMessage.info('日志查看功能开发中...')
}
</script>

<style scoped>
.settings {
  padding: 0;
}

.settings-section {
  padding: 20px;
}

.settings-section h3 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.logo-uploader {
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

.logo-uploader:hover {
  border-color: #409eff;
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.logo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-tip {
  margin-left: 8px;
  color: #999;
  font-size: 12px;
}

.roles-management {
  margin-top: 20px;
}

.roles-header {
  margin-bottom: 20px;
}

.email-config,
.sms-config {
  margin-left: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.maintenance-tools {
  margin-bottom: 30px;
}

.tool-card {
  text-align: center;
  height: 150px;
}

.tool-card p {
  color: #666;
  margin: 16px 0;
}

.permissions-tree {
  max-height: 400px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .settings :deep(.el-tabs--left .el-tabs__header) {
    width: 100%;
  }
  
  .settings :deep(.el-tabs--left .el-tabs__content) {
    padding-left: 0;
  }
  
  .maintenance-tools :deep(.el-row) {
    flex-direction: column;
  }
}
</style>