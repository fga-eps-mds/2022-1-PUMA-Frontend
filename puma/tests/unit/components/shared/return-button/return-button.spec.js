import { shallowMount } from '@vue/test-utils';

import ReturnButton from '../../../../../src/components/shared/ReturnButton/ReturnButton.vue';

describe('Mounted NavBar', () => {
  const wrapper = shallowMount(ReturnButton, {});

  it('does a wrapper exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('does the Voltar text is shows', () => {
    expect(wrapper.find('.btn').text()).toEqual('Voltar');
  });
});
