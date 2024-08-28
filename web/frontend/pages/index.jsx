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
    PageActions,
    Modal,
    Box,
    useIndexResourceState,
    ButtonGroup,
    Icon,
    Toast,
    Tabs,
    FormLayout,
    TextField,
    EmptySearchResult,
    Form,
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
import {  InputField } from '../components/Utils/InputField.jsx'
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
import image  from "../assets/Screenshot_1.png";
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
    const [skeleton, setSkeleton] = useState(false)
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
    const [showBanner, setShowBanner] = useState(false);
    const [toastMsg, setToastMsg] = useState('')
    const [seoTitle, setSeoTitle] = useState('')

    const [seoDescription, setSeoDescription] = useState('')
    const [titleError, setTitleError] = useState(false);
    const [ruleID, setRuleID] = useState("");
    const [shopName, setShopName] = useState('');
    const toggleDeleteModalClose = useCallback(() => {
        setActiveDeleteModal((activeDeleteModal) => !activeDeleteModal);
    }, []);
    const onHandleCancel = () => {};
    const navigate = useNavigate();

    const handleSave = async () => {
        let sessionToken = await getSessionToken(appBridge);
        if (seoTitle.trim() === "") {
            setTitleError(true);
            return;
        }

        setBtnLoading(true)


        try {
            const data = {
                seo_title: seoTitle,
                seo_description: seoDescription,


            };

            const response = await axios.post(`${apiUrl}update-products`, data, {
                headers: {
                    Authorization: `Bearer ${sessionToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setTimeout(() => {
                setSucessToast(true);
                setToastMsg(response?.data?.message);
                setBtnLoading(false);
                setSeoTitle('')
                setSeoDescription('')
                navigate("/Logs");
            }, 500);
        } catch (error) {

            setToastMsg(response?.data?.message);
            setErrorToast(true)
            setBtnLoading(false);
        }
    };


    const fetchStatus = async () => {
        try {
            setTableLoading(true)
            let sessionToken = await getSessionToken(appBridge);
            const response = await axios.get(
                `${apiUrl}check-status`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                }
            );

            if (response?.status === 200) {

                setShowBanner(response?.data?.show_banner)

            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {

        }
    };

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


    const [isInfoModalOpen, setisInfoModal] = useState(false);
    const handleInfoModal = () => {
        setisInfoModal(true);
    };


    const handleUrl = () => {
        // const shopName = currentShop; // Replace with actual logic to get shop name
        // // console.log(shop?.shop);
        // const url = https://${shopName}/admin/themes/current/editor?context=apps&target=mainSection;
        // console.log(url);
        // window.open(url, '_blank'); // Opens the URL in a new tab/window
    };

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


    const handleSeotitle = (e) => {
        setSeoTitle(e.target.value)
    }

    const handleSeoDescription = (e) => {
        setSeoDescription(e.target.value)
    }

    const handleButtonClick = () => {
        if (linkUrl) {
            window.open(linkUrl, '_blank');
        }
    };

    useEffect(() => {
        if (toggleLoadData) {
            fetchData();
            fetchStatus()
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

            <Page>
                {showBanner &&

                        <Banner
                            title="Product Updating In-Progress"
                            tone="critical"
                            onDismiss={() => {
                            }}
                        >
                            <p>
                                Be Patient, Your Products are Updating

                            </p>
                        </Banner>

                }
            </Page>
            <Modal
                open={isInfoModalOpen}
                onClose={() => setisInfoModal(false)}
                title="Quick Setup Guide"
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => setisInfoModal(false),
                    },
                ]}
            >
                <Modal.Section>
                    <div>
                        <div>
                            <Text variant="bodyMd" fontWeight="bold">Purpose of the App</Text>
                            {/* <InlineStack direction="row" gap="1600" align="space-between" blockAlign="center"> */}
                            <Text as="p" variant="bodyMd">
                             The main purpose of the app is to Update the Product SEO title and description in Shopify Products Section on 1 click
                            </Text>

                                                    <div style={{ marginTop: '1rem' }}>
                                                               <img src={image} width="100%" />
                                                    </div>


                        </div>
                        <div>
                            <Text variant="bodyMd" fontWeight="bold">After Billing</Text>
                            {/* <InlineStack direction="row" gap="1600" align="space-between" blockAlign="center"> */}
                            <Text as="p" variant="bodyMd">
                              Once the payment is paid, you will see the form on homepage
                            </Text>
                            <div style={{ marginTop: '10px' }}>
                                {/*<Button variant="primary" size="slim" onClick={handleUrl} icon={AppExtensionIcon}>Click Here to Enable App</Button>*/}
                            </div>
                            {/* </InlineStack> */}
                        </div>
                        <div>
                            <Text variant="bodyMd" fontWeight="bold">Product SEO Title and Description Form</Text>
                            {/* <InlineStack direction="row" gap="1600" align="space-between" blockAlign="center"> */}
                            <Text as="p" variant="bodyMd">
                            You can add title and description in the field, and on click on update it will automatically update the SEO title and description of the Products
                            </Text>
                            <div style={{ marginTop: '10px' }}>
                                {/*<Button variant="primary" size="slim" onClick={handleUrl} icon={AppExtensionIcon}>Click Here to Enable App</Button>*/}
                            </div>
                            {/* </InlineStack> */}
                        </div>

                    </div>



                </Modal.Section>
            </Modal>
            {loading ? (
                <SkeletonTable />
            ) : (
                <Page
                    // backAction={{ content: "Home", url: "/" }}
                    title="Product SEO title and description"
                    primaryAction={

                            <Button variant="primary" onClick={handleInfoModal}>Setup Guideline</Button>

                    }


                >

                    <Form>
                        <FormLayout>
                            <LegacyCard sectioned title='Create Product SEO title and description'>
                                {skeleton ? <SkeletonBodyText /> : (
                                    <>
                                        <div className="label_editor" style={{ marginBottom: '10px' }}>
                                            <InputField
                                                label='SEO Title'
                                                type='text'
                                                marginTop
                                                required
                                                name='name'
                                                value={seoTitle}
                                                onChange={handleSeotitle}
                                                error={titleError ? "Rule Name is required" : ""}
                                            />
                                        </div>

                                        <div className="label_editor mt-3" style={{ marginBottom: '10px' }}>
                                            <InputField
                                                label='SEO Description'
                                                type='text'
                                                marginTop
                                                multiline={3}
                                                required
                                                name='name'
                                                value={seoDescription}
                                                onChange={handleSeoDescription}
                                                error={titleError ? "Rule Name is required" : ""}
                                            />
                                        </div>

                                    </>
                                )}
                            </LegacyCard>
                        </FormLayout>
                    </Form>



                    <div className='Polaris-Product-Actions'>
                        <PageActions
                            primaryAction={{
                                content: 'Update',
                                onAction: handleSave,
                                loading: btnLoading
                            }}

                        />
                    </div>
                    {toastErrorMsg}
                    {toastSuccessMsg}
                </Page >
            )}
        </>
    );
}
