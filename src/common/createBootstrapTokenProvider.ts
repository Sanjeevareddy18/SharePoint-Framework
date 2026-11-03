import { AadHttpClient, type AadHttpClientFactory } from '@microsoft/sp-http';

export interface IBootstrapConfig {
  backendUrl: string;
  apiResource: string;
}

// Returns a stable provider that exchanges the signed-in SharePoint user's Entra token for an Artemis bootstrap token.
export function createBootstrapTokenProvider(
  factory: AadHttpClientFactory,
  getConfig: () => IBootstrapConfig
): () => Promise<string> {
  let clientPromise: Promise<AadHttpClient> | undefined;
  let clientResource: string | undefined;

  return async (): Promise<string> => {
    try {
      return await requestBootstrapToken();
    } catch (error) {
      console.error('[Artemis] Bootstrap failed:', error instanceof Error ? error.message : error);
      throw error;
    }
  };

  async function requestBootstrapToken(): Promise<string> {
    const { backendUrl, apiResource } = getConfig();
    if (!backendUrl || !apiResource) {
      throw new Error('Artemis backend URL and API resource are not configured');
    }

    if (!clientPromise || clientResource !== apiResource) {
      clientResource = apiResource;
      const pending = factory.getClient(apiResource);
      clientPromise = pending;
      // Do not cache a failed token acquisition.
      pending.catch(() => {
        if (clientPromise === pending) {
          clientPromise = undefined;
        }
      });
    }

    const client = await clientPromise;
    const response = await client.post(
      `${backendUrl.replace(/\/+$/, '')}/api/artemis/bootstrap`,
      AadHttpClient.configurations.v1,
      { headers: { accept: 'application/json' }, cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`Unable to start chat (bootstrap HTTP ${response.status})`);
    }

    const body = await response.json();
    if (typeof body.bootstrapToken !== 'string' || !body.bootstrapToken) {
      throw new Error('Bootstrap endpoint returned an invalid response');
    }

    return body.bootstrapToken;
  }
}
