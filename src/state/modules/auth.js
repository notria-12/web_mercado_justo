import router from '@router/index'
import NProgress from 'nprogress/nprogress'

export const state = () => ({
  user: getSavedState('auth.user'),
  access_token: getSavedState('auth.access_token'),
  is_session_expired: false,
})

export const getters = {
  loggedIn: (state) => !!state.user && !!state.access_token,
  user: (state) => state.user,
  accessToken: (state) => state.access_token,
  isSessionExpired: (state) => state.is_session_expired
}

export const actions = {
  validate({ getters, dispatch }) {
    dispatch('verifyAccessLevel')
    return this._vm.$axios.post('auth/validar', { access_token: getters.accessToken })
      .then((response) => {
        dispatch('setIsSessionExpired', !response.data.dados)
        return
      })
  },
  logIn({ commit, dispatch, getters }, { cpf, senha }) {
    if (getters.loggedIn) {
      return true
    } else {
      return this._vm.$axios.post('auth/login', { cpf, senha })
        .then((response) => {
          const { access_token, usuario } = response.data.dados
          if (response.status == 201) {
            if (usuario.tipo_conta != 'cliente') {
              commit('SET_USER', usuario)
              commit('SET_ACCESS_TOKEN', access_token)
              dispatch('setDefaultAuthHeaders')
            } else {
              throw Error('Você não possui acesso a este app.')
            }
          } else {
            commit('SET_USER', null)
            commit('SET_ACCESS_TOKEN', null)
            dispatch('setDefaultAuthHeaders')
          }
          return response.data.dados
        })
    }
  },
  logOut({ commit, dispatch }) {
    commit('SET_USER', null)
    commit('SET_ACCESS_TOKEN', null)
    dispatch('setDefaultAuthHeaders')
  },
  setDefaultAuthHeaders({ getters }) {
    if (getters.accessToken) {
      this._vm.$axios.defaults.headers.Authorization = `Bearer ${getters.accessToken}`
    } else {
      delete this._vm.$axios.defaults.headers.Authorization
    }
  },
  setIsSessionExpired({ commit }, isSessionExpired) {
    commit('SET_IS_SESSION_EXPIRED', isSessionExpired)
  },
  verifyAccessLevel({ getters, dispatch }) {
    const user = getters.user
    if (user && user.tipo_conta == 'cliente') {
      dispatch('logOut')
      router.push({ name: 'login' })
      NProgress.done()
    }
  },
  init({ dispatch }) {
    dispatch('setDefaultAuthHeaders')
  }
}

export const mutations = {
  SET_USER(state, newValue) {
    state.user = newValue
    saveState('auth.user', newValue)
  },
  SET_ACCESS_TOKEN(state, newValue) {
    state.access_token = newValue
    saveState('auth.access_token', newValue)
  },
  SET_IS_SESSION_EXPIRED(state, newValue) {
    state.is_session_expired = !!newValue
  }
}

function getSavedState(key) {
  return JSON.parse(window.localStorage.getItem(key))
}

function saveState(key, state) {
  window.localStorage.setItem(key, JSON.stringify(state))
}