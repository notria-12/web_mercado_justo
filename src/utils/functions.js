export function hasKeys (data, keys) {
  if (Array.isArray(data)) {
    for (const obj of data) {
      if (!hasKeys(obj, keys)) {
        return false
      }
    }
    return true
  } else {
    for (const key of keys) {
      if (!keys.includes(key)) {
        return false
      }
    }
    return true
  }
}