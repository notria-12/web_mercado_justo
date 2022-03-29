import helpers from '@plugins/services/helpers'
import store from '@state/store'
import auth from '@plugins/services/auth'
import users from '@plugins/services/users'
import stateCity from '@plugins/services/state-city'
import products from '@plugins/services/products'
import prices from '@/src/plugins/services/prices'
import dashboard from '@plugins/services/dashboard'
import problems from '@plugins/services/problems'
import supermarkets from '@plugins/services/supermarkets'
import images from '@plugins/services/images'
import categories from '@plugins/services/categories'
import termsUse from '@plugins/services/terms-use'
import faq from '@plugins/services/faq'

export default {
  install: (Vue, options) => {
    const servicesPlugin = {
      auth: auth(store),
      users: users(Vue.$axios, helpers),
      stateCity: stateCity(Vue.$axios),
      products: products(Vue.$axios, helpers),
      prices: prices(Vue.$axios, helpers),
      dashboard: dashboard(Vue.$axios, helpers),
      problems: problems(Vue.$axios, helpers),
      supermarkets: supermarkets(Vue.$axios, helpers),
      images: images(Vue.$axios, helpers),
      categories: categories(Vue.$axios, helpers),
      termsUse: termsUse(Vue.$axios, helpers),
      faq: faq(Vue.$axios, helpers)
    }
    Vue.prototype.$services = servicesPlugin
    Vue.$services = servicesPlugin
  }
}