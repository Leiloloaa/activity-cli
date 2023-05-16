import type { App, Plugin } from 'vue';
import Header from './Header';

Header.install = (app: App) => {
    app.component(Header.name, Header)
    return app
}

export default Header as typeof Header & Plugin