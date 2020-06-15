export default {
  data() {
    return {
      abc: '123'
    }
  },
  mounted() {
    console.log('mixin counted')
  },
  created() {
    console.log('mixin created')
  },
  methods: {
    some() {
      console.log('mixin function')
    }
  }
}
