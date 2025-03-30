import { pubsubRuteo } from './config/PubSubConfig';

const EVENTO_RUTEO = pubsubRuteo.topic('santiago-evento-rutear');
export default EVENTO_RUTEO;
