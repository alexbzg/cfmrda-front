export default {
  methods: {
    capitalize (obj, field) {
      if (obj[field] && obj[field] !== obj[field].toUpperCase()) {
        obj[field] = obj[field].toUpperCase()
      }
    }
  }
}
