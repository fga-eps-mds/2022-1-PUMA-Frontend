import Vue from 'vue';
import Vuex from 'vuex';
import * as Cookies from 'js-cookie';
import createPersistedState from 'vuex-persistedstate';

import userStore from './modules/user';
import modalStore from './modules/modal';

Vue.use(Vuex);

const userState = createPersistedState({
  paths: ['userStore'],
  storage: {
    getItem: (key) => Cookies.get(key),
    setItem: (key, value) => Cookies.set(key, value, { expires: 7, secure: true }),
    removeItem: (key) => Cookies.remove(key),
  },
});

const store = new Vuex.Store({
  modules: {
    userStore,
    modalStore,
  },
  plugins: [userState],
});

export default store;
