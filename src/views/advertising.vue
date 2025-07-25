<template>
  <div class="page-container">
    <div class="card">
      <div class="card-header">
        <div class="header-content">
          <h1>广告管理</h1>
          <el-button type="primary" @click="showModal = true" size="default" class="operation-btn">
            <el-icon><Plus /></el-icon>
            新增广告位
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <!-- 广告位列表 -->
        <el-table :data="ads" stripe border style="width: 100%">
          <el-table-column prop="companyName" label="公司名称" min-width="120"></el-table-column>
          <el-table-column label="广告图片" min-width="100">
            <template #default="{ row }">
              <el-image :src="row.imageUrl" :preview-src-list="[row.imageUrl]" style="width: 50px; height: 50px; object-fit: cover;"></el-image>
            </template>
          </el-table-column>
          <el-table-column prop="linkUrl" label="链接地址" min-width="200"></el-table-column>
          <el-table-column label="操作" min-width="120" align="center">
            <template #default="{ row }">
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
        
    <!-- 新增广告位弹窗 -->
    <el-dialog v-model="showModal" title="新增广告位" width="500px">
      <el-form ref="adFormRef" :model="adForm" :rules="adFormRules" label-width="100px">
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="adForm.companyName" placeholder="请输入公司名称"></el-input>
        </el-form-item>
        <el-form-item label="图片上传" prop="imageUrl">
          <el-upload
            class="upload-custom"
            action="/api/upload"
            :headers="{ Authorization: 'Bearer ' + token }"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            v-model:file-list="fileList"
            list-type="picture-card"
            :limit="1"
            :on-exceed="handleExceed"
          >
            <div style="display: flex;align-items: center;flex-direction: column;">
                <div class="upload-icon-container">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                </div>
              <div class="upload-text">点击上传或拖拽文件至此处</div>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="链接URL" prop="linkUrl">
          <el-input v-model="adForm.linkUrl" placeholder="请输入链接URL"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showModal = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue'
// 取消注释以导入advertisementApi
import { advertisementApi } from '../../api'

// 控制弹窗显示/隐藏
const showModal = ref(false)

// 广告位表单数据（仅保留三个字段）
const adForm = ref({
  companyName: '',
  imageUrl: '',
  linkUrl: ''
})

// 表单验证规则
// const userStore = useUserStore()
// const token = userStore.token
const fileList = ref([])

// 上传前验证
const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isJpgOrPng) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
  }
  return isJpgOrPng && isLt2M
}

// 文件超出数量限制时的钩子
const handleExceed = () => {
  ElMessage.error('最多只能上传1张图片')
}

// 上传成功处理
const handleUploadSuccess = (response) => {
  if (response.code === 200) {
    adForm.imageUrl = response.data.url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败: ' + response.msg)
  }
}

// 表单引用
const adFormRef = ref()

// 提交表单
const handleSubmit = () => {
  adFormRef.value.validate((valid) => {
    if (valid) {
      // 这里添加表单提交逻辑
      console.log('广告位数据:', adForm)
      ElMessage.success('广告位创建成功')
      showModal.value = false
      // 重置表单
      adFormRef.value.resetFields()
    }
  })
}
// 更新表单验证规则
const adFormRules = ref({
  companyName: [
    { required: true, message: '请输入公司名称', trigger: 'blur' },
    { min: 2, max: 100, message: '公司名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  imageUrl: [
    { required: true, message: '请上传图片', trigger: 'change' }
  ],
  linkUrl: [
    { required: true, message: '请输入链接URL', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ]
})

// 广告位数据列表
const ads = ref([]);

// 获取广告位列表
const fetchAds = async () => {
  try {
    const response = await request.get('/api/advertisements');
    ads.value = response.data;
  } catch (error) {
    ElMessage.error('获取广告位列表失败');
    console.error(error);
  }
};

// 编辑广告位
const handleEdit = (row) => {
  showModal.value = true;
  adForm.value = { ...row };
  isEdit.value = true;
};

// 删除广告位
const handleDelete = async (row) => {
  ElMessageBox.confirm(
    '确定要删除这个广告位吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await request.delete(`/api/advertisements/${row.id}`);
      ElMessage.success('删除成功');
      fetchAds();
    } catch (error) {
      ElMessage.error('删除失败');
      console.error(error);
    }
  }).catch(() => {
    // 用户取消操作
  });
};

// 页面加载时获取广告位列表
onMounted(() => {
  fetchAds();
});
</script>
<style scoped>
.page-container {
  padding: 20px;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 16px;
  border-bottom: 1px solid #eaeaea;
}

.card-body {
  padding: 16px;
}

h1 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 500;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operation-btn {
  margin-bottom: 10px;
}

/* 确保按钮图标与文字垂直居中对齐 */
el-button.operation-btn .el-icon {
  vertical-align: middle;
  margin-right: 5px;
}

/* 自定义上传区域样式 */
.upload-custom .el-upload {
  width: 100%;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #c0c4cc;
  border-radius: 8px;
  transition: all 0.3s;
}

.upload-custom .el-upload:hover {
  border-color: #409eff;
  background-color: #f5f9ff;
}

.upload-icon-container {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.upload-icon {
  font-size: 24px;
  color: #409eff;
}

.upload-text {
  font-size: 12px;
  color: #b3b3b3;
  margin-bottom: 6px;
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

/* 修复图片预览样式 */
.upload-custom .el-upload-list__item {
  width: 100%;
  height: 180px;
}
</style>