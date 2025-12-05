<template>
  <div class="container">
    <Header></Header>
    <div class="common-layout">
      <div class="aside">
        <div class="link"><RouterLink to="/home/grades">学生成绩</RouterLink></div>
        <div class="link"><RouterLink to="/home/attendance">考勤管理</RouterLink></div>
        <div class="link"><RouterLink to="/home/courses">课程信息</RouterLink></div>
        <div class="link"><RouterLink to="/home/students">学生档案</RouterLink></div>
        <div class="link"><RouterLink to="/home/reports">统计报表</RouterLink></div>
      </div>
      <div class="content">
        <div class="main">
          <RouterView/>
        </div>
        <div class="footer">学生信息管理系统 © 2023</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from './Header.vue';
import { useTokenStore } from '@/stores/token'
const tokenStore = useTokenStore()
</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.common-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.common-layout * {
  box-sizing: border-box;
}

.aside {
  width: 220px;
  background: linear-gradient(180deg, #2c3e50 0%, #3498db 100%);
  flex-direction: column;
  padding: 0;
  display: flex;
  align-items: stretch;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  border: none;
}

.link {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.link:last-child {
  border-bottom: none;
}

.link a {
  display: block;
  text-decoration: none;
  color: #ecf0f1;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.link a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0;
  background: rgba(255, 255, 255, 0.1);
  transition: width 0.3s ease;
}

.link a:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding-left: 25px;
}

.link a:hover::before {
  width: 4px;
  background: #e74c3c;
}

.link a.router-link-active {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-weight: 600;
  padding-left: 25px;
  border-left: 4px solid #e74c3c;
}

.link a.router-link-active::after {
  content: '›';
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #e74c3c;
}

.content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.main {
  flex: 1;
  padding: 25px;
  background-color: #f8f9fa;
  overflow: auto;
  border: none;
}

.footer {
  height: 60px;
  min-height: 60px;
  background-color: #34495e;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ecf0f1;
  font-size: 14px;
  border: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .common-layout {
    flex-direction: column;
  }
  
  .aside {
    width: 100%;
    height: auto;
    padding: 0;
    flex-direction: row;
    overflow-x: auto;
  }
  
  .link {
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }
  
  .link:last-child {
    border-right: none;
  }
  
  .link a {
    padding: 12px 15px;
    white-space: nowrap;
  }
  
  .link a:hover,
  .link a.router-link-active {
    padding-left: 15px;
    border-left: none;
    border-bottom: 3px solid #e74c3c;
  }
  
  .link a.router-link-active::after {
    display: none;
  }
  
  .footer {
    height: 50px;
    min-height: 50px;
  }
}
</style>