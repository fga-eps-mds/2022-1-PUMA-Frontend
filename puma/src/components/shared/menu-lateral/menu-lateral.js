/* eslint-disable */
import ItemMenuLateral from "./item-menu-lateral/ItemMenuLateral.vue";
import USER_CONST from '../../../utils/enums/users.enum.js';

export default {
    name: 'MenuLateral',
    components: {
        ItemMenuLateral,
    },
    props: {},
    data() {
        return {
            user: this.$store.getters.user,
            menuItems: {
                adminProjects: {
                    basePath: '/projetos-plataforma',
                    title: 'Projetos',
                    iconUrl: require('@/assets/menu-2.svg'),
                    show: () => { return this.user.isAdmin },
                    onclick: () => {
                        this.$router.push({ path: '/projetos-plataforma' }).catch(()=>{});
                    },
                },
                subjectProjects: {
                    basePath: '/projetos-disciplina',
                    title: 'Projetos das Disciplinas',
                    iconUrl: require('@/assets/menu-2.svg'),
                    show: () => { return [USER_CONST.TYPES.PROFESSOR.KEY].some((type) => type === this.user.type); },
                    onclick: () => {
                        this.$router.push({ path: '/projetos-disciplina' }).catch(()=>{});
                    },
                },
                myProjects: {
                    basePath: '/meus-projetos',
                    title: 'Meus Projetos',
                    iconUrl: require('@/assets/menu-1.png'),
                    show: () => { return true; },
                    onclick: () => {
                        this.$router.push({ path: '/meus-projetos' }).catch(()=>{});
                    },
                },
                subjects: {
                    basePath: '/disciplinas',
                    title: 'Disciplinas',
                    iconUrl: require('@/assets/subjects.png'),
                    show: () => { return [USER_CONST.TYPES.PROFESSOR.KEY].some((type) => type === this.user.type); },
                    onclick: () => {
                        this.$router.push({ path: '/disciplinas' }).catch(()=>{});
                    },
                },
                keywords: {
                    basePath: '/palavras-chave',
                    title: 'Palavras-Chave',
                    iconUrl: require('@/assets/menu-4.svg'),
                    show: () => { return [USER_CONST.TYPES.PROFESSOR.KEY].some((type) => type === this.user.type); },
                    onclick: () => {
                        this.$router.push({ path: '/palavras-chave' }).catch(()=>{});
                    },
                },
                logout: {
                    title: 'Sair',
                    iconUrl: require('@/assets/menu-3.svg'),
                    show: () => { return true },
                    onclick: () => {
                        this.$store.commit('RESET_USER_STATE');
                        this.$router.push({ path: '/usuario/login' }).catch(()=>{});
                    },
                }
            }
        };
    },
    methods: {
        redirectToUserProjects() {
            this.$router.push({ path: '/meus-projetos' }).catch(()=>{});
        },
        showMenuHamburger(element) {
            const content = document.getElementById(element);
      
            if (!content.style.display) {
              content.style.display = 'block';
            } else if (content.style.display === 'block') {
              content.style.display = 'none';
            } else {
              content.style.display = 'block';
            }
        },
    },
};
