import { v7 as uuid7 } from "uuid";

import {
    BASE_API_URL,
    GET_STEPS_ENDPOINT,
    MAX_RETRY_LIMIT,
    RETRY_INTERVAL,
    SEND_STEPS_ENDPOINT,
} from "./contants";
import type { StepInput, StepsResponse } from "./types";

export default class XraySDK {
    private baseUrl = BASE_API_URL;
    private uniqueStepKey = uuid7();

    constructor(baseUrl?: string, key?: string) {
        this.baseUrl = baseUrl || this.baseUrl;
        this.uniqueStepKey = key || this.uniqueStepKey;
    }

    async step(props: StepInput) {
        if (!props?.name) throw new Error("Step name cannot be empty");
        if (!props?.step?.function)
            throw new Error("Step function cannot be empty");

        let response;

        try {
            response = props.step.function(props.step.props);
            if (response instanceof Promise) {
                response = await response;
            }

            this.sendStep(props, response);
        } catch (error) {
            this.sendStep(
                props,
                {
                    error: {
                        message: error instanceof Error ? error.message : String(error),
                        stack: error instanceof Error ? error.stack : undefined,
                    }
                },
                true
            );

            throw error;
        }

        return response;
    }

    private async sendStep(
        stepInput: StepInput,
        stepResponse: any,
        error?: boolean
    ) {
        let tries = 0;

        while (tries < MAX_RETRY_LIMIT) {
            try {
                const response = await fetch(
                    `${this.baseUrl}/${SEND_STEPS_ENDPOINT}`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            key: this.uniqueStepKey,
                            stepInput: {
                                ...stepInput,
                                step: {
                                    ...stepInput.step,
                                    props: JSON.parse(JSON.stringify(stepInput.step.props)),
                                    function: stepInput.step.function.name
                                }
                            },
                            stepResponse,
                            stepFailed: error,
                        }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    console.log(
                        "Failed to log the step with status",
                        response.status,
                        response.statusText
                    );
                }

                break;
            } catch (error) {
                console.log(
                    `Error saving step, retrying ${tries === MAX_RETRY_LIMIT - 1 ? "last time" : tries
                    }`,
                    error
                );
            } finally {
                await new Promise((resolve) =>
                    setTimeout(resolve, RETRY_INTERVAL * 1000)
                );

                tries++;
            }
        }
    }

    public async getSteps(
        key?: string
    ): Promise<StepsResponse | { error: string }> {
        const response = await fetch(
            `${this.baseUrl}/${GET_STEPS_ENDPOINT}?key=${key || this.uniqueStepKey
            }`
        );

        if (!response.ok) {
            try {
                const json = await response.json();
                return json as any;

            } catch (error) {
                return { "error": response.statusText }
            }
        };

        return (await response.json()) as any;
    }
}
