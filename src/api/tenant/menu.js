import request from '@/utils/request'

// 获取租户菜单权限
export function getTenantMenus(tenantId) {
  return request({
    url: '/system/tenant/menu/' + tenantId,
    method: 'get'
  })
}

// 更新租户菜单权限
export function updateTenantMenus(tenantId, menuIds) {
  return request({
    url: '/system/tenant/menu',
    method: 'put',
    data: {
      tenantId,
      menuIds
    }
  })
}
