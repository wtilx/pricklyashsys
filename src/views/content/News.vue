<template>
  <div class="news-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>法律资讯管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            发布资讯
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="标题">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入资讯标题"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option label="已发布" value="published" />
              <el-option label="待审核" value="pending" />
              <el-option label="草稿" value="draft" />
            </el-select>
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="searchForm.category" placeholder="请选择分类" clearable style="width: 150px">
              <el-option label="民商法律" value="civil" />
              <el-option label="刑事法律" value="criminal" />
              <el-option label="行政法律" value="administrative" />
              <el-option label="知识产权" value="intellectual" />
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
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category) || 'primary'" >
              {{ getCategoryName(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="views" label="阅读量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status) || 'primary'">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" size="small" v-if="row.status === 'pending'" @click="handleApprove(row)">
              审核
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
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入资讯标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类">
            <el-option label="民商法律" value="civil" />
            <el-option label="刑事法律" value="criminal" />
            <el-option label="行政法律" value="administrative" />
            <el-option label="知识产权" value="intellectual" />
          </el-select>
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入资讯摘要"
          />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="请输入资讯内容"
          />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="form.tags" placeholder="请输入标签，多个标签用逗号分隔" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="pending">待审核</el-radio>
            <el-radio label="published">已发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增资讯')
const formRef = ref<FormInstance>()

const searchForm = reactive({
  title: '',
  status: '',
  category: ''
})

const form = reactive({
  id: null,
  title: '',
  category: '',
  author: '',
  summary: '',
  content: '',
  tags: '',
  status: 'draft'
})

const rules = {
  title: [{ required: true, message: '请输入资讯标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  content: [{ required: true, message: '请输入资讯内容', trigger: 'blur' }]
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: 1,
    title: '最新民法典解读：物权编重点条款分析',
    category: 'civil',
    author: '张律师',
    views: 1234,
    status: 'published',
    publishTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    title: '刑事诉讼程序改革最新动态',
    category: 'criminal',
    author: '李专家',
    views: 856,
    status: 'pending',
    publishTime: '2024-01-14 14:20:00'
  },
  {
    id: 3,
    title: '知识产权保护新政策解读',
    category: 'intellectual',
    author: '王教授',
    views: 2341,
    status: 'published',
    publishTime: '2024-01-13 09:15:00'
  }
])

const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    civil: '民商法律',
    criminal: '刑事法律',
    administrative: '行政法律',
    intellectual: '知识产权'
  }
  return map[category] || category
}

const getCategoryType = (category: string) => {
  const map: Record<string, string> = {
    civil: 'primary',
    criminal: 'danger',
    administrative: 'warning',
    intellectual: 'success'
  }
  return map[category] || ''
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    published: '已发布',
    pending: '待审核',
    draft: '草稿'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    published: 'success',
    pending: 'warning',
    draft: 'info'
  }
  return map[status] || ''
}

const handleSearch = () => {
  // 实现搜索逻辑
  ElMessage.info('搜索功能开发中...')
}

const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    status: '',
    category: ''
  })
}

const handleAdd = () => {
  dialogTitle.value = '新增资讯'
  Object.assign(form, {
    id: null,
    title: '',
    category: '',
    author: '',
    summary: '',
    content: '',
    tags: '',
    status: 'draft'
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑资讯'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleApprove = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认审核通过该资讯吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 更新状态
    row.status = 'published'
    ElMessage.success('审核通过')
  } catch {
    // 用户取消
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该资讯吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 删除逻辑
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
        // 编辑
        const index = tableData.value.findIndex(item => item.id === form.id)
        if (index > -1) {
          Object.assign(tableData.value[index], { ...form })
        }
        ElMessage.success('更新成功')
      } else {
        // 新增
        const newItem = {
          ...form,
          id: Date.now(),
          views: 0,
          publishTime: new Date().toLocaleString()
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
  // 重新加载数据
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  // 重新加载数据
}

onMounted(() => {
  pagination.total = tableData.value.length
})
</script>

<style scoped>
.news-management {
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