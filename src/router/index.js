import Vue from 'vue';
import Router from 'vue-router';
// import HelloWorld from '@/components/HelloWorld';
import CrewSchedule from '@/components/CrewSchedule';
import CounselEdit from '@/components/CounselEdit';
import CounselReservation from '@/components/CounselReservation';
import DaumApi from '@/components/DaumApi';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'DaumApi',
      component: DaumApi
    }
  ]
})
