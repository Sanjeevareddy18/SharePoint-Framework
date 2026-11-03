import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';

import { createBootstrapTokenProvider } from '../../common/createBootstrapTokenProvider';
import FloatingBot from './components/FloatingBot';

export interface IArtemisFloatingBotApplicationCustomizerProperties {
  runtimeEndpoint: string;
  projectId: string;
  backendUrl: string;
  apiResource: string;
  title?: string;
}

export default class ArtemisFloatingBotApplicationCustomizer
  extends BaseApplicationCustomizer<IArtemisFloatingBotApplicationCustomizerProperties> {

  private _container: HTMLDivElement | undefined;
  private _root: Root | undefined;

  public onInit(): Promise<void> {
    const { runtimeEndpoint, projectId } = this.properties;
    if (!runtimeEndpoint || !projectId) {
      console.warn('[Artemis] Floating bot is not configured (runtimeEndpoint/projectId missing)');
      return Promise.resolve();
    }

    const bootstrapTokenProvider = createBootstrapTokenProvider(
      this.context.aadHttpClientFactory,
      () => this.properties
    );

    this._container = document.createElement('div');
    this._container.setAttribute('data-artemis-floating-bot', '');
    document.body.appendChild(this._container);

    this._root = createRoot(this._container);
    this._root.render(
      React.createElement(FloatingBot, {
        runtimeEndpoint,
        projectId,
        title: this.properties.title || 'Chat with us',
        bootstrapTokenProvider
      })
    );

    return Promise.resolve();
  }

  protected onDispose(): void {
    this._root?.unmount();
    this._root = undefined;
    this._container?.remove();
    this._container = undefined;
  }
}
