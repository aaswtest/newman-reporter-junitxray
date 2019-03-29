# newman-reporter-junitxray
A Newman Junit reporter designed simplify output for use with XRAY for JIRA
JUnit reporter for [Newman](https://github.com/postmanlabs/newman) that provides the information about the collection run in a JUnit format.
This needs to be used in [conjunction with Newman](https://github.com/postmanlabs/newman#external-reporters) so that it can recognize JUnit reporting options.

> JUnit Reporter so that the JUnit results XML can be used in Conjunction with XRay for JIRA and provide a 1:1 relationship of requests per test cases (Instead of assertions per rquest being reported as unique test cases.)

> Different from [newman-reporter-junit](https://github.com/postmanlabs/newman/blob/develop/lib/reporters/junit/index.js) is using executions to have full report and no aggregated report.
Please use [newman-reporter-junit](https://github.com/postmanlabs/newman/blob/develop/lib/reporters/junit/index.js) if you want the original aggregated results.

## Install
> The installation should be global if newman is installed globally, local otherwise. (Replace -g from the command below with -S for a local installation)

```console
$ npm install -g newman-reporter-junitxray
```

## Usage
In order to enable this reporter, specify `junit` in Newman's `-r` or `--reporters` option.

In order to enable this reporter, specify `junitxray` in Newman's `-r` or `--reporters` option.

```console
newman run https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv -r junitxray --reporter-junitxray-export './examples/full/result.xml' -n 2
```

### Options

#### With Newman CLI

| CLI Option  | Description       |
|-------------|-------------------|
| `--reporter-junitxray-export <path>` | Specify a path where the output XML file will be written to disk. If not specified, the file will be written to `newman/` in the current working directory. |

#### With Newman as a Library
The CLI functionality is available for programmatic use as well.

```javascript
const newman = require('newman');

newman.run({
    collection: require('https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv'), // can also provide a URL or path to a local JSON file.
    reporters: 'junitfull',
    reporter: {
        junitxray: {
            export: './examples/full/result.xml', // If not specified, the file will be written to `newman/` in the current working directory.
        }
    },
	iterationCount: 2
}, function (err) {
	if (err) { throw err; }
    console.log('collection run complete!');
});
```

## Compatibility

| **newman-reporter-junitxray** | **newman** | **node** |
|:-----------------------------:|:----------:|:--------:|
|            v1.0.0             | >= v4.0.0  | >= v6.x  |

## Troubleshooting

### Reporter not found
The reporter and newman must be installed at the same level, the installation should be global if newman is installed globally, local otherwise.

### Getting different JUnit output
You are most probably getting in-built reporter output used in older versions of newman, Please check the newman's [compatibility](#compatibility) section above.

> If you are facing any other problem, please check the open [issues](https://github.com/martijnvandervlag/newman-reporter-junitxray/issues) or create new.

## Community Support

<img src="https://avatars1.githubusercontent.com/u/3220138?v=3&s=120" align="right" />
If you are interested in talking to the Postman team and fellow Newman users, you can find us on our <a href="https://community.getpostman.com">Postman Community Forum</a>. Feel free to drop by and say hello. You'll find us posting about upcoming features and beta releases, answering technical support questions, and contemplating world peace.

Sign in using your Postman account to participate in the discussions and don't forget to take advantage of the <a href="https://community.getpostman.com/search?q=newman">search bar</a> - the answer to your question might already be waiting for you! Don’t want to log in? Then lurk on the sidelines and absorb all the knowledge.


## License
This software is licensed under Apache-2.0. Copyright Postdot Technologies, Inc. See the [LICENSE](LICENSE) file for more information.