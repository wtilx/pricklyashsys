<template>
  <div class="experts-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>专家管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            添加专家
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="专家姓名">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入专家姓名"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="专业领域">
            <el-select v-model="searchForm.field" placeholder="请选择专业领域" clearable style="width: 150px">
              <el-option label="民商法" value="civil" />
              <el-option label="刑法" value="criminal" />
              <el-option label="行政法" value="administrative" />
              <el-option label="知识产权" value="intellectual" />
              <el-option label="劳动法" value="labor" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 100px">
              <el-option label="在线" value="online" />
              <el-option label="忙碌" value="busy" />
              <el-option label="离线" value="offline" />
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
        <el-table-column label="专家信息" min-width="250">
          <template #default="{ row }">
            <div class="expert-info">
              <el-avatar :src="row.avatar" :size="50" />
              <div class="expert-details">
                <div class="expert-name">
                  {{ row.name }}
                  <el-tag v-if="row.isVerified" type="success" size="small" class="verified-tag">
                    <el-icon><Select /></el-icon>
                    已认证
                  </el-tag>
                </div>
                <div class="expert-title">{{ row.title }}</div>
                <div class="expert-institution">{{ row.institution }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="field" label="专业领域" width="120">
          <template #default="{ row }">
            <el-tag :type="getFieldType(row.field) || 'primary'">
              {{ getFieldName(row.field) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="experience" label="执业年限" width="100" />
        <el-table-column prop="rating" label="评分" width="100">
          <template #default="{ row }">
            <el-rate
              v-model="row.rating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
          </template>
        </el-table-column>
        <el-table-column prop="consultations" label="咨询次数" width="100" />
        <el-table-column prop="courses" label="课程数" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status) || 'primary'" :icon="getStatusIcon(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinTime" label="加入时间" width="150" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="info" size="small" @click="handleViewProfile(row)">档案</el-button>
            <el-button type="success" size="small" @click="handleSetPermissions(row)">权限</el-button>
            <el-button 
              :type="row.status === 'online' ? 'warning' : 'success'" 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'online' ? '下线' : '上线' }}
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
          <el-col :span="12">
            <el-form-item label="专家姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入专家姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职称" prop="title">
              <el-input v-model="form.title" placeholder="请输入职称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="专业领域" prop="field">
              <el-select v-model="form.field" placeholder="请选择专业领域">
                <el-option label="民商法" value="civil" />
                <el-option label="刑法" value="criminal" />
                <el-option label="行政法" value="administrative" />
                <el-option label="知识产权" value="intellectual" />
                <el-option label="劳动法" value="labor" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执业年限" prop="experience">
              <el-input-number v-model="form.experience" :min="0" :max="50" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="所属机构" prop="institution">
          <el-input v-model="form.institution" placeholder="请输入所属机构" />
        </el-form-item>

        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="form.contact" placeholder="请输入联系方式" />
        </el-form-item>

        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="form.bio"
            type="textarea"
            :rows="4"
            placeholder="请输入个人简介"
          />
        </el-form-item>

        <el-form-item label="专业成就">
          <el-input
            v-model="form.achievements"
            type="textarea"
            :rows="3"
            placeholder="请输入专业成就和荣誉"
          />
        </el-form-item>

        <el-form-item label="认证状态">
          <el-switch
            v-model="form.isVerified"
            active-text="已认证"
            inactive-text="未认证"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="online">在线</el-radio>
            <el-radio label="busy">忙碌</el-radio>
            <el-radio label="offline">离线</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 专家档案对话框 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="专家档案"
      width="900px"
    >
      <div class="expert-profile" v-if="selectedExpert">
        <div class="profile-header">
          <el-avatar :src="selectedExpert.avatar" :size="80" />
          <div class="profile-info">
            <h3>{{ selectedExpert.name }}</h3>
            <p>{{ selectedExpert.title }} | {{ selectedExpert.institution }}</p>
            <div class="profile-stats">
              <el-tag type="primary">{{ getFieldName(selectedExpert.field) }}</el-tag>
              <el-tag type="success">{{ selectedExpert.experience }}年经验</el-tag>
              <el-tag v-if="selectedExpert.isVerified" type="warning">已认证</el-tag>
            </div>
          </div>
        </div>

        <el-tabs>
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="专家姓名">{{ selectedExpert.name }}</el-descriptions-item>
              <el-descriptions-item label="职称">{{ selectedExpert.title }}</el-descriptions-item>
              <el-descriptions-item label="专业领域">{{ getFieldName(selectedExpert.field) }}</el-descriptions-item>
              <el-descriptions-item label="执业年限">{{ selectedExpert.experience }}年</el-descriptions-item>
              <el-descriptions-item label="所属机构">{{ selectedExpert.institution }}</el-descriptions-item>
              <el-descriptions-item label="联系方式">{{ selectedExpert.contact }}</el-descriptions-item>
              <el-descriptions-item label="评分">
                <el-rate v-model="selectedExpert.rating" disabled show-score />
              </el-descriptions-item>
              <el-descriptions-item label="加入时间">{{ selectedExpert.joinTime }}</el-descriptions-item>
            </el-descriptions>
            
            <div class="bio-section">
              <h4>个人简介</h4>
              <p>{{ selectedExpert.bio }}</p>
            </div>
            
            <div class="achievements-section">
              <h4>专业成就</h4>
              <p>{{ selectedExpert.achievements }}</p>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="业务统计" name="stats">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedExpert.consultations }}</div>
                  <div class="stat-label">咨询次数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedExpert.courses }}</div>
                  <div class="stat-label">课程数量</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedExpert.rating }}</div>
                  <div class="stat-label">平均评分</div>
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <!-- 权限设置对话框 -->
    <el-dialog
      v-model="permissionsDialogVisible"
      title="权限设置"
      width="600px"
    >
      <div class="permissions-form">
        <h4>专家权限配置</h4>
        <el-checkbox-group v-model="expertPermissions">
          <el-checkbox label="consultation" value="consultation">法律咨询解答</el-checkbox>
          <el-checkbox label="course" value="course">课程讲解</el-checkbox>
          <el-checkbox label="activity" value="activity">活动发起</el-checkbox>
          <el-checkbox label="article" value="article">文章发布</el-checkbox>
          <el-checkbox label="review" value="review">内容审核</el-checkbox>
          <el-checkbox label="mentor" value="mentor">专业指导</el-checkbox> 
        </el-checkbox-group>
      </div>
      
      <template #footer>
        <el-button @click="permissionsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search, Select } from '@element-plus/icons-vue'

