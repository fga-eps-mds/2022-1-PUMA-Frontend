/* eslint-disable */
import ProjectService from '../../../services/ProjectService';
import AlocateService from '../../../services/AlocateService';

export default {
  name: 'CadastroProjeto',
  data() {
    return {
      operacao: 'cadastrar',
      titulo: '',
      descricao: '',
      resultadoEsperado: '',
      formIsValid: '',
      keywords: [],
      mainKeyword: null,
      selectedKeywords: [],
      projectService: new ProjectService(),
      alocateService: new AlocateService(),
      multiSelectPlaceholder: 'Carregando opções...',
    };
  },
  beforeMount() {
    this.getKeywords();
  },
  mounted() {
    this.operacao = this.$route.path.split('/', 3)[2];
    if (this.operacao !== 'cadastrar') {
      if (this.operacao === 'visualizar') {
        this.disableForm();
        this.removeDropdownIcons();
      }
      this.getProject(this.$route.params.id);
    }
  },
  methods: {
    async onSubmit() {
      try {
        this.$store.commit('OPEN_LOADING_MODAL', { title: 'Cadastrando...' });

        const isFormValid = await this.$refs.observer.validate();
        if (!isFormValid) return;

        const project = {
          name: this.titulo,
          problem: this.descricao,
          expectedresult: this.resultadoEsperado,
          status: 'SB',
          createdat: new Date().toISOString(),
          userid: this.$store.getters.user.userId,
          keywords: this.selectedKeywords.map((k) => ({ keywordid: k.value, main: k.value === this.mainKeyword })),
        };

        await this.projectService.addProject(project);

        this.$store.commit('CLOSE_LOADING_MODAL');
        await this.$router.push({ path: `/meus-projetos` });
        this.makeToast('Sucesso', 'Operação realizada com sucesso', 'success');
      } catch (error) {
        this.$store.commit('CLOSE_LOADING_MODAL');
        this.makeToast('Erro', 'Falha ao realizar operação', 'danger');
      }
    },
    handleChangeKeywords: function (value) {
      if (!!!value.find((k) => k.value === this.mainKeyword)) {
        this.mainKeyword = null;
      }
    },
    makeToast: function (title, message, variant) {
      this.$bvToast.toast(message, { title: title, variant: variant, solid: true });
    },
    sortMultiselectLabels() {
      this.selectedKeywords.sort((a, b) => b.keyword.length - a.keyword.length);
    },
    isChecked(option) {
      return this.selectedKeywords.some((op) => op.value === option.value);
    },
    disableForm() {
      const inputs = document.getElementsByTagName('input');
      const textareas = document.getElementsByTagName('textarea');
      for (let i = 0; i < inputs.length; i += 1) { inputs[i].disabled = true; }
      for (let i = 0; i < textareas.length; i += 1) { textareas[i].disabled = true; }
    },
    removeDropdownIcons() {
      document.getElementsByClassName('multiselect__select')[0].remove();
    },
    async getKeywords() {
      try {
        this.$store.commit('OPEN_LOADING_MODAL', { title: 'Carregando...' });

        const response = await this.projectService.getKeywords();
        this.keywords = response.data.map((k) => ({ value: k.keywordid, text: k.keyword })).sort();
        this.multiSelectPlaceholder = this.keywords.length ? 'Selecione' : 'Sem palavras disponíveis';

        this.$store.commit('CLOSE_LOADING_MODAL');
      } catch (error) {
        this.multiSelectPlaceholder = 'Sem palavras disponíveis';
        this.$store.commit('CLOSE_LOADING_MODAL');
        this.makeToast('Erro', 'Falha ao carregar os dados', 'danger');
      }
    },
    getProject(projectId) {
      this.projectService.getProjById(projectId).then((response) => {
        const project = response.data;
        this.selectedKeywords = project.keywords;
        this.titulo = project.name;
        this.descricao = project.problem;
        this.resultadoEsperado = project.expectedresult;
      }).catch((error) => {
        alert(`Erro ao recuperar projeto: ${error}`);
      });
    },
  },
};
