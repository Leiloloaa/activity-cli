import { defineComponent } from "vue";

import "./style";

export default defineComponent({
  name: "TextStroke",
  props: {
    textStroke: {
      type: String,
      default: "0.05rem #f40",
    },
    text: {
      type: String,
    },
  },
  emits: [""],
  setup(props, { slots, emit }) {
    const renderContent = () => {
      if (slots.content) {
        return (
          <div
            class={["yoho-text-outline"]}
            style={{
              "--textStroke": props.textStroke,
              "--text": props.text,
            }}
          >
            {slots.content()}
          </div>
        );
      }
    };

    return () => {
      return renderContent();
    };
  },
});
