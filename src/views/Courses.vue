<template>
  <div class="courses-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课程管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            创建课程
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="课程名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入课程名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="专业领域">
            <el-select v-model="searchForm.field" placeholder="请选择领域" clearable style="width: 150px">
              <el-option label="民法典" value="civil" />
              <el-option label="刑法" value="criminal" />
              <el-option label="公司法" value="corporate" />
              <el-option label="知识产权" value="intellectual" />
              <el-option label="劳动法" value="labor" />
            </el-select>
          </el-form-item>
          <el-form-item label="课程状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option label="已发布" value="published" />
              <el-option label="待审核" value="pending" />
              <el-option label="草稿" value="draft" />
              <el-option label="已下架" value="offline" />
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
        <el-table-column label="课程信息" min-width="300">
          <template #default="{ row }">
            <div class="course-info">
              <img :src="row.cover" alt="课程封面" class="course-cover" />
              <div class="course-details">
                <div class="course-name">{{ row.name }}</div>
                <div class="course-instructor">讲师：{{ row.instructor }}</div>
                <div class="course-meta">
                  <span class="course-duration">{{ row.duration }}课时</span>
                  <span class="course-price">¥{{ row.price }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="field" label="专业领域" width="120">
          <template #default="{ row }">
            <el-tag :type="getFieldType(row.field)  || 'primary'">
              {{ getFieldName(row.field) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="students" label="学员数" width="80" />
        <el-table-column prop="rating" label="评分" width="120">
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
        <el-table-column prop="completionRate" label="完成率" width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.completionRate" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status) || 'primary'">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="info" size="small" @click="handleViewContent(row)">内容</el-button>
            <el-button type="success" size="small" @click="handleViewStudents(row)">学员</el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              type="warning" 
              size="small" 
              @click="handleAudit(row)"
            >
              审核
            </el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              type="danger" 
              size="small" 
              @click="handleReject(row)"
            >
              驳回
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
      width="900px"
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
            <el-form-item label="课程名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="专业领域" prop="field">
              <el-select v-model="form.field" placeholder="请选择专业领域">
                <el-option label="民法典" value="civil" />
                <el-option label="刑法" value="criminal" />
                <el-option label="公司法" value="corporate" />
                <el-option label="知识产权" value="intellectual" />
                <el-option label="劳动法" value="labor" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="讲师" prop="instructor">
              <el-select v-model="form.instructor" placeholder="请选择讲师" filterable>
                <el-option label="张教授" value="张教授" />
                <el-option label="李律师" value="李律师" />
                <el-option label="王专家" value="王专家" />
                <el-option label="赵博士" value="赵博士" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="课时数" prop="duration">
              <el-input-number v-model="form.duration" :min="1" :max="100" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="课程简介" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入课程简介"
          />
        </el-form-item>

        <el-form-item label="适合人群" prop="targetAudience">
          <el-input
            v-model="form.targetAudience"
            type="textarea"
            :rows="2"
            placeholder="请输入适合人群"
          />
        </el-form-item>

        <el-form-item label="学习目标">
          <el-input
            v-model="form.objectives"
            type="textarea"
            :rows="3"
            placeholder="请输入学习目标"
          />
        </el-form-item>

        <el-form-item label="课程封面">
          <el-upload
            class="cover-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
          >
            <img v-if="form.cover" :src="form.cover" class="cover-preview" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="课程标签">
          <el-input v-model="form.tags" placeholder="请输入标签，多个标签用逗号分隔" />
        </el-form-item>

        <el-form-item label="课程状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="draft" value="draft">草稿</el-radio>
            <el-radio label="pending" value="pending">待审核</el-radio>
            <el-radio label="published" value="published">已发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 课程内容管理对话框 -->
    <el-dialog
      v-model="contentDialogVisible"
      title="课程内容管理"
      width="1000px"
    >
      <div class="content-management">
        <div class="content-header">
          <h4>{{ selectedCourse?.name }} - 课程内容</h4>
          <el-button type="primary" size="small" @click="handleAddChapter">
            添加章节
          </el-button>
        </div>

        <el-table :data="chaptersData" row-key="id" default-expand-all>
          <el-table-column prop="title" label="章节标题" min-width="200" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getContentType(row.type) || 'primary'">
                {{ getContentTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="时长" width="100" />
          <el-table-column prop="order" label="排序" width="80" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEditChapter(row)">编辑</el-button>
              <el-button type="success" size="small" @click="handlePreview(row)">预览</el-button>
              <el-button type="danger" size="small" @click="handleDeleteChapter(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 学员管理对话框 -->
    <el-dialog
      v-model="studentsDialogVisible"
      title="学员管理"
      width="1000px"
    >
      <div class="students-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ selectedCourse?.students || 0 }}</div>
              <div class="stat-label">总学员数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ activeStudents }}</div>
              <div class="stat-label">活跃学员</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ completedStudents }}</div>
              <div class="stat-label">完成学习</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ selectedCourse?.completionRate || 0 }}%</div>
              <div class="stat-label">完成率</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-table :data="studentsData" stripe>
        <el-table-column prop="name" label="学员姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="progress" label="学习进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="lastStudyTime" label="最后学习" width="150" />
        <el-table-column prop="studyDuration" label="学习时长" width="100" />
        <el-table-column prop="enrollTime" label="报名时间" width="150" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="handleViewStudentDetail(row)">详情</el-button>
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
// 取消注释API导入
import { getCourseEnrollmentList } from '../../api';