const loading = ref(false)
const dialogVisible = ref(false)
const profileDialogVisible = ref(false)
const permissionsDialogVisible = ref(false)
const dialogTitle = ref('添加专家')
const formRef = ref<FormInstance>()
const selectedExpert = ref<any>(null)
const expertPermissions = ref<string[]>([])

const searchForm = reactive({
  name: '',
  field: '',
  status: ''
})

const form = reactive({
  id: null,
  name: '',
  title: '',
  field: '',
  experience: 0,
  institution: '',
  contact: '',
  bio: '',
  achievements: '',
  isVerified: false,
  status: 'online'
})

const rules = {
  name: [{ required: true, message: '请输入专家姓名', trigger: 'blur' }],
  title: [{ required: true, message: '请输入职称', trigger: 'blur' }],
  field: [{ required: true, message: '请选择专业领域', trigger: 'change' }],
  institution: [{ required: true, message: '请输入所属机构', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  bio: [{ required: true, message: '请输入个人简介', trigger: 'blur' }]
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: 1,
    name: '张教授',
    title: '法学教授',
    field: 'civil',
    experience: 15,
    institution: '北京大学法学院',
    contact: '13800138001',
    bio: '专注民商法研究15年，具有丰富的理论和实践经验...',
    achievements: '发表学术论文50余篇，主持国家级课题3项...',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    rating: 4.8,
    consultations: 234,
    courses: 12,
    isVerified: true,
    status: 'online',
    joinTime: '2023-03-15 10:30'
  },
  {
    id: 2,
    name: '李律师',
    title: '高级律师',
    field: 'criminal',
    experience: 12,
    institution: '金诚律师事务所',
    contact: '13800138002',
    bio: '专业刑事辩护律师，成功办理各类刑事案件300余起...',
    achievements: '获得年度优秀律师称号，多次参与重大案件辩护...',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    rating: 4.6,
    consultations: 189,
    courses: 8,
    isVerified: true,
    status: 'busy',
    joinTime: '2023-05-20 14:15'
  },
  {
    id: 3,
    name: '王专家',
    title: '知识产权专家',
    field: 'intellectual',
    experience: 10,
    institution: '中科院知识产权中心',
    contact: '13800138003',
    bio: '知识产权保护专家，在专利、商标等领域有深入研究...',
    achievements: '参与制定多项知识产权相关法规，获得专利20余项...',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    rating: 4.9,
    consultations: 156,
    courses: 15,
    isVerified: true,
    status: 'online',
    joinTime: '2023-07-10 09:45'
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

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    online: '在线',
    busy: '忙碌',
    offline: '离线'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    online: 'success',
    busy: 'warning',
    offline: 'info'
  }
  return map[status] || ''
}

const getStatusIcon = (status: string) => {
  // 返回对应的图标组件
  return ''
}

const handleSearch = () => {
  ElMessage.info('搜索功能开发中...')
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    field: '',
    status: ''
  })
}

