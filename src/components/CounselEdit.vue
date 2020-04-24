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
              <v-icon class="ma-1 mdi-36px" v-if="mode === 'view'" @click="prevWeek()">mdi-chevron-left</v-icon>

              <span class="ma-2 title">
                {{$moment(dateStart).format('YYYY-MM-DD')}}
                <v-icon class="ma-1">mdi-minus</v-icon>
                {{$moment(dateEnd).format('YYYY-MM-DD')}}
              </span>

              <v-icon class="ma-1 mdi-36px" v-if="mode === 'view'" @click="nextWeek()">mdi-chevron-right</v-icon>
            </v-row>

            <v-simple-table class="table-border" v-if="!isLoading">
              <template v-slot:default>
                <tbody>
                  <tr class="table-header">
                    <td rowspan="2" width="200">구분</td>
                    <td class="red--text">월</td>
                    <td>화</td>
                    <td>수</td>
                    <td>목</td>
                    <td>금</td>
                    <td>토</td>
                    <td>일</td>
                  </tr>

                  <tr class="table-header">
                    <td
                      v-for="(day, index) in days"
                      :key="'day'+index"
                      :class="day.type === 'H' ? 'red--text' : ''"
                    >{{$moment(day.ymd).format('YYYY-MM-DD')}}</td>
                  </tr>

                  <tr v-for="(time, index) in times" :key="'time'+index">
                    <td class="text-center">{{time.text}}</td>
                    <td v-for="(counsel, key, idx) in dayCounselInfo" :key="'data'+counsel.ymd+idx">
                      <v-combobox
                        v-if="mode === 'edit'"
                        :items="selItems"
                        :item-value="Number"
                        :rules="countRules"
                        v-model="counsel[time.type]['count']"
                        hide-details
                        dense
                        outlined
                      ></v-combobox>
                      <p v-else class="text-center">{{ counsel[time.type]['count'] }}</p>
                    </td>
                  </tr>

                  <tr>
                    <td class="text-center">1일 상담 건수</td>
                    <td v-for="(dayCount, idx) in dayCounselCount" :key="'dayCount'+idx">
                      <p class="text-center" v-text="dayCount"></p>
                    </td>
                  </tr>

                  <tr>
                    <td class="text-center">주 상담 건수</td>
                    <td colspan="7" align="center">
                      <p class="text-center" v-text="weekCounselCount"></p>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>

            <v-row justify="center" class="my-2" v-if="mode === 'edit'">
              <v-btn rounded tile color="secondary" @click="changeEditMode('view')">
                <v-icon>mdi-delete-forever</v-icon>취소
              </v-btn>&nbsp;
              <v-btn rounded tile color="secondary" @click="save()">
                <v-icon>mdi-content-save</v-icon>저장
              </v-btn>
            </v-row>
            <v-row justify="center" class="my-2" v-else>
              <v-btn class="ma-1" color="secondary"
                v-if="mode === 'view'"
                @click="changeEditMode('edit')">
                <v-icon>mdi-table-edit</v-icon>&nbsp;수정
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
<style scoped>
.table-header {
  background-color: #eeeeee;
  width: 200px;
  font-weight: bold;
  text-align: center;
}
.table-border {
  border: 1px solid #eeeeee !important;
}
</style>
<script>
export default {
  data() {
    return {
      mode: 'view',
      isLoading: true,
      snackbar: false,
      snackbar_color: '',
      snackbar_text: '',
      todayMonth: 0,
      todayWeek: 0,
      currentIdx: 0,  // 주간 날짜 계산용
      dateStart: '',
      dateEnd: '',
      days: [], // 주간 날짜
      times: [
        {text: '10:30 ~ 12:00', type: 1},
        {text: '13:00 ~ 14:30', type: 2},
        {text: '15:00 ~ 16:30', type: 3},
        {text: '17:00 ~ 18:30', type: 4}
      ],
      selItems: [0, 1, 2, 3],
      countRules: [
        value => {
          return (typeof Number.parseInt(value) === 'number' && (value <= 3)) || false
        }
      ],  // 횟수 콤보박스 유효성 체크
      dayCounselInfo: {}, // 날짜별 상담 데이터
      tmpCounselInfo: {}, // 수정 페이지 리셋용
      counselList: [],  // DB 저장된 데이터
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
          text: "상담 가능일자 설정",
          disabled: true
        }
      ];
    },
    /**
     * 1일 상담 건수 배열
     */
    dayCounselCount() {
      let arr = [];
      for(let [key, value] of Object.entries(this.dayCounselInfo)) {
        let cnt = 0;
        for(let [k, v] of Object.entries(value)) {
          cnt += Number.parseInt(v.count);
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
      const dateToday = this.$moment().add(this.currentIdx, 'days');
      // 주간 시작일
      this.dateStart = dateToday.day(1).format('YYYYMMDD');
      // 주간 종료일
      this.dateEnd = dateToday.day(1).add(6, 'days').format('YYYYMMDD');

      this.getCounselData();
    },

    /**
     * 상담 데이터 가져오기
     */
    getCounselData() {
      const data = {
        bgnDt: this.dateStart,
        endDt: this.dateEnd
      }
      // this.$sendApi('/counsel/counselList', data)
      //   .then(response => {
      //     if (response.data.isSuccess == true) {
      //       this.isLoading = false;
      //       console.log(response.data)
      //       this.days = response.data.calendarList;
      //       this.counselList = response.data.counselList;
      //       this.fetchData();
      //     }
      //   })
      //   .catch(error => {
      //     // this.openSnackbar(
      //     //   0,
      //     //   "데이터 조회 중 오류가 발생했습니다."
      //     // );
      //   });
      for (let i = 0; i <= 6; i++) {
        const day = this.$moment(this.dateStart).add(i, 'days');
        let type = 'D'; // 주간
        switch (i) {
          case 0:
            type = 'H'; // 휴일
            break;
          case 5:
          case 6:
            type = 'W'; // 주말
            break;
        }
        this.days.push({ymd: this.$moment(day).format('YYYYMMDD'), type: type});
      }
      this.counselList = [
        {
          "counselIdx": 0,
          "counselDay": "20200429",
          "timePeriod": 1,
          "aCnt": 1,
          "rCnt": 1,
          "counselTotal": 0
        },
        {
          "counselIdx": 0,
          "counselDay": "20200429",
          "timePeriod": 2,
          "aCnt": 3,
          "rCnt": 0,
          "counselTotal": 0
        },
        {
          "counselIdx": 0,
          "counselDay": "20200429",
          "timePeriod": 3,
          "aCnt": 1,
          "rCnt": 0,
          "counselTotal": 0
        },
        {
          "counselIdx": 0,
          "counselDay": "20200502",
          "timePeriod": 2,
          "aCnt": 1,
          "rCnt": 0,
          "counselTotal": 0
        },
        {
          "counselIdx": 0,
          "counselDay": "20200503",
          "timePeriod": 1,
          "aCnt": 1,
          "rCnt": 0,
          "counselTotal": 0
        },
        {
          "counselIdx": 0,
          "counselDay": "20200503",
          "timePeriod": 3,
          "aCnt": 1,
          "rCnt": 0,
          "counselTotal": 0
        },
        {
          "counselIdx": 0,
          "counselDay": "20200504",
          "timePeriod": 1,
          "aCnt": 1,
          "rCnt": 0,
          "counselTotal": 0
        },
        {
          "counselIdx": 0,
          "counselDay": "20200504",
          "timePeriod": 2,
          "aCnt": 0,
          "rCnt": 1,
          "counselTotal": 0
        },
        {
          "counselIdx": 0,
          "counselDay": "20200504",
          "timePeriod": 3,
          "aCnt": 2,
          "rCnt": 0,
          "counselTotal": 0
        },
        {
          "counselIdx": 0,
          "counselDay": "20200504",
          "timePeriod": 4,
          "aCnt": 1,
          "rCnt": 0,
          "counselTotal": 0
        }
      ];
      this.fetchData();
    },

    /**
     * 데이터 처리
     */
    fetchData() {
      this.days = this.days.map(day => {
        let type = 'D'; // 주간
        if(day.weekEndYn === 'Y') type = 'W'; // 주말
        if(day.dayNm === '월' || day.hodyYn === 'Y') type = 'H'; // 휴일 (월요일 휴관)
        day.type = type;
        return day;
      })
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
          let rCnt = 0;
          // 수정화면에서 데이터 없을 경우에만 초기 데이터 셋팅
          if (this.mode === 'edit' && !this.isCounselData) {
            if(day.type === 'D' && index > 1) count = 2;
            if(day.type === 'W' && index > 0) count = 3;
          } else if (this.isCounselData) {
            const data = this.counselList.filter(d => {
              return d.counselDay === day.ymd && d.timePeriod === (index + 1);
            })[0];
            if (data) {
              count = Number.parseInt(data.aCnt) + Number.parseInt(data.rCnt) || 0;
              rCnt = Number.parseInt(data.rCnt) || 0;
            }
          }

          dayData[time.type] = {
            count: count,
            rCnt: rCnt
          }
        });
        dataMap[day.ymd] = dayData;
      });
      this.dayCounselInfo = dataMap;

      this.isLoading = false;
    },

    save() {
      console.log(this.dayCounselInfo);
    },

    prevWeek() {
      this.currentIdx -= 7;
      this.calDate();
    },

    nextWeek() {
      this.currentIdx += 7;
      this.calDate();
    },

    resetData() {
      this.dayCounselInfo = _.cloneDeep(this.tmpCounselInfo);
    },

    changeEditMode(mode) {
      this.mode = mode;
      if(mode === 'view') {
        this.resetData();
      } else {
        // 초기화할 데이터 저장
        this.tmpCounselInfo = _.cloneDeep(this.dayCounselInfo);
        this.createCounselInfo();
      }
    }
  }
};
</script>
