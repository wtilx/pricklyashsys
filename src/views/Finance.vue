<template>
  <div class="finance-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>财务管理</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="人民币账户" name="rmb">
          <div class="balance-info">
            <div class="balance-amount">¥{{ rmbBalance.toLocaleString() }}</div>
            <div class="balance-desc">可用余额</div>
          </div>
          <el-table :data="rmbTransactions" stripe>
            <!-- 交易记录表格内容 -->
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="花椒账户" name="huajiao">
          <div class="balance-info">
            <div class="balance-amount">{{ huajiaoBalance.toLocaleString() }} 花椒</div>
            <div class="balance-desc">可用余额</div>
          </div>
          <el-table :data="huajiaoTransactions" stripe>
            <!-- 花椒交易记录表格内容 -->
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('rmb');
const rmbBalance = ref(15000.50);
const huajiaoBalance = ref(2500);
const rmbTransactions = ref([/* 交易记录数据 */]);
const huajiaoTransactions = ref([/* 花椒交易记录数据 */]);
</script>