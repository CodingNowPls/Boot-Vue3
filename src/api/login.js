import request from '@/utils/request'
import {encrypt} from "@/utils/jsencrypt.js";

// 登录方法
export function login(userName, password, code, uuid, isAdminLogin, tenantId) {
  password = encrypt(password);
  const data = {
    userName,
    password,
    code,
    uuid,
    isAdminLogin
  }
  // 如果是租户登录，添加租户ID
  if (isAdminLogin !== 1 && tenantId) {
    data.tenantId = tenantId
  }
  return request({
    url: '/login',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}

// 切换租户
export function switchTenant(tenantId) {
  return request({
    url: '/system/user/switchTenant',
    method: 'post',
    data: { tenantId }
  })
}
