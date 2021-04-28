const COLORS = {
  mainColor: {light: 'white', lightP: 'white', dark: 'black', darkP: 'black'},
  mainColorText: {light: 'black', lightP: 'black', dark: 'white', darkP: 'white'},
  primaryColor1: {light: '#119dff', lightP: '#119dff', dark: '#9933ff', darkP: '#9933ff'},
  primaryColor2: {light: '#8ec1ff', lightP: '#8ec1ff', dark: '#cc99ff', darkP: '#cc99ff'},
  primaryColor3: {light: '#c4e7ff', lightP: '#c4e7ff', dark: '#e6ccff', darkP: '#e6ccff'},
  secondaryColor1: {light: '#e9ecef', lightP: '#e9ecef', dark: '#434445', darkP: '#434445'},
  secondaryColor2: {light: '#c4ced9', lightP: '#c4ced9', dark: '#35404a', darkP: '35404a'},
  secondaryColor3: {light: '#a6bed6', lightP: '#a6bed6', dark: '#3e4f61', darkP: '#3e4f61'},
}

var themes = {
  light: settings.global.themeLight,
  lightP: settings.global.themeLightP,
  dark: settings.global.themeDark,
  darkP: settings.global.themeDarkP,
}

// var themesNames = Object.keys(themes);
var currentTheme = themes.light;

Object.keys(themes).forEach((theme, i) => {
  if (themes[theme]) currentTheme = theme;
});

Object.keys(COLORS).forEach((type, i) => {
  document.body.style.setProperty("--" + type, COLORS[type][currentTheme]);
});
