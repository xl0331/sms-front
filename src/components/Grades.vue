<template>
  <div class="grade-container">
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <span>学期</span>
          <el-select v-model="semesterValue" placeholder="学期" clearable>
            <el-option v-for="item in semesterOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        
        <div class="filter-item">
          <span>课程</span>
          <el-select v-model="courseValue" placeholder="课程" clearable>
            <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        
        <div class="filter-item">
          <span>班级</span>
          <el-select v-model="classValue" placeholder="班级" clearable>
            <el-option v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        
        <div class="filter-item">
          <span>学号</span>
          <el-input v-model="studentId" placeholder="学号" clearable />
        </div>
        
        <div class="filter-item">
          <span>姓名</span>
          <el-input v-model="studentName" placeholder="姓名" clearable />
        </div>
        <div class="filter-buttons">
          <el-button type="primary" @click="handleFilter" :icon="Search">筛选</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
        </div>
      </div>
    </el-card>

    <el-card class="table-card">
      <el-table :data="pagedStudents" stripe style="width: 100%">
        <el-table-column label="学号" prop="sno" align="center" />
        <el-table-column label="姓名" prop="sname" align="center" />
        <el-table-column label="班级" prop="classno" align="center" />
        <el-table-column label="课程名" prop="cname" align="center" />
        <el-table-column label="平时成绩" align="center">
          <template #default="scope">
            <el-input 
              v-model.number="scope.row.regularGrades" 
              @input="updateGrade(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="平时成绩比例" align="center">
          <template #default>
            <el-input 
              v-model.number="regularRatio" 
              @input="updateAllGrades"
            />
          </template>
        </el-table-column>
        <el-table-column label="期末成绩" align="center">
          <template #default="scope">
            <el-input 
              v-model.number="scope.row.finalGrade" 
              @input="updateGrade(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="期末成绩比例" align="center">
          <template #default>
            <el-input 
              v-model.number="finalRatio" 
              @input="updateAllGrades"
            />
          </template>
        </el-table-column>
        <el-table-column label="总成绩" align="center">
          <template #default="scope">
            <span :class="getScoreClass(scope.row.grade)">{{ scope.row.grade }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleSave(scope.row)">保存</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <div class="pagination">
      <el-pagination 
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[5, 10, 20, 50]"
        :total="students.length"
        layout="prev, pager, next, jumper, sizes, total"
        :background="true"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import axios from 'axios'
import { useTokenStore } from '@/stores/token'
const tokenStore=useTokenStore()
const semesterValue = ref('')
const courseValue = ref('')
const classValue = ref('')
const studentId = ref('')
const studentName = ref('')
const regularRatio = ref(0.3)
const finalRatio = ref(0.7)
onMounted(async ()=>{
  let {data}=await axios.get("/api/home/getInfo",{
    headers:{
      Authorization:tokenStore.getToken()
    }
  })
  console.log(data.data)
  semesterOptions.value = data.data.sem.map(item => ({
        label: item,
        value: item}))
  courseOptions.value = data.data.cname.map(item => ({
        label: item,
        value: item
      }))
  classOptions.value = data.data.classno.map(item => ({
        label: item,
        value: item
      }))
})
const semesterOptions = ref([])
const courseOptions = ref([])
const classOptions = ref([])
const students = ref([])

const updateGrade = (student) => {
  student.grade = (student.regularGrades * regularRatio.value + student.finalGrade * finalRatio.value).toFixed(1)
}

const updateAllGrades = () => {
  students.value.forEach(student => {
    student.grade = (student.regularGrades * regularRatio.value + student.finalGrade * finalRatio.value).toFixed(1)
  })
}

students.value.forEach(student => {
  updateGrade(student)
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 5,
})

const pagedStudents = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return students.value.slice(start, end)
})

const handleFilter = async () => {
  let {data}=await axios.post("/api/home/getGrades",{
    sem:semesterValue.value,
    cname:courseValue.value,
    classno:classValue.value,
    sno:studentId.value,
    sname:studentName.value
  },{
    headers:{
      Authorization:tokenStore.getToken()
    }
  })
  if(data.msg=="fail")ElMessage.error('筛选失败')
  else{
    students.value=data.data;
    updateAllGrades()
    ElMessage.success('筛选完成')
  }
}

const handleReset = () => {
  semesterValue.value = ''
  courseValue.value = ''
  classValue.value = ''
  studentId.value = ''
  studentName.value = ''
  ElMessage.info('已重置筛选条件')
}

const handleSave = async (row) => {
  let {data}=await axios.post("/api/home/updateStudent",{
    sno:row.sno,
    sname:row.sname,
    cname:row.cname,
    regularGrades:row.regularGrades,
    finalGrade:row.finalGrade
  },{
    headers:{
      Authorization:tokenStore.getToken()
    }
  })
  console.log(data)
  if(data.msg=='fail')ElMessage.error(`数据不在范围内`)
  else ElMessage.success(`学生 ${row.sname} 的成绩已保存`)
}

const getScoreClass = (score) => {
  if (score >= 60) return 'high-score'
  return 'low-score'
}

const handleSizeChange = (newSize) => {
  pagination.pageSize = newSize
  pagination.currentPage = 1 
}

const handleCurrentChange = (newPage) => {
  pagination.currentPage = newPage
}
</script>

<style scoped>
.grade-container {
  padding: 16px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card {
  flex-shrink: 0;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-item span {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.filter-item :deep(.el-select),
.filter-item :deep(.el-input) {
  width: 120px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-card :deep(.el-table) {
  flex: 1;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.high-score {
  color: #67c23a;
  font-weight: bold;
}

.low-score {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
}
</style>