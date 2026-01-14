import { db } from "./db";

export const saveStep = (key: string, data: string) => {
    return db
        .prepare("INSERT INTO steps (key, data) VALUES (?, ?)")
        .run(key, data);
};

export const fetchSteps = (key: string) => {
    const response: any[] = db
        .prepare("SELECT * from steps WHERE key = ?")
        .all(key);
    
    if (!response || response.length === 0 || !response?.[0]?.key) {
        return null;
    }

    return {
        key: response[0]?.key,
        steps: response.map((item) => {
            const { input, response, failed } = JSON.parse(item.data);
            
            return {
                name: input?.name,
                description: input?.description,
                metadata: input?.metadata,
                step: {
                    props: input.step?.props,
                    function: input.step?.function,
                    response: response,
                    exceptions: !!failed
                },
                createdAt: item.created_at
            };
        }),
    };
};
