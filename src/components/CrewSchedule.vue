<!-- 크루 관리 > 크루 근무표 -->
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
              <v-col cols="12" sm="6" md="5">
                <v-icon
                  class="ma-1 mdi-36px"
                  v-if="mode === 'view'"
                  @click="prevWeek()"
                >mdi-chevron-left</v-icon>
                <span class="ma-2 title">
                  {{$moment(dateStart).format('YYYY-MM-DD')}}
                  <v-icon class="ma-1">mdi-minus</v-icon>
                  {{$moment(dateEnd).format('YYYY-MM-DD')}}
                </span>
                <v-icon
                  class="ma-1 mdi-36px"
                  v-if="mode === 'view'"
                  @click="nextWeek()"
                >mdi-chevron-right</v-icon>
              </v-col>
              <v-col cols="6" md="3" class="text-center">
                <!-- 월간 데이터 보기 -->
                <v-btn
                  class="ma-1"
                  color="primary" dark
                  v-if="mode === 'view'"
                  @click="showMonthDialog = true"
                >
                  <v-icon class="ma-1 mdi-18px">mdi-calendar-blank</v-icon>월 단위 보기
                </v-btn>
                <CalendarMonth
                  v-if="showMonthDialog"
                  :showMonthDialog="showMonthDialog"
                  :currentYear="todayYear"
                  :currentMonth="todayMonth"
                  :holidays="holidays"
                  @closeDialog="showMonthDialog = false"
                />
                <!-- 수정 버튼 -->
                <v-btn
                  class="ma-1"
                  color="secondary"
                  v-if="mode === 'view'"
                  @click="changeEditMode('edit')"
                >
                  <v-icon class="mdi-18px">mdi-table-edit</v-icon>&nbsp;근무표 편집
                </v-btn>
              </v-col>
            </v-row>
            <v-row justify="center">
              <b>크루 명단</b>&nbsp; [&nbsp;&nbsp;
              <span
                v-for="crew in crewList"
                :key="'crewname_'+crew.name"
              >{{crew.name}}({{crew.grade}})&nbsp;&nbsp;</span>]
            </v-row>

            <v-simple-table class="table-border">
              <template v-slot:default>
                <tbody>
                  <tr class="table-header">
                    <td rowspan="2" width="200">구분</td>
                    <template v-if="days && days.length > 0">
                      <td
                        v-for="(day, index) in days"
                        :key="'day'+index"
                        :class="day.type === 'H' ? 'red--text' : ''"
                      >{{day.dayNm}}</td>
                    </template>
                    <template v-else>
                      <td class="red--text">월</td>
                      <td>화</td>
                      <td>수</td>
                      <td>목</td>
                      <td>금</td>
                      <td>토</td>
                      <td>일</td>
                    </template>
                  </tr>

                  <tr class="table-header">
                    <template v-if="days && days.length > 0">
                      <td
                        v-for="(day, index) in days"
                        :key="'day'+index"
                        :class="day.type === 'H' ? 'red--text' : ''"
                      >{{$moment(day.ymd).format('YYYY-MM-DD')}}</td>
                    </template>
                    <template v-else>
                      <td class="red--text">{{$moment(dateStart).format('YYYY-MM-DD')}}</td>
                      <td>{{$moment(dateStart).add(1, 'day').format('YYYY-MM-DD')}}</td>
                      <td>{{$moment(dateStart).add(2, 'day').format('YYYY-MM-DD')}}</td>
                      <td>{{$moment(dateStart).add(3, 'day').format('YYYY-MM-DD')}}</td>
                      <td>{{$moment(dateStart).add(4, 'day').format('YYYY-MM-DD')}}</td>
                      <td>{{$moment(dateStart).add(5, 'day').format('YYYY-MM-DD')}}</td>
                      <td>{{$moment(dateEnd).format('YYYY-MM-DD')}}</td>
                    </template>
                  </tr>

                  <tr v-for="(job, index) in jobs" :key="'job_'+index">
                    <td class="td-jobname">
                      <span>{{job.name}}</span>
                    </td>
                    <td v-for="(data, key, idx) in crewData" :key="'day_'+idx">
                      <!-- <template v-if="!!data[job.name] && data[job.name].length > 0"> -->
                        <v-form v-model="formValid" v-if="mode === 'edit'">
                          <v-text-field
                            v-for="(d, i) in data[job.name]"
                            :key="'input_'+i"
                            type="text"
                            name="crewName"
                            :rules="crewInputRules"
                            v-model="d['crewName']"
                          >
                            <v-icon
                              slot="append"
                              color="red"
                              v-if="job.name === 'S.C' && i > 0 && data[job.name].length === (i + 1)"
                              @click="handleAppend(key)"
                            >mdi-plus</v-icon>
                            <v-icon
                              slot="prepend"
                              color="green"
                              v-if="job.name === 'S.C' && i > 0 && data[job.name].length === (i + 1)"
                              @click="handlePrepend(key)"
                            >mdi-minus</v-icon>
                          </v-text-field>
                        </v-form>
                        <!-- <div v-else
                          v-for="(d, i) in data[job.name]"
                          :key="'button_'+d.crewName+'_'+i">
                          <v-btn class="ma-2" outlined color="indigo" width="90px"
                            v-if="!!d.crewName">
                            {{d.crewName}}
                          </v-btn>
                        </div> -->
                      <!-- </template> -->
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>

            <v-row justify="center" class="my-2" v-if="mode === 'edit'">
              <v-btn rounded tile color="secondary" @click="changeEditMode('view')">
                <v-icon class="mdi-18px">mdi-delete-forever</v-icon>&nbsp;취소
              </v-btn>&nbsp;
              <v-btn rounded tile color="secondary" @click="save()">
                <v-icon class="mdi-18px">mdi-content-save</v-icon>&nbsp;저장
              </v-btn>
            </v-row>
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

