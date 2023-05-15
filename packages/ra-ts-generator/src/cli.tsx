#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './app.js';
import { QueryClient, QueryClientProvider } from 'react-query';

const cli = meow(
    `
	Usage
	  $ ra-ts-generator <paths>

    Examples
	  $ ra-ts-generator ./src/types.ts
`,
    {
        importMeta: import.meta,
        flags: {
            out: {
                type: 'string',
                shortFlag: 'o',
            },
        },
    }
);

if (cli.flags.h) {
    cli.showHelp();
} else {
    render(
        // @ts-ignore
        <QueryClientProvider client={new QueryClient()}>
            <App fileNames={cli.input} out={cli.flags.out} />
        </QueryClientProvider>
    );
}
