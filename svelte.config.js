import sveltePreprocess from 'svelte-preprocess';

export default {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: sveltePreprocess({
		scss: {
			prependData: `@import 'src/style.scss';`,
		},
		pug: {
			markupTagName: 'template',
		},
	}),
};
