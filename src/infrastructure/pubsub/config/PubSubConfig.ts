import 'reflect-metadata';
import { PubSub } from '@google-cloud/pubsub';
import { ENV } from '@modules/shared';

export const pubsubRuteo = new PubSub({ projectId: ENV.GCP_PROJECT });
