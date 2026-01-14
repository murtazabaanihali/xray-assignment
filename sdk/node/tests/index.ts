import XraySDK from "../src";

const wait = async () => {
    return new Promise((resolve) => {
        setTimeout(resolve, 3000);
    })
}

const TestSdk = async () => {
    console.log("Running tests....");

    const xray = new XraySDK();

    // STEP 1: Generate search keywords (LLM-like, non-deterministic)
    console.log("Running step 1....")
    const step1 = await xray.step({
        name: "Generate keywords",
        description: "Generate search keywords from product title and category",
        step: {
            props: {
                title: "iPhone 15 Pro Silicone Case",
                category: "Mobile Accessories",
            },
            function: async (props) => {
                return {
                    keywords: [
                        "iphone case",
                        "silicone phone cover",
                        "apple mobile accessories",
                    ],
                    reasoning: "Derived keywords from title and category using LLM",
                };
            },
        },
    });

    await wait();

    console.log("Running step 2....")
    // STEP 2: Fetch candidate products
    const step2 = await xray.step({
        name: "Fetch candidates",
        description: "Fetch competitor products using search keywords",
        step: {
            props: {
                keywords: step1.keywords,
            },
            function: () => {
                return {
                    totalCandidates: 120,
                    candidatesSample: [
                        { id: "product1", name: "iPhone 14 Clear Case", price: 899 },
                        { id: "product2", name: "Laptop Stand Aluminum", price: 1499 },
                        { id: "product3", name: "iPhone Silicone Case", price: 999 },
                    ],
                };
            },
        },
    });

    await wait();

    // STEP 3: Filter candidates
    console.log("Running step 3....")
    const step3 = await xray.step({
        name: "Filter candidates",
        description: "Filter by category and price range",
        step: {
            props: {
                totalCandidates: step2.totalCandidates,
            },
            function: () => {
                return {
                    inputCount: 120,
                    outputCount: 18,
                    rejectedCount: 102,
                    rejectionReasons: {
                        wrong_category: 70,
                        price_out_of_range: 32,
                    },
                };
            },
        },
    });

    await wait();

    console.log("Running step 4....")
    // STEP 4: Final selection
    const step4 = await xray.step({
        name: "Select best competitor",
        description: "Rank and select the best competitor product",
        step: {
            props: {
                filteredCount: step3.outputCount,
            },
            function: () => {
                return {
                    selectedProduct: {
                        id: "p2",
                        name: "Laptop Stand Aluminum",
                        price: 1499,
                    },
                    confidence: 0.42,
                    reasoning:
                        "High review count outweighed weak category match (potential bug)",
                };
            },
        },
    });

    console.log("Final Result:", step4);

    const fetchSteps = await xray.getSteps();
    console.log("\n\nDebug steps: ", JSON.stringify(fetchSteps, null, 2));
};


const fetchSteps = async (key: string) => {
    const xray = new XraySDK(undefined, key);
    
    const fetchSteps = await xray.getSteps();
    console.log("\n\nDebug steps: ", JSON.stringify(fetchSteps, null, 2));
}

// fetchSteps("019bbbcd-6567-7005-b6fc-4fd6c1c16cd9");
TestSdk();