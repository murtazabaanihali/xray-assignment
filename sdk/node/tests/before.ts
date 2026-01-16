import XraySDK from "../src";

const firstStep = (name: string) => {
    return {
        "name": name,
        "message": `Your name is ${name}`
    }
};

const secondStep = (email: string) => {
    return {
        "correct": true,
        "email": email
    }
};

const thirdStep = (adress: string) => {
    return {
        "correct": false,
        "message": `Your adress is ${adress}`
    }
};

const main = async () => {
    const xray = new XraySDK();

    const r1 = await xray.step({
        name: "Processing name",
        description: "Returns name and message",
        metadata: {},
        step: {
            props: "name",
            function: firstStep
        }
    });

    const r2 = await xray.step({
        name: "Validating email",
        description: "Validates the email and returns it",
        metadata: {
            "xyz": "something here"
        },
        step: {
            props: "test@gmail.com",
            function: secondStep
        }
    });

    const r3 = await xray.step({
        name: "Returns if address is valid",
        description: "Returns address is valid and adress",
        metadata: {
            "xyz": "something here"
        },
        step: {
            props: "India",
            function: thirdStep
        }
    });

    console.log(r1, r2, r3);
    
    const debugLogs = await xray.getSteps();
    console.log("Debug Logs: ", JSON.stringify(debugLogs, null, 2));
};

main();