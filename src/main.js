// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import vuetify from '@/plugins/vuetify';
import axios from 'axios';
import Vuex from "vuex";
import utils from "@/components/utils";
import moment from 'moment';
import _ from 'lodash';

Vue.config.productionTip = false;
Vue.prototype.$http = axios;
Vue.prototype.$moment = moment;
Vue.prototype.$utils = utils;
Vue.use(Vuex);

const token =
'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJBRF90ZXN0MDMiLCJyb2xlcyI6WyJST0xFX0FETUlOIl0sInJvbGUiOiJST0xFX0FETUlOIiwibGV2ZWwiOiI1IiwibmFtZSI6Iu2BrOujqDEiLCJ1c2VyaWQiOiJ0ZXN0MDMiLCJpYXQiOjE1ODgxNTA1MjksImV4cCI6MTU4ODE1NDEyOX0.roU6JfvSUWPukBT01MwLkvKNYhbYk0uGnNesB5vME2Q'

const sendApi = function(url, data) {
  return axios.post(url, data, { headers: { 'Content-type': 'application/json', 'X-AUTH-TOKEN': token } });
}

Vue.prototype.$sendApi = sendApi;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  vuetify
})
