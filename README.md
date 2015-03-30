Distance matrix proxy application
=================================

This is a sample Java + Spring MVC application that allows you to make requests to Google's DistanceMatrix API from your backend,
signing the request so you can acess the increased limits for this API that you are allowed to use when using a Google Maps for Work license.

You can browse the code and run the  using Eclipse or Netbeans, or just use the command line to build and run it. Java 7 and Maven 3.2.5 needs to be installed in your system in order to compile and run the project. Maven handles the Google AppEngine SDK so there is no need to install that.

A list of relevant files:
* src/main/resources/app.properties: Java properties file that contains the Google Maps for Work client id and private key needed to sign the requests.
* src/main/java/com/snowdropsolutions/dm/services/UrlSigner.java: Creates a signature for a request using the configured Google Maps for Work client id and private key (retrieved from the app.properties file)
* src/main/java/com/snowdropsolutions/dm/services/DistanceMatrixService.java: makes distance matrix requests to Google servers. In order to avoid the API lenght limitation to 2000 characters, it might make several requests in order to be able to retrieve all data. We currently do this by limiting the number of destinations requested to 100 (defined in the MAX_DESTINATIONS const) but better approachs might be tried, such as checking the length of the url being created. This class also assume that latitude and longitude values has been rounded previously to 3 decimal places. You might be interested in doing so in the backend. Allowing more decimal places greatly limits the number of destinations you are able to send in one request to the DistanceMatrix API.
