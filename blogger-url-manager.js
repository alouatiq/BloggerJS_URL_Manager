<script type='text/javascript'>
//<![CDATA[
// BloggerJS v0.4.0
// Copyright (c) 2024 ALOUATIQ
// Licensed under the MIT License

// Global variables
let urlTotal;                          // Total number of URLs (posts/pages) to process
let nextPageToken;                     // Token for paginating through Blogger API results
const postsDatePrefix = false;         // Boolean to check if URLs include date prefixes
const accessOnly = false;              // Boolean to determine if URL modification is allowed
const useApiV3 = false;                // Boolean to determine if Blogger API v3 should be used
const apiKey = '';                     // API key for accessing Blogger API v3
const blogId = '';                     // Blog ID for accessing Blogger API v3
const postsOrPages = ['pages', 'posts']; // Array for toggling between pages and posts
let jsonIndex = 1;                     // Index for JSON pagination
let secondRequest = true;              // Boolean to manage a second request attempt
let feedPriority = 0;                  // Priority for deciding between posts or pages
const amp = '&';                       // Ampersand character to handle in URLs

// Function to determine the type of the current URL
// Returns:
// - 0 if it's a single post URL (ending in .html)
// - 1 if it's a directory URL (for lists of posts or pages)
// - 2 if it's the homepage
const urlVal = () => {
    const path = window.location.pathname; // Get the current URL path
    const length = path.length;            // Length of the path

    // Determine the type of URL
    return path.endsWith('.html') ? 0 : length > 1 ? 1 : 2;
};

// Function to modify the URL for cleaner structure
const urlMod = () => {
    let path = window.location.pathname; // Get the current URL path

    // If it's a page, modify the URL to remove unnecessary parts
    if (path.startsWith('/p/')) {
        path = path.slice(path.indexOf('/', 1) + 1, path.indexOf('.html'));
        history.replaceState(null, null, `../${path}`);
    } else { 
        // If it's a post, handle differently based on date prefix
        path = postsDatePrefix ? path.slice(1) : path.slice(path.indexOf('/', 7) + 1);
        path = path.slice(0, path.indexOf('.html'));
        history.replaceState(null, null, `../../${path}`);
    }
};

// Function to search through URLs and redirect to the matching one
// @param {string} currentPath - The current pathname
// @param {Array} urlArray - Array of URLs to search through
const urlSearch = (currentPath, urlArray) => {
    const target = `${currentPath}.html`; // Append .html to the current path

    // Iterate through the list of URLs to find a match
    urlArray.some(url => {
        if (url.includes(target)) {
            window.location = url; // If a match is found, redirect to that URL
            return true;           // Exit loop once a match is found
        }
        return false;
    });
};

// Main function to manage the URL based on its type
const urlManager = () => {
    const type = urlVal(); // Determine the type of the current URL

    // Call appropriate functions based on URL type
    switch (type) {
        case 0: // If it's a single post URL
            if (!accessOnly) urlMod();
            break;
        case 1: // If it's a directory URL
            getJSON(postsOrPages[feedPriority], 1);
            break;
        case 2: // If it's the homepage
            if (!accessOnly) history.replaceState(null, null, '/');
            break;
    }
};

// Function to dynamically retrieve JSON data using Blogger API or RSS/Atom feeds
// @param {string} type - The type of content to retrieve (posts or pages)
// @param {number} index - The index from which to start fetching data
const getJSON = (type, index) => {
    const script = document.createElement('script'); // Create a script element
    let url;

    // If using Blogger API v3
    if (useApiV3) {
        url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/${type}?key=${apiKey}&maxResults=500&fields=nextPageToken,items(url)&callback=bloggerJSON`;
        if (nextPageToken) url += `&pageToken=${nextPageToken}`; // Append pagination token if available
        nextPageToken = undefined;
    } else { 
        // If using RSS/Atom feeds
        url = `${window.location.protocol}//${window.location.hostname}/feeds/${type}/default?start-index=${index}&max-results=150&orderby=published&alt=json-in-script&callback=bloggerJSON`;
    }

    url = url.replace(/&/g, amp);  // Replace & with ampersand in the URL
    script.type = 'text/javascript'; // Set the script type
    script.src = url; // Set the script source to the constructed URL
    document.head.appendChild(script); // Add the script to the head of the document
};

// Callback function to process the JSON data retrieved by getJSON
// @param {Object} data - The JSON data returned by the Blogger API or feed
const bloggerJSON = (data) => {
    const urls = []; // Array to hold the URLs

    // If using Blogger API v3 or if urlTotal is undefined
    if (useApiV3 || typeof urlTotal === 'undefined') {
        urlTotal = useApiV3 ? urlTotal : parseInt(data.feed.openSearch$totalResults.$t);
    }

    // Extract URLs from the data
    try {
        const entries = useApiV3 ? data.items : data.feed.entry;

        entries.forEach(entry => {
            if (useApiV3) {
                urls.push(entry.url);
            } else {
                entry.link.forEach(link => {
                    if (link.rel === 'alternate') urls.push(link.href);
                });
            }
        });
    } catch (error) {
        console.error('Error processing JSON data', error); // Log any errors
    }

    // Search for the current URL in the list of URLs and redirect if found
    urlSearch(window.location.pathname, urls);

    // Handle pagination if there are more than 150 URLs
    if (urlTotal > 150) {
        jsonIndex += 150;
        urlTotal -= 150;
        getJSON(postsOrPages[feedPriority], jsonIndex);
    } else if (nextPageToken) { 
        // If there's a next page token, get the next set of results
        getJSON(postsOrPages[feedPriority]);
    } else if (secondRequest) { 
        // Handle second request attempt if needed
        nextPageToken = undefined;
        urlTotal = undefined;
        jsonIndex = 1;
        secondRequest = false;
        feedPriority = feedPriority === 0 ? 1 : 0;
        getJSON(postsOrPages[feedPriority], 1);
    }
};

// Entry point for the script to start the process
// @param {number} [priority] - Optional priority parameter to decide whether to prioritize pages or posts
const bloggerJS = (priority) => {
    if (priority) feedPriority = priority; // Set feed priority if provided
    urlManager(); // Start the URL management process
};

// Execute the BloggerJS function to initiate the script
bloggerJS();

//]]>
</script>
