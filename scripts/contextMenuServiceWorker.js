const getKey = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openai-key'], (result) => {
            if (result['openai-key']) {
                const decodedKey = atob(result['openai-key']);
                resolve(decodedKey);
            }
        });
    });
};


const sendMessage = (content) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0].id;

        chrome.tabs.sendMessage(
            activeTab,
            { message: 'inject', content },
            (response) => {
                if (response.status === 'failed') {
                    console.log('injection failed.');
                }
            }
        );
    });
};

const generate = async (prompt) => {
    // Get your API key from storage
    const key = await getKey();
    const url = 'https://api.openai.com/v1/completions';

    // Call completions endpoint
    const completionResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 1250,
            temperature: 0.7,
        }),
    });

    // Select the top choice and send back
    const completion = await completionResponse.json();
    return completion.choices.pop();
}

const generateCompletionAction = async (info) => {
    try {
        sendMessage('generating...');
        const { selectionText } = info;
        const basePromptPrefix =
            `
        List the tweets in an engaging thread with well-written copy done by an expert using the topic and links given below:
        `;
        const basePromptSuffix =
            `
        /1
        `;
        const baseCompletion = await generate(`${basePromptPrefix}${selectionText}\n${basePromptSuffix}`);

        // Let's see what we get!
        sendMessage(baseCompletion.text);
    } catch (error) {
        sendMessage(error.toString());
    }
};


chrome.contextMenus.create({
    id: 'context-run',
    title: 'Generate Twitter Thread',
    contexts: ['selection'],
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);