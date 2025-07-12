<template>
  <div class="consultations-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>法律咨询管理</span>
          <div class="header-actions">
            <el-button type="success" :icon="Download" @click="handleExport">
              导出数据
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="12" :sm="6" v-for="stat in consultationStats" :key="stat.title">
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
          <el-form-item label="咨询标题">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入咨询标题"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="专业领域">
            <el-select v-model="searchForm.field" placeholder="请选择领域" clearable style="width: 150px">
              <el-option label="民商法" value="civil" />
              <el-option label="刑法" value="criminal" />
              <el-option label="行政法" value="administrative" />
              <el-option label="知识产权" value="intellectual" />
              <el-option label="劳动法" value="labor" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option label="待分配" value="pending" />
              <el-option label="已分配" value="assigned" />
              <el-option label="已回复" value="answered" />
              <el-option label="已关闭" value="closed" />
            </el-select>
          </el-form-item>
          <el-form-item label="紧急程度">
            <el-select v-model="searchForm.priority" placeholder="请选择紧急程度" clearable style="width: 120px">
              <el-option label="紧急" value="urgent" />
              <el-option label="普通" value="normal" />
              <el-option label="低" value="low" />
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
        <el-table-column label="咨询信息" min-width="250">
          <template #default="{ row }">
            <div class="consultation-info">
              <div class="consultation-title">{{ row.title }}</div>
              <div class="consultation-user">咨询人：{{ row.userName }}</div>
              <div class="consultation-meta">
                <el-tag :type="getFieldType(row.field) || 'primary'" size="small">
                  {{ getFieldName(row.field) }}
                </el-tag>
                <el-tag :type="getPriorityType(row.priority) || 'primary'" size="small">
                  {{ getPriorityName(row.priority) }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="expert" label="分配专家" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status) || 'primary'">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="150" />
        <el-table-column prop="responseTime" label="响应时间" width="150" />
        <el-table-column prop="rating" label="满意度" width="120">
          <template #default="{ row }">
            <el-rate
              v-if="row.rating"
              v-model="row.rating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
            <span v-else class="no-rating">未评价</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              type="primary" 
              size="small" 
              @click="handleAssign(row)"
            >
              分配
            </el-button>
            <el-button 
              v-if="row.status === 'assigned'" 
              type="success" 
              size="small" 
              @click="handleReply(row)"
            >
              回复
            </el-button>
            <el-button 
              v-if="row.status === 'answered'" 
              type="warning" 
              size="small" 
              @click="handleClose(row)"
            >
              关闭
            </el-button>
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

    <!-- 咨询详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="咨询详情"
      width="900px"
    >
      <div class="consultation-detail" v-if="selectedConsultation">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="咨询标题">{{ selectedConsultation.title }}</el-descriptions-item>
          <el-descriptions-item label="咨询人">{{ selectedConsultation.userName }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ selectedConsultation.userPhone }}</el-descriptions-item>
          <el-descriptions-item label="专业领域">
            <el-tag :type="getFieldType(selectedConsultation.field) || 'primary'">
              {{ getFieldName(selectedConsultation.field) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="紧急程度">
            <el-tag :type="getPriorityType(selectedConsultation.priority) || 'primary'">
              {{ getPriorityName(selectedConsultation.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分配专家">{{ selectedConsultation.expert || '未分配' }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ selectedConsultation.createTime }}</el-descriptions-item>
          <el-descriptions-item label="响应时间">{{ selectedConsultation.responseTime || '未响应' }}</el-descriptions-item>
        </el-descriptions>

        <div class="consultation-content">
          <h4>咨询内容</h4>
          <div class="content-text">{{ selectedConsultation.content }}</div>
        </div>

        <div class="consultation-reply" v-if="selectedConsultation.reply">
          <h4>专家回复</h4>
          <div class="reply-text">{{ selectedConsultation.reply }}</div>
        </div>

        <div class="consultation-attachments" v-if="selectedConsultation.attachments?.length">
          <h4>相关附件</h4>
          <div class="attachments-list">
            <el-tag
              v-for="file in selectedConsultation.attachments"
              :key="file.name"
              class="attachment-tag"
            >
              {{ file.name }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 分配专家对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="分配专家"
      width="600px"
    >
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="选择专家" required>
          <el-select v-model="assignForm.expertId" placeholder="请选择专家" style="width: 100%">
            <el-option
              v-for="expert in availableExperts"
              :key="expert.id"
              :label="`${expert.name} - ${expert.field}`"
              :value="expert.id"
            >
              <div class="expert-option">
                <span>{{ expert.name }}</span>
                <span class="expert-field">{{ expert.field }}</span>
                <span class="expert-rating">评分: {{ expert.rating }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="assignForm.note"
            type="textarea"
            :rows="3"
            placeholder="请输入分配备注"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAssign">确定分配</el-button>
      </template>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="专家回复"
      width="700px"
    >
      <el-form :model="replyForm" label-width="80px">
        <el-form-item label="回复内容" required>
          <el-input
            v-model="replyForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入回复内容"
          />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            multiple
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、DOC、DOCX 格式文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmReply">发送回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download, UploadFilled } from '@element-plus/icons-vue'

const loading = ref(false)
const detailDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const replyDialogVisible = ref(false)
const selectedConsultation = ref<any>(null)

const consultationStats = [
  {
    title: '总咨询数',
    value: '2,345',
    icon: 'Service',
    color: '#1890ff'
  },
  {
    title: '待处理',
    value: '89',
    icon: 'Clock',
    color: '#faad14'
  },
  {
    title: '已回复',
    value: '1,856',
    icon: 'Check',
    color: '#52c41a'
  },
  {
    title: '平均响应时间',
    value: '2.5小时',
    icon: 'Timer',
    color: '#f5222d'
  }
]

const searchForm = reactive({
  title: '',
  field: '',
  status: '',
  priority: ''
})

const assignForm = reactive({
  expertId: '',
  note: ''
})

const replyForm = reactive({
  content: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: 1,
    title: '关于劳动合同纠纷的咨询',
    userName: '张三',
    userPhone: '13800138001',
    field: 'labor',
    priority: 'urgent',
    expert: '李律师',
    status: 'answered',
    createTime: '2024-01-15 10:30',
    responseTime: '2024-01-15 14:20',
    rating: 4.8,
    content: '我在公司工作了3年，现在公司要解除劳动合同，但是没有给出合理的理由...',
    reply: '根据您的描述，公司解除劳动合同需要有合法理由...',
    attachments: [
      { name: '劳动合同.pdf' },
      { name: '工资单.jpg' }
    ]
  },
  {
    id: 2,
    title: '房屋买卖合同问题',
    userName: '李四',
    userPhone: '13800138002',
    field: 'civil',
    priority: 'normal',
    expert: '王专家',
    status: 'assigned',
    createTime: '2024-01-14 16:45',
    responseTime: null,
    rating: null,
    content: '我购买了一套二手房，但是发现房屋存在质量问题...',
    reply: null,
    attachments: []
  },
  {
    id: 3,
    title: '知识产权侵权咨询',
    userName: '王五',
    userPhone: '13800138003',
    field: 'intellectual',
    priority: 'normal',
    expert: null,
    status: 'pending',
    createTime: '2024-01-13 09:15',
    responseTime: null,
    rating: null,
    content: '我的商标被他人恶意注册，应该如何维权...',
    reply: null,
    attachments: [
      { name: '商标注册证.pdf' }
    ]
  }
])

const availableExperts = ref([
  {
    id: 1,
    name: '张教授',
    field: '民商法',
    rating: 4.9
  },
  {
    id: 2,
    name: '李律师',
    field: '劳动法',
    rating: 4.7
  },
  {
    id: 3,
    name: '王专家',
    field: '知识产权',
    rating: 4.8
  }
])

const getFieldName = (field: string) => {
  const map: Record<string, string> = {
    civil: '民商法',
    criminal: '刑法',
    administrative: '行政法',
    intellectual: '知识产权',
    labor: '劳动法'
  }
  return map[field] || field
}

const getFieldType = (field: string) => {
  const map: Record<string, string> = {
    civil: 'primary',
    criminal: 'danger',
    administrative: 'warning',
    intellectual: 'success',
    labor: 'info'
  }
  return map[field] || ''
}

const getPriorityName = (priority: string) => {
  const map: Record<string, string> = {
    urgent: '紧急',
    normal: '普通',
    low: '低'
  }
  return map[priority] || priority
}

const getPriorityType = (priority: string) => {
  const map: Record<string, string> = {
    urgent: 'danger',
    normal: 'warning',
    low: 'info'
  }
  return map[priority] || ''
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    pending: '待分配',
    assigned: '已分配',
    answered: '已回复',
    closed: '已关闭'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    assigned: 'primary',
    answered: 'success',
    closed: 'info'
  }
  return map[status] || ''
}

const handleSearch = () => {
  ElMessage.info('搜索功能开发中...')
}

const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    field: '',
    status: '',
    priority: ''
  })
}

const handleExport = () => {
  ElMessage.success('数据导出功能开发中...')
}

const handleViewDetail = (row: any) => {
  selectedConsultation.value = row
  detailDialogVisible.value = true
}

const handleAssign = (row: any) => {
  selectedConsultation.value = row
  Object.assign(assignForm, {
    expertId: '',
    note: ''
  })
  assignDialogVisible.value = true
}

const handleConfirmAssign = () => {
  if (!assignForm.expertId) {
    ElMessage.warning('请选择专家')
    return
  }
  
  const expert = availableExperts.value.find(e => e.id === Number(assignForm.expertId))
  if (selectedConsultation.value && expert) {
    selectedConsultation.value.expert = expert.name
    selectedConsultation.value.status = 'assigned'
    
    // 更新表格数据
    const index = tableData.value.findIndex(item => item.id === selectedConsultation.value.id)
    if (index > -1) {
      Object.assign(tableData.value[index], selectedConsultation.value)
    }
  }
  
  ElMessage.success('专家分配成功')
  assignDialogVisible.value = false
}

const handleReply = (row: any) => {
  selectedConsultation.value = row
  Object.assign(replyForm, {
    content: ''
  })
  replyDialogVisible.value = true
}

const handleConfirmReply = () => {
  if (!replyForm.content.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  if (selectedConsultation.value) {
    selectedConsultation.value.reply = replyForm.content
    selectedConsultation.value.status = 'answered'
    selectedConsultation.value.responseTime = new Date().toLocaleString().slice(0, -3)
    
    // 更新表格数据
    const index = tableData.value.findIndex(item => item.id === selectedConsultation.value.id)
    if (index > -1) {
      Object.assign(tableData.value[index], selectedConsultation.value)
    }
  }
  
  ElMessage.success('回复发送成功')
  replyDialogVisible.value = false
}

const handleClose = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认关闭该咨询吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    row.status = 'closed'
    ElMessage.success('咨询已关闭')
  } catch {
    // 用户取消
  }
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
.consultations-management {
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

.consultation-info {
  padding: 8px 0;
}

.consultation-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.consultation-user {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.consultation-meta {
  display: flex;
  gap: 8px;
}

.no-rating {
  color: #999;
  font-size: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.consultation-detail {
  padding: 20px 0;
}

.consultation-content,
.consultation-reply,
.consultation-attachments {
  margin-top: 20px;
}

.consultation-content h4,
.consultation-reply h4,
.consultation-attachments h4 {
  margin-bottom: 12px;
  color: #333;
}

.content-text,
.reply-text {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  line-height: 1.6;
  color: #666;
}

.attachments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-tag {
  cursor: pointer;
}

.expert-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.expert-field {
  color: #666;
  font-size: 12px;
}

.expert-rating {
  color: #f56c6c;
  font-size: 12px;
}

.upload-demo {
  width: 100%;
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