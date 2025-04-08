import request from '@/utils/request'

// 查询租户列表
export function listTenants(query) {
  return request({
    url: '/system/tenant/list',
    method: 'get',
    params: query
  })
}

// 查询租户详细
export function getTenant(tenantId) {
  return request({
    url: '/system/tenant/' + tenantId,
    method: 'get'
  })
}

// 新增租户
export function addTenant(data) {
  return request({
    url: '/system/tenant',
    method: 'post',
    data: data
  })
}

// 修改租户
export function updateTenant(data) {
  return request({
    url: '/system/tenant',
    method: 'put',
    data: data
  })
}

// 删除租户
export function delTenant(tenantId) {
  return request({
    url: '/system/tenant/' + tenantId,
    method: 'delete'
  })
}

// 租户状态修改
export function changeTenantStatus(tenantId, status) {
  const data = {
    tenantId,
    status
  }
  return request({
    url: '/system/tenant/changeStatus',
    method: 'put',
    data: data
  })
}

// 查询租户菜单
export function getTenantMenus(tenantId) {
  return request({
    url: '/system/tenant/menus/' + tenantId,
    method: 'get'
  })
}

// 设置租户菜单
export function setTenantMenus(tenantId, menuIds) {
  const data = {
    tenantId,
    menuIds
  }
  return request({
    url: '/system/tenant/menus',
    method: 'put',
    data: data
  })
} 
