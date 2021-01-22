import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // 配置页面进度条

const whiteList = ['/login', '/auth-redirect'] // 配置白名单页面

// 全局路由守卫，在此处进行权限校验
router.beforeEach(async(to, from, next) => {
  // 显示路由进度条
  NProgress.start()

  // 设置页面标题
  document.title = getPageTitle(to.meta.title)

  // 判Token是否存在
  const hasToken = getToken()
  if (hasToken) {
    // 已登陆，前往login页重定向到/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      // 前往非login页面，获取用户角色权限进行判断
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      // 已获得权限数组，
      if (hasRoles) {
        next()
      } else {
        // 处于登录态但是没有权限数组
        try {
          // 获取权限数组
          const { roles } = await store.dispatch('user/getInfo')
          // 根据用户的权限数组 生成用户有权限访问的路由数组对象
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          // 将生成用户有权限访问的路由数组对象 动态添加 constantRoutes.concat(asyncRoutes)
          router.addRoutes(accessRoutes)
          // 前往路由， replace替换为true防止用户点击后退回到登陆页
          next({ ...to, replace: true })
        } catch (error) {
          console.log(error)
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
