<template>
  <div v-if="!isAdminLogin && tenantList.length > 0" class="tenant-switch">
    <el-dropdown @command="handleCommand">
      <span class="tenant-dropdown-link">
        {{ currentTenantName }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="item in tenantList"
            :key="item.tenantId"
            :command="item.tenantId"
            :class="{ 'is-active': currenttenantId === item.tenantId }"
          >
            {{ item.tenantName }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { getUserTenants, switchTenant } from '@/api/system/user';
import useUserStore from '@/store/modules/user';

const userStore = useUserStore();
const tenantList = ref([]);
const currenttenantId = computed(() => userStore.currenttenantId);
const isAdminLogin = computed(() => userStore.isAdminLogin);

const currentTenantName = computed(() => {
  const tenant = tenantList.value.find(item => item.tenantId === currenttenantId.value);
  return tenant ? tenant.tenantName : '未选择租户';
});

function handleCommand(tenantId) {
  if (tenantId === currenttenantId.value) return;

  switchTenant(tenantId).then(() => {
    userStore.switchTenant(tenantId);
    location.reload(); // 切换租户后刷新页面，重新加载菜单和权限
  });
}

onMounted(() => {
  if (!isAdminLogin.value) {
    getUserTenants().then(res => {
      tenantList.value = res.data || [];
    });
  }
});
</script>

<style scoped>
.tenant-switch {
  display: inline-flex;
  align-items: center;
  margin-right: 20px;
  color: #fff;
  cursor: pointer;
}

.tenant-dropdown-link {
  display: flex;
  align-items: center;
  font-size: 14px;
}

:deep(.el-dropdown-menu__item.is-active) {
  color: #409EFF;
  background-color: #ecf5ff;
}
</style>
