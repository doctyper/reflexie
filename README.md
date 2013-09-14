Reflexie: A grown-up polyfill for a grown-up flexbox.
--------

### Status

__Sooooo not ready for prime-time.__ There is still lots to do to get this to a shipping version. See the issues / milestones for more information.

### Setup

Clone the repository, then run from your project root:

```shell
git submodule update --init
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

Point an up-to-date Chrome to [0.0.0.0:9090/generate](http://0.0.0.0:9090/generate). On file save, the page will reload and generate a pristine set of values to test against. You should probably stick to vanilla Chrome (as opposed to Canary, etc) to reflect the current implementation.

It should be noted that for my tests "full implementation" means "parity with Google Chrome". Any Chrome variation from the spec will have to be manually accounted for.

Point Safari / Firefox / IE to [0.0.0.0:9090/runner](http://0.0.0.0:9090/runner). These pages will listen for changes to the testbed and reload accordingly.

I use `test/views/tester.html` to debug specific flexbox properties.

## Generate a new set of pairwise tests

The flexbox spec is enormous, so I'm using a pairwise algorithm (via [James Bach](http://www.satisfice.com/tools.shtml)) to build out relevant tests.

To generate a new set, run this command from project root. You must have Perl installed:

```shell
node test/data/pairwise/generate-tests.js
```

### Contributing

Your code should pass JSHint based on the settings in .jshintrc. You should try to follow the current code style. Please use semicolons, please use tabs.

This project uses [git-flow](https://github.com/nvie/gitflow). tl;dr: the develop branch is for development, and nothing gets pushed into master unless tests pass.

Branch at will. Use feature branches to organize your changes. Follow the git-flow model when branching.

Use pull requests often. Pull requests should be separated by intent, please don't bulk your changes. Pull requests should target the develop branch. Never pull request into master unless all tests pass successfully.

### Caveats (so far)

- clearfix + display: flex does not mix. Chrome start reporting weird values. The only workaround is to use overflow: hidden;

- No IE10 support yet, because how fun is that browser? /sarc

- Lots (LOTS) to figure out, including a proper CSS parsing engine.

- HELP.
 

