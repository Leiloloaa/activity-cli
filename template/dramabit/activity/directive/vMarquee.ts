import { DirectiveBinding, App } from 'vue';

interface Manager {
	instances: Set<ScrollInstance>
	rafId: number
	update: Function
	add: Function
	remove: Function
}

interface CustomHTMLElement extends HTMLElement {
	_content: any;
	_scrollInstance: any;
  }

// 管理页面上所有滚动实例
const manager: Manager = {
	instances: new Set(),
	rafId: 0, // 非0整数值

	update() {
		this.instances.forEach(instance => instance.update());
		this.rafId = requestAnimationFrame(() => this.update());
	},

	add(instance) {
		if (!this.instances.has(instance)) {
			this.instances.add(instance);
			if (this.instances.size === 1) {
				this.rafId = requestAnimationFrame(() => this.update())
			};
		}
	},

	remove(instance) {
		this.instances.delete(instance);
		if (this.instances.size === 0 && this.rafId) {
			cancelAnimationFrame(this.rafId);
			this.rafId = 0;
		}
	}
};

class ScrollInstance {
	el: any;
	content: any;
	speed: number;
	startTime: number;
	pausedTime: number;
	observer: null | IntersectionObserver;
	isRtl: boolean
	constructor(el, content, speed = 30, isRtl = false) {
		this.el = el;
		this.content = content;
		this.speed = speed;
		this.isRtl = isRtl;
		this.startTime = 0; // 滚动开始时间
		this.pausedTime = 0; // 滚动暂停时间
		this.observer = null; // 观察元素是否离开视口
		this.initIntersectionObserver();
		this.resume();
	}

	initIntersectionObserver() {
		// IntersectionObserver，被观察元素进入或离开视口，触发回调
		this.observer = new IntersectionObserver((entries) => {
			// isIntersecting: true，当前元素进入视口，   false，当前元素离开视口
			entries.forEach(entry => {
				entry.isIntersecting ? this.resume() : this.pause()
			});
		}, { threshold: 0.1 });
		// threshold，当元素进入视口的比例为0.1时触发回调
		this.observer.observe(this.el);
	}

	update() {
		if (!this.startTime) return;
		const now = new Date().getTime();
		const timeDiff = (now - this.startTime) / 1000; // 经过的时间
		const totalDistance = this.el.clientWidth + this.content.scrollWidth; // 滚动的总距离
		const displacement = (timeDiff * this.speed) % totalDistance; // 从开始时间到现在时间应该滚动的距离 时间差*速度%总距离
		let position;
		if (!this.isRtl) {
			position = this.el.clientWidth - displacement; // translateX位移
		} else {
			position = displacement - this.el.clientWidth
		}
		this.content.style.transform = `translateX(${position}px)`;
	}

	// 滚动
	resume() {
		if (this.startTime !== 0) return;
		if (this.pausedTime !== 0) {
			// 恢复滚动时，重新计算开始时间
			this.startTime = new Date().getTime() - this.pausedTime * 1000;
			// 清空暂停时间
			this.pausedTime = 0;
		} else {
			this.startTime = new Date().getTime();
		}
		manager.add(this);
	}

	// 暂停滚动
	pause() {
		if (this.startTime === 0) return;
		this.content.style.transform = `translateX(0px)`; // 暂停滚动时，将translateX置为0
		// 记录暂停滚动时间
		this.pausedTime = (new Date().getTime() - this.startTime) / 1000;
		this.startTime = 0;
		manager.remove(this); // 离开视口暂停滚动时，从管理器中移除
	}

	destroy() {
		this.pause();
		this.observer?.disconnect(); // 停止观察目标元素
	}
}
const getContentWidth = ele => {

}
const checkAndInitScroll = (el: CustomHTMLElement, binding: DirectiveBinding) => {
	const content = el._content;
	// 检测内容宽度变化
	const isOverflow = content.scrollWidth > el.clientWidth;
	const currentSpeed = binding.value?.speed || 30;
	const currentIsRtl = ['EG','ME','AR'].includes(binding.value?.lang.toUpperCase()); // 示例判断逻辑

	// 需要滚动但未初始化
	if (isOverflow && !el._scrollInstance) {
		el._scrollInstance = new ScrollInstance(
			el,
			content,
			currentSpeed,
			currentIsRtl
		);
	} else if (el._scrollInstance && isOverflow) { // 已有实例但参数变化或内容宽度变化
		// 销毁旧实例并创建新实例
		el._scrollInstance.destroy();
		el._scrollInstance = new ScrollInstance(
			el,
			content,
			currentSpeed,
			currentIsRtl
		);
	} else if (!isOverflow && el._scrollInstance) { // 不再需要滚动
		el._scrollInstance.destroy();
		delete el._scrollInstance;
	}
};
const vMarquee = {
	mounted(el, binding) {
		el._content = document.createElement('div');
		el._content.style.display = 'inline-block';
		el._content.style.whiteSpace = 'nowrap';
		el._content.style.fontSize = binding.value?.fontSize || '.24rem'; // fontSize: 如果不设置，会使用公共的.3rem
		// 移动原始子节点到el._content中
		while (el.firstChild) el._content.appendChild(el.firstChild);
		el.appendChild(el._content);
		el.style.overflow = 'hidden';
		// 检测溢出
		checkAndInitScroll(el, binding)
	},

	unmounted(el) {
		el._scrollInstance?.destroy();
		delete el._scrollInstance;
	},

	updated(el, binding) {
		setTimeout(() => {
			checkAndInitScroll(el, binding);
		}, 0);
	}
};

export { vMarquee };

export default {
    install(app: App<Element>) {
        app.directive('marquee', vMarquee);
    }
};