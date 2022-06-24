import global from 'global';

import { addons, AddonStore, Channel } from '@storybook/addons';
import type { Config, Types } from '@storybook/addons';
import * as postMessage from '@storybook/channel-postmessage';
import * as webSocket from '@storybook/channel-websocket';
import Events from '@storybook/core-events';
import Provider from './provider';
import { renderStorybookUI } from './index';

import { definitions, values } from './globals';

const { FEATURES, SERVER_CHANNEL_URL } = global;

class ReactProvider extends Provider {
  private addons: AddonStore;

  private channel: Channel;

  private serverChannel?: Channel;

  constructor() {
    super();

    const channel = postMessage.createChannel({ page: 'manager' });

    addons.setChannel(channel);
    channel.emit(Events.CHANNEL_CREATED);

    this.addons = addons;
    this.channel = channel;

    if (FEATURES?.storyStoreV7 && SERVER_CHANNEL_URL) {
      const serverChannel = webSocket.createChannel({ url: SERVER_CHANNEL_URL });
      this.serverChannel = serverChannel;
      addons.setServerChannel(this.serverChannel);
    }
  }

  getElements(type: Types) {
    return this.addons.getElements(type);
  }

  getConfig(): Config {
    return this.addons.getConfig();
  }

  handleAPI(api: unknown) {
    this.addons.loadAddons(api);
  }
}

const { document } = global;

const rootEl = document.getElementById('root');
renderStorybookUI(rootEl, new ReactProvider());

// Apply all the globals
Object.keys(definitions).forEach((key: keyof typeof definitions) => {
  global[definitions[key].varName] = values[key];
});
