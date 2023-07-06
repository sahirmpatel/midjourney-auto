export const waitFewSeconds = time => new Promise((r) => setTimeout(r, time));

export const getButtonCount = async (btnText, page) => {
    const count = await page.evaluate((btnText) => {
        const elements = document.evaluate(`//button//div[text()="${btnText}"]`, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        return elements.snapshotLength;
    }, btnText);
    return count
    // return document.evaluate(`//button//div[text()="${btnText}"]`, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
}

export async function waitUntil(condition) {
    return await new Promise(resolve => {
        const interval = setInterval(() => {
            if (condition) {
                resolve();
                clearInterval(interval);
            };
        }, 1000);
    });
}

// Function to check if the button count has increased
export function checkButtonCount(text, document, condition, resolve) {
    const currentCount = getButtonCount(text, document);

    if (condition(currentCount)) {
        clearInterval(interval);
        resolve();
    }
}

export async function waitTillButtonCountIncrease(text, page, condition) {
    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            const currentCount = await page.evaluate((btnText) => {
                const xpathResult = document.evaluate(`//button//div[text()="${btnText}"]`, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                return xpathResult.snapshotLength;
            }, text);
            
            if (condition(currentCount)) {
                clearInterval(interval);
                resolve();
            }
        }, 1000);
    });
}

export const clickLatestButton = async (btnText, page) => {
    const elements = await page.$x(`//button//div[text()="${btnText}"]`);
    if (elements.length > 0) {
      const lastElement = elements[elements.length - 1];
      await lastElement.click();
    }
}