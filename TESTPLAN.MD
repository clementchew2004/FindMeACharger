In order to test our system, we decided upon an automated test suite to improve the efficiency that which we catch errors within our system. For the backend unit tests, we picked node-tap for its simplicity and ease of use.
We decided against manual testing as it would've took up a large portion of our development time and we didn't believe it would add significant value to our development of this first prototype.
Despite this, we did conduct informal manual tests whilst developing individual features, but these wouldn't really meet the level of rigor required for documentation.
We ended up with good coverage of our backend routes, only really missing last minute additions and a few external api calls that unit testing wouldn't be appropriate for. 
We have ~100 unit tests, and assuming the latest database, they should all pass. Any failures will likely be last minute changes that slipped through our testing.

We also developed frontend integration testing, which tests elements of our frontend in a more efficient manner than unit tests would. These test interaction rather than method, and we also attained fairly good coverage of our frontend system by the end of development. Our frontend testing suite was vitest. 
The results of this testing were slightly more mixed, however, due to the more volatile nature of our frontend and architectural changes late on in development. Therefore we achieved a lower, but still reasonable pass rate of ~65%. Many of these will not necessarily be critical failures, but simple semantic/structural differences from when the tests were introduced. 



