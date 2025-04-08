<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 租户列表 -->
      <el-col :span="8" :xs="24">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>租户列表</span>
            </div>
          </template>
          <div class="tenant-tree">
            <el-input
              v-model="tenantName"
              placeholder="请输入租户名称"
              clearable
              :suffix-icon="Search"
              @keyup.enter="handleTenantQuery"
            />
            <el-tree
              :data="tenantOptions"
              :props="{ label: 'tenantName', children: 'children' }"
              :load="loadTenantData"
              lazy
              @node-click="handleNodeClick"
            ></el-tree>
          </div>
        </el-card>
      </el-col>
      <!-- 菜单权限 -->
      <el-col :span="16" :xs="24">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>菜单权限分配</span>
              <el-button
                type="primary"
                :disabled="!currentTenant.tenantId"
                @click="submitMenuAuth"
                v-hasPermi="['tenant:tenant:menu']"
              >保存</el-button>
            </div>
          </template>
          <div v-if="currentTenant.tenantId">
            <el-form :model="currentTenant" label-width="80px">
              <el-form-item label="租户名称">
                <el-input v-model="currentTenant.tenantName" readonly />
              </el-form-item>
              <el-form-item label="菜单权限">
                <el-tree
                  ref="menuTreeRef"
                  :data="menuOptions"
                  show-checkbox
                  node-key="id"
                  :props="{ label: 'label', children: 'children' }"
                  :default-checked-keys="checkedMenuIds"
                ></el-tree>
              </el-form-item>
            </el-form>
          </div>
          <div v-else class="empty-block">
            请先选择左侧租户
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue';
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { treeselect } from "@/api/system/menu";
import { listTenants } from "@/api/tenant/tenant";
import { getTenantMenus, updateTenantMenus } from "@/api/tenant/menu";

const route = useRoute();
const { proxy } = getCurrentInstance();

const tenantOptions = ref([]);
const menuOptions = ref([]);
const tenantName = ref('');
const menuTreeRef = ref(null);
const checkedMenuIds = ref([]);

const currentTenant = reactive({
  tenantId: undefined,
  tenantName: undefined
});

/** 查询菜单树结构 */
async function getMenuTree() {
  const response = await treeselect();
  // 过滤出非系统菜单（is_sys=0）
  menuOptions.value = response.data.filter(item => item.isSys === "0");
}

/** 加载租户数据 */
function loadTenantData(node, resolve) {
  if (node.level === 0) {
    listTenants({ tenantName: tenantName.value, pageNum: 1, pageSize: 100, status: 0 }).then(res => {
      resolve(res.rows);
    });
  } else {
    resolve([]);
  }
}

/** 搜索租户 */
function handleTenantQuery() {
  loadTenantData({ level: 0 }, (data) => {
    tenantOptions.value = data;
  });
}

/** 节点单击事件 */
function handleNodeClick(data) {
  currentTenant.tenantId = data.tenantId;
  currentTenant.tenantName = data.tenantName;
  getTenantMenus(data.tenantId).then(res => {
    checkedMenuIds.value = res.data;
  });
}

/** 提交菜单权限 */
function submitMenuAuth() {
  if (!currentTenant.tenantId) {
    proxy.$modal.msgError("请先选择租户");
    return;
  }

  const checkedKeys = menuTreeRef.value.getCheckedKeys();
  const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys();
  const menuIds = [...checkedKeys, ...halfCheckedKeys];

  updateTenantMenus(currentTenant.tenantId, menuIds).then(res => {
    proxy.$modal.msgSuccess("菜单权限保存成功");
  });
}

onMounted(() => {
  // 获取菜单树
  getMenuTree();

  // 如果路由中有租户ID参数，则自动选中该租户
  const tenantId = route.query.tenantId;
  if (tenantId) {
    listTenants({ tenantId, pageNum: 1, pageSize: 1 }).then(res => {
      if (res.rows && res.rows.length > 0) {
        const tenant = res.rows[0];
        currentTenant.tenantId = tenant.tenantId;
        currentTenant.tenantName = tenant.tenantName;
        getTenantMenus(tenant.tenantId).then(res => {
          checkedMenuIds.value = res.data;
        });
      }
    });
  }
});
</script>

<style scoped>
.tenant-tree {
  margin-top: 10px;
  height: calc(100vh - 230px);
  overflow: auto;
}

.empty-block {
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
