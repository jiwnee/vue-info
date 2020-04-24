import Vue from 'vue';
import Router from 'vue-router';
// import HelloWorld from '@/components/HelloWorld';
// import CalendarEdit from '@/components/CalendarEdit';
import CounselEdit from '@/components/CounselEdit';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: CounselEdit
    }
  ]
})
