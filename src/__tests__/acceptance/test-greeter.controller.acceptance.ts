import {Client, expect} from '@loopback/testlab';
import {GrpcClientApplication} from '../..';
import {setupApplication} from './test-helper';

describe('TestGreeterController', () => {
  let app: GrpcClientApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());

  });


  after(async () => {
    await app.stop();
  });

  it('invokes GET /greeter/{name}', async () => {
    const res = await client.get('/greeter/loopback').expect(200);
    expect(res.body).to.containEql({message: 'Hello loopback'});
  });
});
