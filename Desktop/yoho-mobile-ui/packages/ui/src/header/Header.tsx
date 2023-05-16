import { defineComponent } from "vue";

import "./style";

export const headerProps = {
  video: Boolean,
  videoSrc: String,
  videoPoster: String,
  src: String,
  className: String,
};

export default defineComponent({
  name: "Header",
  props: headerProps,
  emits: [""],
  setup(props, { slots, emit }) {
    // const globalProperties = useGlobalProperties();
    // const imgUrl = globalProperties.$imgUrl;
    const imgUrl = "";

    const renderVideo = () => {
      if (props.video) {
        return (
          <>
            {slots.videoTitle && slots.videoTitle()}
            <video
              id="myVideo"
              src={props.videoSrc}
              poster={props.videoPoster}
              class={["yoho-default-video", props.className]}
              autoplay
              loop
              muted
              preload="true"
              x5-video-player-type="h5"
              x5-playsinline
              playsinline
              webkit-playsinline
              x5-video-player-fullscreen="false"
            />
          </>
        );
      }
    };

    const renderPng = () => {
      if (slots.header) {
        return (
          <div class={["yoho-default-header", props.className]}>
            {slots.header()}
          </div>
        );
      } else {
        return (
          <img
            src={props.src}
            alt=""
            class={["yoho-default-header", props.className]}
          />
        );
      }
    };

    return () => {
      return <>{props.video ? renderVideo() : renderPng()}</>;
    };
  },
});
