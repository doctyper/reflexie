More coming, but for now:
-------------------------

### Setup

```shell
npm install
```

### Run Server

```shell
npm start
```

### Watch file changes

```shell
grunt watch
```

### Generate a new testbed

Point Chrome to [0.0.0.0:9090/generate](http://0.0.0.0:9090/generate). On file save, the page will reload and generate a pristine set of values to test against, split into six files (so browser don't crash reading a huge 110k-line file).

Point Safari / Firefox / IE to [0.0.0.0:9090/runner](http://0.0.0.0:9090/runner). These pages will listen for changes to the testbed and reload accordingly.

Right now the runner only tests one of the six files. Change it manually in `test/lib/tests.js`, line 174.

### Caveats (so far)

- clearfix + display: flex does not mix. Chrome start reporting weird values. The only workaround is to use overflow: hidden;
