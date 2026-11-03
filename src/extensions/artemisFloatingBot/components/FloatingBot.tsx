import * as React from 'react';
import { AgentProvider, ChatWidget, useAgent } from '@koreai/artemis-web-sdk/react';
import styles from './FloatingBot.module.scss';

export interface IFloatingBotProps {
  runtimeEndpoint: string;
  projectId: string;
  title: string;
  bootstrapTokenProvider: () => Promise<string>;
}

function ConnectionNotice(): React.ReactElement | null {
  const { error, isConnected } = useAgent();
  if (error) {
    return <div className={styles.notice} role="alert">Chat unavailable: {error.message}</div>;
  }
  if (!isConnected) {
    return <div className={styles.notice}>Connecting…</div>;
  }
  return null;
}

export default function FloatingBot(props: IFloatingBotProps): React.ReactElement<IFloatingBotProps> {
  const { runtimeEndpoint, projectId, title, bootstrapTokenProvider } = props;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [hasOpened, setHasOpened] = React.useState<boolean>(false);

  const toggle = React.useCallback((): void => {
    setIsOpen((open) => !open);
    setHasOpened(true);
  }, []);

  return (
    <div className={styles.root}>
      {hasOpened && (
        // Mounted on first open and then only hidden, so the conversation survives closing the panel.
        <div
          className={styles.panel}
          style={{ display: isOpen ? 'flex' : 'none' }}
          role="dialog"
          aria-label={title}
        >
          <div className={styles.header}>
            <span>{title}</span>
            <button type="button" className={styles.close} onClick={toggle} aria-label="Close chat">
              &#x2715;
            </button>
          </div>
          <div className={styles.body}>
            <AgentProvider
              endpoint={runtimeEndpoint}
              projectId={projectId}
              bootstrapTokenProvider={bootstrapTokenProvider}
            >
              <ConnectionNotice />
              <div className={styles.chat}>
                <ChatWidget />
              </div>
            </AgentProvider>
          </div>
        </div>
      )}
      <button
        type="button"
        className={styles.launcher}
        onClick={toggle}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <span aria-hidden="true">&#x2715;</span>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-4.6 3.7A.5.5 0 0 1 2.6 21V5a2 2 0 0 1 2-2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
