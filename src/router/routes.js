import store from '@state/store'

// auth related routes
const authRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => lazyLoadView(import('@views/pages/account/login')),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        if (store.getters['auth/loggedIn']) {
          next({ name: 'Dashboard' })
        } else {
          next()
        }
      },
    },
  },
  {
    path: '/logout',
    name: 'logout',
    meta: {
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        store.dispatch('auth/logOut')
        next(
          { name: 'login' }
        )
      },
    },
  },
]

const dashboardRoutes = [
  {
    path: '/',
    name: 'Dashboard',
    header: 'Menu',
    icon: 'pie-chart',
    component: () => lazyLoadView(import('@views/pages/dashboard/dashboard')),
    permission: 'todas',
    meta: { 
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        return permissionGuard(routeFrom, next, 'todas')
      },
    },
    props: (route) => ({ user: store.state.auth.user || {} }),
  }
]

const dataManagementRoutes = [
  {
    path: '/gerenciamento-dados',
    name: 'Gerenciamento de Dados',
    icon: 'hard-drive',
    permission: 'gerenciamento_dados',
    meta: {
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        return permissionGuard(routeFrom, next, 'gerenciamento_dados')
      },
    },
    component: {
      render(c) {
        return c('router-view')
      },
    },
    props: (route) => ({ user: store.state.auth.user || {} }),
    children: [
      {
        path: 'produtos-sem-cadastro',
        name: 'Produtos Sem Cadastro',
        component: () => lazyLoadView(import('@views/pages/gerenciamento-dados/produtos-sem-cadastro/produtos-sem-cadastro')),
        meta: { authRequired: true },
      },
      {
        path: 'erros-tela-leitor',
        name: 'Erros na Tela do Leitor',
        component: () => lazyLoadView(import('@views/pages/gerenciamento-dados/erros-tela-leitor/erros-tela-leitor')),
        meta: { authRequired: true },
      },
      {
        path: 'usuarios',
        name: 'Usuários',
        permission: 'usuarios',
        component: () => lazyLoadView(import('@views/pages/gerenciamento-dados/usuarios/usuarios')),
        meta: { 
          authRequired: true,
          beforeResolve(routeTo, routeFrom, next) {
            return permissionGuard(routeFrom, next, 'usuarios')
          },
        }
      }
    ],
  }
]

const imagesRoutes = [
  {
    path: '/imagens',
    name: 'Imagens',
    icon: 'image',
    permission: 'imagens',
    meta: { 
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        return permissionGuard(routeFrom, next, 'imagens')
      },
    },
    component: {
      render(c) {
        return c('router-view')
      }
    },
    props: (route) => ({ user: store.state.auth.user || {} }),
    children: [
      {
        path: 'logo-mercado',
        name: 'Logo do Mercado',
        component: () => lazyLoadView(import('@views/pages/imagens/logo-mercado/logo-mercado')),
      },
      {
        path: 'imagem-produto',
        name: 'Imagem do Produto',
        component: () => lazyLoadView(import('@views/pages/imagens/imagem-produto/imagem-produto')),
      },
    ]
  }
]

const pricesRoute = {
  path: '/precos',
  name: 'Preços',
  icon: 'folder',
  permission: 'precos',
  meta: { 
    authRequired: true, 
    beforeResolve(routeTo, routeFrom, next) {
      return permissionGuard(routeFrom, next, 'precos')
    },
  },
  component: () => lazyLoadView(import('@views/pages/precos/precos')),
  props: (route) => ({ user: store.state.auth.user || {} }),
}

const productsRoute = {
  path: '/produtos',
  name: 'Produtos',
  icon: 'folder',
  permission: 'produtos',
  meta: { 
    authRequired: true,
    beforeResolve(routeTo, routeFrom, next) {
      return permissionGuard(routeFrom, next, 'produtos')
    }, 
  },
  component: () => lazyLoadView(import('@views/pages/produtos/produtos')),
  props: (route) => ({ user: store.state.auth.user || {} }),
}


