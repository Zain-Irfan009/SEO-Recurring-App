import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  BlockStack,
    Frame,
    Banner,
    List,
    Modal,
    Box,
    useIndexResourceState,
    ButtonGroup,
    Icon,
    Toast,
    Tabs,
    TextField,
    EmptySearchResult,
    LegacyCard,
    IndexFilters,
    useSetIndexFiltersMode,
    Pagination,
    InlineStack,
    Loading,
    Badge,
    Button,
    IndexTable,
  Link,
  Text,
} from "@shopify/polaris";

import {TitleBar, useAppBridge} from "@shopify/app-bridge-react";
import SkeletonTable from "../components/SkeletonTable.jsx";
import {
    EditIcon,
    DeleteIcon,
    ExternalSmallIcon

} from "@shopify/polaris-icons";
import { useTranslation, Trans } from "react-i18next";
import React, { useState, useCallback, useEffect, useContext } from "react";
import { trophyImage } from "../assets";
import  rule  from "../assets/rule.png";


import {AppContext, ProductsCard} from "../components";
import {useNavigate} from "react-router-dom";
import {getSessionToken} from "@shopify/app-bridge-utils";
import SetupGuides  from "../components/SetupGuides.jsx";
import axios from "axios";

export default function HomePage() {
  const { t } = useTranslation();
    const appBridge = useAppBridge();
    const { apiUrl } = useContext(AppContext);
    const [modalReassign, setModalReassign] = useState(false);
    const [loading, setLoading] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false);
    const [selected, setSelected] = useState(0);
    const queryParams = new URLSearchParams(location.search);
    const [paginationValue, setPaginationValue] = useState(1);
    const currentPage = parseInt(queryParams.get('page')) || 1;
    const search_value = (queryParams.get('search')) || "";
    const [queryValue, setQueryValue] = useState(search_value);
    const [showClearButton, setShowClearButton] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [activeDeleteModal, setActiveDeleteModal] = useState(false);
    const [deleteBtnLoading, setDeleteBtnLoading] = useState(false);
    const [toggleLoadData, setToggleLoadData] = useState(true);

    const [appStatus, setAppStatus] = useState(false);
    const [passwordProtected, setPasswordProtected] = useState(false);
    const [linkUrl, setLinkUrl] = useState(null);
    const [rules, setRules] = useState([]);
    const { mode, setMode } = useSetIndexFiltersMode();
    const [toastMsg, setToastMsg] = useState('')
    const [ruleID, setRuleID] = useState("");
    const [shopName, setShopName] = useState('');
    const toggleDeleteModalClose = useCallback(() => {
        setActiveDeleteModal((activeDeleteModal) => !activeDeleteModal);
    }, []);
    const onHandleCancel = () => {};
    const navigate = useNavigate();

    // const [rules, setRules] = useState([]);
    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(rules);


    const allResourcesSelect = rules?.every(({ id }) =>
        selectedResources.includes(id)
    );
    const toggleDeleteModal = useCallback((id) => {
        setRuleID(id);
        setActiveDeleteModal((activeDeleteModal) => !activeDeleteModal);
    }, []);



    const fetchData = async () => {
        try {
            setTableLoading(true)
            let sessionToken = await getSessionToken(appBridge);
            const response = await axios.get(
                `${apiUrl}dashboard`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                }
            );

            if (response?.status === 200) {
                    if (response?.data?.billing_url) {
                        // Extract the shop name from the billing URL
                        const shopName = response?.data?.billing_url.match(/https:\/\/(.+?)\.myshopify\.com/)[1];
                        // Extract the dynamic part of the billing URL
                        const dynamicPart = response?.data?.billing_url.split(`${shopName}.myshopify.com`)[1];
                        // Construct the new billing URL
                        const newBillingUrl = `https://admin.shopify.com/store/${shopName}${dynamicPart}`;
                        // Redirect the user to the new billing URL
                        window.top.location.href = newBillingUrl;
                        // Prevent further execution
                        return false;
                    }

                setShopName(response?.data?.shopname)
                setLoading(false);
                setToggleLoadData(false);
                // setHasNextPage(response?.data?.data?.last_page > paginationValue);
                // setHasPreviousPage(paginationValue > 1);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    };





    const handlePagination = (value) => {
        if (value == "next") {
            setPaginationValue(paginationValue + 1);
        } else {
            setPaginationValue(paginationValue - 1);
        }
        setLoading(true);
        setToggleLoadData(true);
    };



    const handleButtonClick = () => {
        if (linkUrl) {
            window.open(linkUrl, '_blank');
        }
    };

    useEffect(() => {
        if (toggleLoadData) {
            fetchData();
        }
    }, [toggleLoadData, selected, queryValue]);




    const emptyStateMarkup = (
        // <EmptySearchResult title={"No Rule Found"} withIllustration />

        <Box padding={"600"}>
            <BlockStack inlineAlign="center">
                <Box maxWidth="100%">
                    <BlockStack inlineAlign="center">
                        <BlockStack gap={300}>
                            <div className="flex justify-center items-center">
                                <img src={rule} width={100} height={48} alt="" />
                            </div>
                            <Text as="p" variant="bodyLg" alignment="center" >
                                No Rule has been found
                            </Text>
                            <Text as="p" variant="bodyMd" tone="subdued">
                                No Rule available. Consider creating a new one to get started!
                            </Text>
                        </BlockStack>
                    </BlockStack>
                </Box>
            </BlockStack>
        </Box>
    );
    function handleRowClick(id) {
        const target = event.target;
        const isCheckbox = target.tagName === "INPUT" && target.type === "checkbox";

        if (!isCheckbox) {
            event.stopPropagation(); // Prevent row from being selected
        } else {
            // Toggle selection state of row
            const index = selectedResources.indexOf(id);
            if (index === -1) {
                handleSelectionChange([...selectedResources, id]);
            } else {
                handleSelectionChange(selectedResources.filter((item) => item !== id));
            }
        }
    }

    const formatDate = (created_at) => {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const date = new Date(created_at);
        const monthName = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();

        const formattedDate = `${monthName} ${day}, ${year}`;
        return formattedDate;
    }


    const resourceName = {
        singular: "Rule",
        plural: "Rules",
    };
    const [errorToast, setErrorToast] = useState(false);
    const [sucessToast, setSucessToast] = useState(false);
    const handleReassignCloseAction = () => {
        setUniqueId();
        setSellerEmail("");
        setModalReassign(false);
    };

    const handleFiltersQueryChange = useCallback((value) => {
        setQueryValue(value);
        setToggleLoadData(true);
    }, []);



    // ------------------------Toasts Code start here------------------
    const toggleErrorMsgActive = useCallback(() => setErrorToast((errorToast) => !errorToast), []);
    const toggleSuccessMsgActive = useCallback(() => setSucessToast((sucessToast) => !sucessToast), []);


    const toastErrorMsg = errorToast ? (
        <Toast content={toastMsg} error onDismiss={toggleErrorMsgActive} />
    ) : null;

    const toastSuccessMsg = sucessToast ? (
        <Toast content={toastMsg} onDismiss={toggleSuccessMsgActive} />
    ) : null;


    const handleCreateRule = async () => {

        navigate('/CreateRule')

    };

    const [itemStrings, setItemStrings] = useState([
        "All",
        "Active",
        "Inactive",
    ]);

    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => {},
        id: `${item}-${index}`,
        isLocked: index === 0,

    }));

    const handleOrderFilter =async (value) =>  {
        setSelected(value)
        setLoading(true)
        const sessionToken = await getSessionToken(appBridge);

    }


    return (
        <>
            {loading ? (
                <SkeletonTable />
            ) : (
                <Page title={`Welcome to SEO BOOST for ${shopName}`}>
                    <Layout>
                        <Layout.Section>
                            <Card>
                                <TextContainer>
                                    <b>This is a super app to charge the store for sales and optimizations.</b>
                                    <br />
                                    <div className="mt-2">
                                        <b>
                                            <span variation="strong">Note:</span> Do Not Remove the App.
                                            <div>
                                                Removing the app will impact all the sales of the store.
                                            </div>
                                        </b>
                                    </div>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <TextContainer spacing="tight">
                                    <h3><b>1. Keyword Research</b></h3>
                                    <List>
                                        <List.Item>Conduct Thorough Research: Utilize tools to identify the most relevant keywords for your store, focusing on long-tail and high-converting keywords.</List.Item>
                                        <List.Item>Competitor Analysis: Analyze your competitors’ keywords and rankings to find opportunities for improvement.</List.Item>
                                        <List.Item>Content Targeting: Use keyword data to enhance product descriptions, blog posts, and other content across your Shopify store.</List.Item>
                                    </List>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <TextContainer spacing="tight">
                                    <h3><b>2. Optimize Product Titles and Descriptions</b></h3>
                                    <List>
                                        <List.Item>Keyword Placement: Incorporate target keywords naturally into your product titles and descriptions.</List.Item>
                                        <List.Item>Write Unique Descriptions: Avoid duplicate content by crafting unique and compelling descriptions for each product.</List.Item>
                                        <List.Item>Focus on User Intent: Ensure descriptions answer potential customers' questions and guide them towards making a purchase.</List.Item>
                                    </List>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <TextContainer spacing="tight">
                                    <h3><b>3. Improve Meta Tags</b></h3>
                                    <List>
                                        <List.Item>Title Tags: Ensure each page has a unique and descriptive title tag, featuring the primary keyword.</List.Item>
                                        <List.Item>Meta Descriptions: Write clear and persuasive meta descriptions for each page that encourage clicks and feature the target keywords.</List.Item>
                                    </List>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <TextContainer spacing="tight">
                                    <h3><b>4. Optimize Images</b></h3>
                                    <List>
                                        <List.Item>Alt Text: Add keyword-rich alt text to all images to help search engines understand their content.</List.Item>
                                        <List.Item>File Names: Use descriptive, keyword-focused file names for images.</List.Item>
                                        <List.Item>Compression: Compress images to reduce load times and improve overall site speed.</List.Item>
                                    </List>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <TextContainer spacing="tight">
                                    <h3><b>5. Enhance Site Speed</b></h3>
                                    <List>
                                        <List.Item>Minify Code: Optimize HTML, CSS, and JavaScript to reduce file sizes and load times.</List.Item>
                                        <List.Item>Lazy Load Images: Implement lazy loading for images to improve the initial load time of the page.</List.Item>
                                        <List.Item>Leverage Browser Caching: Use browser caching to store static resources and reduce server load.</List.Item>
                                    </List>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <TextContainer spacing="tight">
                                    <h3><b>6. Mobile Optimization</b></h3>
                                    <List>
                                        <List.Item>Responsive Design: Ensure that your Shopify store is fully responsive across all devices and screen sizes.</List.Item>
                                        <List.Item>Mobile Page Speed: Focus on improving the mobile page load times through image optimization and efficient coding.</List.Item>
                                    </List>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <TextContainer spacing="tight">
                                    <h3><b>7. Internal Linking</b></h3>
                                    <List>
                                        <List.Item>Build Logical Links: Use internal links to connect related products, categories, and content across your Shopify store.</List.Item>
                                        <List.Item>Anchor Text: Use keyword-rich anchor text to help search engines understand the relevance of the linked pages.</List.Item>
                                    </List>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <TextContainer spacing="tight">
                                    <h3><b>8. Fix Broken Links</b></h3>
                                    <List>
                                        <List.Item>Audit Regularly: Perform regular audits to identify and fix broken links that can negatively impact your SEO.</List.Item>
                                        <List.Item>Redirects: Use 301 redirects to guide users from outdated URLs to new, relevant pages.</List.Item>
                                    </List>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <TextContainer spacing="tight">
                                    <h3><b>9. Implement Structured Data</b></h3>
                                    <List>
                                        <List.Item>Rich Snippets: Use structured data to help search engines understand the content on your store, which can improve the visibility of rich snippets in search results.</List.Item>
                                        <List.Item>Product Schema: Implement product schema to enhance how your products appear in search results.</List.Item>
                                    </List>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <TextContainer spacing="tight">
                                    <h3><b>10. Create High-Quality Content</b></h3>
                                    <List>
                                        <List.Item>Blog Regularly: Publish blog posts that are relevant to your audience and optimized for target keywords.</List.Item>
                                        <List.Item>User-Generated Content: Encourage reviews and testimonials to build trust and improve SEO through unique content.</List.Item>
                                        <List.Item>Content Strategy: Develop a consistent content strategy that balances product promotion with informative content.</List.Item>
                                    </List>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <TextContainer spacing="tight">
                                    <h3><b>11. Enhance User Experience (UX)</b></h3>
                                    <List>
                                        <List.Item>Clear Navigation: Simplify site navigation so users can easily find what they’re looking for.</List.Item>
                                        <List.Item>Fast Checkout: Ensure your checkout process is smooth and efficient, which can reduce bounce rates and improve conversions.</List.Item>
                                    </List>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <TextContainer spacing="tight">
                                    <h3><b>12. Backlink Building</b></h3>
                                    <List>
                                        <List.Item>Outreach: Reach out to influencers, bloggers, and other websites for backlinks to your Shopify store.</List.Item>
                                        <List.Item>Guest Posting: Write guest posts on reputable sites within your industry to build backlinks and drive traffic.</List.Item>
                                        <List.Item>Monitor Backlinks: Regularly monitor and disavow any spammy backlinks that may hurt your SEO.</List.Item>
                                    </List>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <TextContainer spacing="tight">
                                    <h3><b>13. Monitor and Analyze Performance</b></h3>
                                    <List>
                                        <List.Item>Google Analytics: Set up Google Analytics to monitor traffic, user behavior, and conversions on your Shopify store.</List.Item>
                                        <List.Item>SEO Tools: Use SEO tools like Google Search Console to identify and resolve issues that may be impacting your rankings.</List.Item>
                                        <List.Item>Regular Audits: Perform regular SEO audits to identify areas for improvement and track progress.</List.Item>
                                    </List>
                                </TextContainer>
                            </Card>
                        </Layout.Section>

                    </Layout>

                    {toastErrorMsg}
                    {toastSuccessMsg}
                </Page>
            )}
        </>
    );
}
