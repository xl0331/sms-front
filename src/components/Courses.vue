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
        <el-table-column prop="sem" label="学期" width="120">
          <template #default="scope">
            <el-tag type="info" size="small">{{ scope.row.sem }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cscore" label="学分" width="80">
          <template #default="scope">
            <span class="credit">{{ scope.row.cscore }}</span>
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

    <el-dialog v-model="showDialog" :title="dialogTitle" width="400px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="课程号">
          <el-input v-model="formData.cno" :disabled="isEditMode" />
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input v-model="formData.cname" />
        </el-form-item>
        <el-form-item label="学期">
          <el-input v-model="formData.sem" />
        </el-form-item>
        <el-form-item label="学分">
          <el-input-number v-model="formData.cscore" :min="0.5" :max="10" :step="0.5" />
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

const formData = reactive({
  cno: "",
  cname: "",
  sem: "",
  cscore: 2
});

const dialogTitle = computed(() => isEditMode.value ? "编辑课程" : "添加课程");

onMounted(loadData);

async function loadData() {
  try {
    const response = await axios.get("/api/course/getCourses", {
      headers: { Authorization: tokenStore.getToken() }
    });
    if (response.data.msg === "success") courses.value = response.data.data;
  } catch (error) {
    ElMessage.error("加载课程数据失败");
  }
}

function handleEdit(course) {
  isEditMode.value = true;
  Object.assign(formData, course);
  showDialog.value = true;
}

function handleAdd() {
  isEditMode.value = false;
  Object.assign(formData, { cno: "", cname: "", sem: "", cscore: 2 });
  showDialog.value = true;
}

async function handleSave() {
  try {
    const url = isEditMode.value ? "/api/home/updateCourse" : "/api/home/addCourse";
    const response = await axios.post(url, formData, {
      headers: { Authorization: tokenStore.getToken() }
    });
    if (response.data.msg === "success") {
      ElMessage.success(isEditMode.value ? "课程更新成功" : "课程添加成功");
      showDialog.value = false;
      await loadData();
    }
  } catch (error) {
    ElMessage.error("保存失败");
  }
}

async function handleDelete(course) {
  try {
    await ElMessageBox.confirm(`确定删除课程"${course.cname}"吗？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
    const response = await axios.post("/api/home/deleteCourse", 
      { cno: course.cno },
      { headers: { Authorization: tokenStore.getToken() } }
    );
    if (response.data.msg === "success") {
      ElMessage.success("课程删除成功");
      await loadData();
    }
  } catch {}
}
</script>

<style scoped>
.course-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.credit { font-weight: bold; color: #409eff; }
.button-group { display: flex; gap: 8px; }
</style>