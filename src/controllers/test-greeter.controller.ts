import {inject} from '@loopback/core';
import {
  get, param, response
} from '@loopback/rest';
import {Greeter, HelloReply, HelloRequest} from '../interfaces';

export class TestGreeterController {
  constructor(
    @inject('services.Greeter')
    private greeter: Greeter
  ) { }

  // Greeter with openAPI specification. We need to be able to generate basic
  // JSON schemas from interfaces in the near future
  @get('/greeter/{name}')
  @response(200, {
    description: 'Hello World grPRC Response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'HelloWorldResponse',
          properties: {
            message: {type: 'string'},
          },
        },
      },
    },
  })
  async myGreeterMethod(
    @param.path.string('name') arg: string
  ): Promise<HelloReply> {
    const grParam: HelloRequest = {name: arg};
    return this.greeter.SayHello(grParam);
  }

  // Greeter without openAPI specification.
  @get('/greeter-two/{name}')
  async myGreeterAgainMethod(
    @param.path.string('name') arg: string
  ): Promise<HelloReply> {
    const grParam: HelloRequest = {name: arg};
    return this.greeter.SayHelloAgain(grParam);
  }

}
