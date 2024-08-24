import React from 'react';
import {
    Card,
    InlineStack,
    Box,
    RadioButton,
    Text,
    BlockStack,
    SkeletonThumbnail,
    SkeletonDisplayText,
    SkeletonBodyText
} from '@shopify/polaris';

function ShowPages({ selectedValue, handleChange }) {
    const cardData = [
        {
            id: 'product',
            label: 'Product',
            content: (
                <Box padding={300}>
                    <div className='flex justify-between gap-3'>
                        <SkeletonThumbnail size="large" />
                        <div className='flex flex-col w-full gap-4'>
                            <SkeletonDisplayText size="large" />
                            <SkeletonBodyText lines={3} />
                        </div>
                    </div>
                </Box>
            ),
        },
        {
            id: 'type',
            label: 'Type',
            content: (
                <Box padding={300}>
                    <BlockStack align='center' gap="300">
                        <SkeletonBodyText lines={2} />
                        <div className='flex gap-2'>
                            {Array(4).fill(null).map((_, index) => (
                                <SkeletonThumbnail key={index} size="medium" />
                            ))}
                        </div>

                    </BlockStack>
                </Box>
            ),
        },
        {
            id: 'vendor',
            label: 'Vendor',
            content: (
                <Box padding={300}>
                    <BlockStack align='center' gap="300">
                        {/*<div className='min-w-full'>*/}
                        {/*    <SkeletonDisplayText size="extraLarge" />*/}
                        {/*</div>*/}
                        <div className='flex gap-2'>
                            {Array(3).fill(null).map((_, index) => (
                                <SkeletonThumbnail key={index} size="medium" />
                            ))}
                        </div>
                        <SkeletonBodyText lines={2} />
                    </BlockStack>
                </Box>
            ),
        },
        {
            id: 'tags',
            label: 'Tags',
            content: (
                <Box padding={300}>
                    <BlockStack align='center' gap="300">
                        <div className='flex gap-2'>
                            {Array(4).fill(null).map((_, index) => (
                                <SkeletonThumbnail key={index} size="medium" />
                            ))}
                        </div>
                        <SkeletonBodyText lines={2} />
                    </BlockStack>
                </Box>
            ),
        },
    ];

    return (
        <Card sectioned title="Show on pages">
            <div className="flex flex-wrap -m-2">
                {cardData.map((card, index) => (
                    <CustomCard
                        key={index}
                        label={card.label}
                        id={card.id}
                        selectedValue={selectedValue}
                        handleChange={handleChange}
                    >
                        {card.content}
                    </CustomCard>
                ))}
            </div>
        </Card>
    );
}

function CustomCard({ label, id, selectedValue, handleChange, children }) {
    return (
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2">
            <Card roundedAbove="sm" padding="0">
                <Box background="bg-surface-brand" padding="200">
                    <RadioButton
                        label={label}
                        id={id}
                        name="accounts"
                        checked={selectedValue === id}
                        onChange={() => handleChange(id)}
                    />
                </Box>
                <BlockStack gap="4">
                    <Box minHeight="120px">
                        {children}
                    </Box>
                </BlockStack>
            </Card>
        </div>
    );
}



export default ShowPages;
