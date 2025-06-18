import { createRouter, createWebHistory } from 'vue-router';

import LoginLayout from '../layouts/login.layout.vue';
import RecipeListLayout from '../layouts/recipe-list.layout.vue';
import RecipeDetailsLayout from '../layouts/recipe-details.layout.vue';
import RecipeCreateLayout from '../layouts/recipe-create.layout.vue';
import RecipeUpdateLayout from '../layouts/recipe-update.layout.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: 'Login',
      component: LoginLayout,
      path: '/',
    },
    {
      name: 'RecipeList',
      component: RecipeListLayout,
      path: '/recipes',
    },
    {
      name: 'CreateRecipe',
      component: RecipeCreateLayout,
      path: '/recipes/new',
      props: true,
    },
    {
      name: 'RecipeDetails',
      component: RecipeDetailsLayout,
      path: '/recipes/:id',
      props: true,
    },
    {
      name: 'UpdateRecipe',
      component: RecipeUpdateLayout,
      path: '/recipes/:id/edit',
      props: true,
    },
  ],
});
