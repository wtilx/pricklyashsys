<template>
  <div class="activities-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            创建活动
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="活动名称">
            <el-input v-model="searchForm.name" placeholder="请输入活动名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="活动类型">
            <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 120px">
              <el-option label="线上活动" value="online" />
              <el-option label="线下活动" value="offline" />
              <el-option label="混合活动" value="hybrid" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option label="报名中" value="registering" />
              <el-option label="进行中" value="ongoing" />
              <el-option label="已结束" value="finished" />
              <el-option label="已取消" value="cancelled" />
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
        <el-table-column label="活动信息" min-width="250">
          <template #default="{ row }">
            <div class="activity-info">
              <img :src="row.poster" alt="活动海报" class="activity-poster" />
              <div class="activity-details">
                <div class="activity-name">{{ row.name }}</div>
                <div class="activity-theme">{{ row.theme }}</div>
                <div class="activity-speaker">主讲：{{ row.speaker }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type) || 'primary'">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="150" />
        <el-table-column prop="duration" label="时长" width="80" />
        <el-table-column prop="maxParticipants" label="限制人数" width="100" />
        <el-table-column prop="registeredCount" label="已报名" width="80" />
        <el-table-column prop="attendedCount" label="实际参与" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status) || 'primary'"> {{ getStatusName(row.status) }} </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="info" size="small" @click="handleViewParticipants(row)">参与者</el-button>
            <el-button type="success" size="small" @click="handleNotify(row)">通知</el-button>
            <el-button v-if="row.status === 'registering'" type="warning" size="small"
              @click="handleCancel(row)">取消</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" @close="handleDialogClose">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动名称" prop="name">
              <el-input v-model="form.name" id="activityName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动类型" prop="type">
              <el-select v-model="form.type" id="activityType">
                <el-option label="线上活动" value="online" />
                <el-option label="线下活动" value="offline" />
                <el-option label="混合活动" value="hybrid" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="活动主题" prop="theme">
          <el-input v-model="form.theme" placeholder="请输入活动主题" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主讲人" prop="speaker">
              <el-input v-model="form.speaker" placeholder="请输入主讲人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动时长" prop="duration">
              <el-input v-model="form.duration" placeholder="如：2小时" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报名截止" prop="registrationDeadline">
              <el-date-picker v-model="form.registrationDeadline" type="datetime" placeholder="选择报名截止时间"
                style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动地点" prop="location">
              <el-input v-model="form.location" id="activityLocation" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="限制人数" prop="maxParticipants">
              <el-input-number v-model="form.maxParticipants" :min="1" :max="10000" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="活动描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入活动描述" />
        </el-form-item>

        <el-form-item label="活动流程">
          <el-input v-model="form.agenda" type="textarea" :rows="3" placeholder="请输入活动流程安排" />
        </el-form-item>

        <el-form-item label="参与要求">
          <el-checkbox-group v-model="form.requirements">
            <el-checkbox label="实名报名" value="实名报名">实名报名</el-checkbox>
            <el-checkbox label="需要审核" value="需要审核">需要审核</el-checkbox>
            <el-checkbox label="会员专享" value="会员专享">会员专享</el-checkbox>
            <el-checkbox label="专业限制" value="专业限制">专业限制</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="活动海报">
          <el-upload class="poster-uploader" action="#" :show-file-list="false" :auto-upload="false">
            <img v-if="form.poster" :src="form.poster" class="poster-preview" />
            <el-icon v-else class="poster-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 参与者管理对话框 -->
    <el-dialog v-model="participantsDialogVisible" title="参与者管理" width="1000px">
      <div class="participants-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ selectedActivity?.registeredCount || 0 }}</div>
              <div class="stat-label">已报名</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ selectedActivity?.attendedCount || 0 }}</div>
              <div class="stat-label">实际参与</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ pendingCount }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ selectedActivity?.maxParticipants || 0 }}</div>
              <div class="stat-label">限制人数</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-table :data="participantsData" stripe>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="profession" label="职业" width="120" />
        <el-table-column prop="registrationTime" label="报名时间" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getParticipantStatusType(row.status) || 'primary'">
              {{ getParticipantStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" type="success" size="small"
              @click="handleApproveParticipant(row)">
              通过
            </el-button>
            <el-button v-if="row.status === 'pending'" type="danger" size="small" @click="handleRejectParticipant(row)">
              拒绝
            </el-button>
            <el-button v-if="row.status === 'approved'" type="warning" size="small"
              @click="handleCancelParticipant(row)">
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { eventApi } from '@/api'

const loading = ref(false)
const dialogVisible = ref(false)
const participantsDialogVisible = ref(false)
const dialogTitle = ref('创建活动')
const formRef = ref<FormInstance>()
const selectedActivity = ref<any>(null)

const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

const form = reactive({
  id: null,
  name: '',
  type: '',
  theme: '',
  speaker: '',
  duration: '',
  startTime: '',
  registrationDeadline: '',
  location: '',
  maxParticipants: 100,
  description: '',
  agenda: '',
  requirements: [],
  poster: ''
})

const rules = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  theme: [{ required: true, message: '请输入活动主题', trigger: 'blur' }],
  speaker: [{ required: true, message: '请输入主讲人', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
  description: [{ required: true, message: '请输入活动描述', trigger: 'blur' }]
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})
const limits = ref({
  limit: 10,
  page: 1,
})
const tableData = ref([
  {
    id: 1,
    name: '民法典实务应用专题讲座',
    theme: '民法典在实务中的应用与案例分析',
    speaker: '张教授',
    type: 'online',
    startTime: '2024-01-20 14:00',
    duration: '2小时',
    location: '线上会议室',
    maxParticipants: 200,
    registeredCount: 156,
    attendedCount: 142,
    status: 'registering',
    poster: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
  },
  {
    id: 2,
    name: '知识产权保护实务研讨会',
    theme: '企业知识产权保护策略与实践',
    speaker: '王专家',
    type: 'offline',
    startTime: '2024-01-25 09:00',
    duration: '4小时',
    location: '北京国际会议中心',
    maxParticipants: 100,
    registeredCount: 89,
    attendedCount: 0,
    status: 'ongoing',
    poster: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
  },
  {
    id: 3,
    name: '刑事辩护技巧分享会',
    theme: '刑事案件辩护策略与技巧',
    speaker: '李律师',
    type: 'hybrid',
    startTime: '2024-01-15 19:00',
    duration: '3小时',
    location: '线上+线下',
    maxParticipants: 150,
    registeredCount: 134,
    attendedCount: 128,
    status: 'finished',
    poster: 'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
  }
])

const participantsData = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    profession: '律师',
    registrationTime: '2024-01-18 10:30',
    status: 'approved'
  },
  {
    id: 2,
    name: '李四',
    phone: '13800138002',
    email: 'lisi@example.com',
    profession: '法务',
    registrationTime: '2024-01-18 14:20',
    status: 'pending'
  },
  {
    id: 3,
    name: '王五',
    phone: '13800138003',
    email: 'wangwu@example.com',
    profession: '学生',
    registrationTime: '2024-01-18 16:45',
    status: 'approved'
  }
])
const token = ref('')
onMounted(() => {
  token.value = localStorage.getItem('token') || ''
  getevent()
})
const getevent = async () => {
  eventApi.getEventList(limits).then(res => {
    console.log(res);
    participantsData.value = res.data
  })
}

