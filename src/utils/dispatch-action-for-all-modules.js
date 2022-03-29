import allModules from '@state/modules'
import store from '@state/store'

export default function dispatchActionForAllModules(
  actionName,
  { modules = allModules, modulePrefix = '', flags = {} } = {}
) {
  for (const moduleName in modules) {
    const moduleDefinition = modules[moduleName]
    if (moduleDefinition.actions && moduleDefinition.actions[actionName]) {
      if (moduleDefinition.namespaced) {
        store.dispatch(`${modulePrefix}${moduleName}/${actionName}`)
      } else {
        flags.dispatchGlobal = true
      }
    }
    if (moduleDefinition.modules) {
      dispatchActionForAllModules(actionName, {
        modules: moduleDefinition.modules,
        modulePrefix: modulePrefix + moduleName + '/',
        flags,
      })
    }
  }

  if (!modulePrefix && flags.dispatchGlobal) {
    store.dispatch(actionName)
  }
}
