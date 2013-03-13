Reflexie: A grown-up polyfill for a grown-up flexbox.
--------

### Status

__Sooooo not ready for prime-time.__ There is still lots to do to get this to a shipping version. See the issues / milestones for more information.

### Setup

Clone the repository, then run from your project root:

```shell
npm install
```

### Getting Started

Spool up your server:

```shell
npm start
```

If you're making changes to the code, make sure to run `grunt watch` for on-the-fly compilation:

```shell
grunt watch
```

### Generate a new testbed

Point an up-to-date Chrome to [0.0.0.0:9090/generate](http://0.0.0.0:9090/generate). On file save, the page will reload and generate a pristine set of values to test against, split into six files (so browser don't crash reading a huge 110k-line file). You should probably stick to vanilla Chrome (as opposed to Canary, etc) to reflect the current implementation.

Point Safari / Firefox / IE to [0.0.0.0:9090/runner](http://0.0.0.0:9090/runner). These pages will listen for changes to the testbed and reload accordingly.

Right now the runner only tests one of the six files. Change it manually in `test/lib/tests.js`, line 174.

I use `test/views/tester.html` to debug specific flexbox properties.

### Caveats (so far)

- clearfix + display: flex does not mix. Chrome start reporting weird values. The only workaround is to use overflow: hidden;

- No IE10 support yet, because how fun is that browser? /sarc

- Lots (LOTS) to figure out, including a proper CSS parsing engine.

- HELP.

### Misc

- This project uses [git-flow](https://github.com/nvie/gitflow). tl;dr: use the develop branch for development, and nothing gets pushed into master unless tests pass.