const handleAdd = () => {
  dialogTitle.value = '添加专家'
  Object.assign(form, {
    id: null,
    name: '',
    title: '',
    field: '',
    experience: 0,
    institution: '',
    contact: '',
    bio: '',
    achievements: '',
    isVerified: false,
    status: 'online'
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑专家'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleViewProfile = (row: any) => {
  selectedExpert.value = row
  profileDialogVisible.value = true
}

const handleSetPermissions = (row: any) => {
  selectedExpert.value = row
  // 模拟获取专家权限
  expertPermissions.value = ['consultation', 'course', 'article']
  permissionsDialogVisible.value = true
}

const handleSavePermissions = () => {
  ElMessage.success('权限设置成功')
  permissionsDialogVisible.value = false
}

const handleToggleStatus = async (row: any) => {
  const action = row.status === 'online' ? '下线' : '上线'
  try {
    await ElMessageBox.confirm(`确认${action}该专家吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    row.status = row.status === 'online' ? 'offline' : 'online'
    ElMessage.success(`${action}成功`)
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
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
          rating: 5.0,
          consultations: 0,
          courses: 0,
          joinTime: new Date().toLocaleString().slice(0, -3)
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
.experts-management {
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

.expert-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.expert-details {
  flex: 1;
}

.expert-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.verified-tag {
  margin-left: 8px;
}

.expert-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 2px;
}

.expert-institution {
  font-size: 12px;
  color: #999;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.expert-profile {
  padding: 20px 0;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.profile-info h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.profile-info p {
  margin: 0 0 12px 0;
  color: #666;
}

.profile-stats {
  display: flex;
  gap: 8px;
}

.bio-section,
.achievements-section {
  margin-top: 20px;
}

.bio-section h4,
.achievements-section h4 {
  margin-bottom: 12px;
  color: #333;
}

.bio-section p,
.achievements-section p {
  line-height: 1.6;
  color: #666;
}

.stat-item {
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

.permissions-form h4 {
  margin-bottom: 16px;
  color: #333;
}

.permissions-form :deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 768px) {
  .search-bar :deep(.el-form) {
    flex-direction: column;
  }
  
  .search-bar :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>