import { defineComponent } from "vue";
import { isNum } from "@yoho/utils";

export default defineComponent({
  name: "Button",
  setup() {
    return () => {
      return <button style="color:red">button</button>;
    };
  },
});