<script>
export default {
  name: "CrewSchedule",
  data() {
    return {
      mode: "view",
      formValid: false, // form validation
      snackbar: false,
      snackbar_color: "",
      snackbar_text: "",
      todayYear: this.$moment()
        .day(1)
        .format("YYYY"),
      todayMonth: this.$moment()
        .day(1)
        .format("MM"),
      currentIdx: 0, // 주간 날짜 계산용
      dateStart: "",
      dateEnd: "",
      days: [],
      holidays: [], // 휴일 데이터
      jobs: [
        {
          name: "Reception",
          max: 1
        },
        {
          name: "Garage",
          max: 1
        },
        {
          name: "Shop",
          max: 1
        },
        {
          name: "Multi",
          max: 1
        },
        {
          name: "S.C",
          max: 4
        }
      ],
      crewList: [],
      baseModel: {
        crewName: null
      },
      crewData: {}, // 날짜별 크루 스케줄
      tmpCrewData: {}, // 수정 페이지 리셋용
      crewInputRules: [
        value => {
          return !value ||
            this.crewList.findIndex(crew => crew.name === value) > -1
            ? true
            : "Invalid.";
        }
      ],
      showMonthDialog: false // 월간 데이터 보기 다이얼로그
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
          text: "크루관리",
          disabled: true
        },
        {
          text: "크루 근무표",
          disabled: true
        }
      ];
    }
  },
  created() {
    this.holidays = this.$utils.getHolidays();
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
          dayNm: momentDay.locale("ko").format("ddd") // 요일
        });
      }
      this.days = days;
      this.getCrewData();
    },

    /**
     * 크루 스케줄 데이터 가져오기
     */
    getCrewScheduleData() {
      this.$sendApi("/crew/crewSchedule", {})
        .then(response => {
          if (response.data.isSuccess == true) {
            console.log(response.data);
            // this.crewList = response.data.crewList;
            // this.fetchData();
          }
        })
        .catch(error => {
          console.log("ERROR::", error);
          this.openSnackbar(0, "데이터 조회 중 오류가 발생했습니다.");
        });
    },

    /**
     * 크루 데이터 가져오기
     */
    getCrewData() {
      this.$sendApi("/crew/crewList", {})
        .then(response => {
          if (response.data.isSuccess == true) {
            console.log(response.data);
            this.crewList = response.data.crewList;
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
        if (this.holidays.includes(day.ymd)) type = "H"; // 공휴일 체크
        day.type = type;
        return day;
      });
      this.createDataSet();
    },

    /**
     * 근무표 데이터 초기값 설정
     */
    createDataSet: function() {
      let dataMap = {};
      this.days.forEach(day => {
        let dayData = {};
        this.jobs.forEach(job => {
          let jobData = [];
          for (let idx = 0; idx < job.max; idx++) {
            // if (day.type === "H") continue;
            if (job.name === "S.C" && day.type !== "W" && idx > 1) continue;
            jobData.push(Object.assign({}, this.baseModel));
          }
          dayData[job.name] = jobData;
        });
        dataMap[day.ymd] = dayData;
      });
      this.crewData = dataMap;
    },

    handleAppend: function(day) {
      this.crewData[day]["S.C"].push(Object.assign({}, this.baseModel));
    },
    handlePrepend: function(day) {
      this.crewData[day]["S.C"].splice(this.crewData[day]["S.C"].length - 1, 1);
    },

    /**
     * 크루 근무표 저장
     */
    save() {
      this.mode = "view";
      return;

      // validation
      if (!this.formValid) {
        this.openSnackbar(0, "데이터를 확인해주세요.");
        return;
      }

      if (this.mode !== "edit" || !confirm("저장하시겠습니까?")) return;
      let counselData = [];
      for (let [key, value] of Object.entries(this.dayCounselInfo)) {
        for (let [k, v] of Object.entries(value)) {
          // 유효성 체크
          if (v < 0) continue;
          counselData.push({
            counselDay: key,
            timePeriod: k,
            counselTotal: v.count
          });
        }
      }
      // console.log(counselData);

      this.$sendApi("/counsel/counselInsertProc", { counselData: counselData })
        .then(response => {
          if (response.data.isSuccess == true) {
            // console.log(response.data);
            this.mode = "view";
            this.openSnackbar(1, "Success");
            this.getCounselData();
          }
        })
        .catch(error => {
          console.log("ERROR::", error);
          this.openSnackbar(0, "데이터 저장 중 오류가 발생했습니다.");
        });
    },

    prevWeek() {
      // 2020년 6월 서비스 개시로 그 전으로는 이동 불가
      // if (
      //   Number.parseInt(this.todayYear) <= 2020 &&
      //   Number.parseInt(this.todayMonth) <= 5
      // ) {
      //   return;
      // }
      this.currentIdx -= 7;
      this.calDate();
    },

    nextWeek() {
      this.currentIdx += 7;
      this.calDate();
    },

    resetData() {
      this.crewData = _.cloneDeep(this.tmpCrewData);
    },

    changeEditMode(mode) {
      this.mode = mode;
      if (mode === "view") {
        this.resetData();
      } else {
        // 초기화할 데이터 저장
        this.tmpCrewData = _.cloneDeep(this.crewData);
        this.createDataSet();
      }
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

<style type="text/css" scoped>
.table-header {
  background-color: #eeeeee;
  width: 200px;
  font-weight: bold;
  text-align: center;
}
.table-border {
  border: 1px solid #eeeeee !important;
}
.td-jobname {
  font-weight: bold;
  text-align: center;
}
div >>> .error--text {
  color: red;
}
</style>