const pendingCount = computed(() => {
  return participantsData.value.filter(p => p.status === 'pending').length
})

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    online: '线上活动',
    offline: '线下活动',
    hybrid: '混合活动'
  }
  return map[type] || type
}

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    online: 'primary',
    offline: 'success',
    hybrid: 'warning'
  }
  return map[type] || ''
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    registering: '报名中',
    ongoing: '进行中',
    finished: '已结束',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    registering: 'primary',
    ongoing: 'success',
    finished: 'info',
    cancelled: 'danger'
  }
  return map[status] || ''
}

const getParticipantStatusName = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getParticipantStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'info'
  }
  return map[status] || ''
}

const handleSearch = () => {
  ElMessage.info('搜索功能开发中...')
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    type: '',
    status: ''
  })
}

const handleAdd = () => {
  dialogTitle.value = '创建活动'
  Object.assign(form, {
    id: null,
    name: '',
    type: '',
    theme: '',
    speaker: '',
    duration: '',
    startTime: '',
    registrationDeadline: '',
    location: '',
    maxParticipants: 100,
    description: '',
    agenda: '',
    requirements: [],
    poster: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑活动'
  Object.assign(form, { ...row, requirements: row.requirements || [] })
  dialogVisible.value = true
}

const handleViewParticipants = (row: any) => {
  selectedActivity.value = row
  participantsDialogVisible.value = true
}

const handleNotify = (_row: any) => {
  ElMessage.success('通知发送成功')
}

const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认取消该活动吗？取消后无法恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    row.status = 'cancelled'
    ElMessage.success('活动已取消')
  } catch {
    // 用户取消
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该活动吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleApproveParticipant = (row: any) => {
  row.status = 'approved'
  ElMessage.success('审核通过')
}

const handleRejectParticipant = (row: any) => {
  row.status = 'rejected'
  ElMessage.success('已拒绝')
}

const handleCancelParticipant = (row: any) => {
  row.status = 'cancelled'
  ElMessage.success('已取消')
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
          registeredCount: 0,
          attendedCount: 0,
          status: 'registering',
          poster: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
        }
        tableData.value.unshift(newItem)
        ElMessage.success('创建成功')
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
.activities-management {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-poster {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.activity-details {
  flex: 1;
}

.activity-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.activity-theme {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.activity-speaker {
  font-size: 12px;
  color: #999;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.poster-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-uploader:hover {
  border-color: #409eff;
}

.poster-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.poster-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.participants-stats {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .search-bar :deep(.el-form) {
    flex-direction: column;
  }

  .search-bar :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .participants-stats :deep(.el-row) {
    flex-direction: column;
  }
}
</style>