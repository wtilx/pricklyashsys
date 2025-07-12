<template>
  <div class="statistics">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据统计</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              @change="handleDateChange"
            />
            <el-button type="primary" :icon="Download" @click="handleExport">
              导出报告
            </el-button>
          </div>
        </div>
      </template>

      <!-- 概览统计 -->
      <div class="overview-stats">
        <el-row :gutter="20">
          <el-col :xs="12" :sm="6" v-for="stat in overviewStats" :key="stat.title">
            <div class="stat-card">
              <div class="stat-icon" :style="{ backgroundColor: stat.color }">
                <el-icon :size="24"><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-title">{{ stat.title }}</div>
                <div class="stat-trend">
                  <span :class="['trend', stat.trend > 0 ? 'up' : 'down']">
                    <el-icon><component :is="stat.trend > 0 ? 'TrendCharts' : 'Bottom'" /></el-icon>
                    {{ Math.abs(stat.trend) }}%
                  </span>
                  <span class="trend-text">较上期</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <el-row :gutter="20">
          <!-- 用户增长趋势 -->
          <el-col :xs="24" :lg="12">
            <el-card class="chart-card">
              <template #header>
                <div class="chart-header">
                  <span>用户增长趋势</span>
                  <el-button-group size="small">
                    <el-button :type="userChartType === 'week' ? 'primary' : ''" @click="userChartType = 'week'">周</el-button>
                    <el-button :type="userChartType === 'month' ? 'primary' : ''" @click="userChartType = 'month'">月</el-button>
                    <el-button :type="userChartType === 'year' ? 'primary' : ''" @click="userChartType = 'year'">年</el-button>
                  </el-button-group>
                </div>
              </template>
              <div class="chart-container">
                <v-chart :option="userGrowthOption" style="height: 300px;" />
              </div>
            </el-card>
          </el-col>

          <!-- 内容统计 -->
          <el-col :xs="24" :lg="12">
            <el-card class="chart-card">
              <template #header>
                <span>内容统计分布</span>
              </template>
              <div class="chart-container">
                <v-chart :option="contentStatsOption" style="height: 300px;" />
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <!-- 活动参与度 -->
          <el-col :xs="24" :lg="12">
            <el-card class="chart-card">
              <template #header>
                <span>活动参与度</span>
              </template>
              <div class="chart-container">
                <v-chart :option="activityStatsOption" style="height: 300px;" />
              </div>
            </el-card>
          </el-col>

          <!-- 咨询处理效率 -->
          <el-col :xs="24" :lg="12">
            <el-card class="chart-card">
              <template #header>
                <span>咨询处理效率</span>
              </template>
              <div class="chart-container">
                <v-chart :option="consultationStatsOption" style="height: 300px;" />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 详细数据表格 -->
      <div class="data-tables">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="用户数据" name="users">
            <el-table :data="userStatsData" stripe>
              <el-table-column prop="date" label="日期" width="120" />
              <el-table-column prop="newUsers" label="新增用户" width="100" />
              <el-table-column prop="activeUsers" label="活跃用户" width="100" />
              <el-table-column prop="totalUsers" label="总用户数" width="100" />
              <el-table-column prop="retention" label="留存率" width="100">
                <template #default="{ row }">
                  {{ row.retention }}%
                </template>
              </el-table-column>
              <el-table-column prop="avgSessionTime" label="平均会话时长" width="120" />
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="内容数据" name="content">
            <el-table :data="contentStatsData" stripe>
              <el-table-column prop="type" label="内容类型" width="120" />
              <el-table-column prop="total" label="总数" width="100" />
              <el-table-column prop="published" label="已发布" width="100" />
              <el-table-column prop="views" label="总浏览量" width="120" />
              <el-table-column prop="avgViews" label="平均浏览量" width="120" />
              <el-table-column prop="engagement" label="互动率" width="100">
                <template #default="{ row }">
                  {{ row.engagement }}%
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="业务数据" name="business">
            <el-table :data="businessStatsData" stripe>
              <el-table-column prop="metric" label="业务指标" width="150" />
              <el-table-column prop="thisMonth" label="本月" width="100" />
              <el-table-column prop="lastMonth" label="上月" width="100" />
              <el-table-column prop="growth" label="增长率" width="100">
                <template #default="{ row }">
                  <span :class="['growth', row.growth > 0 ? 'positive' : 'negative']">
                    {{ row.growth > 0 ? '+' : '' }}{{ row.growth }}%
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="target" label="目标完成度" width="120">
                <template #default="{ row }">
                  <el-progress :percentage="row.target" :stroke-width="8" />
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const dateRange = ref<[Date, Date] | null>(null)
const userChartType = ref('month')
const activeTab = ref('users')

