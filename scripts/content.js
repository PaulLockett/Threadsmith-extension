chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'inject') {
        const { content } = request;

        console.log(content);

        sendResponse({ status: 'success' });
    }
});

const insert = (content) => {
    // insert the cotent into the span with the data-text="true" attribute
    const text = document.querySelector('[data-text="true"]');
    if (content === '') {
        return false;
      } else {
        text.textContent = content;
      }
    return true;
};


chrome.runtime.onMessage.addListener(
    // This is the message listener
    (request, sender, sendResponse) => {
        if (request.message === 'inject') {
            const { content } = request;

            // Call this insert function
            const result = insert(content);

            // If something went wrong, send a failes status
            if (!result) {
                sendResponse({ status: 'failed' });
            }

            sendResponse({ status: 'success' });
        }
    }
);