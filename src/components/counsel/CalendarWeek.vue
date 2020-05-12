<template>
  <v-simple-table class="table-border">
    <template v-slot:default>
      <tbody>
        <tr class="table-header">
          <td rowspan="2" width="16%">구분</td>
          <template v-if="days && days.length > 0">
            <template v-if="type === 'first'">
              <td v-for="n in 7 - Object.keys(counselInfo).length" :key="'nodata'+n"></td>
            </template>
            <td
              v-for="(day, index) in days"
              :key="'day'+index"
              :class="day.type === 'H' ? 'red--text' : ''"
              width="12%"
            ><span v-if="day.ymd">{{day.dayNm}}</span></td>
            <template v-if="type === 'last'">
              <td v-for="n in 7 - Object.keys(counselInfo).length" :key="'nodata'+n"></td>
            </template>
          </template>
          <template v-else>
            <td class="red--text" width="12%">월</td>
            <td width="12%">화</td>
            <td width="12%">수</td>
            <td width="12%">목</td>
            <td width="12%">금</td>
            <td width="12%">토</td>
            <td width="12%">일</td>
          </template>
        </tr>

        <tr class="table-header">
          <template v-if="days && days.length > 0">
            <template v-if="type === 'first'">
              <td v-for="n in 7 - Object.keys(counselInfo).length" :key="'nodata'+n"></td>
            </template>
            <td
              v-for="(day, index) in days"
              :key="'day'+index"
              :class="day.type === 'H' ? 'red--text' : ''"
            ><span v-if="day.ymd">{{$moment(day.ymd).format('YYYY-MM-DD')}}</span></td>
            <template v-if="type === 'last'">
              <td v-for="n in 7 - Object.keys(counselInfo).length" :key="'nodata'+n"></td>
            </template>
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

        <tr v-for="(time, index) in times" :key="'time'+index">
          <td class="text-center">{{time.text}}</td>
          <template v-if="type === 'first'">
            <td v-for="n in 7 - Object.keys(counselInfo).length" :key="'nodata'+n"></td>
          </template>
          <td
            v-for="(counsel, key, idx) in counselInfo"
            :key="'data'+counsel.ymd+idx"
            class="text-center"
          >
            <v-tooltip
              right
              v-for="(item, i) in counsel[time.type]"
              :key="'counsel-'+key+'-'+time.type+'-'+i"
            >
              <template v-slot:activator="{ on }">
                <v-btn class="ma-2" outlined color="indigo" v-on="on" width="90px">
                  <!-- <v-icon left>mdi-account-circle</v-icon> -->
                  {{item.memberName}}
                </v-btn>
              </template>
              <span v-text="phoneNumberFormat(item.phoneNumber)"></span>
            </v-tooltip>
          </td>
          <template v-if="type === 'last'">
            <td v-for="n in 7 - Object.keys(counselInfo).length" :key="'nodata'+n"></td>
          </template>
        </tr>

        <tr>
          <td class="text-center">1일 상담 건수</td>
          <template v-if="type === 'first'">
            <td v-for="n in 7 - Object.keys(counselInfo).length" :key="'nodata'+n"></td>
          </template>
          <td v-for="(dayCount, idx) in dayCounselCount" :key="'dayCount'+idx">
            <p class="text-center" v-text="dayCount"></p>
          </td>
          <template v-if="type === 'last'">
            <td v-for="n in 7 - Object.keys(counselInfo).length" :key="'nodata'+n"></td>
          </template>
        </tr>

        <tr>
          <td class="text-center">주 상담 건수</td>
          <template v-if="type === 'first'">
            <td v-for="n in 7 - Object.keys(counselInfo).length" :key="'nodata'+n"></td>
          </template>
          <td colspan="7" align="center">
            <p class="text-center" v-text="weekCounselCount"></p>
          </td>
          <template v-if="type === 'last'">
            <td v-for="n in 7 - Object.keys(counselInfo).length" :key="'nodata'+n"></td>
          </template>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
export default {
  name: 'CalendarWeek',
  props: ['days', 'times', 'counselInfo', 'type'],
  data() {
    return {
      dateStart: this.$moment().day(1).format("YYYYMMDD"),
      dateEnd: this.$moment().day(1).add(6, "days").format("YYYYMMDD"),
      weekDatas: []
    };
  },

  computed: {
    /**
     * 1일 상담 건수 배열
     */
    dayCounselCount() {
      let arr = [];
      for (let [key, value] of Object.entries(this.counselInfo)) {
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
      return this.dayCounselCount && this.dayCounselCount.length > 0 &&
                this.dayCounselCount.reduce((acc, cur) => acc + cur) || cur;
    }
  },

  created() {
    this.weekDatas = _.cloneDeep(this.counselInfo);
  },

  methods: {
    // 휴대폰 번호 포맷
    phoneNumberFormat(number) {
      return number.replace(/(\d{3})(\*{4}|\d{4})(\d{4})/,"$1-$2-$3");
    }
  }
};
</script>

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
