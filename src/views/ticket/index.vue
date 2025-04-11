<template>
  <div class="app-container">
    <custom-table
        :data="ticketList"
        :loading="loading"
        :search-config="searchConfig"
        :total="total"
        :page="queryParams.pageNum"
        :limit="queryParams.pageSize"
        :default-collapse="true"
        :max-display-rows="1"
        @search="handleSearch"
        @reset="handleReset"
        @pagination-change="handlePaginationChange"
        @selection-change="handleSelectionChange"
    >
      <template #toolbar>
        <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['ticket:manage:add']">新增</el-button>
        <el-button type="danger" icon="Delete" @click="handleBatchDelete" :disabled="selectedIds.length === 0" v-hasPermi="['ticket:manage:delete']">批量删除</el-button>
        <el-button type="warning" icon="Download" @click="handleExport" v-hasPermi="['ticket:manage:export']">导出</el-button>
      </template>

      <el-table-column prop="ticketNo" label="工单编号" align="center" />
      <el-table-column prop="title" label="工单标题" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="status" label="状态" align="center">
        <template #default="{ row }">
          <dict-tag :options="statusOptions" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" align="center">
        <template #default="{ row }">
          <dict-tag :options="priorityOptions" :value="row.priority" />
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" align="center" />
      <el-table-column prop="createTime" label="创建时间" align="center" width="160">
        <template #default="{ row }">
          <span>{{ parseTime(row.createTime) }}</span>
        </template>
      </el-table-column>

      <template #operation="{ row }">
        <el-button type="text" icon="View" @click="handleView(row)" v-hasPermi="['ticket:manage:view']">查看</el-button>
        <el-button type="text" icon="Edit" @click="handleEdit(row)" v-hasPermi="['ticket:manage:edit']">编辑</el-button>
        <el-button type="text" icon="Delete" @click="handleDelete(row)" v-hasPermi="['ticket:manage:delete']">删除</el-button>
      </template>
    </custom-table>

    <!-- 添加或修改工单对话框 -->
    <ticket-dialog
        ref="ticketDialogRef"
        :title="dialogTitle"
        @success="getList"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { listTicket, delTicket, exportTicket } from '@/api/ticket/manage';
import { parseTime } from '@/utils/ruoyi';
import CustomTable from '@/components/Table';
import TicketDialog from './components/TicketDialog.vue';

// 查询条件
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  ticketNo: '',
  title: '',
  status: '',
  priority: '',
  createTimeRange: []
});

// 表格数据
const ticketList = ref([]);
const loading = ref(false);
const total = ref(0);
const selectedIds = ref([]);
const ticketDialogRef = ref(null);
const dialogTitle = ref('');

// 字典数据
const statusOptions = ref([]);
const priorityOptions = ref([]);

// 获取字典数据
const getDicts = async () => {
  // 这里应该调用若依的字典接口获取状态和优先级的字典数据
  // 示例数据
  statusOptions.value = [
    { value: '0', label: '待处理', elTagType: 'info' },
    { value: '1', label: '处理中', elTagType: 'warning' },
    { value: '2', label: '已完成', elTagType: 'success' },
    { value: '3', label: '已关闭', elTagType: 'danger' }
  ];

  priorityOptions.value = [
    { value: '0', label: '低', elTagType: 'info' },
    { value: '1', label: '中', elTagType: 'warning' },
    { value: '2', label: '高', elTagType: 'danger' }
  ];
};

// 查询配置
const searchConfig = [
  {
    type: 'input',
    label: '工单编号',
    prop: 'ticketNo',
    placeholder: '请输入工单编号'
  },
  {
    type: 'input',
    label: '工单标题',
    prop: 'title',
    placeholder: '请输入工单标题'
  },
  {
    type: 'select',
    label: '状态',
    prop: 'status',
    placeholder: '请选择状态',
    options: statusOptions
  },
  {
    type: 'select',
    label: '优先级',
    prop: 'priority',
    placeholder: '请选择优先级',
    options: priorityOptions
  },
  {
    type: 'daterange',
    label: '创建时间',
    prop: 'createTimeRange',
    attrs: {
      valueFormat: 'YYYY-MM-DD'
    }
  },
  {
    type: 'input',
    label: '创建人',
    prop: 'createBy',
    placeholder: '请输入创建人'
  }
];

// 获取工单列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await listTicket(queryParams);
    ticketList.value = res.rows;
    total.value = res.total;
  } catch (error) {
    console.error('获取工单列表失败', error);
  } finally {
    loading.value = false;
  }
};

// 处理查询
const handleSearch = (formData) => {
  queryParams.pageNum = 1;
  Object.assign(queryParams, formData);
  getList();
};

// 处理重置
const handleReset = () => {
  queryParams.pageNum = 1;
  queryParams.ticketNo = '';
  queryParams.title = '';
  queryParams.status = '';
  queryParams.priority = '';
  queryParams.createTimeRange = [];
  queryParams.createBy = '';
  getList();
};

// 处理分页变化
const handlePaginationChange = ({ page, limit }) => {
  queryParams.pageNum = page;
  queryParams.pageSize = limit;
  getList();
};

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id);
};

// 处理新增
const handleAdd = () => {
  dialogTitle.value = '新增工单';
  ticketDialogRef.value.openDialog();
};

// 处理编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑工单';
  ticketDialogRef.value.openDialog(row.id);
};

// 处理查看
const handleView = (row) => {
  dialogTitle.value = '查看工单';
  ticketDialogRef.value.openDialog(row.id, true);
};

// 处理删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm(`是否确认删除工单编号为"${row.ticketNo}"的数据项?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });

  try {
    await delTicket(row.id);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    console.error('删除失败', error);
  }
};

// 处理批量删除
const handleBatchDelete = async () => {
  const ids = selectedIds.value.join(',');
  await ElMessageBox.confirm(`是否确认删除选中的${selectedIds.value.length}条数据?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });

  try {
    await delTicket(ids);
    ElMessage.success('批量删除成功');
    getList();
  } catch (error) {
    console.error('批量删除失败', error);
  }
};

// 处理导出
const handleExport = () => {
  exportTicket(queryParams);
};

// 初始化
onMounted(() => {
  getDicts();
  getList();
});
</script>
