<template>
  <div>
    <div class="main-content hidden-scroll-bar">
      <div class="d-flex ml-4 mr-5 justify-content-between" style="width: 80% !important">
        <div>
          <h1 class="kw-title">
            Palavras-Chave
          </h1>

          <div class="kw-sub-title">
            Palavras-chave cadastradas na plataforma
          </div>
        </div>
        <div>
          <div class="kw-userName">{{this.$store.getters.user.fullName}}</div>
          <div class="kw-userType">{{this.$store.getters.user.type}}</div>
        </div>
      </div>

      <div class="div-filter-and-button ml-4">
        <b-form-select
          @input="filter"
          class="col-md-4 select"
          v-model="selected"
          :options="subjects"
        >
        </b-form-select>
        <button class="btn kw-btn w-25" @click="addKeyword()">
          <div
            style="
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-around
            "
          >
            <em class="fa-solid fa-plus-circle add-project"></em>
            Adicionar Palavra-Chave
          </div>
        </button>
      </div>

      <div class="tabelas">
        <ListagemConsultaKeyWords
          :keywordsInfo="keywordsInfo"
          :tableKeywordSubject="tableKeywordSubject"
          :subjectsForm="subjectsForm"
          :form_prop.sync="form"
          :keywordService_prop="keywordService"
          :subjects="subjects"
        />

      </div>
    </div>

    <b-modal hide-footer v-model="openModalRegister" centered size="md" modal-class="myclass">
      <template #modal-header>
        Criar Nova Palavra-Chave
      </template>

      <ValidationObserver ref="observer">
        <div style="display: flex; flex-direction: column;  align-items: center;">

          <b-form-group class="col-md-9">
            <template #label>
              <span class="label-text">Palavra-Chave</span>
            </template>

            <validation-provider rules="required" v-slot="{ errors }">
              <b-form-input
                @input="keywordNameAlreadyExist"
                type="text"
                placeholder="Escreva aqui sua nova palavra-chave"
                v-bind:class="{ 'kw-invalid': errors.length }"
                class="custom-input"
                id="inputKeyword"
                v-model.trim="form.keywordName"
              />
              <span class="kw-error">{{ errors[0] }}</span>
              <span
                v-if="kwNameAlreadyExist"
                class="kw-error"
              >
                Palavra-chave já existe, tente novamente.
              </span>
            </validation-provider>
          </b-form-group>

          <b-form-group class="col-md-9">
            <template #label>
              <span class="label-text">Disciplina</span>
            </template>

            <validation-provider rules="required" v-slot="{ errors }">
              <b-select v-model="form.selectedSubject" :options="subjectsForm"
                v-bind:class="{ 'kw-invalid': errors.length }" class="custom-input select" />
              <span class="kw-error">{{ errors[0] }}</span>
            </validation-provider>
          </b-form-group>

        </div>
      </ValidationObserver>

      <div class="divFooter">
        <button
          class="kw-btn-crud-cancel"
          style="margin-right: 5%;"
          @click="openModalRegister=false"
        >
          Cancelar
        </button>

        <button class="kw-btn-confirm" @click="handleAdd()">
          Criar
        </button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import KeywordService from '../../services/KeywordService';
import SubjectService from '../../services/SubjectService';
import ListagemConsultaKeyWords from './ListagemConsultaKeyWords.vue';