const loading = ref(false)
const dialogVisible = ref(false)
const contentDialogVisible = ref(false)
const studentsDialogVisible = ref(false)
const dialogTitle = ref('创建课程')
const formRef = ref<FormInstance>()
const selectedCourse = ref<any>(null)

const searchForm = reactive({
  name: '',
  field: '',
  status: ''
})
const tableData = ref([
  {
    id: 1,
    name: '民法典物权编深度解析',
    field: 'civil',
    instructor: '张教授',
    duration: 24,
    price: 299.00,
    students: 1234,
    rating: 4.8,
    completionRate: 85,
    status: 'published',
    createTime: '2024-01-15 10:30',
    cover: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
  },
  {
    id: 2,
    name: '刑法总则实务应用',
    field: 'criminal',
    instructor: '李律师',
    duration: 18,
    price: 199.00,
    students: 856,
    rating: 4.6,
    completionRate: 78,
    status: 'published',
    createTime: '2024-01-14 14:20',
    cover: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
  },
  {
    id: 3,
    name: '知识产权保护实务',
    field: 'intellectual',
    instructor: '王专家',
    duration: 32,
    price: 399.00,
    students: 567,
    rating: 4.9,
    completionRate: 92,
    status: 'pending',
    createTime: '2024-01-13 09:15',
    cover: 'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
  }
])
onMounted(() => {
  getCourseList()
})
const getCourseList = async () => {
  loading.value = true
  try {
    // 取消注释API调用并添加错误处理
    const res = await getCourseEnrollmentList();
    console.log(res);
    tableData.value = res.data
    pagination.total = res.total
  } catch (error) {
    ElMessage.error('获取课程列表失败: ' + (error as Error).message)
  } finally {
    loading.value = false
  }
}
const form = reactive({
  id: null,
  name: '',
  field: '',
  instructor: '',
  duration: 1,
  price: 0,
  description: '',
  targetAudience: '',
  objectives: '',
  cover: '',
  tags: '',
  status: 'draft'
})

const rules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  field: [{ required: true, message: '请选择专业领域', trigger: 'change' }],
  instructor: [{ required: true, message: '请选择讲师', trigger: 'change' }],
  description: [{ required: true, message: '请输入课程简介', trigger: 'blur' }]
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})



const chaptersData = ref([
  {
    id: 1,
    title: '第一章：物权法基础理论',
    type: 'video',
    duration: '45分钟',
    order: 1
  },
  {
    id: 2,
    title: '第二章：所有权制度',
    type: 'video',
    duration: '60分钟',
    order: 2
  },
  {
    id: 3,
    title: '第三章：用益物权',
    type: 'document',
    duration: '30分钟',
    order: 3
  }
])

