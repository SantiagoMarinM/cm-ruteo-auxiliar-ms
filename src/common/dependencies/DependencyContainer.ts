import { Container } from 'inversify';
import { TYPES } from './Types';
import PubSubEventsPublisher from '@infrastructure/pubsub/PubsubEventsPublisher';
import { EventsPublisher } from '@common/domain/events';
import { Publisher } from '@modules/shared/domain/events';
import { PubsubPublisher } from '@modules/shared/Infrastructure/pubsub/Publisher';
import { AgrupadorLogger } from '@common/logger/AgrupadorLogger';
import { ILogger } from '@common/logger';

export const GLOBAL_CONTAINER = new Container();

const createDependencyContainer = () => {
    GLOBAL_CONTAINER.bind<EventsPublisher>(TYPES.EventsPublisher).to(PubSubEventsPublisher);
    GLOBAL_CONTAINER.bind<Publisher>(TYPES.Publisher).to(PubsubPublisher).inSingletonScope();
    GLOBAL_CONTAINER.bind<ILogger>(TYPES.Logger).to(AgrupadorLogger).inSingletonScope();
};

export default createDependencyContainer;
