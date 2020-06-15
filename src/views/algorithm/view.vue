<template>
  <div>
    <custom-alg-detail v-if="isCustom" :can-edit="true" :only-read="true"/>
    <alg-detail v-else :can-edit="true" :only-read="true"/>
  </div>
</template>

<script>
import AlgorithmDetail from './components/AlgorithmDetail'
import CustomAlgorithmDetail from './components/CustomAlgorithmDetail'

export default {
  name: 'AlgorithmView',
  components: {
    'alg-detail': AlgorithmDetail,
    'custom-alg-detail': CustomAlgorithmDetail
  },
  data() {
    return {
      isCustom: false
    }
  },
  created() {
    console.log('algmanagement index view', this.$route.query.config)
    if (this.$route.query.config && this.$route.query.config === 'custom') {
      this.isCustom = true
    }
  }
}
</script>

