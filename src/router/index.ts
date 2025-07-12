import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/Layout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: { title: '数据概览', icon: 'DataAnalysis' }
        },
        {
          path: 'content',
          name: 'Content',
          meta: { title: '内容管理', icon: 'Document' },
          children: [
            {
              path: 'news',
              name: 'News',
              component: () => import('../views/content/News.vue'),
              meta: { title: '法律资讯', icon: 'Notification' }
            },
            {
              path: 'knowledge',
              name: 'Knowledge',
              component: () => import('../views/content/Knowledge.vue'),
              meta: { title: '知识库', icon: 'Collection' }
            },
            {
              path: 'topics',
              name: 'Topics',
              component: () => import('../views/content/Topics.vue'),
              meta: { title: '热门话题', icon: 'ChatDotRound' }
            }
          ]
        },
        {
          path: 'users',
          name: 'Users',
          meta: { title: '用户管理', icon: 'User' },
          children: [
            {
              path: 'members',
              name: 'Members',
              component: () => import('../views/users/Members.vue'),
              meta: { title: '会员管理', icon: 'UserFilled' }
            },
            {
              path: 'experts',
              name: 'Experts',
              component: () => import('../views/users/Experts.vue'),
              meta: { title: '专家管理', icon: 'Avatar' }
            }
          ]
        },
        {
          path: 'activities',
          name: 'Activities',
          component: () => import('../views/Activities.vue'),
          meta: { title: '活动管理', icon: 'Calendar' }
        },
        {
          path: 'courses',
          name: 'Courses',
          component: () => import('../views/Courses.vue'),
          meta: { title: '课程管理', icon: 'Reading' }
        },
        {
          path: 'projects',
          name: 'Projects',
          component: () => import('../views/Projects.vue'),
          meta: { title: '项目管理', icon: 'Folder' }
        },
        {
          path: 'interactions',
          name: 'Interactions',
          meta: { title: '互动管理', icon: 'ChatLineRound' },
          children: [
            {
              path: 'consultations',
              name: 'Consultations',
              component: () => import('../views/interactions/Consultations.vue'),
              meta: { title: '法律咨询', icon: 'Service' }
            },
            {
              path: 'qa',
              name: 'QA',
              component: () => import('../views/interactions/QA.vue'),
              meta: { title: '互助问答', icon: 'QuestionFilled' }
            }
          ]
        },
        {
          path: 'statistics',
          name: 'Statistics',
          component: () => import('../views/Statistics.vue'),
          meta: { title: '数据统计', icon: 'TrendCharts' }
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('../views/Settings.vue'),
          meta: { title: '系统设置', icon: 'Setting' }
        }
      ]
    }
  ]
})

export default router