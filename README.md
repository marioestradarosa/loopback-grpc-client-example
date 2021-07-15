# gRPC client example

This application demonstrate the power of `service proxy` along with `connectors`
within a loopback 4 application. In this case the connector used is the
`loopback-connector-grpc`.

## Installing
After you clone it locally, you need to install the packages.

```sh
npm install
```
You will need to instantiate a local `gRPC server` in order to test the application.
I have created a `Docker` image already, so you only need to run it.

```sh
npm run docker:run:grpc-test-server
```

## Testing

In order to run the local test try to run
```sh
npm run pretest
npm run test
```
## Starting the application

run `npm start` and then try to interact with the local controller GET `/greeter/$name`
end point. The local `greeter` method from the controller will invoke the remote
method from the `gRPC` server via the `dataSource` and `serviceProxy`.

## Stopping the remote gRPC Server

We have created another script task in the `package.json` for that, just run:

```sh
npm run docker:stop:grpc-test-server
```

## Tutorial

We are assuming you `docker` installed in your computer, since you will need it

## Responsibility of `loopback-connector-grpc`

- Imports the protocol buffers file descriptor at dataSource initialization
- Registers service & methods (stubs) in the loopback-connector-grpc

### Protocol Buffer files

You can create a `protos` (or any name) directory in the root of your loopback 4
project in order to have it ready for the connector. Failing to do so the connector
will not start since it won't find the proto file.

## Responsibity of `service proxy`

- Allows a communication between your application and the methods exposed by the
connector.

## Your responsibility

- Add interfaces to the generated provided service class that is associated to
the `datasource`. This will allow you to have type checking at the code editor
 level. The service class can be injected in any application controller or any
 other services in order to call the methods exposed by the grpc server.

# Creating the Project

- Using `lb4` command, you scaffold an application.
- Create a `protos` directory in the root of your application
- Copy any `proto` file to the `protos` folder you just created

## Creating the DataSource

Using `lb4 datasource` let's create the `hellods` data sourcename and select
gRPC as the connector name as follows:

```sh
% lb4 datasource hellods
? Select the connector for hellods:
  Couchdb 2.x (supported by StrongLoop)
  IBM WebSphere eXtreme Scale key-value connector (supported by StrongLoop)
  Cassandra (supported by StrongLoop)
❯ gRPC (supported by StrongLoop)
  Redis key-value connector (supported by StrongLoop)
  MongoDB (supported by StrongLoop)
  MySQL (supported by StrongLoop)
```

It will then ask for the gRPC spec file location. Just answer `protos/helloworld.proto`
since we are reading it locally for this example and it is located in the root
of the project.

```sh
? HTTP URL/path to gRPC spec file (file name extension .yaml/.yml or .json):
protos/helloworld.proto
proto
```

Now it will ask if you require validation of the spec file specified above against
the gRPC specification 2.0 , for now answer `N` since currently the proto is in
version 3.0. For the Security config in this case leave it empty.

```sh
? Validate spec against gRPC specification 2.0?: (Y/n) n
? Security config for making authenticated requests to API:
```
After the `dataSource` is created you will see the following message.

```sh
Datasource Hellods was/were created in src/datasources
```

### Editing the `hellods.datasource.ts` file

Add the following 3 items (host, port, remotingEnabled) in the configuration
 constant as such: The `host` where the gRPC server is running and its `port`
 number are important.

```ts
 const config = {
  name: 'hellods',
  connector: 'grpc',
  spec: 'protos/helloworld.proto',
  validate: false,
  host: 'localhost',
  port: 50051,
  remotingEnabled: true
};
```

## Creating the `service proxy`

From the command line run `lb4 service greeter` and choose the option
`Remote service proxy backed by a data source ` as such:

```sh
% lb4 service helloService
? Service type: (Use arrow keys)
❯ Remote service proxy backed by a data source
  Local service class bound to application context
  Local service provider bound to application context
```

Now it will prompt for the `dataSource` you want this service to be associated
with, select the `HellodsDatasource` as such:

