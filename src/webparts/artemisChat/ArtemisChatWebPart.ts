import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneSlider,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'ArtemisChatWebPartStrings';
import { createBootstrapTokenProvider } from '../../common/createBootstrapTokenProvider';
import ArtemisChat from './components/ArtemisChat';
import { IArtemisChatProps } from './components/IArtemisChatProps';

export interface IArtemisChatWebPartProps {
  runtimeEndpoint: string;
  projectId: string;
  backendUrl: string;
  apiResource: string;
  height: number;
}

export default class ArtemisChatWebPart extends BaseClientSideWebPart<IArtemisChatWebPartProps> {

  private _root: Root | undefined;

  // Stable reference so the chat SDK is not re-created on every render.
  private _bootstrapTokenProvider: (() => Promise<string>) | undefined;

  protected onInit(): Promise<void> {
    this._bootstrapTokenProvider = createBootstrapTokenProvider(
      this.context.aadHttpClientFactory,
      () => this.properties
    );
    return Promise.resolve();
  }

  public render(): void {
    if (!this._bootstrapTokenProvider) {
      return;
    }

    const element: React.ReactElement<IArtemisChatProps> = React.createElement(
      ArtemisChat,
      {
        runtimeEndpoint: this.properties.runtimeEndpoint,
        projectId: this.properties.projectId,
        height: this.properties.height,
        bootstrapTokenProvider: this._bootstrapTokenProvider
      }
    );

    if (!this._root) {
      this._root = createRoot(this.domElement);
    }

    this._root.render(element);
  }

  protected onDispose(): void {
    this._root?.unmount();
    this._root = undefined;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('runtimeEndpoint', {
                  label: strings.RuntimeEndpointLabel
                }),
                PropertyPaneTextField('projectId', {
                  label: strings.ProjectIdLabel
                }),
                PropertyPaneTextField('backendUrl', {
                  label: strings.BackendUrlLabel
                }),
                PropertyPaneTextField('apiResource', {
                  label: strings.ApiResourceLabel
                }),
                PropertyPaneSlider('height', {
                  label: strings.HeightLabel,
                  min: 300,
                  max: 900,
                  step: 50
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
