import { PropType, defineComponent } from "vue";

// Utils
import { unknownProp, makeObjectProp } from "../../utils";

import "./style";

export interface itemProps {
  rank: number;
  name: string;
  score: number | string;
}

export const rankCardProps = {
  hideTop3Rank: Boolean,
  hideTop3: Boolean,
  className: unknownProp,
  item: {
    type: Object as PropType<itemProps>,
    default: {
      rank: 1,
      name: "--",
      score: 999,
    },
  },
};

export default defineComponent({
  name: "RankCard",
  props: rankCardProps,
  emits: [""],
  setup(props, { slots, emit }) {
    const renderTitle = () => {
      if (slots.title) {
        return slots.title();
      }
    };

    const renderRank = () => {
      if (slots.rank) {
        return slots.rank();
      } else {
        return props.hideTop3Rank ? (
          <div class="rank">
            {props.item.rank <= 3 ? "" : props.item.rank}
          </div>
        ) : (
          <div class="rank">{props.item.rank}</div>
        );
      }
    };

    const renderAvatar = () => {
      if (slots.avatar) {
        return slots.avatar();
      }
    };

    const renderName = () => {
      if (slots.rank) {
        return slots.rank();
      } else {
        return <div class="name">{props.item.name}</div>;
      }
    };

    const renderScore = () => {
      if (slots.score) {
        return slots.score();
      } else {
        return <div class="score">{props.item.score}</div>;
      }
    };

    const renderStamp = () => {
      if (slots.stamp) {
        return slots.stamp();
      }
    };

    const renderContent = () => {
      if (slots.content) {
        return (
          <div class={["yoho-default-card", props.className]}>
            {slots.content()}
          </div>
        );
      } else {
        return (
          <>
            {props.hideTop3 && props.item.rank <= 3 ? (
              ""
            ) : slots.title || slots.footer ? (
              <div class={[props.className]}>
                {renderTitle()}
                <div class={["content"]}>
                  {renderRank()}
                  {renderAvatar()}
                  {renderName()}
                  {renderScore()}
                  {slots.stamp ? renderStamp() : ""}
                </div>
                {renderFooter()}
              </div>
            ) : (
              <div class={["yoho-default-card", props.className]}>
                {renderRank()}
                {renderAvatar()}
                {renderName()}
                {renderScore()}
              </div>
            )}
          </>
        );
      }
    };

    const renderFooter = () => {
      if (slots.footer) {
        return slots.footer();
      }
    };

    return () => {
      return renderContent();
    };
  },
});
