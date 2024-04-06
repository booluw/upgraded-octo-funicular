/* eslint-disable @typescript-eslint/no-unused-vars */
import { createVNode, render, type VNodeProps } from "vue";

import AppNotificationVue from "./AppNotification.vue";

let notify: any;
const appNotification: any = {
  install(app: any, options: any) {
    const handler = async (options: ({ [x: string]: unknown; } & VNodeProps) | null | undefined) => {
      let node: any;
      const container = document.createElement('div');

      const response = await new Promise(resolve => {
        const vm = createVNode(AppNotificationVue, {
          ...options
        });

        render(vm, container);

        node = container.getElementsByTagName('div')[0];
        document.body.appendChild(node);
      })

      document.querySelector('body')?.removeChild(node);

      return response;
    }

    app.provide('appNotification', handler);
    notify = handler;
  },
}

export { appNotification, notify };