export default {
  components: {
    ListagemConsultaKeyWords,
  },

  data() {
    return {
      kwNameAlreadyExist: false,
      multiSelectPlaceholder: 'Carregando opções...',
      keywordService: new KeywordService(),
      subjectService: new SubjectService(),
      openModalRegister: false,
      openModalEdit: false,
      currentKeyWord: {},
      selected: null,
      form: { keywordName: '', selectedSubject: null },
      idKeywordEdit: '',
      idSubjectEdit: '',
      flag: false,
      subjects: [],
      subjectsForm: [],
      subjectsList: [],
      isLoadingKeywords: false,
      optionsSelected: [],
      keyWords: [],
      keywordsInfo: {},
      tableKeywordSubject: [],
    };
  },
  created() {
    this.handleLoadData();
  },
  methods: {
    async handleLoadData() {
      console.log(this.$store.getters.user.fullName);
      try {
        this.$store.commit('OPEN_LOADING_MODAL', { title: 'Carregando...' });
        const { isAdmin } = this.$store.getters.user;
        await this.getKeywords();
        if (isAdmin) {
          await this.getSubjects();
        } else {
          await this.getSubjectsProfessor();
          await this.getFilterProfessor();
        }
        this.$store.commit('CLOSE_LOADING_MODAL');
      } catch (error) {
        this.$store.commit('CLOSE_LOADING_MODAL');
        this.makeToast('ERRO', 'Falha ao carregar os dados', 'danger');
      }
    },

    async getKeywords() {
      try {
        const { data } = await this.keywordService.getKeywords();
        this.tableKeywordSubject = JSON.parse(JSON.stringify(data.reverse()));
        this.keyWords = data;
        Object.keys(data).forEach((key) => {
          this.keywordsInfo[data[key].keywordid] = data[key].array_agg;
        });
      } catch (error) {
        this.makeToast('ERRO', 'Falha ao carregar as palavras-chave', 'danger');
      }
    },

    async getSubjects() {
      try {
        const allSubjects = (await this.subjectService.getSubjects()).data.map(
          (s) => ({ value: s.subjectid, text: s.name }
          ),
        );
        this.subjectsForm = JSON.parse(JSON.stringify(allSubjects));
        this.subjectsForm.unshift({ value: null, text: 'Escolha a disciplina', disabled: true });
        this.subjects = JSON.parse(JSON.stringify(allSubjects));
        this.subjects.unshift({ value: 0, text: 'Todas as Disciplinas' });
        this.subjects.unshift({ value: null, text: 'Escolha a disciplina', disabled: true });
      } catch (error) {
        this.makeToast('ERRO', 'Falha ao carregar as disciplinas', 'danger');
      }
    },

    async getSubjectsProfessor() {
      try {
        const { userId } = this.$store.getters.user;
        const subjectByKeywords = [];
        Object.keys(this.keyWords).forEach((key) => {
          Object.values(this.keyWords[key].array_agg).forEach((allowId) => {
            if (allowId === userId) {
              subjectByKeywords.push({
                value: this.keyWords[key].subjectid,
                text: this.keyWords[key].subjectname,
              });
            }
          });
        });
        this.subjectsForm = [...new Set(subjectByKeywords.map((o) => JSON.stringify(o)))].map(
          (s) => (JSON.parse(s)),
        );
        this.subjectsForm.unshift({ value: null, text: 'Escolha a disciplina', disabled: true });
      } catch (erro) {
        this.makeToast('ERRO', 'Falha ao carregar as disciplinas', 'danger');
      }
    },

    async getFilterProfessor() {
      try {
        const allSubjects = (await this.subjectService.getSubjects()).data.map(
          (s) => ({ value: s.subjectid, text: s.name }),
        );
        this.subjects = JSON.parse(JSON.stringify(allSubjects));
        this.subjects.unshift({ value: 0, text: 'Todas as Disciplinas' });
        this.subjects.unshift({ value: null, text: 'Escolha a disciplina', disabled: true });
      } catch (error) {
        this.makeToast('ERRO', 'Falha ao carregar Professor', 'danger');
      }
    },

    filter(subjectId) {
      this.tableKeywordSubject = this.keyWords;
      if (subjectId === 0) {
        this.tableKeywordSubject = this.keyWords;
      } else {
        this.tableKeywordSubject = this.tableKeywordSubject.filter(
          (d) => d.subjectid === subjectId,
        );
      }
    },

    addKeyword() {
      this.openModalRegister = true;
      this.getKeywords();
      this.form = { keywordName: '', selectedSubject: null };
    },

    keywordNameAlreadyExist() {
      // const currentKeyword = this.form.keywordName;
      this.kwNameAlreadyExist = this.tableKeywordSubject.some(
        (k) => this.treatKeyword(k.keyword) === this.treatKeyword(this.form.keywordName),
      );
    },

    treatKeyword(keyword) { return keyword.split(' ').join('').toLowerCase(); },

    async handleAdd() {
      try {
        this.keywordNameAlreadyExist();
        const isFormValid = await this.$refs.observer.validate();

        if (isFormValid && !this.kwNameAlreadyExist) {
          this.$store.commit('OPEN_LOADING_MODAL', { title: 'Enviando...' });
          const response = await this.keywordService.addKeyword(this.form.keywordName);
          const currentKeywordid = response.data.keywordid;
          const idSubject = this.form.selectedSubject;

          await this.keywordService.addKeywordToSubject(currentKeywordid, idSubject);
          await this.getKeywords();

          this.openModalRegister = false;
          this.$store.commit('CLOSE_LOADING_MODAL');
          this.makeToast('SUCESSO', 'Cadastro realizado com sucesso!', 'success');
        }
      } catch (error) {
        this.openModalRegister = false;
        this.$store.commit('CLOSE_LOADING_MODAL');
        this.makeToast('ERRO', 'Infelizmente houve um erro ao tentar cadastrar a palavra-chave', 'danger');
      }
    },

    makeToast(thisTitle, message, thisVariant) {
      this.$bvToast.toast(
        message,
        {
          title: thisTitle,
          variant: thisVariant,
          solid: true,
          autoHideDelay: 4000,
        },
      );
    },
  },
};
</script>

<style src="./keyWords.css"></style>
