import type { App, Plugin } from 'vue';
import RankCard from './RankCard';

RankCard.install = (app: App) => {
    app.component(RankCard.name, RankCard)
    return app
}

export default RankCard as typeof RankCard & Plugin