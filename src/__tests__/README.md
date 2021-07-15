# Tests

The `interfaces` artifacts where generated from the root folder directory with the following command.

```sh
protoc --plugin=node_modules/ts-proto/protoc-gen-ts_proto --ts_proto_out=src/__tests__/fixtures/interfaces --ts_proto_opt=env=node --ts_proto_opt=outputEncodeMethods=false,outputJsonMethods=false,outputClientImpl=false   ./protos/helloworld.proto
```
