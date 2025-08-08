<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="24" class="stats-cards">
      <el-col :xs="24" :sm="12" :lg="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
          <div class="stat-trend">
            <span :class="['trend', stat.trend > 0 ? 'up' : 'down']">
              <el-icon><component :is="stat.trend > 0 ? 'TrendCharts' : 'Bottom'" /></el-icon>
              {{ Math.abs(stat.trend) }}%
            </span>
            <span class="trend-text">较上月</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="24" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card title="用户增长趋势" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
              <el-button-group size="small">
                <el-button :type="activeTab === 'week' ? 'primary' : ''" @click="handleTabChange('week')">周</el-button>
                <el-button :type="activeTab === 'month' ? 'primary' : ''" @click="handleTabChange('month')">月</el-button>
                <el-button :type="activeTab === 'year' ? 'primary' : ''" @click="handleTabChange('year')">年</el-button>
              </el-button-group>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="userGrowthOption" style="height: 300px;" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="8">
        <el-card title="内容分布" class="chart-card">
          <div class="chart-container">
            <v-chart :option="contentDistributionOption" style="height: 300px;" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新动态 -->
    <el-row :gutter="24" class="activity-row">
      <el-col :xs="24" :lg="12">
        <el-card title="最新活动" class="activity-card">
          <div class="activity-list">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                <el-icon :color="activity.color"><component :is="activity.icon" /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card title="待处理事项" class="todo-card">
          <div class="todo-list">
            <div v-for="todo in todoList" :key="todo.id" class="todo-item">
              <el-badge :value="todo.count" :type="todo.type" class="todo-badge">
                <div class="todo-content">
                  <div class="todo-title">{{ todo.title }}</div>
                  <div class="todo-desc">{{ todo.description }}</div>
                </div>
              </el-badge>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { userChartApi } from '@/api'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const activeTab = ref('week')
const userChartData = ref([])
const stats = ref([
  {
    title: '总用户数',
    value: '12,345',
    icon: 'User',
    color: '#1890ff',
    trend: 12.5
  },
  {
    title: '活跃专家',
    value: '234',
    icon: 'Avatar',
    color: '#52c41a',
    trend: 8.2
  },
  {
    title: '法律咨询',
    value: '1,567',
    icon: 'Service',
    color: '#faad14',
    trend: -3.1
  },
  {
    title: '课程总数',
    value: '89',
    icon: 'Reading',
    color: '#f5222d',
    trend: 15.3
  }
])
onMounted(() => {
  getChartData()
  getUserOverview()
})

const getUserOverview = async () => {
  const res = await userChartApi.getUserOverview()
  stats.value[0].value = res.data.data.totalCount
  // 正确计算增长率
  stats.value[0].trend = ((res.data.data.thisMonthCount - res.data.data.lastMonthCount) / res.data.data.lastMonthCount) * 100
}
// 添加切换函数
const handleTabChange = (tab: string) => {
  // 更新激活的标签
  activeTab.value = tab
  // 重新获取图表数据
  getChartData()
}

const getChartData = async () => {
  // 显示加载状态（可选）
  // loading.value = true
  try {
    const res = await userChartApi.getUserChart({"type": activeTab.value})
    userChartData.value = res.data.data.chartData
  } catch (error) {
    console.error('获取图表数据失败:', error)
    // 可以添加错误提示
  } finally {
    // 隐藏加载状态（可选）
    // loading.value = false
  }
}
const userGrowthOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: userChartData.value.map((item: any) => item.period)
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '新增用户',
      type: 'line',
      smooth: true,
      data: userChartData.value.map((item: any) => item.count),
      itemStyle: {
        color: '#1890ff'
      }
    },
    // {
    //   name: '活跃用户',
    //   type: 'line',
    //   smooth: true,
    //   data: [220, 182, 191, 234, 290, 330, 310, 201, 154, 190, 330, 410],
    //   itemStyle: {
    //     color: '#52c41a'
    //   }
    // }
  ]
}))

const contentDistributionOption = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '内容分布',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: '法律资讯' },
        { value: 735, name: '知识库' },
        { value: 580, name: '热门话题' },
        { value: 484, name: '专业课程' },
        { value: 300, name: '法律项目' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}

const recentActivities = [
  {
    id: 1,
    title: '新用户注册',
    time: '2分钟前',
    icon: 'UserFilled',
    color: '#1890ff'
  },
  {
    id: 2,
    title: '专家发布新课程',
    time: '15分钟前',
    icon: 'Reading',
    color: '#52c41a'
  },
  {
    id: 3,
    title: '法律咨询已回复',
    time: '1小时前',
    icon: 'Service',
    color: '#faad14'
  },
  {
    id: 4,
    title: '活动报名开始',
    time: '2小时前',
    icon: 'Calendar',
    color: '#f5222d'
  }
]

const todoList = [
  {
    id: 1,
    title: '待审核资讯',
    description: '有新的法律资讯等待审核',
    count: 5,
    type: 'warning'
  },
  {
    id: 2,
    title: '待回复咨询',
    description: '用户咨询等待专家回复',
    count: 12,
    type: 'danger'
  },
  {
    id: 3,
    title: '活动申请',
    description: '新的活动申请等待处理',
    count: 3,
    type: 'primary'
  },
  {
    id: 4,
    title: '系统通知',
    description: '重要系统消息需要处理',
    count: 2,
    type: 'info'
  }
]
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  height: 120px;
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
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

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.stat-trend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.trend.up {
  color: #52c41a;
}

.trend.down {
  color: #f5222d;
}

.trend-text {
  font-size: 12px;
  color: #999;
}

.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  height: 400px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-container {
  height: 300px;
}

.activity-row {
  margin-bottom: 24px;
}

.activity-card,
.todo-card {
  height: 400px;
}

.activity-list,
.todo-list {
  max-height: 320px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

.todo-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-badge {
  width: 97%;
}

.todo-content {
  width: 100%;
}

.todo-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.todo-desc {
  font-size: 12px;
  color: #666;
}

@media (max-width: 768px) {
  .charts-row {
    flex-direction: column;
  }
  
  .activity-row {
    flex-direction: column;
  }
}
</style>