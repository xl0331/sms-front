<!-- Header.vue -->
<template>
  <div class="header">
    <div class="left">
        <div class="logo-container">
          <img src="../assets/logo.png" alt="Logo" class="logo"/>
        </div>
        <div class="info">学生信息管理系统</div>
    </div>
    <div class="right">
        <el-avatar :size="size" :src="circleUrl" />
        <div class="user_info">{{ nickname }}</div>
        <el-button type="danger" @click="logout">退出</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTokenStore } from '@/stores/token';
import { ElMessageBox } from 'element-plus';
const tokenStore = useTokenStore()
const nickname = ref('')
const avatar = ref('')
const size = ref('default')
const circleUrl = ref('') 
const router=useRouter()
nickname.value = tokenStore.getTName()
avatar.value = tokenStore.getAvatar()
circleUrl.value = avatar.value
const logout=()=>{
    tokenStore.removeToken()
    ElMessageBox.alert('退出成功')
    router.push("/login")
}
</script>

<style scoped>
.header {
  height: 60px;
  background-color: #74ade7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  padding: 0 20px;
}

.left {
  font-size: larger;
  font-family: 'Times New Roman', Times, serif;
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-container {
  height: 40px; 
  width: 100px;  
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
}

.logo {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.info {
  white-space: nowrap;
  color: white;
  font-weight: bold;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px; 
}

.user_info {
  color: white;
  font-weight: 500;
}
</style>