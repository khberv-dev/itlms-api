import { Global, Module } from '@nestjs/common';
import { WebGateway } from './web-socket.gateway';
@Global()
@Module({
  imports: [],
  providers: [WebGateway],
  exports: [WebGateway],
})
export class WebSocketModule {}
