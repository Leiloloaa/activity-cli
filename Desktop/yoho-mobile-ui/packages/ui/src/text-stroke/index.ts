import type { App, Plugin } from 'vue';
import TextStroke from './TextStroke';

TextStroke.install = (app: App) => {
    app.component(TextStroke.name, TextStroke)
    return app
}

export default TextStroke as typeof TextStroke & Plugin