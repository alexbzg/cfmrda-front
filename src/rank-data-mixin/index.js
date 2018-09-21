export default {
  methods: {
    isMeta (val) {
      return val === 'total' || val === 'bandsSum'
    },
    getModeBand (data, mode, band) {
      const modeData = this.isMeta(mode) ? data[mode] : data.modes[mode]
      if (modeData) {
        return (this.isMeta(band) ? modeData[band] : modeData.bands[band] )
      }
    }
  }
}
