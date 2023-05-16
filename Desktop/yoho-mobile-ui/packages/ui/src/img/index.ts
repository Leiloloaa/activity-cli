import type { App, Plugin } from 'vue';
import Img from './Img';

Img.install = (app: App) => {
    app.component(Img.name, Img)
    return app
}

export default Img as typeof Img & Plugin