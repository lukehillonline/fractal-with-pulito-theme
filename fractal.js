// eslint-disable-next-line no-multi-assign
const fractal = (module.exports = require('@frctl/fractal').create());

fractal.set('project.title', 'Fractal With Pulito Theme');

fractal.components.set('path', `${__dirname}/components`);

fractal.components.set('default.status', null);

fractal.docs.set('path', `${__dirname}/docs`);

fractal.web.set('static.path', `${__dirname}/public`);
fractal.web.set('builder.dest', `${__dirname}/dist`);

fractal.web.set('server.sync', true);
fractal.web.set('server.syncOptions', {
    notify: true,
    open: true,
    browser: ['google chrome']
});

const pulitoTheme = require('pulito-fractal-theme');

fractal.web.theme(pulitoTheme);
