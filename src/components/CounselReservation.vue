<template>
  <v-app>
    <!-- <CommonToolbar /> -->
    <v-content>
      <v-layout>
        <!-- <CommonLmenu /> -->
        <v-card min-height="860" min-width="1024" width="100%">
          <v-breadcrumbs :items="navigations" class="pa-2">
            <template v-slot:divider>
              <v-icon>mdi-chevron-right</v-icon>
            </template>
          </v-breadcrumbs>

          <v-container fluid class="py-0">
            <v-row justify="center" class="my-2">
              <v-col cols="6" md="4"></v-col>
              <v-col cols="12" sm="6" md="6">
                <v-icon class="ma-1 mdi-36px" @click="prevWeek()">mdi-chevron-left</v-icon>
                <span class="ma-2 title">
                  {{$moment(dateStart).format('YYYY-MM-DD')}}
                  <v-icon class="ma-1">mdi-minus</v-icon>
                  {{$moment(dateEnd).format('YYYY-MM-DD')}}
                </span>
                <v-icon class="ma-1 mdi-36px" @click="nextWeek()">mdi-chevron-right</v-icon>
              </v-col>
              <v-col cols="6" md="2">
                <!-- 월간 데이터 보기 -->
                <v-btn color="primary" dark @click="showMonthDialog = true">
                  <v-icon class="ma-1 mdi-18px">mdi-calendar-blank</v-icon>월 단위 보기
                </v-btn>
                <CalendarMonth
                  v-if="showMonthDialog"
                  :showMonthDialog="showMonthDialog"
                  :currentYear="todayYear"
                  :currentMonth="todayMonth"
                  @closeDialog="showMonthDialog = false"
                />
              </v-col>
            </v-row>

            <CalendarWeek
              v-if="!isLoading"
              :days="days"
              :times="times"
              :counselInfo="dayCounselInfo"
            />
          </v-container>
        </v-card>
      </v-layout>

      <v-snackbar v-model="snackbar" :timeout="2500" :color="snackbar_color">
        {{ snackbar_text }}
        <v-btn dark text :top="true" @click="snackbar = false">닫기</v-btn>
      </v-snackbar>
    </v-content>
  </v-app>
</template>
<style scoped>
</style>
<script>
import CalendarMonth from '@/components/counsel/CalendarMonth.vue';
import CalendarWeek from '@/components/counsel/CalendarWeek.vue';
export default {
  name: 'CounselReservation',
  components: {
    CalendarMonth,
    CalendarWeek
  },
  data() {
    return {
      isLoading: true,
      snackbar: false,
      snackbar_color: "",
      snackbar_text: "",
      currentIdx: 0, // 주간 날짜 계산용
      todayYear: this.$moment().day(1).format("YYYY"),
      todayMonth: this.$moment().day(1).format("MM"),
      dateStart: "",
      dateEnd: "",
      days: [], // 주간 날짜
      times: [
        { text: "10:30 ~ 12:00", type: 1 },
        { text: "13:00 ~ 14:30", type: 2 },
        { text: "15:00 ~ 16:30", type: 3 },
        { text: "17:00 ~ 18:30", type: 4 }
      ],
      dayCounselInfo: {}, // 날짜별 상담 데이터
      counselList: [], // DB 저장된 데이터
      showMonthDialog: false, // 월간 데이터 보기 다이얼로그
    };
  },

  computed: {
    navigations() {
      return [
        {
          text: "홈",
          href: "/#/views/index"
        },
        {
          text: "일정관리",
          disabled: true
        },
        {
          text: "상담 예약 현황",
          disabled: true
        }
      ];
    },
    /**
     * 1일 상담 건수 배열
     */
    dayCounselCount() {
      let arr = [];
      for (let [key, value] of Object.entries(this.dayCounselInfo)) {
        let cnt = 0;
        for (let [k, v] of Object.entries(value)) {
          cnt += v.length || 0;
        }
        arr.push(cnt);
      }
      return arr;
    },
    /**
     * 주 상담 건수
     */
    weekCounselCount() {
      let cur = 0;
      return this.dayCounselCount.reduce((acc, cur) => acc + cur);
    },
    /**
     * 현재 상담 데이터 존재 여부
     */
    isCounselData() {
      return this.counselList && this.counselList.length > 0;
    }
  },

  created() {
    this.calDate();
  },

  methods: {
    accessMode() {
      return ["admin"];
    },

    /**
     * 주간 날짜 계산
     */
    calDate() {
      this.days = [];
      const dateToday = this.$moment().add(this.currentIdx, "days");
      // 주간 시작일
      this.dateStart = dateToday.day(1).format("YYYYMMDD");
      this.todayYear = dateToday.day(1).format("YYYY");
      this.todayMonth = dateToday.day(1).format("MM");
      // 주간 종료일
      this.dateEnd = dateToday
        .day(1)
        .add(6, "days")
        .format("YYYYMMDD");

      let days = [];
      for (let i = 0; i < 7; i++) {
        const momentDay = this.$moment(this.dateStart);
        days.push({
          ymd: momentDay.add(i, "day").format("YYYYMMDD"),
          dayNm: momentDay.locale('ko').format('ddd'),  // 요일
        });
      }
      this.days = days;
      this.getCounselData();
    },

    /**
     * 상담 데이터 가져오기
     */
    getCounselData() {
      const data = {
        bgnDt: this.dateStart,
        endDt: this.dateEnd
      };
      this.$sendApi("/counsel/counselStatusList", data)
        .then(response => {
          if (response.data && response.data.isSuccess) {
            // console.log(response.data);
            this.counselList = response.data.counselList || [];
            this.fetchData();
          }
        })
        .catch(error => {
          console.log("ERROR::", error);
          this.openSnackbar(0, "데이터 조회 중 오류가 발생했습니다.");
        });
    },

    /**
     * 데이터 처리
     */
    fetchData() {
      this.days = this.days.map(day => {
        let type = "D"; // 주간
        if (day.dayNm === "토" || day.dayNm === "일") type = "W"; // 주말
        if (day.dayNm === "월") type = "H"; // 월요일 휴관
        // TODO 공휴일 체크 필요
        day.type = type;
        return day;
      });
      this.createCounselInfo();
    },

    /**
     * 카운셀 데이터 초기값 설정
     */
    createCounselInfo() {
      let dataMap = {};
      this.days.forEach(day => {
        let dayData = {};
        this.times.forEach((time, index) => {
          let count = 0;
          let timeData = [];
          // 데이터 셋팅
          if (this.isCounselData) {
            const data = this.counselList.filter(d => {
              return d.counselDay === day.ymd && d.timePeriod === index + 1;
            });
            // console.log(data);
            if (data) {
              timeData = timeData.concat(data);
            }
          }

          dayData[time.type] = _.cloneDeep(timeData);
        });
        dataMap[day.ymd] = dayData;
      });
      this.dayCounselInfo = dataMap;
      this.isLoading = false;
    },

    prevWeek() {
      // 2020년 6월 서비스 개시로 그 전으로는 이동 불가
      if(Number.parseInt(this.todayYear) <= 2020 && Number.parseInt(this.todayMonth) <= 5) {
        return;
      }
      this.currentIdx -= 7;
      this.calDate();
    },

    nextWeek() {
      this.currentIdx += 7;
      this.calDate();
    },

    /* 알림 메시지 */
    openSnackbar(result, msg) {
      if (result == 1) {
        this.snackbar = true;
        this.snackbar_text = msg;
        this.snackbar_color = "success";
      } else {
        this.snackbar = true;
        this.snackbar_text = msg;
        this.snackbar_color = "error";
      }
    }
  }
};
</script>
