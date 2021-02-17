import Vue from 'vue';
import VueRouter from 'vue-router';
import DashboardComponent from '../views/Dashboard.vue';
import ChartComponent from '../views/ChartWrapper.vue';
// import UVCDevice from '../components/dashboard/UVCDevice.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardComponent,
    // children: [
    //   {
    //     path: 'device',
    //     component: UVCDevice,
    //   },
    // ],
    // meta: {
    //   requiresAuth: true,
    // },
  },
  {
    path: '/chart',
    name: 'Chart',
    component: ChartComponent,
    props(route) {
      return route.query || {};
    },
  },
];

const router = new VueRouter({
  // mode: 'history',
  routes,
});

// router.replace('/chart');

// router.beforeEach((to, from, next) => {
//   if (to.matched.some((record) => record.meta.requiresAuth)) {
//     if (localStorage.getItem('jwt') == null) {
//       next({
//         path: '/login',
//         params: { nextUrl: to.fullPath },
//       });
//     } else {
//       const user = JSON.parse(localStorage.getItem('user'));
//       if (to.matched.some((record) => record.meta.is_admin)) {
//         if (user.is_admin === 1) {
//           next();
//         } else {
//           next({ name: 'userboard' });
//         }
//       } else {
//         next();
//       }
//     }
//   } else if (to.matched.some((record) => record.meta.guest)) {
//     if (localStorage.getItem('jwt') == null) {
//       next();
//     } else {
//       next({ name: 'userboard' });
//     }
//   } else {
//     next();
//   }
// });

export default router;