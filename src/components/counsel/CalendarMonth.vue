<template>
  <!-- 월간 데이터 보기 -->
  <v-dialog v-model="showMonthDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar dark color="primary">
        <v-spacer></v-spacer>
        <v-toolbar-title>상담 예약 현황</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon dark @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-list three-line subheader>
        <v-list-item>
          <v-list-item-content>
            <v-row justify="center" class="my-2">
              <v-icon class="ma-1 mdi-36px" @click="prevMonth()">mdi-chevron-left</v-icon>
              <span class="ma-2 title">
                {{$moment(dateStart).format('YYYY년 MM월')}}
              </span>
              <v-icon class="ma-1 mdi-36px" @click="nextMonth()">mdi-chevron-right</v-icon>
            </v-row>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list three-line subheader>
        <v-subheader>월 예약 상담 건수 : {{totalCount}}</v-subheader>
        <v-list-item>
          <v-list-item-content>
            <CalendarWeek
              v-for="(week, weekIdx) in counselWeeks"
              :key="'week'+weekIdx"
              :days="dayWeek[weekIdx + startWeek]"
              :times="times"
              :counselInfo="week"
              :type="weekIdx === 0 ? 'first' : counselWeeks.length === (weekIdx + 1) ? 'last' : ''"
            />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog>
</template>
<style scoped>
</style>
<script>
import CalendarWeek from '@/components/counsel/CalendarWeek.vue';
export default {
  name: 'CalendarMonth',
  components: {
    CalendarWeek
  },
  props: ['currentYear', 'currentMonth', "showMonthDialog"],
  data() {
    return {
      type: "month",
      currentIdx: 0, // 월간 날짜 계산용
      todayYear: this.$moment().day(1).format("YYYY"),
      todayMonth: this.$moment().day(1).format("MM"),
      dateStart: "",
      dateEnd: "",
      times: [
        { text: "10:30 ~ 12:00", type: 1 },
        { text: "13:00 ~ 14:30", type: 2 },
        { text: "15:00 ~ 16:30", type: 3 },
        { text: "17:00 ~ 18:30", type: 4 }
      ],
      days: [],
      dayWeek: [[],[],[],[],[],[],[]],
      counselWeeks: [], // 날짜별 상담 데이터 주간 배열
      counselList: [], // DB 저장된 데이터
      totalCount: 0,  // 월간 총 개수
      startWeek: 1,
    };
  },

  computed: {
    curYear() {
      return Number.parseInt(this.currentYear);
    },
    curMonth() {
      return Number.parseInt(this.currentMonth) - 1;
    },
    /**
     * 현재 월간 데이터 존재 여부
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
     * 월간 날짜 계산
     */
    calDate() {
      this.days = [];
      const dateToday = this.$moment([this.curYear, this.curMonth, 1]).add(this.currentIdx, "months");
      // 월간 시작일
      this.dateStart = dateToday.format("YYYYMMDD");
      this.todayYear = dateToday.format("YYYY");
      this.todayMonth = dateToday.format("MM");
      // 월간 종료일
      this.dateEnd = dateToday.add(1, 'months').date(0).format("YYYYMMDD");

      let days = [];
      let i = 0;
      let startDt = this.dateStart;
      const endDt = this.dateEnd;
      while (startDt !== endDt && i < 31) {
        startDt = this.$moment(startDt).add(i, 'days').format("YYYYMMDD");
        const momentDay = this.$moment(startDt);
        days.push({
          ymd: momentDay.format("YYYYMMDD"),
          dayNm: momentDay.locale('ko').format('ddd'),  // 요일
        });
        i = 1;
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
            this.totalCount = response.data.counselList && response.data.counselList.length || 0;
            this.counselList = response.data.counselList || [];
            this.fetchData();
          }
        })
        .catch(error => {
          console.log("ERROR::", error);
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
      this.createCounselWeeks();
    },

    /**
     * 카운셀 데이터 초기값 설정
     */
    createCounselWeeks() {
      let weekMap = [];
      let dataMap = {};
      let nowWeek = 1;
      let dayWeek = 1;
      this.days.forEach((day, dayIndex) => {
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

        const week = this.weekOfMonth(day.ymd);
        // 달의 첫날이 일요일일 경우 week이 1이지만 월요일 시작이기 때문에 먼저 weekMap에 push
        if (dayIndex === 0 && this.$moment(day.ymd).day() === 0) {
          this.dayWeek[0].push(day);
          this.startWeek = 0;
          weekMap.push(_.cloneDeep(dataMap));
          dataMap = {};
        } else {
          this.dayWeek[nowWeek].push(day);

        }
        // week이 달라질 때 weekMap에 push
        if(dayWeek !== week) {
          dayWeek = week;
          if(week > 0) {
            nowWeek = week;
          } else {
            nowWeek ++;
          }
          if (Object.keys(dataMap).length > 0) weekMap.push(_.cloneDeep(dataMap));
          dataMap = {};
        }
      });
      // 마지막 주차 데이터 push
      if (Object.keys(dataMap).length > 0) weekMap.push(_.cloneDeep(dataMap));

      this.counselWeeks = weekMap;
      this.isLoading = false;
    },

    /**
     * 현재 주차 구하기
     * 12월 마지막주가 1월 첫째주로 계산되는 케이스 발생 -> 리턴이 -값
     */
    weekOfMonth (day) {
      return this.$moment(day).week() - this.$moment(day).startOf('month').week() + 1;
    },

    resetData() {
      this.counselWeeks = [];
      this.days = [];
      this.dayWeek = [[],[],[],[],[],[],[]];
      this.counselList = [];
      this.startWeek = 1;
    },

    prevMonth() {
      // 2020년 6월 서비스 개시로 그 전으로는 이동 불가
      if(Number.parseInt(this.todayYear) <= 2020 && Number.parseInt(this.todayMonth) <= 6) {
        return false;
      }
      this.currentIdx -= 1;
      this.resetData();
      this.calDate();
    },

    nextMonth() {
      this.currentIdx += 1;
      this.resetData();
      this.calDate();
    },

    closeDialog() {
      this.$emit('closeDialog')
    }
  }
};
</script>
