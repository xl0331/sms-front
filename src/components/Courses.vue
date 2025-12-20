<template>
  <div class="course-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课程列表</span>
          <el-button type="primary" size="small" @click="handleAdd">
            添加课程
          </el-button>
        </div>
      </template>
      
      <el-table :data="courses" style="width: 100%">
        <el-table-column prop="cno" label="课程号" width="100" />
        <el-table-column prop="cname" label="课程名称" />
        <el-table-column prop="cscore" label="学分" width="80">
          <template #default="scope">
            <span class="credit">{{ scope.row.cscore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sem" label="学期" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.sem" size="small" type="primary">
              {{ scope.row.sem }}
            </el-tag>
            <span v-else class="no-data">未安排</span>
          </template>
        </el-table-column>
        <el-table-column prop="classroom" label="教室" width="120">
          <template #default="scope">
            <span v-if="scope.row.classroom">{{ scope.row.classroom }}</span>
            <span v-else class="no-data">未安排</span>
          </template>
        </el-table-column>
        <el-table-column prop="classTime" label="上课时间" width="150">
          <template #default="scope">
            <span v-if="scope.row.classTime">{{ scope.row.classTime }}</span>
            <span v-else class="no-data">未安排</span>
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="课程容量" width="100">
          <template #default="scope">
            {{ scope.row.capacity || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="enrolled" label="已选人数" width="100">
          <template #default="scope">
            <span :class="{'full': scope.row.enrolled >= scope.row.capacity}">
              {{ scope.row.enrolled || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <div class="button-group">
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑/添加课程对话框 -->
    <el-dialog v-model="showDialog" :title="dialogTitle" width="600px">
      <el-form :model="formData" label-width="100px" ref="formRef" :rules="rules">
        <!-- 课程基本信息 -->
        <el-form-item label="课程号" prop="cno">
          <el-input v-model="formData.cno" :disabled="isEditMode" />
        </el-form-item>
        <el-form-item label="课程名称" prop="cname">
          <el-input v-model="formData.cname" />
        </el-form-item>
        <el-form-item label="学分" prop="cscore">
          <el-input-number 
            v-model="formData.cscore" 
            :min="0.5" 
            :max="10" 
            :step="0.5" 
            style="width: 100%"
          />
        </el-form-item>
        
        <!-- 课程安排信息 -->
        <el-divider>课程安排信息</el-divider>
        
        <el-form-item label="学期" prop="sem" >
          <el-input v-model="formData.sem" placeholder="例如：2023秋" :disabled="isEditMode"/>
        </el-form-item>
        <el-form-item label="教室" prop="classroom">
          <el-input v-model="formData.classroom" placeholder="例如：逸夫楼201" />
        </el-form-item>
        <el-form-item label="上课时间" prop="classTime">
          <el-input v-model="formData.classTime" placeholder="例如：周三 10:00-11:40" />
        </el-form-item>
        <el-form-item label="课程容量" prop="capacity">
          <el-input-number 
            v-model="formData.capacity" 
            :min="1" 
            :max="200" 
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="已选人数" prop="enrolled">
          <el-input-number 
            v-model="formData.enrolled" 
            :min="0" 
            :max="formData.capacity" 
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option label="开放" value="open" />
            <el-option label="已满" value="full" />
            <el-option label="关闭" value="closed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";
import { useTokenStore } from "@/stores/token";

const tokenStore = useTokenStore();
const courses = ref([]);
const showDialog = ref(false);
const isEditMode = ref(false);
const formRef = ref(null);

const formData = reactive({
  cno: "",
  cname: "",
  cscore: 2,
  sem: "",
  classroom: "",
  classTime: "",
  capacity: 30,
  enrolled: 0,
  status: "open"
});

// 表单验证规则
const rules = {
  cno: [
    { required: true, message: '请输入课程号', trigger: 'blur' },
    { min: 1, max: 10, message: '课程号长度在1-10个字符', trigger: 'blur' }
  ],
  cname: [
    { required: true, message: '请输入课程名称', trigger: 'blur' },
    { min: 2, max: 50, message: '课程名称长度在2-50个字符', trigger: 'blur' }
  ],
  cscore: [
    { required: true, message: '请输入学分', trigger: 'blur' }
  ],
  sem: [
    { required: true, message: '请输入学期', trigger: 'blur' }
  ],
  capacity: [
    { required: true, message: '请输入课程容量', trigger: 'blur' }
  ]
};

const dialogTitle = computed(() => isEditMode.value ? "编辑课程" : "添加课程");

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'open': return 'success';
    case 'full': return 'warning';
    case 'closed': return 'danger';
    default: return 'info';
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'open': return '开放';
    case 'full': return '已满';
    case 'closed': return '关闭';
    default: return '未知';
  }
};

onMounted(loadData);

async function loadData() {
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

function handleEdit(course) {
  isEditMode.value = true;
  // 填充所有字段
  Object.assign(formData, {
    cno: course.cno || '',
    cname: course.cname || '',
    cscore: course.cscore || 2,
    sem: course.sem || '',
    classroom: course.classroom || '',
    classTime: course.classTime || '',
    capacity: course.capacity || 30,
    enrolled: course.enrolled || 0,
    status: course.status || 'open'
  });
  showDialog.value = true;
}

function handleAdd() {
  isEditMode.value = false;
  // 重置表单数据
  Object.assign(formData, {
    cno: "",
    cname: "",
    cscore: 2,
    sem: "",
    classroom: "",
    classTime: "",
    capacity: 30,
    enrolled: 0,
    status: "open"
  });
  showDialog.value = true;
}

async function handleSave() {
  try {
    // 验证表单
    await formRef.value.validate();
    
    const url = isEditMode.value ? "/api/course/updateCourse" : "/api/course/addCourse";
    const response = await axios.post(url, formData, {
      headers: { Authorization: tokenStore.getToken() }
    });
    
    if (response.data.msg === "success") {
      ElMessage.success(isEditMode.value ? "课程更新成功" : "课程添加成功");
      showDialog.value = false;
      await loadData();
    } else {
      ElMessage.error(response.data.msg || "保存失败");
    }
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data.msg || "保存失败");
    } else if (!error.message.includes("validate")) {
      ElMessage.error("保存失败");
    }
  }
}

async function handleDelete(course) {
  try {
    await ElMessageBox.confirm(
      `确定删除课程"${course.cname}"吗？删除后相关安排和选课记录也会被删除。`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    
    const response = await axios.post("/api/course/deleteCourse", 
      { 
        cno: course.cno,
        // 如果是删除特定安排，需要传递学期信息
        sem: course.sem || null
      },
      { headers: { Authorization: tokenStore.getToken() } }
    );
    
    if (response.data.msg === "success") {
      ElMessage.success("删除成功");
      await loadData();
    } else {
      ElMessage.error(response.data.msg || "删除失败");
    }
  } catch (error) {
    // 用户取消删除，不做任何操作
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
}
</script>

<style scoped>
.course-container { padding: 20px; }
.card-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}
.credit { 
  font-weight: bold; 
  color: #409eff; 
}
.button-group { 
  display: flex; 
  gap: 8px; 
}
.no-data { 
  color: #999; 
  font-size: 12px; 
}
.full { 
  color: #e6a23c; 
  font-weight: bold; 
}

/* 状态标签样式 */
.el-tag--success { 
  background-color: #f0f9eb; 
  color: #67c23a; 
  border-color: #c2e7b0; 
}
.el-tag--warning { 
  background-color: #fdf6ec; 
  color: #e6a23c; 
  border-color: #f5dab1; 
}
.el-tag--danger { 
  background-color: #fef0f0; 
  color: #f56c6c; 
  border-color: #fbc4c4; 
}

/* 对话框样式优化 */
:deep(.el-dialog__body) {
  padding: 20px 25px;
}

:deep(.el-divider) {
  margin: 20px 0;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}
</style>