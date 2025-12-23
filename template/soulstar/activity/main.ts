import { createApp } from 'vue';
import App from './template/app/app.vue';
import router from './router/index';
import developTool from '@components/developTool_TS/index';
import animate from '@activity-business/h5-package-vue3Animate';
import { Pretreatment } from "@library/activity_pretreatment/index";
import { vClickOutside, vMarquee } from '@activity-business/h5-package-micoUse';
import '@library/styles/index.scss';
import { config } from './config';

const app = createApp(App);

const rootDom = document.createElement('div');
rootDom.setAttribute('id', 'root');
document.body.appendChild(rootDom);

const countryList = ['EG','TW'];
//  第一个国家、地区码为默认值
const pretreatment = new Pretreatment(app, countryList);

pretreatment.init().then(({ profile, LANG }) => {
	app.use(router).use(animate).use(developTool, {
		activityId: config.activityId,
		countryCode: LANG,
		moduleVersion: {
			toast: 'v2',
		},
		componentConfig: {
			toast: {
				style: {
					width: 'fit-content',
					maxWidth: '80.8vw',
					lineHeight: '6vw',
					padding: '0.24rem',
					borderRadius: '0.24rem',
					backgroundColor: 'rgba(36, 36, 40, 0.75)',
					fontSize: '0.32rem',
					fontWeight: '500',
				},
			},
			// 图片资源文件名
			image: {
				p: config.projectName
			}
		}
	})
	.directive('click-outside', vClickOutside)
	.directive('marquee', vMarquee)
	.mount(rootDom);
});
