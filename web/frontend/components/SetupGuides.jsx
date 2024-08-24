import React, { useState, useCallback } from 'react';
import {
  Page, Button, Card, BlockStack, Text, Box, InlineStack, ProgressBar,
  Collapsible, Popover, ActionList, Tooltip, VideoThumbnail, MediaCard
} from '@shopify/polaris';

import {
    MenuHorizontalIcon
} from '@shopify/polaris-icons';

export default function SetupGuides() {
  const [completedCount, setCompletedCount] = useState(0);
  const [openItemIndex, setOpenItemIndex] = useState(null);

  const listItems = [
    {
      title: "After App Installation",
      content: <div className='pl-14'>
        <BlockStack gap="300">
          <InlineStack direction="row" gap="1600" align="space-between" blockAlign="center">

              <Text as="p" variant="bodyMd">
                  After installing the app, make the payment on the billing plans page to access the app

              </Text>
            {/* <video controls width="250" style={{ marginRight: '1rem' }}>
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video> */}
          </InlineStack>
        </BlockStack>
      </div>
    },
    {
      title: "Create Rule",
      content: <div className='pl-14'>
        <BlockStack gap="300">
          <InlineStack direction="row" gap="1600" align="space-between" blockAlign="center">
            <Text as="p" variant="bodyMd">
                After Making the payment, you can go to create rule page and add new rule
              <ul>
                  <li>You can create rule of Product,type,vendor and tags</li>


              </ul>

            </Text>
            {/* <video controls width="250" style={{ marginRight: '1rem' }}>
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video> */}
          </InlineStack>
        </BlockStack>
      </div>
    },
    // {
    //   title: "Set Disable Redirection",
    //   content: <div className='pl-14'>
    //     <BlockStack gap="300">
    //       <InlineStack direction="row" gap="1600" align="space-between" blockAlign="center">
    //         <Text as="p" variant="bodyMd">
    //          By click on enable or disable btn you can disable the redirection if it is enable.
    //         </Text>
    //         {/* <video controls width="250" style={{ marginRight: '1rem' }}>
    //           <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
    //           Your browser does not support the video tag.
    //         </video> */}
    //       </InlineStack>
    //     </BlockStack>
    //   </div>
    // },
    {
      title: "Update and Delete Rule",
      content: <div className='pl-14'>
        <BlockStack gap="300">
          <InlineStack direction="row" gap="1600" align="space-between" blockAlign="center">
            <Text as="p" variant="bodyMd">
              You can also update and edit rule
            </Text>
            {/* <video controls width="250" style={{ marginRight: '1rem' }}>
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video> */}
          </InlineStack>
        </BlockStack>
      </div>
    }
  ];

  const [popoverActive, setPopoverActive] = useState(false);
  const [cardVisible, setCardVisible] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );
  const toggleExpanded = () => setExpanded(!expanded);

  const activator = (
    <Button onClick={togglePopoverActive} icon={MenuHorizontalIcon} variant='tertiary'>
    </Button>
  );
  const toggleCompleted = (isCompleted) => {
    if (isCompleted) {
      setCompletedCount(prevCount => prevCount + 1);
    } else {
      setCompletedCount(prevCount => prevCount - 1);
    }
  };
  const toggleOpenItem = (index) => {
    setOpenItemIndex(index == openItemIndex ? null : index);
  };
  const handleDismiss = () => {
    setCardVisible(false);
    setPopoverActive(false);
  };

  if (!cardVisible) {
    return null; // Don't render the card if it's not visible
  }
  return (
    <Box padding={50}>
      <BlockStack gap="500">

        <Card title="Credit card" sectioned>
          <BlockStack gap="300">
            <InlineStack align='space-between' blockAlign='center'>
              <Text as="p" variant="bodyMd" fontWeight='semibold'>
               <span  onClick={toggleExpanded} >Quick Setup Guide</span>
              </Text>
              <Popover
                active={popoverActive}
                activator={activator}
                autofocusTarget="first-node"
                onClose={togglePopoverActive}
              >
                <ActionList
                  actionRole="menuitem"
                  items={[{ content: 'Dismiss', onAction: handleDismiss }]}
                />
              </Popover>

            </InlineStack>
            {expanded && (
              <>
            <Text as="p" variant="bodyMd">
              Use this personalized guide to get your store up and running.
            </Text>
            {/*<InlineStack gap="400" blockAlign='center'>*/}
            {/*  <Text as="p" variant="bodyMd">*/}
            {/*    {completedCount == 3 ? "Done" : ` ${completedCount} / ${listItems.length} completed`}*/}
            {/*  </Text>*/}
            {/*  <div className='w-[200px]'>*/}
            {/*    <ProgressBar progress={(completedCount / listItems.length) * 100} tone='primary' size='small' />*/}
            {/*  </div>*/}
            {/*</InlineStack>*/}
            <div className='flex flex-col'>
              {listItems.map((item, index) => (
                <ListItemWithState
                  key={index}
                  index={index}
                  title={item.title}
                  content={item.content}
                  toggleCompleted={toggleCompleted}
                  isOpen={index === openItemIndex}
                  toggleOpenItem={toggleOpenItem}
                />
              ))}
            </div>
          </>
          )}
          </BlockStack>
        </Card>
      </BlockStack >
    </Box>
  );
}

const ListItemWithState = ({ index, title, content, toggleCompleted, toggleOpenItem, isOpen }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleCircleClick = () => {
    console.log('Circle clicked!');
    setIsCompleted(!isCompleted);
    toggleCompleted(!isCompleted);
  };

  return (
    <ListItem
      title={title}
      content={content}
      onCircleClick={handleCircleClick}
      isOpen={isOpen}
      isCompleted={isCompleted}
      onToggle={() => toggleOpenItem(index)}
    />
  );
};

const ListItem = ({ title, content, onToggle, onCircleClick, isOpen, isCompleted }) => {

  return (
    <div>
      <Box
        background={isOpen ? 'bg-surface-hover' : 'white'}
        borderRadius='400'
        paddingBlock="200"
        onClick={() => {
          onToggle();
        }}
      >
        <div className='flex items-center select-none py-0.5 hover:bg-slate-200 rounded-lg cursor-pointer gap-3' >
          <Tooltip content="Mark as completed">
            <div
              onClick={(event) => {
                onCircleClick();
                event.stopPropagation();
              }}
              className={`size-6 flex justify-center items-center z-50 cursor-pointer mr-2 circle-animation ${isCompleted ? 'clicked' : ''}`}
              style={{
                borderRadius: '50%',
                backgroundColor: isCompleted ? 'black' : 'transparent',
                border: isCompleted ? 'none' : '2px dashed gray',
              }}
            >
              {isCompleted && <span style={{ color: 'white' }}>✓</span>}
            </div>
          </Tooltip>
          <Text as="p" variant="bodyMd">
            {title}
          </Text>
        </div>
        <div className='z-50'>
          <Collapsible open={isOpen}>
            <div onClick={(event) => event.stopPropagation()}>
              {content}
              <button onClick={(event) => {
                console.log("Button inside Collapsible clicked!");
                event.stopPropagation();
              }}>
              </button>
            </div>
          </Collapsible>
        </div>

      </Box>
    </div>

  );
};
