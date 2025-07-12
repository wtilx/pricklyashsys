<template>
  <div class="qa-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>互助问答管理</span>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="问题标题">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入问题标题"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="searchForm.category" placeholder="请选择分类" clearable style="width: 150px">
              <el-option label="法律咨询" value="consultation" />
              <el-option label="案例讨论" value="case_discussion" />
              <el-option label="法规解读" value="regulation" />
              <el-option label="实务经验" value="practice" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option label="待审核" value="pending" />
              <el-option label="已发布" value="published" />
              <el-option label="已解决" value="solved" />
              <el-option label="已关闭" value="closed" />
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
        <el-table-column label="问题信息" min-width="300">
          <template #default="{ row }">
            <div class="question-info">
              <div class="question-title">{{ row.title }}</div>
              <div class="question-user">提问者：{{ row.userName }}</div>
              <div class="question-meta">
                <el-tag :type="getCategoryType(row.category)" size="small">
                  {{ getCategoryName(row.category) }}
                </el-tag>
                <span class="question-views">{{ row.views }}次浏览</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="answers" label="回答数" width="80" />
        <el-table-column prop="likes" label="点赞数" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提问时间" width="150" />
        <el-table-column prop="lastReplyTime" label="最后回复" width="150" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button type="primary" size="small" @click="handleManageAnswers(row)">回答</el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              type="success" 
              size="small" 
              @click="handleApprove(row)"
            >
              审核
            </el-button>
            <el-button 
              v-if="row.status === 'published'" 
              type="warning" 
              size="small" 
              @click="handleRecommend(row)"
            >
              推荐
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

    <!-- 问题详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="问题详情"
      width="900px"
    >
      <div class="question-detail" v-if="selectedQuestion">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="问题标题">{{ selectedQuestion.title }}</el-descriptions-item>
          <el-descriptions-item label="提问者">{{ selectedQuestion.userName }}</el-descriptions-item>
          <el-descriptions-item label="分类">
            <el-tag :type="getCategoryType(selectedQuestion.category)">
              {{ getCategoryName(selectedQuestion.category) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedQuestion.status)">
              {{ getStatusName(selectedQuestion.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="浏览次数">{{ selectedQuestion.views }}</el-descriptions-item>
          <el-descriptions-item label="点赞数">{{ selectedQuestion.likes }}</el-descriptions-item>
          <el-descriptions-item label="提问时间">{{ selectedQuestion.createTime }}</el-descriptions-item>
          <el-descriptions-item label="最后回复">{{ selectedQuestion.lastReplyTime || '暂无回复' }}</el-descriptions-item>
        </el-descriptions>

        <div class="question-content">
          <h4>问题内容</h4>
          <div class="content-text">{{ selectedQuestion.content }}</div>
        </div>

        <div class="question-tags" v-if="selectedQuestion.tags?.length">
          <h4>相关标签</h4>
          <div class="tags-list">
            <el-tag
              v-for="tag in selectedQuestion.tags"
              :key="tag"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 回答管理对话框 -->
    <el-dialog
      v-model="answersDialogVisible"
      title="回答管理"
      width="1000px"
    >
      <div class="answers-management">
        <div class="answers-header">
          <h4>{{ selectedQuestion?.title }} - 回答列表</h4>
          <el-button type="primary" size="small" @click="handleAddAnswer">
            添加回答
          </el-button>
        </div>

        <el-table :data="answersData" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="userName" label="回答者" width="120" />
          <el-table-column prop="content" label="回答内容" min-width="300" show-overflow-tooltip />
          <el-table-column prop="likes" label="点赞数" width="80" />
          <el-table-column prop="isAccepted" label="是否采纳" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isAccepted ? 'success' : 'info'">
                {{ row.isAccepted ? '已采纳' : '未采纳' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getAnswerStatusType(row.status)">
                {{ getAnswerStatusName(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="回答时间" width="150" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="info" size="small" @click="handleViewAnswer(row)">查看</el-button>
              <el-button 
                v-if="row.status === 'pending'" 
                type="success" 
                size="small" 
                @click="handleApproveAnswer(row)"
              >
                审核
              </el-button>
              <el-button 
                v-if="!row.isAccepted && row.status === 'approved'" 
                type="warning" 
                size="small" 
                @click="handleAcceptAnswer(row)"
              >
                采纳
              </el-button>
              <el-button type="danger" size="small" @click="handleDeleteAnswer(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 回答详情对话框 -->
    <el-dialog
      v-model="answerDetailDialogVisible"
      title="回答详情"
      width="700px"
    >
      <div class="answer-detail" v-if="selectedAnswer">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="回答者">{{ selectedAnswer.userName }}</el-descriptions-item>
          <el-descriptions-item label="点赞数">{{ selectedAnswer.likes }}</el-descriptions-item>
          <el-descriptions-item label="是否采纳">
            <el-tag :type="selectedAnswer.isAccepted ? 'success' : 'info'">
              {{ selectedAnswer.isAccepted ? '已采纳' : '未采纳' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="回答时间">{{ selectedAnswer.createTime }}</el-descriptions-item>
        </el-descriptions>

        <div class="answer-content">
          <h4>回答内容</h4>
          <div class="content-text">{{ selectedAnswer.content }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const loading = ref(false)
const detailDialogVisible = ref(false)
const answersDialogVisible = ref(false)
const answerDetailDialogVisible = ref(false)
const selectedQuestion = ref<any>(null)
const selectedAnswer = ref<any>(null)

const searchForm = reactive({
  title: '',
  category: '',
  status: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: 1,
    title: '劳动合同中的试用期规定有哪些？',
    userName: '张三',
    category: 'consultation',
    answers: 5,
    likes: 23,
    views: 156,
    status: 'published',
    createTime: '2024-01-15 10:30',
    lastReplyTime: '2024-01-16 14:20',
    content: '我想了解劳动合同中关于试用期的具体规定，包括试用期的长度、工资标准等...',
    tags: ['劳动合同', '试用期', '工资']
  },
  {
    id: 2,
    title: '房屋买卖合同纠纷如何处理？',
    userName: '李四',
    category: 'case_discussion',
    answers: 3,
    likes: 18,
    views: 89,
    status: 'solved',
    createTime: '2024-01-14 16:45',
    lastReplyTime: '2024-01-15 09:30',
    content: '购买二手房时发现房屋存在质量问题，卖方拒绝承担责任，应该如何维权...',
    tags: ['房屋买卖', '合同纠纷', '维权']
  },
  {
    id: 3,
    title: '新公司法的主要变化有哪些？',
    userName: '王五',
    category: 'regulation',
    answers: 0,
    likes: 12,
    views: 67,
    status: 'pending',
    createTime: '2024-01-13 09:15',
    lastReplyTime: null,
    content: '听说公司法有了新的修订，想了解主要的变化内容...',
    tags: ['公司法', '法规修订']
  }
])

const answersData = ref([
  {
    id: 1,
    userName: '专家A',
    content: '根据《劳动合同法》规定，试用期的长度应根据劳动合同期限确定...',
    likes: 15,
    isAccepted: true,
    status: 'approved',
    createTime: '2024-01-15 14:20'
  },
  {
    id: 2,
    userName: '律师B',
    content: '试用期工资不得低于本单位相同岗位最低档工资或者劳动合同约定工资的百分之八十...',
    likes: 8,
    isAccepted: false,
    status: 'approved',
    createTime: '2024-01-15 16:30'
  },
  {
    id: 3,
    userName: '用户C',
    content: '我觉得试用期最长不能超过6个月...',
    likes: 2,
    isAccepted: false,
    status: 'pending',
    createTime: '2024-01-16 10:15'
  }
])

const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    consultation: '法律咨询',
    case_discussion: '案例讨论',
    regulation: '法规解读',
    practice: '实务经验'
  }
  return map[category] || category
}

const getCategoryType = (category: string) => {
  const map: Record<string, string> = {
    consultation: 'primary',
    case_discussion: 'success',
    regulation: 'warning',
    practice: 'info'
  }
  return map[category] || ''
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    published: '已发布',
    solved: '已解决',
    closed: '已关闭'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    published: 'primary',
    solved: 'success',
    closed: 'info'
  }
  return map[status] || ''
}

const getAnswerStatusName = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已审核',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const getAnswerStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || ''
}

const handleSearch = () => {
  ElMessage.info('搜索功能开发中...')
}

const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    category: '',
    status: ''
  })
}

const handleViewDetail = (row: any) => {
  selectedQuestion.value = row
  detailDialogVisible.value = true
}

const handleManageAnswers = (row: any) => {
  selectedQuestion.value = row
  answersDialogVisible.value = true
}

const handleApprove = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认审核通过该问题吗？', '提示', {
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

const handleRecommend = (row: any) => {
  ElMessage.success('问题已推荐到首页')
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该问题吗？', '提示', {
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

const handleAddAnswer = () => {
  ElMessage.info('添加回答功能开发中...')
}

const handleViewAnswer = (row: any) => {
  selectedAnswer.value = row
  answerDetailDialogVisible.value = true
}

const handleApproveAnswer = (row: any) => {
  row.status = 'approved'
  ElMessage.success('回答审核通过')
}

const handleAcceptAnswer = (row: any) => {
  // 先取消其他回答的采纳状态
  answersData.value.forEach(answer => {
    answer.isAccepted = false
  })
  
  // 设置当前回答为采纳状态
  row.isAccepted = true
  
  // 更新问题状态为已解决
  if (selectedQuestion.value) {
    selectedQuestion.value.status = 'solved'
    const questionIndex = tableData.value.findIndex(item => item.id === selectedQuestion.value.id)
    if (questionIndex > -1) {
      tableData.value[questionIndex].status = 'solved'
    }
  }
  
  ElMessage.success('回答已采纳')
}

const handleDeleteAnswer = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该回答吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = answersData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      answersData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
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
.qa-management {
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

.question-info {
  padding: 8px 0;
}

.question-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.question-user {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-views {
  font-size: 12px;
  color: #999;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.question-detail {
  padding: 20px 0;
}

.question-content,
.question-tags {
  margin-top: 20px;
}

.question-content h4,
.question-tags h4 {
  margin-bottom: 12px;
  color: #333;
}

.content-text {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  line-height: 1.6;
  color: #666;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
}

.answers-management {
  padding: 20px 0;
}

.answers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.answers-header h4 {
  margin: 0;
  color: #333;
}

.answer-detail {
  padding: 20px 0;
}

.answer-content {
  margin-top: 20px;
}

.answer-content h4 {
  margin-bottom: 12px;
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
}
</style>