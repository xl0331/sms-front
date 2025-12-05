<template>
  <div class="login">
    <div class="login-card">
      <div class="login-head">
        登录界面
      </div>
      <el-form label-width="auto">
        <el-form-item label="账号">
          <el-input v-model="input.username" style="width: 240px" placeholder="请输入账号" clearable/>
        </el-form-item>
        <el-form-item label="密码">
           <el-input v-model="input.password" style="width: 240px" placeholder="请输入密码" clearable show-password/>
        </el-form-item>
        <el-form-item label="验证码">
           <el-input v-model="input.code" style="width: 120px" placeholder="请输入验证码" clearable/>
           <img :src=code_url @click="updateCode" style="height:32px;width:110px;margin-left:10px"/>
        </el-form-item>
        <div class="button-item">
          <el-button type="primary" @click="onSubmit">登录</el-button>
        </div>
      </el-form>
  </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useTokenStore } from '@/stores/token'
const router=useRouter()
const useToken=useTokenStore()
onMounted(()=>{
  if(useToken.isTokenValid())router.push('/home')
  updateCode()
})
const input=reactive({
  username:'',
  password:'',
  code:''
})
let code_url=ref('')
let codeKey=ref('')
async function updateCode(){
  let {data}=await axios.get("/api/login/getCode")
  code_url.value=data.data.code
  codeKey.value=data.data.codeKey
}
async function onSubmit(){
  let {data}=await axios.post("/api/login",{
    tno:input.username,
    password:input.password,
    code:input.code,
    codeKey:codeKey.value
  })
  if(data.msg=='success'){
    console.log(data.data.token);
    useToken.setToken(data.data.token)
    ElMessageBox.alert('登录成功')
    router.push('/home')
  }else if(data.msg=='fail'){
    ElMessageBox.alert('登录失败')
  }
}
</script>

<style scoped>
.login{
  display: flex;
  justify-content: center;
  align-items: center;
  height:100vh;
  background:linear-gradient(to bottom right, #ff99cc, #66ccff);
}
.login-head{
  text-align: center;
  font-size: 100%;
}
.login-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items:center;
  gap: 10px;
  padding: 40px 30px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  width: 380px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}
.button-item {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  width:100%;
}
</style>