<!--
[TODO]
- 크루 명단 불러오기
- Submit 시 데이터 validation
- 마크업.. 이쁘게
- 휴일 데이터에 대한 처리
- 주간 날짜 처리 기준
-->
<template>
  <div>
      <h2>크루 근무표</h2>
      <br>
      <span v-for="crew in crews" :key="'crewname_'+crew.name">{{crew.name}}({{crew.grade}})  </span>
      <br>
      <br>
      <table class="table">
        <thead>
          <tr>
            <td rowspan="2">구분</td>
            <td v-for="(weekName, index) in weekNames" :key="index">
              {{weekName}}
            </td>
          </tr>
          <tr>
            <td v-for="day in days" :key="'day_'+day.day">
              {{day.day}}
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(job, index) in jobs" :key="'job_'+index">
            <td>
              <span>{{job.name}}</span>
            </td>
            <td v-for="(data, key, idx) in crewData" :key="'day_'+idx">
              <template v-if="!!data[job.name] && data[job.name].length > 0">
                <v-text-field
                  v-for="(d, i) in data[job.name]"
                  :key="'input_'+i"
                  type="text"
                  name="crewName"
                  :rules="crewInputRules"
                  v-model="d['crewName']"
                >
                  <v-icon slot="append" color="red"
                    v-if="job.name === 'S.C' && i > 0 && data[job.name].length === (i + 1)"
                    @click="handleAppend(key)"
                  >mdi-plus</v-icon>
                  <v-icon slot="prepend" color="green"
                    v-if="job.name === 'S.C' && i > 0 && data[job.name].length === (i + 1)"
                    @click="handlePrepend(key)"
                  >mdi-minus</v-icon>
                </v-text-field>
              </template>
              <v-text-field
                v-else
                :disabled="true"
              ></v-text-field>
            </td>
          </tr>
        </tbody>
      </table>
  </div>
</template>

<script>
export default {
  name: 'CalendarEdit',
  data () {
    return {
      weekNames: ['월', '화', '수', '목', '금', '토', '일'],
      days: [
        {day: '2020-06-01', type: 'H'},
        {day: '2020-06-02', type: 'D'},
        {day: '2020-06-03', type: 'D'},
        {day: '2020-06-04', type: 'D'},
        {day: '2020-06-05', type: 'D'},
        {day: '2020-06-06', type: 'W'},
        {day: '2020-06-07', type: 'W'}
      ],
      jobs: [
        {
          name: 'Reception',
          max: 1
        },
        {
          name: 'Garage',
          max: 1
        },
        {
          name: 'Shop',
          max: 1
        },
        {
          name: 'Multi',
          max: 1
        },
        {
          name: 'S.C',
          max: 4
        }
      ],
      crews: [
        {name: '이지원', grade: 'J'},
        {name: '김수연', grade: 'J'},
        {name: '이종호', grade: 'S'},
        {name: '박현지', grade: 'J'},
        {name: '김은정', grade: 'S'},
        {name: '이선지', grade: 'J'}
      ],
      baseModel: {
        crewName: null
      },
      crewName: '',
      crewData: [],
      crewInputRules: [
        value => {
          return !value || this.crews.findIndex(crew => crew.name === value) > -1 ? true : 'Invalid.'
        }
      ]
    }
  },
  computed: {
  },
  created () {
    this.createDataSet();
  },
  methods: {
    createDataSet: function () {
      let dataMap = {};
      this.days.forEach(day => {
        let dayData = {};
        this.jobs.forEach(job => {
          let jobData = [];
          for (let idx = 0; idx < job.max; idx++) {
            if (day.type === 'H') continue;
            if (job.name === 'S.C' && (day.type === 'D' && idx > 1)) continue;
            jobData.push(Object.assign({}, this.baseModel));
          }
          dayData[job.name] = jobData;
        });
        dataMap[day.day] = dayData;
      });
      this.crewData = dataMap;
    },
    handleAppend: function (day) {
      this.crewData[day]['S.C'].push(Object.assign({}, this.baseModel));
    },
    handlePrepend: function (day) {
      this.crewData[day]['S.C'].splice(this.crewData[day]['S.C'].length - 1, 1)
    }
  }
}
</script>

<style type="text/css" scoped>
.table {
  max-width: 100%;
}
div >>> .error--text {
  color : red;
}
</style>
