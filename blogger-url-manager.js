<script type='text/javascript'>
//<![CDATA[
// BloggerJS v0.3.1
// Copyright (c) 2020 ALOUATIQ
// Licensed under the MIT License

// Global variables
var urlTotal,                // Total number of URLs (posts/pages) to process
    nextPageToken,           // Token for paginating through Blogger API results
    postsDatePrefix = !1,    // Boolean to check if URLs include date prefixes
    accessOnly = !1,         // Boolean to determine if URL modification is allowed
    useApiV3 = !1,           // Boolean to determine if Blogger API v3 should be used
    apiKey = "",             // API key for accessing Blogger API v3
    blogId = "",             // Blog ID for accessing Blogger API v3
    postsOrPages = ["pages", "posts"], // Array for toggling between pages and posts
    jsonIndex = 1,           // Index for JSON pagination
    secondRequest = !0,      // Boolean to manage a second request attempt
    feedPriority = 0,        // Priority for deciding between posts or pages
    amp = "&"[0];            // Ampersand character to handle in URLs

// Function to determine the type of the current URL
function urlVal() {
    var e = window.location.pathname, // Get the current URL path
        t = e.length;                // Length of the path

    // Determine the type of URL:
    // - Return 0 if it's a single post URL (ending in .html)
    // - Return 1 if it's a directory URL (for lists of posts or pages)
    // - Return 2 if it's the homepage
    return ".html" === e.substring(t - 5) ? 0 : t > 1 ? 1 : 2;
}

// Function to modify the URL for cleaner structure
function urlMod() {
    var e = window.location.pathname; // Get the current URL path

    // If it's a page, modify the URL to remove unnecessary parts
    if ("p" === e.substring(1, 2)) {
        e = (e = e.substring(e.indexOf("/", 1) + 1)).substr(0, e.indexOf(".html"));
        history.replaceState(null, null, "../" + e);
    } else { // If it's a post, handle differently based on date prefix
        e = (e = postsDatePrefix ? e.substring(1) : e.substring(e.indexOf("/", 7) + 1)).substr(0, e.indexOf(".html"));
        history.replaceState(null, null, "../../" + e);
    }
}

// Function to search through URLs and redirect to the matching one
function urlSearch(e, t) {
    var n = e + ".html"; // Append .html to the current path

    // Iterate through the list of URLs to find a match
    t.forEach(function(e) {
        // If a match is found, redirect the browser to that URL
        -1 !== e.search(n) && (window.location = e);
    });
}

// Main function to manage the URL based on its type
function urlManager() {
    var e = urlVal(); // Determine the type of the current URL

    // Call appropriate functions based on URL type
    if (0 === e) { // If it's a single post URL
        accessOnly || urlMod();
    } else if (1 === e) { // If it's a directory URL
        getJSON(postsOrPages[feedPriority], 1);
    } else if (2 === e) { // If it's the homepage
        accessOnly || history.replaceState(null, null, "/");
    }
}

// Function to dynamically retrieve JSON data using Blogger API or RSS/Atom feeds
function getJSON(e, t) {
    var n = document.createElement("script"); // Create a script element

    // If using Blogger API v3
    if (useApiV3) {
        var o = "https://www.googleapis.com/blogger/v3/blogs/" + blogId + "/" + e + "?key=" + apiKey + "#maxResults=500#fields=nextPageToken%2Citems(url)#callback=bloggerJSON";
        nextPageToken && (o += "#pageToken=" + nextPageToken); // Append pagination token if available
        nextPageToken = void 0;
    } else { // If using RSS/Atom feeds
        o = window.location.protocol + "//" + window.location.hostname + "/feeds/" + e + "/default?start-index=" + t + "#max-results=150#orderby=published#alt=json-in-script#callback=bloggerJSON";
    }
    o = o.replace(/#/g, amp); // Replace # with & in the URL
    n.type = "text/javascript"; // Set the script type
    n.src = o; // Set the script source to the constructed URL
    document.getElementsByTagName("head")[0].appendChild(n); // Add the script to the head of the document
}

// Callback function to process the JSON data retrieved by getJSON
function bloggerJSON(e) {
    var t = []; // Array to hold the URLs

    // If using Blogger API v3 or if urlTotal is undefined
    if (useApiV3 || void 0 === urlTotal && (urlTotal = parseInt(e.feed.openSearch$totalResults.$t))) {
        // Try to extract URLs from the API response
        try {
            e.items.forEach(function(e, n) {
                t.push(e.url);
            });
        } catch (e) {}
        nextPageToken = e.nextPageToken; // Save the next page token for pagination
    } else { // If using RSS/Atom feeds
        // Try to extract URLs from the feed entries
        try {
            e.feed.entry.forEach(function(n, o) {
                var r = e.feed.entry[o];
                r.link.forEach(function(e, n) {
                    "alternate" === r.link[n].rel && t.push(r.link[n].href);
                });
            });
        } catch (e) {}
    }

    // Search for the current URL in the list of URLs and redirect if found
    urlSearch(window.location.pathname, t);

    // Handle pagination if there are more than 150 URLs
    if (urlTotal > 150) {
        jsonIndex += 150;
        urlTotal -= 150;
        getJSON(postsOrPages[feedPriority], jsonIndex);
    } else if (nextPageToken) { // If there's a next page token, get the next set of results
        getJSON(postsOrPages[feedPriority]);
    } else if (secondRequest) { // Handle second request attempt if needed
        nextPageToken = void 0;
        urlTotal = void 0;
        jsonIndex = 1;
        secondRequest = !1;

        // Switch between posts and pages
        if (0 === feedPriority) {
            feedPriority = 1;
            getJSON("posts", 1);
        } else if (1 === feedPriority) {
            feedPriority = 0;
            getJSON("pages", 1);
        }
    }
}

// Entry point for the script to start the process
function bloggerJS(e) {
    e && (feedPriority = e); // Set feed priority if provided
    urlManager(); // Start the URL management process
}

// Execute the BloggerJS function to initiate the script
bloggerJS();

//]]>
</script>
