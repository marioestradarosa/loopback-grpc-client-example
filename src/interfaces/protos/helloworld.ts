/* eslint-disable */
export const protobufPackage = 'helloworld';

/** The request message containing the user's name. */
export interface HelloRequest {
  name: string;
}

/** The response message containing the greetings */
export interface HelloReply {
  message: string;
}

/** The greeting service definition. */
export interface Greeter {
  /** Sends a greeting */
  SayHello(request: HelloRequest): Promise<HelloReply>;
  SayHelloAgain(request: HelloRequest): Promise<HelloReply>;
}
