<template>
  <div class="topics-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>热门话题管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            创建话题
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="话题标题">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入话题标题"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option label="进行中" value="active" />
              <el-option label="已结束" value="closed" />
              <el-option label="置顶" value="pinned" />
            </el-select>
          </el-form-item>
          <el-form-item label="热度">
            <el-select v-model="searchForm.heat" placeholder="请选择热度" clearable style="width: 120px">
              <el-option label="热门" value="hot" />
              <el-option label="普通" value="normal" />
              <el-option label="冷门" value="cold" />
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
        <el-table-column prop="title" label="话题标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category) || 'primary'">
              {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建者" width="100" />
        <el-table-column prop="participants" label="参与人数" width="100" />
        <el-table-column prop="replies" label="回复数" width="80" />
        <el-table-column prop="views" label="浏览量" width="80" />
        <el-table-column prop="heat" label="热度" width="80">
          <template #default="{ row }">
            <el-tag :type="getHeatType(row.heat) || 'primary'" size="small">
              {{ getHeatName(row.heat) }}
            </el-tag>
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
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              :type="row.status === 'pinned' ? 'warning' : 'success'" 
              size="small" 
              @click="handlePin(row)"
            >
              {{ row.status === 'pinned' ? '取消置顶' : '置顶' }}
            </el-button>
            <el-button type="info" size="small" @click="handleManageReplies(row)">管理回复</el-button>
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
        label-width="80px"
      >
        <el-form-item label="话题标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入话题标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类">
            <el-option label="法律咨询" value="法律咨询" />
            <el-option label="案例讨论" value="案例讨论" />
            <el-option label="法规解读" value="法规解读" />
            <el-option label="学术交流" value="学术交流" />
            <el-option label="实务经验" value="实务经验" />
          </el-select>
        </el-form-item>
        <el-form-item label="话题描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入话题描述"
          />
        </el-form-item>
        <el-form-item label="相关标签" prop="tags">
          <el-input v-model="form.tags" placeholder="请输入标签，多个标签用逗号分隔" />
        </el-form-item>
        <el-form-item label="话题状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active" value="active">进行中</el-radio>
            <el-radio label="closed" value="closed">已结束</el-radio>
            <el-radio label="pinned" value="pinned">置顶</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="讨论规则">
          <el-checkbox-group v-model="form.rules">
            <el-checkbox label="实名讨论" value="实名讨论">实名讨论</el-checkbox>
            <el-checkbox label="禁止匿名" value="禁止匿名">禁止匿名</el-checkbox>
            <el-checkbox label="需要审核" value="需要审核">回复需要审核</el-checkbox>
            <el-checkbox label="专家优先" value="专家优先">专家回复优先显示</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 回复管理对话框 -->
    <el-dialog
      v-model="repliesDialogVisible"
      title="回复管理"
      width="1000px"
    >
      <el-table :data="repliesData" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user" label="用户" width="120" />
        <el-table-column prop="content" label="回复内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="likes" label="点赞数" width="80" />
        <el-table-column prop="replyTime" label="回复时间" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'approved' ? 'success' : 'warning'">
              {{ row.status === 'approved' ? '已审核' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'pending'" 
              type="success" 
              size="small" 
              @click="handleApproveReply(row)"
            >
              审核通过
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteReply(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { topicApi } from '@/api'

const loading = ref(false)
const dialogVisible = ref(false)
const repliesDialogVisible = ref(false)
const dialogTitle = ref('创建话题')
const formRef = ref<FormInstance>()

const searchForm = reactive({
  title: '',
  status: '',
  heat: ''
})

const form = reactive({
  id: null,
  title: '',
  category: '',
  description: '',
  tags: '',
  status: 'active',
  rules: []
})

const rules = {
  title: [{ required: true, message: '请输入话题标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  description: [{ required: true, message: '请输入话题描述', trigger: 'blur' }]
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: 1,
    title: '民法典实施后的合同纠纷处理',
    category: '法律咨询',
    creator: '张律师',
    participants: 156,
    replies: 89,
    views: 2341,
    heat: 'hot',
    status: 'pinned',
    createTime: '2024-01-15 10:30'
  },
  {
    id: 2,
    title: '刑事案件中的证据收集问题',
    category: '案例讨论',
    creator: '李专家',
    participants: 89,
    replies: 45,
    views: 1567,
    heat: 'normal',
    status: 'active',
    createTime: '2024-01-14 14:20'
  },
  {
    id: 3,
    title: '知识产权侵权的认定标准',
    category: '学术交流',
    creator: '王教授',
    participants: 234,
    replies: 123,
    views: 3456,
    heat: 'hot',
    status: 'active',
    createTime: '2024-01-13 09:15'
  }
])

const repliesData = ref([
  {
    id: 1,
    user: '用户A',
    content: '这个问题很有意思，我认为应该从合同的性质来分析...',
    likes: 15,
    replyTime: '2024-01-15 11:30',
    status: 'approved'
  },
  {
    id: 2,
    user: '用户B',
    content: '同意楼上的观点，但是还需要考虑具体的法律条文...',
    likes: 8,
    replyTime: '2024-01-15 12:15',
    status: 'pending'
  }
])
onMounted(() => {
  getTopics()
})
const getTopics = async () => {
  loading.value = true
  try {
    const res = await topicApi.getTopicPage({
      page: pagination.currentPage,
      limit: pagination.pageSize,
    })
    console.log(res.data);
    
    tableData.value = res.data.data.list
    pagination.total = res.data.data.total
  } finally {
    loading.value = false
  }
}

const getCategoryType = (category: string) => {
  const map: Record<string, string> = {
    '法律咨询': 'primary',
    '案例讨论': 'success',
    '法规解读': 'warning',
    '学术交流': 'info',
    '实务经验': 'danger'
  }
  return map[category] || ''
}

const getHeatName = (heat: string) => {
  const map: Record<string, string> = {
    hot: '热门',
    normal: '普通',
    cold: '冷门'
  }
  return map[heat] || heat
}

const getHeatType = (heat: string) => {
  const map: Record<string, string> = {
    hot: 'danger',
    normal: 'warning',
    cold: 'info'
  }
  return map[heat] || ''
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    active: '进行中',
    closed: '已结束',
    pinned: '置顶'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    active: 'success',
    closed: 'info',
    pinned: 'warning'
  }
  return map[status] || ''
}

const handleSearch = () => {
  ElMessage.info('搜索功能开发中...')
}

const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    status: '',
    heat: ''
  })
}

const handleAdd = () => {
  dialogTitle.value = '创建话题'
  Object.assign(form, {
    id: null,
    title: '',
    category: '',
    description: '',
    tags: '',
    status: 'active',
    rules: []
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑话题'
  Object.assign(form, { ...row, rules: row.rules || [] })
  dialogVisible.value = true
}

const handlePin = async (row: any) => {
  const action = row.status === 'pinned' ? '取消置顶' : '置顶'
  try {
    await ElMessageBox.confirm(`确认${action}该话题吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    row.status = row.status === 'pinned' ? 'active' : 'pinned'
    ElMessage.success(`${action}成功`)
  } catch {
    // 用户取消
  }
}

const handleManageReplies = (_row: any) => {
  repliesDialogVisible.value = true
}

const handleApproveReply = (row: any) => {
  row.status = 'approved'
  ElMessage.success('审核通过')
}

const handleDeleteReply = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该回复吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = repliesData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      repliesData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该话题吗？', '提示', {
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
          creator: '当前用户',
          participants: 0,
          replies: 0,
          views: 0,
          heat: 'normal',
          createTime: new Date().toLocaleString().slice(0, -3)
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
.topics-management {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
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