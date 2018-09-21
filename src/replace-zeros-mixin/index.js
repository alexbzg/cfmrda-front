export default {
  methods: {
    replace0 (str) {
      return str ? str.replace( /0/g, '\u00D8' ) : str
    }
  }
}
