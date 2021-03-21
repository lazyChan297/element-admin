import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/info',
    method: 'post'
  })
}

export function loginMock(data) {
  return request({
    url: '/mock/vue-element-admin/article/list',
    method: 'get',
    data
  })
}

export function getMenus(role) {
  return request({
    url: '/mock/getMenus',
    method: 'get',
    params: { role }
  })
}
