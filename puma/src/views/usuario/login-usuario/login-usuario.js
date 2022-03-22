import { extend } from 'vee-validate';
import { email, required } from 'vee-validate/dist/rules';
import UserService from '../../../services/userService';
import Loading from '../../../components/Loading.vue';

const userService = new UserService();

export default {
  name: 'LoginUsuario',
  components: {
    Loading,
  },
  data() {
    return {
      password: '',
      email: '',
      isLoading: false,
    };
  },
  mounted() {
    document.title = 'PUMA | Login';
  },
  methods: {
    async logar() {
      const isValid = await this.$refs.observer.validate();
      if (isValid) {
        const user = { email: this.email, password: this.password };
        this.isLoading = true;

        userService.logUserIn(user).then((response) => {
          this.isLoading = false;

          this.$store.commit('LOGIN_USER', {
            userId: response.data.userId,
            fullName: response.data.fullName,
            email: response.data.email,
            type: response.data.type,
          });

          this.$store.commit('SET_TOKEN', response.data.token);

          if (response.data.type === 'Agente Externo') {
            this.$router.push('/myProposals');
          } else {
            this.$router.push('/');
          }
        }).catch(() => {
          this.isLoading = false;
          // eslint-disable-next-line no-alert
          alert('Uma falha ocorreu ao fazer login. Tente novamente.');
        });
      }
    },
  },
};

extend('email', {
  ...email,
  validate(value) {
    if (value) {
      return email.validate(value);
    }
    return '';
  },
  message: 'Insira um email válido',
});
extend('required', {
  ...required,
  message: 'Preenchimento obrigatório',
});