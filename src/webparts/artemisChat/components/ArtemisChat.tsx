import * as React from 'react';
import { AgentProvider, ChatWidget } from '@koreai/artemis-web-sdk/react';
import styles from './ArtemisChat.module.scss';
import type { IArtemisChatProps } from './IArtemisChatProps';

export default function ArtemisChat(props: IArtemisChatProps): React.ReactElement<IArtemisChatProps> {
  const { runtimeEndpoint, projectId, height, bootstrapTokenProvider } = props;

  if (!runtimeEndpoint || !projectId) {
    return (
      <section className={styles.artemisChat}>
        Configure the Artemis runtime endpoint and project ID in the web part properties.
      </section>
    );
  }

  return (
    <section className={styles.artemisChat} style={{ height }}>
      <AgentProvider
        endpoint={runtimeEndpoint}
        projectId={projectId}
        bootstrapTokenProvider={bootstrapTokenProvider}
      >
        <ChatWidget />
      </AgentProvider>
    </section>
  );
}
