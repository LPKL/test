<template>
  <div>
    <custom-alg-detail v-if="isCustom" :can-edit="false" :only-read="false"/>
    <alg-detail v-else :can-edit="false" :only-read="false"/>
  </div>
</template>

<script>
import AlgorithmDetail from './components/AlgorithmDetail'
import CustomAlgorithmDetail from './components/CustomAlgorithmDetail'

export default {
  name: 'AlgorithmCreate',
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
    console.log('algmanagement index created', this.$route.query.config)
    if (this.$route.query.config && this.$route.query.config === 'custom') {
      this.isCustom = true
    }
  }
}
</script>

