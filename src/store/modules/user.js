import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'
import { defineStore } from 'pinia'

const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      name: '',
      avatar: '',
      roles: [],
      permissions: [],
      userId: null,
      currenttenantId: null, // 当前租户ID
      isAdminLogin: 2, // 是否是管理员登录，1:管理员登录，2:非管理员登录
      tenantInfo: null, // 租户信息
    }),
    actions: {
      // 登录
      login(userInfo) {
        const userName = userInfo.userName.trim()
        const password = userInfo.password
        const code = userInfo.code
        const uuid = userInfo.uuid
        const tenantId = userInfo.tenantId
        const isAdminLogin = userInfo.isAdminLogin || 2

        return new Promise((resolve, reject) => {
          login(userName, password, code, uuid, isAdminLogin, tenantId).then(res => {
            setToken(res.token)
            this.token = res.token
            this.isAdminLogin = isAdminLogin
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 获取用户信息
      getInfo() {
        return new Promise((resolve, reject) => {
          getInfo().then(res => {
            const user = res.user
            const avatar = (user.avatar == "" || user.avatar == null) ? defAva : import.meta.env.VITE_APP_BASE_API + user.avatar

            if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              this.roles = res.roles
              this.permissions = res.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.name = user.userName
            this.avatar = avatar
            this.userId = user.userId
            this.currenttenantId = res.currenttenantId
            this.isAdminLogin = res.isAdminLogin
            this.tenantInfo = res.tenantInfo
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          logout(this.token).then(() => {
            this.token = ''
            this.roles = []
            this.permissions = []
            this.currenttenantId = null
            this.isAdminLogin = 2
            this.tenantInfo = null
            removeToken()
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 切换租户
      switchTenant(tenantId) {
        return new Promise((resolve, reject) => {
          // 调用切换租户的API
          switchTenant(tenantId).then(res => {
            // 更新当前租户信息
            this.currenttenantId = tenantId
            this.tenantInfo = res.tenantInfo
            // 更新权限和角色
            this.roles = res.roles
            this.permissions = res.permissions
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      }
    }
  })

export default useUserStore
