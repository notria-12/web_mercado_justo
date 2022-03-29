export default {
  dateWithoutTime(date) {
    if (typeof date == 'undefined') {
      return
    }
    return date
      .split('T')[0]
      .split('-')
      .reverse()
      .join('/')
  },

  dateWithTime(date) {
    if (typeof date == 'undefined') {
      return
    }
    const dateString = new Date(date).toLocaleDateString()
    const timeString = new Date(date).toLocaleTimeString().substr(0, 5)
    return `${dateString} ${timeString} hs`
  },

  dateOut(date) {
    if (typeof date == 'undefined') {
      return
    }
    return date
      .split('/')
      .reverse()
      .join('-')
  },

  cashFormatIn(value) {
    if (value >= 10) {
      return `R$ ${value.toFixed(2).replace('.', ',')}`
    } else {
      return `R$ 0${value.toFixed(2).replace('.', ',')}`
    }
  },

  cashFormatOut(value) {
    const valueNoPrefix = value.split(' ')[1]
    return Number(valueNoPrefix.replace(',', '.'))
  },

  percentage(value) {
    if (!value) {
      return
    }
    if (typeof value == 'string') {
      return `${value.replace('.', ',')}%`
    } else {
      return `${(value.toString()).replace('.', ',')}%`
    }
  },

  generateQueryFromOptions(options) {
    const perPage = options.perPage
    const currentPage = options.currentPage
    const orderField = options.order ? options.order.field : null
    const orderDirection = options.order ? options.order.direction : null
    const strict = !!options.strict
    let baseQuery = '?'

    if (perPage) {
      baseQuery += `itens_pagina=${perPage}`
    }
    if (currentPage) {
      const ampersend = baseQuery.length > 1 ? '&' : ''
      baseQuery += `${ampersend}pagina=${currentPage}`
    }
    if (orderField && orderDirection) {
      const ampersend = baseQuery.length > 1 ? '&' : ''
      baseQuery += `${ampersend}ordernar=${orderField},${orderDirection}`
    }
    if (strict) {
      const ampersend = baseQuery.length > 1 ? '&' : ''
      baseQuery += `${ampersend}estrito=${strict}`
    }

    if (options.search) {
      const searchArr = Array.isArray(options.search) ? options.search : [options.search]
      if (searchArr.length > 0) {
        const findQueryArr = []
        for (const search of searchArr) {
          if (!search.term) {
            continue
          }
          const searchField = search.field
          const searchTerm = search.term
          const searchType = search.type
          const searchStrict = search.strict
          const searchMulti = search.multi
          const dataTransform = search.dataTransform

          const searchObj = {}
          Object.assign(searchObj, {
            termo: searchField,
            valor: dataTransform ? dataTransform(searchTerm) : searchTerm
          })
          if (searchType) {
            Object.assign(searchObj, {
              tipo: searchType
            })
          }
          if (searchStrict) {
            Object.assign(searchObj, {
              estrito: !!searchStrict
            })
          }
          if (searchMulti) {
            Object.assign(searchObj, {
              multi: !!searchMulti
            })
          }

          if (searchObj.valor) {
            findQueryArr.push(searchObj)
          }
        }
        if (findQueryArr.length > 0) {
          const ampersend = baseQuery.length > 1 ? '&' : ''
          baseQuery += `${ampersend}procurar=${encodeURIComponent(JSON.stringify(findQueryArr))}`
        }
      }
    }
    return baseQuery
  },

  capitalize(string) {
    if(!string) {
      return
    }
    
    if (string.split(' ').length > 1) {
      const words = string.split(' ')
      let result = ''
      for (const word of words) {
        result += `${word.charAt(0).toUpperCase()}${word.slice(1)} `
      }
      return result.trim()
    } else {
      return `${string.charAt(0).toUpperCase()}${string.slice(1)}`
    }
  },

  stripHTML(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  },
}