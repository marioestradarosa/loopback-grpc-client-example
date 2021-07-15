import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'hellods',
  connector: 'grpc',
  spec: 'protos/helloworld.proto',
  validate: false,
  host: 'localhost',
  port: 50051,
  remotingEnabled: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class HellodsDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'hellods';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.hellods', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
