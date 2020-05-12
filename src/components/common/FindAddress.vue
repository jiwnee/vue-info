<template>
  <div>
    <v-btn :style="styles" @click="execDaumPostcode">주소 검색</v-btn>
    <v-dialog v-model="dialog" max-width="290">
      <!-- [D] Layer -->
      <div
        id="layerPostWrap"
        class="ly_wrap ly_post"
        :class="isLayerOpen ? 'is_open' : ''"
        :style="isDisplay ? {display: 'block'} : {display: 'none'}"
      >
        <div class="ly_inner">
          <h2 class="blind">우편번호 검색</h2>
          <button type="button" class="btn_close" @click="foldDaumPostcode">
            <span class="blind">닫기</span>
          </button>
          <div class="ly_content">
            <div
              id="postWrap"
              class="post_wrap"
              :style="isDisplay ? {display: 'block'} : {display: 'none'}"
            ></div>
          </div>
        </div>
      </div>
      <!-- // [D] LAYER -->
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "FindAddress",
  props: ["styles"],
  data() {
    return {
      dialog: false,
      isLayerOpen: false,
      isDisplay: false
    };
  },

  computed: {},

  created() {},

  mounted() {
    window.kakao && window.kakao.maps ? this.initMap() : this.addScript();
  },

  methods: {
    addScript: function() {
      const script = document.createElement("script");
      /* global kakao */
      // script.onload = () => kakao.maps.load(this.initMap);
      script.src =
        "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js?autoload=false";
      // "//dapi.kakao.com/v2/maps/sdk.js?appkey=e1c75618ca43ccb80f333c826f2d002d";
      document.head.appendChild(script);
    },

    initMap: function() {},
    /* 우편번호 찾기 */
    execDaumPostcode: function() {
      const _self = this;
      this.dialog = true;
      console.log("execDaumPostcode");
      // this.$emit("execDaumPostcode");

      const postWrap = document.getElementById("postWrap");
      const layerPostWrap = document.getElementById("layerPostWrap");
      const currentScroll = Math.max(
        document.body.scrollTop,
        document.documentElement.scrollTop
      );
      console.log(postWrap);

      // 동적로딩
      // daum.postcode.load(function() {
      new daum.Postcode({
        oncomplete: function(data) {
          let addr = ""; // 주소 변수

          //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
          if (data.userSelectedType === "R") {
            // 사용자가 도로명 주소를 선택했을 경우
            addr = data.roadAddress;
          } else {
            // 사용자가 지번 주소를 선택했을 경우(J)
            addr = data.jibunAddress;
          }

          // $('input[name="shippingZipCd"]').val(data.zonecode);
          // $('input[name="shippingAddr"]').val(addr);
          // // 커서를 상세주소 필드로 이동한다.
          // $('input[name="shippingDetailAddr"]').focus();

          console.log(data.zonecode, addr);

          // document.body.scrollTop = currentScroll;
          _self.foldDaumPostcode();
        },
        width: "100%",
        height: "100%",
        theme: {
          bgColor: "#FFFFFF", //바탕 배경색
          pageBgColor: "#FFFFFF", //페이지 배경색
          textColor: "#666666", //기본 글자색
          queryTextColor: "#666666", //검색창 글자색
          postcodeTextColor: "#111111", //우편번호 글자색
          emphTextColor: "#666666", //강조 글자색
          outlineColor: "#FFFFFF" //테두리
        }
      }).embed(postWrap);
      // postWrap.css("display", "block");
      // layerPostWrap.addClass("is_open");
      // _self.isLayerOpen = true;
      // _self.isDisplay = true;
      _self.$emit("isShow");
      // });
    },
    foldDaumPostcode: function() {
      // $("#layerPostWrap").removeClass("is_open");
      this.isLayerOpen = false;
      // $("#postWrap").css("display", "none");
      this.isDisplay = false;
    }
  }
};
</script>

<style scoped></style>
