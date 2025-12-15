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
      <el-table :data="students" stripe style="width: 100%">
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
        :total="totalCount"
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

const tokenStore = useTokenStore()

const semesterValue = ref('')
const courseValue = ref('')
const classValue = ref('')
const studentId = ref('')
const studentName = ref('')
const regularRatio = ref(0.3)
const finalRatio = ref(0.7)
const semesterOptions = ref([])
const courseOptions = ref([])
const classOptions = ref([])
const students = ref([])
const totalCount = ref(0)

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
})

onMounted(async ()=>{
  let {data}=await axios.get("/api/home/getInfo",{
    headers:{
      Authorization: tokenStore.getToken()
    }
  })
  
  semesterOptions.value = data.data.sem.map(item => ({
    label: item,
    value: item
  }))
  courseOptions.value = data.data.cname.map(item => ({
    label: item,
    value: item
  }))
  classOptions.value = data.data.classno.map(item => ({
    label: item,
    value: item
  }))
  
  await loadData()
})

const updateGrade = (student) => {
  if (student.regularGrades !== undefined && student.finalGrade !== undefined) {
    student.grade = (student.regularGrades * regularRatio.value + student.finalGrade * finalRatio.value).toFixed(1)
  }
}

const updateAllGrades = () => {
  students.value.forEach(student => {
    if (student.regularGrades !== undefined && student.finalGrade !== undefined) {
      student.grade = (student.regularGrades * regularRatio.value + student.finalGrade * finalRatio.value).toFixed(1)
    }
  })
}

const loadData = async () => {
  try {
    let {data} = await axios.post("/api/home/getGrades", {
      sem: semesterValue.value,
      cname: courseValue.value,
      classno: classValue.value,
      sno: studentId.value,
      sname: studentName.value,
      currentPage: pagination.currentPage-1,
      pageSize: pagination.pageSize
    }, {
      headers: {
        Authorization: tokenStore.getToken()
      }
    })
    
    if(data.msg === "fail") {
      ElMessage.error('加载数据失败')
      students.value = []
      totalCount.value = 0
    } else {
      students.value = data.data.studentVoList || []
      totalCount.value = data.data.total || 0
      
      students.value.forEach(student => {
        student.regularGrades = student.regularGrades || 0
        student.finalGrade = student.finalGrade || 0
        updateGrade(student)
      })
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败，请检查网络连接')
    students.value = []
    totalCount.value = 0
  }
}

const handleFilter = async () => {
  pagination.currentPage = 1
  await loadData()
  ElMessage.success('筛选完成')
}

const handleReset = () => {
  semesterValue.value = ''
  courseValue.value = ''
  classValue.value = ''
  studentId.value = ''
  studentName.value = ''
  pagination.currentPage = 1
  
  loadData()
  ElMessage.info('已重置筛选条件')
}

const handleSave = async (row) => {
  try {
    let {data} = await axios.post("/api/home/updateStudent", {
      sno: row.sno,
      sname: row.sname,
      cname: row.cname,
      regularGrades: row.regularGrades,
      finalGrade: row.finalGrade
    }, {
      headers: {
        Authorization: tokenStore.getToken()
      }
    })
    
    if(data.msg === 'fail') {
      ElMessage.error(`数据不在范围内`)
    } else {
      ElMessage.success(`学生 ${row.sname} 的成绩已保存`)
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请检查网络连接')
  }
}

const getScoreClass = (score) => {
  if (score >= 60) return 'high-score'
  return 'low-score'
}

const handleSizeChange = (newSize) => {
  pagination.pageSize = newSize
  pagination.currentPage = 1 
  loadData() 
}

const handleCurrentChange = (newPage) => {
  pagination.currentPage = newPage
  loadData() 
}
</script>

<style scoped>
.grade-container {
  padding: 16px;
  min-height: 100vh;
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