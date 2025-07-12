<template>
  <div class="knowledge-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>知识库管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            添加文章
          </el-button>
        </div>
      </template>

      <!-- 分类管理 -->
      <div class="category-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="category-card">
              <template #header>
                <div class="category-header">
                  <span>文章分类</span>
                  <el-button size="small" type="primary" @click="handleAddCategory">
                    新增分类
                  </el-button>
                </div>
              </template>
              <el-tree
                :data="categoryTree"
                :props="{ children: 'children', label: 'name' }"
                node-key="id"
                :expand-on-click-node="false"
                @node-click="handleCategoryClick"
              >
                <template #default="{ node, data }">
                  <div class="category-node">
                    <span>{{ data.name }}</span>
                    <span class="category-count">({{ data.count }})</span>
                  </div>
                </template>
              </el-tree>
            </el-card>
          </el-col>
          
          <el-col :span="18">
            <div class="content-section">
              <!-- 搜索筛选 -->
              <div class="search-bar">
                <el-form :model="searchForm" inline>
                  <el-form-item label="标题">
                    <el-input
                      v-model="searchForm.title"
                      placeholder="请输入文章标题"
                      clearable
                      style="width: 200px"
                    />
                  </el-form-item>
                  <el-form-item label="类型">
                    <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 120px">
                      <el-option label="专业文献" value="document" />
                      <el-option label="法律文章" value="article" />
                      <el-option label="案例分析" value="case" />
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
                <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getTypeColor(row.type)">
                      {{ getTypeName(row.type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="category" label="分类" width="120" />
                <el-table-column prop="author" label="作者" width="100" />
                <el-table-column prop="views" label="阅读量" width="80" />
                <el-table-column prop="downloads" label="下载量" width="80" />
                <el-table-column prop="updateTime" label="更新时间" width="150" />
                <el-table-column label="操作" width="180" fixed="right">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                    <el-button type="info" size="small" @click="handlePreview(row)">预览</el-button>
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
            </div>
          </el-col>
        </el-row>
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
        label-width="80px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入文章标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择类型">
                <el-option label="专业文献" value="document" />
                <el-option label="法律文章" value="article" />
                <el-option label="案例分析" value="case" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类">
                <el-option label="民商法律" value="民商法律" />
                <el-option label="刑事法律" value="刑事法律" />
                <el-option label="行政法律" value="行政法律" />
                <el-option label="知识产权" value="知识产权" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者" prop="author">
              <el-input v-model="form.author" placeholder="请输入作者" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入文章摘要"
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="请输入文章内容"
          />
        </el-form-item>

        <el-form-item label="文件上传">
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
                支持 PDF、DOC、DOCX 格式文件，单个文件大小不超过 10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-input v-model="form.tags" placeholder="请输入标签，多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分类管理对话框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      title="分类管理"
      width="500px"
    >
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-select v-model="categoryForm.parentId" placeholder="请选择父级分类" clearable>
            <el-option label="无" :value="null" />
            <el-option
              v-for="category in flatCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCategorySubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search, UploadFilled } from '@element-plus/icons-vue'

const loading = ref(false)
const dialogVisible = ref(false)
const categoryDialogVisible = ref(false)
const dialogTitle = ref('新增文章')
const formRef = ref<FormInstance>()

const searchForm = reactive({
  title: '',
  type: '',
  category: ''
})

const form = reactive({
  id: null,
  title: '',
  type: '',
  category: '',
  author: '',
  summary: '',
  content: '',
  tags: ''
})

const categoryForm = reactive({
  name: '',
  parentId: null,
  sort: 0
})

const rules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }]
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const categoryTree = ref([
  {
    id: 1,
    name: '民商法律',
    count: 45,
    children: [
      { id: 11, name: '合同法', count: 15 },
      { id: 12, name: '物权法', count: 12 },
      { id: 13, name: '侵权责任法', count: 18 }
    ]
  },
  {
    id: 2,
    name: '刑事法律',
    count: 32,
    children: [
      { id: 21, name: '刑法', count: 20 },
      { id: 22, name: '刑事诉讼法', count: 12 }
    ]
  },
  {
    id: 3,
    name: '行政法律',
    count: 28,
    children: [
      { id: 31, name: '行政法', count: 15 },
      { id: 32, name: '行政诉讼法', count: 13 }
    ]
  },
  {
    id: 4,
    name: '知识产权',
    count: 25,
    children: [
      { id: 41, name: '专利法', count: 10 },
      { id: 42, name: '商标法', count: 8 },
      { id: 43, name: '著作权法', count: 7 }
    ]
  }
])

const flatCategories = computed(() => {
  const flatten = (categories: any[], result: any[] = []) => {
    categories.forEach(category => {
      result.push(category)
      if (category.children) {
        flatten(category.children, result)
      }
    })
    return result
  }
  return flatten(categoryTree.value)
})

const tableData = ref([
  {
    id: 1,
    title: '民法典物权编重点条款解析',
    type: 'document',
    category: '民商法律',
    author: '张教授',
    views: 1234,
    downloads: 89,
    updateTime: '2024-01-15 10:30'
  },
  {
    id: 2,
    title: '刑事诉讼程序改革研究',
    type: 'article',
    category: '刑事法律',
    author: '李专家',
    views: 856,
    downloads: 45,
    updateTime: '2024-01-14 14:20'
  },
  {
    id: 3,
    title: '知识产权侵权案例分析',
    type: 'case',
    category: '知识产权',
    author: '王律师',
    views: 2341,
    downloads: 156,
    updateTime: '2024-01-13 09:15'
  }
])

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    document: '专业文献',
    article: '法律文章',
    case: '案例分析'
  }
  return map[type] || type
}

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    document: 'primary',
    article: 'success',
    case: 'warning'
  }
  return map[type] || ''
}

const handleCategoryClick = (data: any) => {
  searchForm.category = data.name
  handleSearch()
}

const handleAddCategory = () => {
  Object.assign(categoryForm, {
    name: '',
    parentId: null,
    sort: 0
  })
  categoryDialogVisible.value = true
}

const handleCategorySubmit = () => {
  if (!categoryForm.name) {
    ElMessage.warning('请输入分类名称')
    return
  }
  
  // 添加分类逻辑
  ElMessage.success('分类添加成功')
  categoryDialogVisible.value = false
}

const handleSearch = () => {
  ElMessage.info('搜索功能开发中...')
}

const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    type: '',
    category: ''
  })
}

const handleAdd = () => {
  dialogTitle.value = '新增文章'
  Object.assign(form, {
    id: null,
    title: '',
    type: '',
    category: '',
    author: '',
    summary: '',
    content: '',
    tags: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑文章'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handlePreview = (row: any) => {
  ElMessage.info('预览功能开发中...')
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该文章吗？', '提示', {
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
          views: 0,
          downloads: 0,
          updateTime: new Date().toLocaleString().slice(0, -3)
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
.knowledge-management {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-section {
  margin-top: 20px;
}

.category-card {
  height: 600px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.category-count {
  color: #999;
  font-size: 12px;
}

.content-section {
  height: 600px;
  display: flex;
  flex-direction: column;
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

.upload-demo {
  width: 100%;
}

@media (max-width: 768px) {
  .category-section :deep(.el-row) {
    flex-direction: column;
  }
  
  .category-card {
    height: auto;
    margin-bottom: 20px;
  }
  
  .content-section {
    height: auto;
  }
}
</style>