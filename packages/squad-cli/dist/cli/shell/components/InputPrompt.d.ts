import React from 'react';
interface InputPromptProps {
    onSubmit: (value: string) => void;
    prompt?: string;
    disabled?: boolean;
    agentNames?: string[];
    /** Number of messages exchanged so far — drives progressive hint text. */
    messageCount?: number;
}
export declare const InputPrompt: React.FC<InputPromptProps>;
export {};
//# sourceMappingURL=InputPrompt.d.ts.map