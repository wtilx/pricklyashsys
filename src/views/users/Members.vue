<template>
  <div class="members-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员管理</span>
          <div class="header-actions">
            <el-button type="success" :icon="Download" @click="handleExport">
              导出数据
            </el-button>
            <el-button type="primary" :icon="Plus" @click="handleAdd">
              添加会员
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="12" :sm="6" v-for="stat in memberStats" :key="stat.title">
          <div class="stat-card">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="20"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 搜索筛选 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input
              v-model="searchForm.phone"
              placeholder="请输入手机号"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="会员等级">
            <el-select v-model="searchForm.level" placeholder="请选择等级" clearable style="width: 120px">
              <el-option label="普通会员" value="normal" />
              <el-option label="VIP会员" value="vip" />
              <el-option label="SVIP会员" value="svip" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 100px">
              <el-option label="正常" value="active" />
              <el-option label="禁用" value="disabled" />
              <el-option label="冻结" value="frozen" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :src="row.avatar" :size="40" />
              <div class="user-details">
                <div class="username">{{ row.username }}</div>
                <div class="phone">{{ row.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180" show-overflow-tooltip />
        <el-table-column prop="level" label="会员等级" width="120">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" :icon="getLevelIcon(row.level)">
              {{ getLevelName(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="80" />
        <el-table-column prop="loginCount" label="登录次数" width="100" />
        <el-table-column prop="lastLogin" label="最后登录" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="150" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              :type="row.status === 'active' ? 'warning' : 'success'" 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="info" size="small" @click="handleViewDetails(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="会员等级" prop="level">
          <el-select v-model="form.level" placeholder="请选择会员等级">
            <el-option label="普通会员" value="normal" />
            <el-option label="VIP会员" value="vip" />
            <el-option label="SVIP会员" value="svip" />
          </el-select>
        </el-form-item>
        <el-form-item label="积分" prop="points">
          <el-input-number v-model="form.points" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">正常</el-radio>
            <el-radio label="disabled">禁用</el-radio>
            <el-radio label="frozen">冻结</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="会员详情"
      width="800px"
    >
      <div class="member-details" v-if="selectedMember">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户头像">
            <el-avatar :src="selectedMember.avatar" :size="60" />
          </el-descriptions-item>
          <el-descriptions-item label="用户名">{{ selectedMember.username }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ selectedMember.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedMember.email }}</el-descriptions-item>
          <el-descriptions-item label="会员等级">
            <el-tag :type="getLevelType(selectedMember.level)">
              {{ getLevelName(selectedMember.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="积分">{{ selectedMember.points }}</el-descriptions-item>
          <el-descriptions-item label="登录次数">{{ selectedMember.loginCount }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ selectedMember.lastLogin }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ selectedMember.registerTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedMember.status)">
              {{ getStatusName(selectedMember.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="activity-section">
          <h4>最近活动</h4>
          <el-timeline>
            <el-timeline-item
              v-for="activity in memberActivities"
              :key="activity.id"
              :timestamp="activity.time"
            >
              {{ activity.description }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search, Download, Star, Crown } from '@element-plus/icons-vue'

const loading = ref(false)
const dialogVisible = ref(false)
const detailsDialogVisible = ref(false)
const dialogTitle = ref('添加会员')
const formRef = ref<FormInstance>()
const selectedMember = ref<any>(null)

const memberStats = [
  {
    title: '总会员数',
    value: '12,345',
    icon: 'User',
    color: '#1890ff'
  },
  {
    title: 'VIP会员',
    value: '1,234',
    icon: 'Star',
    color: '#52c41a'
  },
  {
    title: '今日新增',
    value: '89',
    icon: 'UserFilled',
    color: '#faad14'
  },
  {
    title: '活跃会员',
    value: '8,765',
    icon: 'TrendCharts',
    color: '#f5222d'
  }
]

const searchForm = reactive({
  username: '',
  phone: '',
  level: '',
  status: ''
})

const form = reactive({
  id: null,
  username: '',
  phone: '',
  email: '',
  level: 'normal',
  points: 0,
  status: 'active',
  remark: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  level: [{ required: true, message: '请选择会员等级', trigger: 'change' }]
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: 1,
    username: '张三',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    level: 'vip',
    points: 1250,
    loginCount: 89,
    lastLogin: '2024-01-15 10:30',
    status: 'active',
    registerTime: '2023-06-15 14:20'
  },
  {
    id: 2,
    username: '李四',
    phone: '13800138002',
    email: 'lisi@example.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    level: 'normal',
    points: 580,
    loginCount: 45,
    lastLogin: '2024-01-14 16:45',
    status: 'active',
    registerTime: '2023-08-20 09:15'
  },
  {
    id: 3,
    username: '王五',
    phone: '13800138003',
    email: 'wangwu@example.com',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    level: 'svip',
    points: 2890,
    loginCount: 156,
    lastLogin: '2024-01-13 20:12',
    status: 'disabled',
    registerTime: '2023-03-10 11:30'
  }
])

const memberActivities = ref([
  {
    id: 1,
    description: '参与了法律咨询讨论',
    time: '2024-01-15 10:30'
  },
  {
    id: 2,
    description: '购买了VIP课程',
    time: '2024-01-14 15:20'
  },
  {
    id: 3,
    description: '发布了新话题',
    time: '2024-01-13 09:45'
  }
])

const getLevelName = (level: string) => {
  const map: Record<string, string> = {
    normal: '普通会员',
    vip: 'VIP会员',
    svip: 'SVIP会员'
  }
  return map[level] || level
}

const getLevelType = (level: string) => {
  const map: Record<string, string> = {
    normal: '',
    vip: 'warning',
    svip: 'danger'
  }
  return map[level] || ''
}

const getLevelIcon = (level: string) => {
  const map: Record<string, any> = {
    normal: '',
    vip: Star,
    svip: Crown
  }
  return map[level] || ''
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    active: '正常',
    disabled: '禁用',
    frozen: '冻结'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    active: 'success',
    disabled: 'danger',
    frozen: 'warning'
  }
  return map[status] || ''
}

const handleSearch = () => {
  ElMessage.info('搜索功能开发中...')
}

const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    phone: '',
    level: '',
    status: ''
  })
}

const handleExport = () => {
  ElMessage.success('数据导出功能开发中...')
}

const handleAdd = () => {
  dialogTitle.value = '添加会员'
  Object.assign(form, {
    id: null,
    username: '',
    phone: '',
    email: '',
    level: 'normal',
    points: 0,
    status: 'active',
    remark: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑会员'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleToggleStatus = async (row: any) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确认${action}该会员吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    row.status = row.status === 'active' ? 'disabled' : 'active'
    ElMessage.success(`${action}成功`)
  } catch {
    // 用户取消
  }
}

const handleViewDetails = (row: any) => {
  selectedMember.value = row
  detailsDialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (form.id) {
        const index = tableData.value.findIndex(item => item.id === form.id)
        if (index > -1) {
          Object.assign(tableData.value[index], { ...form })
        }
        ElMessage.success('更新成功')
      } else {
        const newItem = {
          ...form,
          id: Date.now(),
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
          loginCount: 0,
          lastLogin: '从未登录',
          registerTime: new Date().toLocaleString().slice(0, -3)
        }
        tableData.value.unshift(newItem)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
}

onMounted(() => {
  pagination.total = tableData.value.length
})
</script>

<style scoped>
.members-management {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
}

.username {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.phone {
  font-size: 12px;
  color: #666;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.member-details {
  padding: 20px 0;
}

.activity-section {
  margin-top: 30px;
}

.activity-section h4 {
  margin-bottom: 16px;
  color: #333;
}

@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
  }
  
  .search-bar :deep(.el-form) {
    flex-direction: column;
  }
  
  .search-bar :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>