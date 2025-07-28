<template>
  <div class="projects-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            创建项目
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="项目名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入项目名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="项目类型">
            <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 150px">
              <el-option label="法律援助" value="legal_aid" />
              <el-option label="法律研究" value="research" />
              <el-option label="公益项目" value="public_welfare" />
              <el-option label="培训项目" value="training" />
            </el-select>
          </el-form-item>
          <el-form-item label="项目状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option label="进行中" value="ongoing" />
              <el-option label="已完成" value="completed" />
              <el-option label="已暂停" value="paused" />
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
        <el-table-column label="项目信息" min-width="250">
          <template #default="{ row }">
            <div class="project-info">
              <div class="project-details">
                <div class="project-name">{{ row.name }}</div>
                <div class="project-description">{{ row.description }}</div>
                <div class="project-meta">
                  <el-tag :type="getTypeColor(row.type) || 'primary'" size="small">
                    {{ getTypeName(row.type) }}
                  </el-tag>
                  <span class="project-leader">负责人：{{ row.leader }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="participants" label="参与人数" width="100" />
        <el-table-column prop="progress" label="项目进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="budget" label="预算" width="100">
          <template #default="{ row }">
            ¥{{ row.budget.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status) || 'primary'">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="info" size="small" @click="handleViewProgress(row)">进度</el-button>
            <el-button type="success" size="small" @click="handleManageParticipants(row)">成员</el-button>
            <el-button 
              v-if="row.status === 'ongoing'" 
              type="warning" 
              size="small" 
              @click="handlePause(row)"
            >
              暂停
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择项目类型">
                <el-option label="法律援助" value="legal_aid" />
                <el-option label="法律研究" value="research" />
                <el-option label="公益项目" value="public_welfare" />
                <el-option label="培训项目" value="training" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目预算" prop="budget">
              <el-input-number v-model="form.budget" :min="0" :step="1000" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="form.startDate"
                type="date"
                placeholder="选择开始日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker
                v-model="form.endDate"
                type="date"
                placeholder="选择结束日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目目标">
          <el-input
            v-model="form.objectives"
            type="textarea"
            :rows="3"
            placeholder="请输入项目目标"
          />
        </el-form-item>

        <el-form-item label="参与要求">
          <el-input
            v-model="form.requirements"
            type="textarea"
            :rows="2"
            placeholder="请输入参与要求"
          />
        </el-form-item>

        <el-form-item label="项目状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="ongoing" value="ongoing">进行中</el-radio>
            <el-radio label="paused" value="paused">已暂停</el-radio>
            <el-radio label="completed" value="completed">已完成</el-radio>
            <el-radio label="cancelled" value="cancelled">已取消</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 项目进度对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="项目进度管理"
      width="900px"
    >
      <div class="progress-management" v-if="selectedProject">
        <div class="progress-header">
          <h4>{{ selectedProject.name }} - 项目进度</h4>
          <el-button type="primary" size="small" @click="handleAddMilestone">
            添加里程碑
          </el-button>
        </div>

        <div class="progress-overview">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="progress-stat">
                <div class="stat-number">{{ selectedProject.progress }}%</div>
                <div class="stat-label">总体进度</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="progress-stat">
                <div class="stat-number">{{ completedMilestones }}</div>
                <div class="stat-label">已完成里程碑</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="progress-stat">
                <div class="stat-number">{{ remainingDays }}</div>
                <div class="stat-label">剩余天数</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-timeline>
          <el-timeline-item
            v-for="milestone in milestonesData"
            :key="milestone.id"
            :timestamp="milestone.date"
            :type="getMilestoneType(milestone.status)"
          >
            <div class="milestone-content">
              <h4>{{ milestone.title }}</h4>
              <p>{{ milestone.description }}</p>
              <div class="milestone-actions">
                <el-tag :type="getMilestoneStatusType(milestone.status) || 'primary'">
                  {{ getMilestoneStatusName(milestone.status) }}
                </el-tag>
                <el-button 
                  v-if="milestone.status === 'pending'" 
                  type="success" 
                  size="small" 
                  @click="handleCompleteMilestone(milestone)"
                >
                  标记完成
                </el-button>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <!-- 成员管理对话框 -->
    <el-dialog
      v-model="participantsDialogVisible"
      title="项目成员管理"
      width="1000px"
    >
      <div class="participants-management">
        <div class="participants-header">
          <h4>项目成员列表</h4>
          <el-button type="primary" size="small" @click="handleAddParticipant">
            添加成员
          </el-button>
        </div>

        <el-table :data="projectParticipants" stripe>
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="role" label="角色" width="120">
            <template #default="{ row }">
              <el-tag :type="getRoleType(row.role) || 'primary'">
                {{ getRoleName(row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门" width="150" />
          <el-table-column prop="responsibility" label="职责" min-width="200" />
          <el-table-column prop="joinDate" label="加入时间" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getParticipantStatusType(row.status) || 'primary'">
                {{ getParticipantStatusName(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEditParticipant(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleRemoveParticipant(row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { projectApi } from "../api"

const loading = ref(false)
const dialogVisible = ref(false)
const progressDialogVisible = ref(false)
const participantsDialogVisible = ref(false)
const dialogTitle = ref('创建项目')
const formRef = ref<FormInstance>()
const selectedProject = ref<any>(null)

const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})
const limits = ref({
  limit: 4,
  page: 1,
  type: 1,
})

const form = reactive({
  id: null,
  name: '',
  type: '',
  description: '',
  leader: '',
  budget: 0,
  startDate: '',
  endDate: '',
  objectives: '',
  requirements: '',
  status: 'ongoing'
})

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入项目描述', trigger: 'blur' }],
  leader: [{ required: true, message: '请输入项目负责人', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: 1,
    name: '农民工法律援助项目',
    type: 'legal_aid',
    description: '为农民工提供免费法律咨询和援助服务',
    leader: '张律师',
    participants: 15,
    progress: 75,
    budget: 50000,
    status: 'ongoing',
    startDate: '2024-01-01',
    endDate: '2024-06-30'
  },
  {
    id: 2,
    name: '知识产权保护研究',
    type: 'research',
    description: '研究中小企业知识产权保护策略',
    leader: '王教授',
    participants: 8,
    progress: 45,
    budget: 80000,
    status: 'ongoing',
    startDate: '2024-01-15',
    endDate: '2024-12-31'
  },
  {
    id: 3,
    name: '社区法律宣传活动',
    type: 'public_welfare',
    description: '在社区开展法律知识普及活动',
    leader: '李专家',
    participants: 12,
    progress: 100,
    budget: 20000,
    status: 'completed',
    startDate: '2023-10-01',
    endDate: '2023-12-31'
  }
])

const milestonesData = ref([
  {
    id: 1,
    title: '项目启动',
    description: '项目正式启动，团队组建完成',
    date: '2024-01-01',
    status: 'completed'
  },
  {
    id: 2,
    title: '需求调研',
    description: '完成目标群体需求调研',
    date: '2024-02-01',
    status: 'completed'
  },
  {
    id: 3,
    title: '方案制定',
    description: '制定详细的援助方案',
    date: '2024-03-01',
    status: 'pending'
  },
  {
    id: 4,
    title: '项目实施',
    description: '开始实施法律援助服务',
    date: '2024-04-01',
    status: 'pending'
  }
])

const projectParticipants = ref([
  {
    id: 1,
    name: '张三',
    role: 'leader',
    department: '法律部',
    responsibility: '项目总负责人',
    joinDate: '2024-01-01',
    status: 'active'
  },
  {
    id: 2,
    name: '李四',
    role: 'member',
    department: '法律部',
    responsibility: '法律咨询',
    joinDate: '2024-01-05',
    status: 'active'
  },
  {
    id: 3,
    name: '王五',
    role: 'consultant',
    department: '外部专家',
    responsibility: '专业指导',
    joinDate: '2024-01-10',
    status: 'active'
  }
])
onMounted(() => {
  getProjectList()
})
const getProjectList = async () => {
  loading.value = true
  try {
    const res = await projectApi.getProjects(limits.value)
    console.log(res.data.data.list);
    // tableData.value = res.data.data.list
    pagination.total = res.data.data.total
  } catch (error) {
    ElMessage.error('获取项目列表失败: ' + (error as Error).message)
  } finally {
    loading.value = false
  }
}
const completedMilestones = computed(() => {
  return milestonesData.value.filter(m => m.status === 'completed').length
})

const remainingDays = computed(() => {
  if (!selectedProject.value?.endDate) return 0
  const endDate = new Date(selectedProject.value.endDate)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    legal_aid: '法律援助',
    research: '法律研究',
    public_welfare: '公益项目',
    training: '培训项目'
  }
  return map[type] || type
}

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    legal_aid: 'primary',
    research: 'success',
    public_welfare: 'warning',
    training: 'info'
  }
  return map[type] || ''
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    ongoing: '进行中',
    completed: '已完成',
    paused: '已暂停',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    ongoing: 'success',
    completed: 'info',
    paused: 'warning',
    cancelled: 'danger'
  }
  return map[status] || ''
}

const getMilestoneType = (status: string) => {
  return status === 'completed' ? 'success' : 'primary'
}

const getMilestoneStatusName = (status: string) => {
  const map: Record<string, string> = {
    completed: '已完成',
    pending: '进行中',
    delayed: '延期'
  }
  return map[status] || status
}

const getMilestoneStatusType = (status: string) => {
  const map: Record<string, string> = {
    completed: 'success',
    pending: 'warning',
    delayed: 'danger'
  }
  return map[status] || ''
}

const getRoleName = (role: string) => {
  const map: Record<string, string> = {
    leader: '项目负责人',
    member: '项目成员',
    consultant: '顾问'
  }
  return map[role] || role
}

const getRoleType = (role: string) => {
  const map: Record<string, string> = {
    leader: 'danger',
    member: 'primary',
    consultant: 'warning'
  }
  return map[role] || ''
}

const getParticipantStatusName = (status: string) => {
  const map: Record<string, string> = {
    active: '活跃',
    inactive: '不活跃',
    left: '已离开'
  }
  return map[status] || status
}

const getParticipantStatusType = (status: string) => {
  const map: Record<string, string> = {
    active: 'success',
    inactive: 'warning',
    left: 'info'
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
  dialogTitle.value = '创建项目'
  Object.assign(form, {
    id: null,
    name: '',
    type: '',
    description: '',
    leader: '',
    budget: 0,
    startDate: '',
    endDate: '',
    objectives: '',
    requirements: '',
    status: 'ongoing'
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑项目'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleViewProgress = (row: any) => {
  selectedProject.value = row
  progressDialogVisible.value = true
}

const handleManageParticipants = (row: any) => {
  selectedProject.value = row
  participantsDialogVisible.value = true
}

const handlePause = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认暂停该项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    row.status = 'paused'
    ElMessage.success('项目已暂停')
  } catch {
    // 用户取消
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    projectApi.deleteProject(row.id).then(() => {
      ElMessage.success('删除成功')
    })
  } catch {
    // 用户取消
  }
}

const handleAddMilestone = () => {
  ElMessage.info('添加里程碑功能开发中...')
}

const handleCompleteMilestone = (milestone: any) => {
  milestone.status = 'completed'
  ElMessage.success('里程碑已标记为完成')
}

const handleAddParticipant = () => {
  ElMessage.info('添加成员功能开发中...')
}

const handleEditParticipant = (_row: any) => {
  ElMessage.info('编辑成员功能开发中...')
}

const handleRemoveParticipant = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认移除该成员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = projectParticipants.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      projectParticipants.value.splice(index, 1)
    }
    ElMessage.success('成员已移除')
  } catch {
    // 用户取消
  }
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
          participants: 0,
          progress: 0
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
.projects-management {
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

.project-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-details {
  flex: 1;
}

.project-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.project-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  line-height: 1.4;
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-leader {
  font-size: 12px;
  color: #999;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.progress-management {
  padding: 20px 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.progress-header h4 {
  margin: 0;
  color: #333;
}

.progress-overview {
  margin-bottom: 30px;
}

.progress-stat {
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

.milestone-content h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.milestone-content p {
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.4;
}

.milestone-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.participants-management {
  padding: 20px 0;
}

.participants-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.participants-header h4 {
  margin: 0;
  color: #333;
}

@media (max-width: 768px) {
  .search-bar :deep(.el-form) {
    flex-direction: column;
  }
  
  .search-bar :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .progress-overview :deep(.el-row) {
    flex-direction: column;
  }
}
</style>