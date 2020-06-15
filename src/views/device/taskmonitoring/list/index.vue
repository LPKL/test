<template>
  <Taskmodel/>
</template>
<script>
// import Searchmodel from './components/searchmodel'
import Taskmodel from '../components/taskmodel'
export default {
  name: 'List',
  components: {
    Taskmodel
  },
  mounted() {
    console.log(this.$store.getters.id)
  }
}

</script>
