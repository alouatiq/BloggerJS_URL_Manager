# BloggerJS URL Manager

### Overview

**BloggerJS v0.4.0** is a JavaScript script designed to manage URLs and content retrieval on a Blogger site. The script enhances the way URLs are handled, cleans up URL structures, and ensures that users are redirected to the correct content whether they are accessing a post, page, or the homepage.

### Features

- **Dynamic URL Handling**: Automatically modifies URLs for cleaner and more SEO-friendly structures.
- **Content Retrieval**: Fetches blog posts or pages using the Blogger API (v3) or RSS/Atom feeds, handling pagination as necessary.
- **Redirection**: Ensures that users are redirected to the correct page or post based on the URL they access.
- **Customizable**: Supports toggling between posts and pages, and can be customized to use different API versions.

### How It Works

1. **URL Identification**: The script first determines the type of URL the user is accessing (single post, directory, or homepage).
2. **URL Modification**: For single post URLs, the script may modify the URL to remove unnecessary parts for better readability and SEO.
3. **Content Fetching**: The script dynamically creates a `<script>` element to fetch content from the Blogger API or RSS/Atom feeds.
4. **Redirection**: It searches through the fetched URLs and redirects the user to the appropriate content if a match is found.
5. **Pagination**: If there are more URLs than can be fetched in one request, the script handles pagination to retrieve the additional URLs.

### Installation

To use this script on your Blogger site, follow these steps:

1. **Copy the Script**: Copy the `blogger.js` file from this repository.
2. **Add to Blogger**: Insert the script into your Blogger template, ideally in the `<head>` section.
3. **Configure**: Adjust any necessary variables such as `apiKey`, `blogId`, `useApiV3`, etc., depending on your site's configuration and needs.

### Customization

- **API Key and Blog ID**: If using Blogger API v3, you'll need to add your API key and Blog ID to the script.
- **Feed Priority**: You can adjust the priority between posts and pages by modifying the `feedPriority` variable.
- **URL Structure**: The script allows for modifications in how URLs are structured, especially when date prefixes are involved.

### License

This script is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

### Acknowledgments

- **Author**: The original script was developed by Kenny Cruz.
- **Modified By**: Alouatiq for custom use and enhancements.

### Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the script.

### Contact

For any questions or suggestions, please feel free to contact me via GitHub.
