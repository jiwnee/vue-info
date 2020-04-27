// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import vuetify from '@/plugins/vuetify';
import axios from 'axios';
import Vuex from "vuex";
import utils from "./components/utils";
import moment from 'moment';
import _ from 'lodash';

Vue.config.productionTip = false;
Vue.prototype.$http = axios;
Vue.prototype.$moment = moment;
Vue.prototype.$utils = utils;
Vue.use(Vuex);

const sendApi = function(url, data) {
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJBRF90ZXN0MDIiLCJyb2xlcyI6WyJST0xFX1NVUEVSIl0sInJvbGUiOiJST0xFX1NVUEVSIiwibGV2ZWwiOiI5IiwibmFtZSI6IuydtOyngOybkCIsInVzZXJpZCI6InRlc3QwMiIsImlhdCI6MTU4Nzk0OTc0NCwiZXhwIjoxNTg3OTUzMzQ0fQ.FgKehET0pDgJpgaFDkalyioV9zsKD7fzfsgJxWeKxBw';
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
