var _ = require("lodash"),
    xml = require("xmlbuilder"),
    moment = require("moment"),
    JunitXrayReporter;

const SEPARATOR = " / ";

/**
 * Resolves the parent qualified name for the provided item
 *
 * @param {PostmanItem|PostmanItemGroup} item The item for which to resolve the full name
 * @param {?String} [separator=SEP] The separator symbol to join path name entries with
 * @returns {String} The full name of the provided item, including prepended parent item names
 * @private
 */
function getParentName(item, separator) {
    if (_.isEmpty(item) || !_.isFunction(item.parent) || !_.isFunction(item.forEachParent)) {
        return;
    }

    var chain = [];

    item.forEachParent(function(parent) {
        chain.unshift(parent.name || parent.id);
    });

    return chain.join(_.isString(separator) ? separator : SEPARATOR);
}

/**
 * A function that creates raw XML to be written to Newman JUnit reports.
 *
 * @param {Object} newman - The collection run object, with a event handler setter, used to enable event wise reporting.
 * @param {Object} reporterOptions - A set of JUnit reporter run options.
 * @param {String=} reporterOptions.export - Optional custom path to create the XML report at.
 * @returns {*}
 */
JunitXrayReporter = function(newman, reporterOptions) {
    newman.on("beforeDone", function() {
        var report = _.get(newman, "summary.run.executions"),
            collection = _.get(newman, "summary.collection"),
            cache,
            collName;

        var date = moment(new Date())
            .local()
            .format("YYYY-MM-DDTHH:mm:ss.SSS");

        if (!report) {
            return;
        }

        let xmlContent = xml.create("testsuites", { version: "1.0", encoding: "UTF-8" });
        xmlContent.att("name", collection.name);
        xmlContent.att("tests", _.get(newman, "summary.run.stats.tests.total", "unknown"));

        cache = _.transform(
            report,
            function(accumulator, execution) {
                accumulator[execution.item.id] = accumulator[execution.id] || [];
                accumulator[execution.item.id].push(execution);
            },
            {},
        );

        // Process executions (testsuites)
        _.forEach(cache, function(executions, itemId) {
            var testsuite = xmlContent.ele("testsuite");
            var failures = 0,
                currentItem,
                errors = 0,
                errorMessages;

            collection.forEachItem(function(item) {
                item.id === itemId && (currentItem = item);
            });

            if (!currentItem) {
                return;
            }

            testsuite.att("id", currentItem.id);

            // Name
            testsuite.att("name", getParentName(currentItem));

            // Tests
            testsuite.att("tests", 1);

            // Timestamp
            testsuite.att("timestamp", date);

            // Set each execution as a single test case
            var testcase = testsuite.ele("testcase");

            // Classname
            collName = _.upperFirst(_.camelCase(collection.name).replace(/\W/g, ""));
            testcase.att("classname", collName);

            // Time (testsuite time divided by number of assertions)
            testcase.att(
                "time",
                (_.get(currentItem, "response.responseTime") / 1000 || 0).toFixed(3),
            );

            //testcase.att("name", currentItem.item.name);
            testcase.att("name", currentItem.name);

            // Process assertion errors(testcases)
            _.forEach(executions, function(testExecution) {
                var iteration = testExecution.cursor.iteration,
                    errored,
                    failure,
                    msg = `Iteration: ${iteration}\n`;

                // Timestamp (add time)
                executionTime = _.get(testExecution, "response.responseTime") / 1000 || 0;

                // Time
                testsuite.att("time", executionTime.toFixed(3));

                
                // Errors / Failures
                if (testExecution.requestError) {
                    ++errors;
                    errored = true;
                    msg += "RequestError: " + testExecution.requestError.stack + "\n";
                }
                msg += "\n---\n";


                _.forEach(["testScript", "prerequestScript"], function(prop) {
                    _.forEach(testExecution[prop], function(err) {
                        if (err.error) {
                            ++errors;
                            errored = true;
                            msg = (msg + prop + "Error: " + (err.error.stack || err.error.message));
                            msg += "\n---\n";
                        }
                    });
                });

                if (errored) {
                    errorMessages = _.isString(errorMessages) ? errorMessages + msg : msg;
                }

                // Process assertions
                _.forEach(testExecution.assertions, function(assertion) {
                    var err = assertion.error;

                    if (err) {
                        ++failures;
                        failure = testcase.ele("failure");
                        failure.att("type", "AssertionFailure");
                        failure.dat('Collection name: ' + collection.name + '.');
                        failure.dat('Test description: '+ assertion.assertion + '.')
                        if (failures.length !== 0) {
                            failure.att("message", err.message);
                            failure.dat("Error message: " + err.message + ".");
                            failure.dat("Stacktrace: " + err.stack + ".");
                        }
                    }
                });

                // Failures
                testsuite.att("failures", failures);

                // Errors
                testsuite.att("errors", errors);

                errorMessages && testsuite.ele('system-err').dat(errorMessages);

            });
        });

        newman.exports.push({
            name: "junit-reporter-junitxray",
            default: "newman-run-report-xray.xml",
            path: reporterOptions.export,
            content: xmlContent.end({
                pretty: true,
                indent: "  ",
                newline: "\n",
                allowEmpty: false,
            }),
        });
    });
};

module.exports = JunitXrayReporter;