const overviewStats = [
  {
    title: '总用户数',
    value: '12,345',
    icon: 'User',
    color: '#1890ff',
    trend: 12.5
  },
  {
    title: '月活跃用户',
    value: '8,765',
    icon: 'TrendCharts',
    color: '#52c41a',
    trend: 8.2
  },
  {
    title: '总咨询数',
    value: '2,567',
    icon: 'Service',
    color: '#faad14',
    trend: -3.1
  },
  {
    title: '课程完成率',
    value: '85.6%',
    icon: 'Reading',
    color: '#f5222d',
    trend: 15.3
  }
]

const userGrowthOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['新增用户', '活跃用户']
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '新增用户',
      type: 'line',
      smooth: true,
      data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330],
      itemStyle: {
        color: '#1890ff'
      }
    },
    {
      name: '活跃用户',
      type: 'line',
      smooth: true,
      data: [220, 182, 191, 234, 290, 330, 310, 201, 154, 190, 330, 410],
      itemStyle: {
        color: '#52c41a'
      }
    }
  ]
}))

const contentStatsOption = {
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
        { value: 735, name: '知识库文章' },
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

const activityStatsOption = {
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['线上讲座', '线下研讨', '案例分析', '法规解读', '实务培训']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '参与人数',
      type: 'bar',
      data: [320, 280, 450, 380, 420],
      itemStyle: {
        color: '#1890ff'
      }
    }
  ]
}

const consultationStatsOption = {
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['待处理', '已回复', '已关闭']
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '待处理',
      type: 'bar',
      stack: 'total',
      data: [20, 25, 18, 22, 28, 15, 12],
      itemStyle: {
        color: '#faad14'
      }
    },
    {
      name: '已回复',
      type: 'bar',
      stack: 'total',
      data: [80, 95, 72, 88, 112, 65, 58],
      itemStyle: {
        color: '#52c41a'
      }
    },
    {
      name: '已关闭',
      type: 'bar',
      stack: 'total',
      data: [60, 70, 55, 65, 85, 48, 42],
      itemStyle: {
        color: '#1890ff'
      }
    }
  ]
}

const userStatsData = ref([
  {
    date: '2024-01-15',
    newUsers: 156,
    activeUsers: 1234,
    totalUsers: 12345,
    retention: 85.6,
    avgSessionTime: '25分钟'
  },
  {
    date: '2024-01-14',
    newUsers: 142,
    activeUsers: 1189,
    totalUsers: 12189,
    retention: 84.2,
    avgSessionTime: '23分钟'
  },
  {
    date: '2024-01-13',
    newUsers: 168,
    activeUsers: 1298,
    totalUsers: 12047,
    retention: 86.1,
    avgSessionTime: '27分钟'
  }
])

const contentStatsData = ref([
  {
    type: '法律资讯',
    total: 1048,
    published: 956,
    views: 125680,
    avgViews: 131,
    engagement: 12.5
  },
  {
    type: '知识库文章',
    total: 735,
    published: 698,
    views: 89456,
    avgViews: 128,
    engagement: 15.8
  },
  {
    type: '热门话题',
    total: 580,
    published: 542,
    views: 67890,
    avgViews: 125,
    engagement: 28.6
  },
  {
    type: '专业课程',
    total: 484,
    published: 456,
    views: 156789,
    avgViews: 344,
    engagement: 45.2
  }
])

const businessStatsData = ref([
  {
    metric: '法律咨询',
    thisMonth: 2567,
    lastMonth: 2234,
    growth: 14.9,
    target: 85
  },
  {
    metric: '课程报名',
    thisMonth: 1234,
    lastMonth: 1456,
    growth: -15.3,
    target: 72
  },
  {
    metric: '活动参与',
    thisMonth: 856,
    lastMonth: 789,
    growth: 8.5,
    target: 95
  },
  {
    metric: '专家回复',
    thisMonth: 2145,
    lastMonth: 1987,
    growth: 8.0,
    target: 88
  }
])

const handleDateChange = (dates: [Date, Date] | null) => {
  if (dates) {
    ElMessage.info('日期范围已更新，数据正在重新加载...')
  }
}

const handleExport = () => {
  ElMessage.success('数据报告导出功能开发中...')
}
</script>

<style scoped>
.statistics {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-stats {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 120px;
}

.stat-icon {
  width: 56px;
  height: 56px;
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
  font-size: 28px;
  font-weight: bold;
  color: #333;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 8px;
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

.charts-section {
  margin-bottom: 30px;
}

.chart-card {
  height: 400px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-container {
  height: 300px;
}

.data-tables {
  margin-top: 30px;
}

.growth.positive {
  color: #52c41a;
}

.growth.negative {
  color: #f5222d;
}

@media (max-width: 768px) {
  .overview-stats :deep(.el-row) {
    flex-direction: column;
  }
  
  .charts-section :deep(.el-row) {
    flex-direction: column;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 12px;
  }
}
</style>