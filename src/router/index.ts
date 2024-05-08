import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/config/supabase'
import { useUser } from '@/stores/user'

import HomeView from '../views/HomeView.vue'
import { notify } from '@/components/AppNotification'

const userGuard = async function (to: { fullPath: any }, from: any, next: (arg0: string | undefined) => void) {
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    useUser().setUserId(user.id);
    next()
  } else {
    notify({ content: 'log in to continue', position: 'top-center', type: 'info' })
    next(`/login?continue=${to.fullPath}`)
  }
}

const adminGuard = async function (to: { fullPath: any }, from: any, next: (arg0: string | undefined) => void) {
  if (useUser().user.role === 'ADMIN') {
    next()
  } else {
    notify({ content: 'You need to be an admin to go here', position: 'top-center', type: 'info' })
    next(`/login?continue=${to.fullPath}`)
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/areas',
      name: 'AreaView',
      component: () => import('../views/AllReviews.vue')
    },
    {
      path: '/sign-up',
      name: 'SignUp',
      component: () => import('../views/auth/RegisterView.vue')
    },
    {
      path: '/login',
      name: 'logIn',
      component: () => import('../views/auth/LoginView.vue')
    },
    {
      path: '/recover-pw',
      name: 'recoverPassword',
      component: () => import('../views/auth/RecoverPasswordView.vue')
    },
    {
      path: '/update-pw',
      name: 'updatePassword',
      component: () => import('../views/auth/UpdatePasswordView.vue')
    },
    {
      path: '/verify',
      name: 'verifyEmail',
      component: () => import('../views/auth/VerifyEmailView.vue')
    },
    {
      path: '/admin',
      component: () => import('../views/admin/defaultView.vue'),
      beforeEnter: adminGuard,
      children: [{
        path: '',
        name: 'AdminHome',
        component: () => import('../views/admin/IndexView.vue')
      }]
    },
  ]
})

export default router
