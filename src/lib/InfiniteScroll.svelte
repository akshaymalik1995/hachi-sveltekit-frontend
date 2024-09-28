<script>
    export let loadMoreFunction; // Function to call when more content needs to be loaded
    export let threshold = 100; // Distance in pixels from the bottom of the page to trigger loading more content

    let lastScrollTop = 0; // Track the last recorded scroll position
    let windowHeight = 0; // Height of the visible part of the window

    function setupScrollListener() {
        // Add a listener to execute the checkScrollBottom function on scroll events
        window.addEventListener("scroll", checkScrollBottom);
    }

    function checkScrollBottom() {
        // Get the current scroll position from the top of the document
        const scrollTop =
            document.documentElement.scrollTop || document.body.scrollTop;

        // Calculate current scroll position with respect to the window height and threshold
        const scrollPosition = scrollTop + windowHeight - threshold;

        if (scrollTop > lastScrollTop) {
            // Scrolling down
            if (
                window.innerHeight + scrollPosition >=
                document.body.offsetHeight
            ) {
                // If near bottom of page, load more content by invoking the function
                loadMoreFunction();
            }
        } else {
            // Scrolling up, update the lastScrollTop with current scrollTop
            lastScrollTop = scrollTop;
        }

        // Update the last scroll position and window height for future scroll events
        lastScrollTop = scrollTop;
        windowHeight = window.innerHeight;
    }

    $: setupScrollListener(); // Initialize scroll listener upon component initialization
</script>

<slot></slot>