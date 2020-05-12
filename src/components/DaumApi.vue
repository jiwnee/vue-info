<!-- 다음 API -->
<template>
  <FindAddress :styles="'top: -8px'" :isShow="isShowAddressLayer" />
</template>

<script>
import FindAddress from "@/components/common/FindAddress.vue";

export default {
  name: "DaumApi",
  components: {
    FindAddress
  },
  data() {
    return {
    }
  },
  computed: {
  },
  created() {
  },
  methods: {
    isShowAddressLayer: function() {
      console.log("isShow");
      this.isLayerOpen = true;
      this.isDisplay = true;
    }
  }
};
</script>

<style type="text/css" scoped>
</style>
