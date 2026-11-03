export interface IArtemisChatProps {
  runtimeEndpoint: string;
  projectId: string;
  height: number;
  bootstrapTokenProvider: () => Promise<string>;
}
