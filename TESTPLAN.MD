We decided to use an automated test suite to improve testing efficiency during development. We conducted informal manual tests whilst developing individual features, however these were not used for formal testing as they were less rigorous and didn't add significant value to our prototype.

For the backend unit tests, we picked node-tap for its simplicity and ease of use. We ended up with 93% branch coverage of our backend files, only really missing a few last minute additions. We have ~120 integrated unit tests and a small number of isolated unit tests. All backend tests pass as of the latest version.

We also developed frontend integration testing using vitest. These tests validate user interactions rather than individual methods. We attained fairly good coverage of our frontend system by the end of development, however the results of this testing were slightly more mixed due to some significant architectural changes made later on. Therefore we achieved a lower, but still reasonable pass rate of ~65%. Many of these will not necessarily be critical failures, but simple semantic/structural differences from when the tests were introduced.

| Type | Framework | Target | Pass rate |
| ---- | --------- | ------ | --------- |
| Unit (integrated) | node-tap | Controllers and DB | 100% |
| Unit (isolated) | node-tap | Middleware, routing endpoint | 100% |
| Integration | vitest | Frontend UI | ~65% |