```sh
? Please select the datasource (Use arrow keys)
❯ HellodsDatasource
```
After the service has been created, you will see the following message:

```sh
Service Greeter was/were created in src/services
```

## DTOs (Data Transfer Objects)

Now we need a way to convert the Message type definitions inside our protocol
buffer file into type script interfaces so we can use them to define the methods,
 parameters and responses in our service proxy class.

We can do it manually, but we can also use tools available for node JS in order
 to maximize our development time and prevent errors.

### Installing globally protoBuf from Google

You can read the [Protoc installation](https://grpc.io/docs/protoc-installation/)
for other operating systems.

*macos*
`brew install protobuf`

Making sure it is the latest version, in my case it shows 3.17.3 as the time of
this writing.

```sh
% protoc --version
libprotoc 3.17.3
```

### Installing locally in my project dev tsproto npm package

We are going to install [TsProto package](https://github.com/stephenh/ts-proto),
make sure you are in your root project folder and the option to be applied is
`--save-dev`since for this case we don't need it when deployed. This package is
 useful for local development as in this example or to include it in a deployment
 pipeline.

```sh
% npm install ts-proto --save-dev
```

### Creating a local directory inside my root project to hold the result from `tsproto` and `protoc` as typescript interfaces

```sh
% mkdir src/interfaces
```

### Generating TS interfaces from the `protos` folder

The following command will invoke the global `protoc` command you installed
before and reference the `ts-proto` npm package as the plugin. We are telling
`ts-proto` to output the result in `src/interfaces` from the original
`protocol buffer` file located in the root of our application.

```sh
% protoc --plugin=node_modules/ts-proto/protoc-gen-ts_proto --ts_proto_out=src/interfaces --ts_proto_opt=env=node --ts_proto_opt=outputEncodeMethods=false,outputJsonMethods=false,outputClientImpl=false  ./protos/helloworld.proto
```

The latter will create the file `src/interfaces/protos/helloworld.ts` with 3
artifacts as follows:

- `interface Greeter` is the interface we will use in our `service proxy` declaring the methods, parameters and responses from the remote gRPC server
- `interface HelloRequest` is our request interface for the two methods exposed in the remote gRPC server
- `interface HelloReply` is our response interface

**Note:** in order work simpler when importing these interfaces, we will add an `index.ts` file in the `src/interfaces` with the following content:

```ts
export * from './protos/helloworld';
```

### Adding our interfaces in the `serviceProxy` Greeter class

Remove the default empty Greeter interface from your service proxy class and just import the `Greeter` from the `interfaces` directory as such:

```ts
import {Greeter} from '../interfaces';

export class GreeterProvider implements Provider<Greeter> {
  constructor(
```

## Testing the new service from a test controller

The `test-greeter.controller.ts` file is there to test our two greeting functions.
 One end point inside the controller is defining manually the object to be returned in openAPI spec, the other one is not. Currently `LB4` can generate it automatically from model classes, however no support is currently for interfaces, this is something that we need to look after in the near future.

The interfaces generated by `protoc` with the `tsproto` plugin are also imported in the controller as follows:

```ts
import {Greeter, HelloReply, HelloRequest} from '../interfaces';
```

Now, You inject the service in the usual way using `injection` as such:

```ts
 constructor(
    @inject('services.Greeter')
    private greeter: Greeter
```

And finally you can invoke any method as follows:

```ts
const grParam: HelloRequest = {name: arg};
    return this.greeter.SayHelloAgain(grParam);
```

## Debugging your gRPC Server

[Bloom RPC] (https://github.com/uw-labs/bloomrpc) is one of the clients we use in order to test any gPRC server, similar to PostMan and GraphQL Playground. This is useful because sometimes you might think if an error is being raised by something wrong in your client application or the server, so having tool on hand is productive.

Just import a `.proto` file, specify the server location and you are ready to test remote gRPC servers.


## What's next

Please check out [LoopBack 4 documentation](https://loopback.io/doc/en/lb4/) to
understand how you can continue to add features to this application.

[![LoopBack](https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)
