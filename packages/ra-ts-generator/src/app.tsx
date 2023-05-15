import React from 'react';
import path from 'path';
import fsExtra from 'fs-extra';
import { useMutation, useQuery } from 'react-query';
import { Text } from 'ink';
import { MultiSelect, Spinner, StatusMessage } from '@inkjs/ui';
import { getResourcesFromFiles } from './getResourcesFromFiles.js';
import { generateTypedComponentsForResource } from './generateTypedComponents.js';

export default function App({
    fileNames,
    out,
}: {
    fileNames: string[];
    out: string;
}) {
    const { data, isLoading: isLoadingResources } = useQuery(
        ['resources', fileNames, out],
        () => {
            return getResourcesFromFiles(fileNames, {});
        },
        {
            retry: false,
        }
    );

    const { mutate, error, status: generationStatus } = useMutation<
        void,
        Error,
        string[]
    >(resources => {
        generate(resources, out);
        return Promise.resolve();
    });

    if (error) {
        return <StatusMessage variant="error">{error.message}</StatusMessage>;
    }

    if (isLoadingResources) {
        return <Spinner label="Parsing files for resources..." />;
    }

    if (generationStatus === 'loading') {
        return (
            <Spinner label="Generating strongly typed components for your resources..." />
        );
    }

    if (generationStatus === 'success') {
        return (
            <StatusMessage variant="success">
                Successfully generated strongly typed components for your
                resources...
            </StatusMessage>
        );
    }

    if (data) {
        return (
            <>
                <Text>
                    Found the following resources, confirm the selection with
                    <Text bold>Enter</Text>:{' '}
                </Text>
                <MultiSelect
                    options={data.map(resource => ({
                        label: resource,
                        value: resource,
                    }))}
                    defaultValue={data}
                    onSubmit={values => {
                        mutate(values);
                    }}
                />
            </>
        );
    }

    return null;
}

const generate = (resources: string[], out: string) => {
    resources.forEach(resource => {
        const resourceFileContent = generateTypedComponentsForResource(
            resource,
            out
        );

        fsExtra.outputFileSync(
            path.join(process.cwd(), out, `${resource}.tsx`),
            resourceFileContent
        );
    });
};
