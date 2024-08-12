<script type='text/javascript'>
//<![CDATA[
// BloggerJS v0.4.0
// Copyright (c) 2020 ALOUATIQ
// Licensed under the MIT License

// Global variables
let urlTotal;
let nextPageToken;
const postsDatePrefix = false;
const accessOnly = false;
const useApiV3 = false;
const apiKey = '';
const blogId = '';
const postsOrPages = ['pages', 'posts'];
let jsonIndex = 1;
let secondRequest = true;
let feedPriority = 0;
const amp = '&';

// Function to determine the type of the current URL
const urlVal = () => {
    const path = window.location.pathname;
    const length = path.length;

    return path.endsWith('.html') ? 0 : length > 1 ? 1 : 2;
};

// Function to modify the URL for cleaner structure
const urlMod = () => {
    let path = window.location.pathname;

    if (path.startsWith('/p/')) {
        path = path.slice(path.indexOf('/', 1) + 1, path.indexOf('.html'));
        history.replaceState(null, null, `../${path}`);
    } else {
        path = postsDatePrefix ? path.slice(1) : path.slice(path.indexOf('/', 7) + 1);
        path = path.slice(0, path.indexOf('.html'));
        history.replaceState(null, null, `../../${path}`);
    }
};

// Function to search through URLs and redirect to the matching one
const urlSearch = (currentPath, urlArray) => {
    const target = `${currentPath}.html`;

    urlArray.some(url => {
        if (url.includes(target)) {
            window.location = url;
            return true;
        }
        return false;
    });
};

// Main function to manage the URL based on its type
const urlManager = () => {
    const type = urlVal();

    switch (type) {
        case 0:
            if (!accessOnly) urlMod();
            break;
        case 1:
            getJSON(postsOrPages[feedPriority], 1);
            break;
        case 2:
            if (!accessOnly) history.replaceState(null, null, '/');
            break;
    }
};

// Function to dynamically retrieve JSON data using Blogger API or RSS/Atom feeds
const getJSON = (type, index) => {
    const script = document.createElement('script');
    let url;

    if (useApiV3) {
        url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/${type}?key=${apiKey}&maxResults=500&fields=nextPageToken,items(url)&callback=bloggerJSON`;
        if (nextPageToken) url += `&pageToken=${nextPageToken}`;
        nextPageToken = undefined;
    } else {
        url = `${window.location.protocol}//${window.location.hostname}/feeds/${type}/default?start-index=${index}&max-results=150&orderby=published&alt=json-in-script&callback=bloggerJSON`;
    }

    url = url.replace(/&/g, amp);
    script.type = 'text/javascript';
    script.src = url;
    document.head.appendChild(script);
};

// Callback function to process the JSON data retrieved by getJSON
const bloggerJSON = (data) => {
    const urls = [];

    if (useApiV3 || typeof urlTotal === 'undefined') {
        urlTotal = useApiV3 ? urlTotal : parseInt(data.feed.openSearch$totalResults.$t);
    }

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
        console.error('Error processing JSON data', error);
    }

    urlSearch(window.location.pathname, urls);

    if (urlTotal > 150) {
        jsonIndex += 150;
        urlTotal -= 150;
        getJSON(postsOrPages[feedPriority], jsonIndex);
    } else if (nextPageToken) {
        getJSON(postsOrPages[feedPriority]);
    } else if (secondRequest) {
        nextPageToken = undefined;
        urlTotal = undefined;
        jsonIndex = 1;
        secondRequest = false;
        feedPriority = feedPriority === 0 ? 1 : 0;
        getJSON(postsOrPages[feedPriority], 1);
    }
};

// Entry point for the script to start the process
const bloggerJS = (priority) => {
    if (priority) feedPriority = priority;
    urlManager();
};

// Execute the BloggerJS function to initiate the script
bloggerJS();

//]]>
</script>
