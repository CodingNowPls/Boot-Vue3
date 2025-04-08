<template>
  <div class="login">
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">后台管理系统</h3>
      <div class="login-type-switch">
        <span></span>
        <el-button type="primary" size="small" @click="switchToTenant">切换到租户登录</el-button>
      </div>
      <el-form-item prop="userName">
        <el-input
          v-model="loginForm.userName"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="账号"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img"/>
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          style="width:100%;"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right;" v-if="register">
          <router-link class="link-type" :to="'/register'">立即注册</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2018-2023 ruoyi.vip All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user';
import { ref, reactive, toRefs, onMounted } from 'vue';
// 确保正确引入了路由
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();
const loginFormRef = ref(null);

const state = reactive({
  codeUrl: "",
  loginForm: {
    userName: "",
    password: "",
    rememberMe: false,
    code: "",
    uuid: ""
  },
  loginRules: {
    userName: [
      { required: true, trigger: "blur", message: "请输入您的账号" }
    ],
    password: [
      { required: true, trigger: "blur", message: "请输入您的密码" }
    ],
    code: [{ required: true, trigger: "change", message: "请输入验证码" }]
  },
  loading: false,
  // 验证码开关
  captchaEnabled: true,
  // 注册开关
  register: false,
  redirect: undefined
});

const { codeUrl, loginForm, loginRules, loading, captchaEnabled, register, redirect } = toRefs(state);

function getCode() {
  getCodeImg().then(res => {
    state.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (state.captchaEnabled) {
      state.codeUrl = "data:image/gif;base64," + res.img;
      state.loginForm.uuid = res.uuid;
    }
  });
}

function handleLogin() {
  loginFormRef.value.validate(valid => {
    if (valid) {
      state.loading = true;
      // 勾选了需要记住密码设置cookie
      if (state.loginForm.rememberMe) {
        Cookies.set("userName", state.loginForm.userName, { expires: 30 });
        Cookies.set("password", encrypt(state.loginForm.password), { expires: 30 });
        Cookies.set("rememberMe", state.loginForm.rememberMe, { expires: 30 });
      } else {
        // 否则移除cookie
        Cookies.remove("userName");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore.login({
        userName: state.loginForm.userName,
        password: state.loginForm.password,
        code: state.loginForm.code,
        uuid: state.loginForm.uuid,
        isAdminLogin: true // 标记为管理员登录
      }).then(() => {
        router.push({ path: state.redirect || "/" });
      }).catch(() => {
        state.loading = false;
        getCode();
      });
    }
  });
}

// 切换到租户登录页面的函数
function switchToTenant() {
  // 跳转到租户登录页面
  router.push('/login');
}

onMounted(() => {
  if (state.captchaEnabled) {
    getCode();
  }
  // 获取cookie
  const userName = Cookies.get("userName");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get('rememberMe');
  // 设置默认值
  state.loginForm.rememberMe = rememberMe === 'true';
  if (userName) {
    state.loginForm.userName = userName;
    state.loginForm.password = password ? decrypt(password) : '';
  }
});
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 40px;
    input {
      height: 40px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 40px;
  padding-left: 12px;
}

.login-type-switch {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  color: #606266;
}
</style>
