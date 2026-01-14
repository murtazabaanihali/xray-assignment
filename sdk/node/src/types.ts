export interface StepInput {
    name: string;
    description?: string;
    metadata?: Record<string, any>;
    step: {
        props?: any;
        function: (props: any) => Record<any, any> | Promise<Record<any, any>>;
    };
}

export interface StepsResponse {
    key: string;
    steps: {
        name: string;
        description?: string;
        metadata?: Record<string, any>;
        exceptions?: boolean;
        createdAt: string;
        step: {
            props: any,
            function: string;
            response: Record<any, any>;
        }
    }[];
}
