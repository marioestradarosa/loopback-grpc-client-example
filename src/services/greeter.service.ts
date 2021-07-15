import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {HellodsDataSource} from '../datasources';
import {Greeter} from '../interfaces';

export class GreeterProvider implements Provider<Greeter> {
  constructor(
    // hellods must match the name property in the datasource json file
    @inject('datasources.hellods')
    protected dataSource: HellodsDataSource = new HellodsDataSource(),
  ) { }

  value(): Promise<Greeter> {
    return getService(this.dataSource);
  }
}