const studentsData = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138001',
    progress: 85,
    lastStudyTime: '2024-01-18 20:30',
    studyDuration: '12小时',
    enrollTime: '2024-01-10 14:20'
  },
  {
    id: 2,
    name: '李四',
    phone: '13800138002',
    progress: 65,
    lastStudyTime: '2024-01-17 19:15',
    studyDuration: '8小时',
    enrollTime: '2024-01-12 10:45'
  },
  {
    id: 3,
    name: '王五',
    phone: '13800138003',
    progress: 100,
    lastStudyTime: '2024-01-16 21:00',
    studyDuration: '15小时',
    enrollTime: '2024-01-08 16:30'
  }
])

const activeStudents = computed(() => {
  return studentsData.value.filter(s => s.progress > 0 && s.progress < 100).length
})

const completedStudents = computed(() => {
  return studentsData.value.filter(s => s.progress === 100).length
})

const getFieldName = (field: string) => {
  const map: Record<string, string> = {
    civil: '民法典',
    criminal: '刑法',
    corporate: '公司法',
    intellectual: '知识产权',
    labor: '劳动法'
  }
  return map[field] || field
}

const getFieldType = (field: string) => {
  const map: Record<string, string> = {
    civil: 'primary',
    criminal: 'danger',
    corporate: 'warning',
    intellectual: 'success',
    labor: 'info'
  }
  return map[field] || ''
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    published: '已发布',
    pending: '待审核',
    draft: '草稿',
    offline: '已下架'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    published: 'success',
    pending: 'warning',
    draft: 'info',
    offline: 'danger'
  }
  return map[status] || ''
}

const getContentTypeName = (type: string) => {
  const map: Record<string, string> = {
    video: '视频',
    audio: '音频',
    document: '文档',
    quiz: '测验'
  }
  return map[type] || type
}

const getContentType = (type: string) => {
  const map: Record<string, string> = {
    video: 'primary',
    audio: 'success',
    document: 'warning',
    quiz: 'danger'
  }
  return map[type] || ''
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
  dialogTitle.value = '创建课程'
  Object.assign(form, {
    id: null,
    name: '',
    field: '',
    instructor: '',
    duration: 1,
    price: 0,
    description: '',
    targetAudience: '',
    objectives: '',
    cover: '',
    tags: '',
    status: 'draft'
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑课程'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleViewContent = (row: any) => {
  selectedCourse.value = row
  contentDialogVisible.value = true
}

const handleViewStudents = (row: any) => {
  selectedCourse.value = row
  studentsDialogVisible.value = true
}

const handleAudit = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认审核通过该课程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    row.status = 'published'
    ElMessage.success('审核通过')
  } catch {
    // 用户取消
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该课程吗？', '提示', {
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

const handleAddChapter = () => {
  ElMessage.info('添加章节功能开发中...')
}

const handleEditChapter = (_row: any) => {
  ElMessage.info('编辑章节功能开发中...')
}

const handlePreview = (_row: any) => {
  ElMessage.info('预览功能开发中...')
}

const handleDeleteChapter = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该章节吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = chaptersData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      chaptersData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleViewStudentDetail = (row: any) => {
  ElMessage.info('学员详情功能开发中...',row)
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
          students: 0,
          rating: 5.0,
          completionRate: 0,
          createTime: new Date().toLocaleString().slice(0, -3),
          cover: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
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

const handleReject = async (row: any) => {
  const { value } = await ElMessageBox.prompt('请输入驳回原因', '驳回课程', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  });
  if (value) {
    // 调用驳回API
    row.status = 'draft';
    ElMessage.success('课程已驳回');
  }
};
</script>

<style scoped>
.courses-management {
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

.course-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.course-cover {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.course-details {
  flex: 1;
}

.course-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.course-instructor {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.course-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.course-duration {
  color: #999;
}

.course-price {
  color: #f56c6c;
  font-weight: 500;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.cover-uploader {
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

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content-management {
  padding: 20px 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content-header h4 {
  margin: 0;
  color: #333;
}

.students-stats {
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
  
  .students-stats :deep(.el-row) {
    flex-direction: column;
  }
}
</style>