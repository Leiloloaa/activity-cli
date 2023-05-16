import { defineComponent, h as renderFunc, reactive } from "vue";

// Utils
import { unknownProp, makeStringProp, makeNumberProp } from "../../utils";

import "./style";

export type ImgType = "success" | "fail" | "live" | "coin" | "";

export const imgProps = {
  src: String,
  fid: String,
  type: makeStringProp<ImgType>(""),
  defaultImg: makeStringProp(
    "https://image.waka.media/activity/regular_newExperience2/default_avatar.png"
  ),
  className: unknownProp,
  domainPrefix: String,
  m: makeStringProp("fill"),
  w: makeNumberProp(300),
  h: makeNumberProp(300),
};

const domainPrefix = "//image.waka.media/activity/yoho-ui/";

export default defineComponent({
  name: "Img",
  props: imgProps,
  emits: [""],
  setup(props, { slots, emit }) {
    // const globalProperties = useGlobalProperties();
    // const imgUrl = globalProperties.$imgUrl;
    const imgUrl = "";

    const renderImage = () => {
      if (props.type) {
        return (
          <img
            src={domainPrefix + props.type + ".png"}
            alt=""
            class={["yoho-default-img", props.className]}
          />
        );
      }

      if (props.src) {
        const _src = props.src.includes("https://")
          ? props.src
          : imgUrl + props.src;
        return (
          <img
            src={_src}
            alt=""
            class={["yoho-default-img", props.className]}
          />
        );
      }
    };

    const renderCdnImg = () => {
      if (props.fid) {
        const _domain = props.domainPrefix
          ? props.domainPrefix
          : `https://${
              window.location.host.includes("test") ? "cdn-test" : "cdn"
            }.waka.media`;

        const params = `?x-oss-process=image/resize,m_${props.m},h_${props.h},w_${props.w}`;

        const VNodeProps = reactive({
          src: `${_domain}/${props.fid}${params}`,
          class: ["yoho-default-img", props.className],
          onError: (err: any) => {
            if (err) {
              VNodeProps.src = `${_domain}/${props.fid}`;
            }
          },
        });

        return () => renderFunc("img", VNodeProps);
      }
    };

    const renderDefaultImg = () => {
      return (
        <img
          src={props.defaultImg}
          alt=""
          class={["yoho-default-img", props.className]}
        />
      );
    };

    return props.src || props.type
      ? () => <>{renderImage()}</>
      : props.fid
      ? renderCdnImg()
      : () => <>{renderDefaultImg()}</>;
  },
});
