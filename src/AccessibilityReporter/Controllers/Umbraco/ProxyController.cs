using Microsoft.AspNetCore.Mvc;
using System;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;

namespace AccessibilityReporter.Controllers.Umbraco
{
    public class ProxyController : BaseUmbracoAuthorisedController
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _proxyPath = "/umbraco/backoffice/api/proxy/fetchresource?url=";

        public ProxyController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        public async Task<IActionResult> FetchPage(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return BadRequest("URL is required");

            try
            {
                // Create a new HttpClient for each request
                var httpClient = _httpClientFactory.CreateClient("AccessibilityReporterProxy");

                // Configure the request with browser-like headers
                var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36");
                request.Headers.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8");
                request.Headers.Add("Accept-Language", "en-US,en;q=0.5");

                // Send the request
                var response = await httpClient.SendAsync(request);

                // Ensure we throw for non-success status codes
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();

                // Parse base URL for the page
                Uri baseUri = new Uri(url);
                string baseUrl = $"{baseUri.Scheme}://{baseUri.Host}";
                if (!baseUri.IsDefaultPort)
                    baseUrl += $":{baseUri.Port}";

                // Convert relative URLs to absolute URLs, but route through our proxy
                content = ConvertUrlsToProxiedUrls(content, baseUrl, baseUri.AbsolutePath);

                // Pass through relevant response headers
                Response.Headers.Add("Content-Type", response.Content.Headers.ContentType?.ToString() ?? "text/html");

                // Return content as HTML
                return Content(content, response.Content.Headers.ContentType?.ToString() ?? "text/html");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching URL: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> FetchResource(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return BadRequest("URL is required");

            try
            {
                var httpClient = _httpClientFactory.CreateClient("AccessibilityReporterProxy");
                var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36");

                var response = await httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsByteArrayAsync();

                // Copy the content type header
                var contentType = response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";

                return File(content, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching resource: {ex.Message}");
            }
        }

        private string ConvertUrlsToProxiedUrls(string html, string baseUrl, string basePath)
        {
            if (string.IsNullOrEmpty(html))
                return html;

            // Get directory path of the original URL
            string baseDirectory = string.Empty;
            if (!string.IsNullOrEmpty(basePath))
            {
                int lastSlashPos = basePath.LastIndexOf('/');
                if (lastSlashPos > 0)
                    baseDirectory = basePath.Substring(0, lastSlashPos + 1);
            }

            // Fix src and href attributes (images, scripts, stylesheets, iframes, etc.)
            html = Regex.Replace(html,
                @"(src|href)=[""'](?!data:|mailto:|tel:|#|javascript:)([^""']+)[""']",
                match =>
                {
                    var attr = match.Groups[1].Value;
                    var path = match.Groups[2].Value;
                    string absoluteUrl;

                    // Convert to absolute URL first
                    if (path.StartsWith("http://") || path.StartsWith("https://"))
                    {
                        // Already an absolute URL
                        absoluteUrl = path;
                    }
                    else if (path.StartsWith("//"))
                    {
                        // Protocol-relative URL
                        absoluteUrl = "https:" + path;
                    }
                    else if (path.StartsWith("/"))
                    {
                        // Root-relative URL
                        absoluteUrl = baseUrl + path;
                    }
                    else
                    {
                        // Directory-relative URL
                        absoluteUrl = baseUrl + baseDirectory + path;
                    }

                    return $"{attr}=\"{_proxyPath}{HttpUtility.UrlEncode(absoluteUrl)}\"";
                },
                RegexOptions.IgnoreCase | RegexOptions.Compiled);

            // Fix CSS url() references
            html = Regex.Replace(html,
                @"url\(['""]?(?!data:)([^'"")\s]+)['""]?\)",
                match =>
                {
                    var path = match.Groups[1].Value;
                    string absoluteUrl;

                    // Convert to absolute URL first
                    if (path.StartsWith("http://") || path.StartsWith("https://"))
                    {
                        // Already an absolute URL
                        absoluteUrl = path;
                    }
                    else if (path.StartsWith("//"))
                    {
                        // Protocol-relative URL
                        absoluteUrl = "https:" + path;
                    }
                    else if (path.StartsWith("/"))
                    {
                        // Root-relative URL
                        absoluteUrl = baseUrl + path;
                    }
                    else
                    {
                        // Directory-relative URL
                        absoluteUrl = baseUrl + baseDirectory + path;
                    }

                    return $"url(\"{_proxyPath}{HttpUtility.UrlEncode(absoluteUrl)}\")";
                },
                RegexOptions.IgnoreCase | RegexOptions.Compiled);

            return html;
        }
    }
}
