import i18n from 'sveltekit-i18n';

export const languages = [
  {key: 'common.en', locale: 'en'},
  {key: 'common.de', locale: 'de'}
];

const config = ({
  loaders: [
    {
      locale: 'en',
      key: 'common',
      loader: async () => (
        await import('./languages/common/en.json')
      ).default,
    },
    {
      locale: 'de',
      key: 'common',
      loader: async () => (
        await import('./languages/common/de.json')
      ).default,
    },
    {
      locale: 'en',
      key: 'home',
      loader: async () => (
        await import('./languages/home/en.json')
      ).default,
    },
    {
      locale: 'de',
      key: 'home',
      loader: async () => (
        await import('./languages/home/de.json')
      ).default,
    }
  ],
});

export const { t, loading, locales, locale, translations, loadTranslations, addTranslations, setLocale, setRoute } = new i18n(config);