const supermarketsRoutes = [
  {
    path: '/mercados',
    name: 'Mercados',
    icon: 'home',
    permission: 'mercados',
    meta: { 
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        return permissionGuard(routeFrom, next, 'mercados')
      },  
    },
    component: () => lazyLoadView(import('@views/pages/mercados/mercados')),
    props: (route) => ({ user: store.state.auth.user || {} }),
  }
]

const adminsRoutes = [
  {
    path: '/administradores',
    name: 'Administradores',
    icon: 'users',
    permission: 'todas',
    meta: { 
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        return permissionGuard(routeFrom, next, 'todas')
      }, 
    },
    component: {
      render(c) {
        return c('router-view')
      }
    },
    props: (route) => ({ user: store.state.auth.user || {} }),
    children: [
      {
        path: 'administradores',
        name: 'Administradores',
        component: () => lazyLoadView(import('@views/pages/administradores/administradores/administradores'))
      },
      {
        path: 'gerentes',
        name: 'Gerentes',
        component: () => lazyLoadView(import('@views/pages/administradores/gerentes/gerentes'))
      }

    ]
  }
]

const profileRoute = {
  path: '/perfil',
  name: 'profile',
  meta: { authRequired: true },
  component: () => lazyLoadView(import('@views/pages/profile')),
  props: (route) => ({ user: store.state.auth.user || {} }),
}

const categoriesRoute = {
  path: '/categorias',
  name: 'Categorias',
  icon: 'inbox',
  permission: 'todas',
  meta: { 
    authRequired: true,
    beforeResolve(routeTo, routeFrom, next) {
      return permissionGuard(routeFrom, next, 'todas')
    },
  },
  component: () => lazyLoadView(import('@views/pages/categories')),
  props: (route) => ({ user: store.state.auth.user || {} }),
}

const appTextsRoute = {
  path: '/textos-app',
  name: 'Textos do App',
  icon: 'file-text',
  permission: 'edicao_textos_app',
  meta: { 
    authRequired: true,
    beforeResolve(routeTo, routeFrom, next) {
      return permissionGuard(routeFrom, next, 'edicao_textos_app')
    },
  },
  props: (route) => ({ user: store.state.auth.user || {} }),
  component: {
    render(c) {
      return c('router-view')
    }
  },
  children: [
    {
      path: 'termos-uso',
      name: 'Termos de Uso',
      component: () => lazyLoadView(import('@views/pages/textos-app/termos-uso')),
    },
    {
      path: 'perguntas-frequentes',
      name: 'Perguntas Frequentes',
      component: () => lazyLoadView(import('@views/pages/textos-app/perguntas-frequentes/perguntas-frequentes')),
    }
  ]
}


const authProtectedRoutes = [
  ...dashboardRoutes, ...dataManagementRoutes, ...imagesRoutes,
  pricesRoute, productsRoute, ...adminsRoutes, ...supermarketsRoutes,
  profileRoute, categoriesRoute, appTextsRoute
]
const allRoutes = [...authRoutes, ...authProtectedRoutes]

export { allRoutes, authProtectedRoutes }

function lazyLoadView(AsyncView) {
  const AsyncHandler = () => ({
    component: AsyncView,
    delay: 400,
    timeout: 10000,
  })

  return Promise.resolve({
    functional: true,
    render(h, { data, children }) {
      return h(AsyncHandler, data, children)
    },
  })
}

function permissionGuard(routeFrom, next, permission) {
  const user = store.getters['auth/user']
  if (user.tipo_conta === 'admin') {
    return next()
  } else {
    if (!user.permissoes.includes(permission)) {
      if (!routeFrom.name) {
        return  next({ name: 'profile' })
      } else {
        return next({ name: routeFrom.name })
      }
    }
    return next()
  }
}
