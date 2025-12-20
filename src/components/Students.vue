<template>
  <div class="course-manage">
    <h2>课程管理</h2>
    
    <div class="course-list">
      <div v-for="item in courses" :key="item.cno" class="course-item">
        <div class="course-info">
          <h3>{{ item.cname }} ({{ item.cno }})</h3>
          <p>学期: {{ item.sem }} | 学分: {{ item.cscore }}</p>
          <p>时间: {{ item.classTime }} | 教室: {{ item.classroom }}</p>
          <p>选课: {{ item.enrolled }}/{{ item.capacity }}人 | 状态: {{ item.status }}</p>
        </div>
        
        <div class="course-actions">
          <el-button type="primary" size="small" @click="showAddStudent(item)">
            添加学生
          </el-button>
          <el-button type="success" size="small" @click="showAddClass(item)">
            添加班级
          </el-button>
        </div>
      </div>
    </div>

    <!-- 添加学生弹窗 -->
    <el-dialog v-model="studentDialog" title="添加学生" width="400px">
      <div v-if="selectedCourse">
        <p>课程: {{ selectedCourse.cname }}</p>
        <el-input
          v-model="studentInput"
          placeholder="请输入学号，多个学号用逗号分隔"
          type="textarea"
          :rows="3"
        />
        <p style="margin-top:10px;color:#666">示例: 2023001,2023002,2023003</p>
      </div>
      <template #footer>
        <el-button @click="studentDialog = false">取消</el-button>
        <el-button type="primary" @click="addStudents">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加班级弹窗 -->
    <el-dialog v-model="classDialog" title="添加班级" width="400px">
      <div v-if="selectedCourse">
        <p>课程: {{ selectedCourse.cname }}</p>
        <el-input
          v-model="classInput"
          placeholder="请输入班级号"
        />
      </div>
      <template #footer>
        <el-button @click="classDialog = false">取消</el-button>
        <el-button type="success" @click="addClass">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useTokenStore } from '@/stores/token'
const tokenStore = useTokenStore()
import { ElButton, ElDialog, ElInput, ElMessage } from 'element-plus'

// 课程数据
const courses = ref([])
// 弹窗控制
const studentDialog = ref(false)
const classDialog = ref(false)
const selectedCourse = ref(null)

// 输入数据
const studentInput = ref('')
const classInput = ref('')

// 加载课程
const loadCourses = async () => {
  try {
    const response = await axios.get("/api/course/getCourses", {
      headers: { Authorization: tokenStore.getToken() }
    });
    if (response.data.msg === "success") {
      // 格式化数据，确保所有字段都有默认值
      courses.value = response.data.data.map(course => ({
        cno: course.cno || '',
        cname: course.cname || '',
        cscore: course.cscore || 0,
        sem: course.sem || '',
        classroom: course.classroom || '',
        classTime: course.classTime || '',
        capacity: course.capacity || 0,
        enrolled: course.enrolled || 0,
        status: course.status || 'open'
      }));
    }
  } catch (error) {
    ElMessage.error("加载课程数据失败");
    console.error(error);
  }
}

// 显示添加学生弹窗
const showAddStudent = (course) => {
  selectedCourse.value = course
  studentInput.value = ''
  studentDialog.value = true
}

// 显示添加班级弹窗
const showAddClass = (course) => {
  selectedCourse.value = course
  classInput.value = ''
  classDialog.value = true
}

// 添加学生
const addStudents = async() => {
  if (!studentInput.value.trim()) {
    ElMessage.warning('请输入学号')
    return
  }
  
  const studentIds = studentInput.value.split(',').map(id => id.trim()).filter(id => id)
  
  if (studentIds.length === 0) {
    ElMessage.warning('请输入有效的学号')
    return
  }
  
  try {
    const response = await axios.post("/api/student/addStudentBySno", {
      sno: studentIds,
      cno: selectedCourse.value.cno,
      sem: selectedCourse.value.sem
    }, {
      headers: { Authorization: tokenStore.getToken() }
    });
    
    if (response.data.msg === "success") {
      ElMessage.success("学号添加成功");
      studentDialog.value = false;
      studentInput.value = '';
      // 重新加载课程数据，更新选课人数
      loadCourses();
    } else {
      ElMessage.error(response.data.msg || "学号添加失败");
    }
  } catch (error) {
    ElMessage.error("学号添加失败");
    console.error(error);
  }
}

// 添加班级
const addClass = async () => {
  if (!classInput.value.trim()) {
    ElMessage.warning('请输入班级号')
    return
  }
  
  try {
    const response = await axios.post("/api/student/addStudentsByCno", {
      classno: classInput.value.trim(),
      cno: selectedCourse.value.cno,
      sem: selectedCourse.value.sem
    }, {
      headers: { Authorization: tokenStore.getToken() }
    });
    
    if (response.data.msg === "success") {
      ElMessage.success("班级添加成功");
      classDialog.value = false;
      classInput.value = '';
      // 重新加载课程数据，更新选课人数
      loadCourses();
    } else {
      ElMessage.error(response.data.msg || "班级添加失败");
    }
  } catch (error) {
    ElMessage.error("班级添加失败");
    console.error(error);
  }
}

// 初始化
onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.course-manage {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.course-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: 0.3s;
}

.course-item:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.course-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
}

.course-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.course-actions {
  display: flex;
  gap: 10px;
}
</style>