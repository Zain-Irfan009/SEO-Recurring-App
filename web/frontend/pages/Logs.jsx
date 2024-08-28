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

export default function Logs() {
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
    const [showBanner, setShowBanner] = useState(false);
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
                `${apiUrl}logs`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                }
            );

            if (response?.status === 200) {

                setRules(response?.data?.data?.data);
                setLoading(false);
                setToggleLoadData(false);
                setHasNextPage(response?.data?.data?.last_page > paginationValue);
                setHasPreviousPage(paginationValue > 1);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
            setTableLoading(false);
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



    const handlePagination = (value) => {
        if (value == "next") {
            setPaginationValue(paginationValue + 1);
        } else {
            setPaginationValue(paginationValue - 1);
        }
        setLoading(true);
        setToggleLoadData(true);
    };

    const handleDelete = async () => {
        setDeleteBtnLoading(true);
        try {
            let sessionToken = await getSessionToken(appBridge);
            const response = await axios.delete(
                `${apiUrl}delete-rule/${ruleID}`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                }
            );
            if (response?.status === 200) {
                setTableLoading(false)
                setSucessToast(true);
                setToastMsg(response?.data?.message);
                setActiveDeleteModal((activeDeleteModal) => !activeDeleteModal);
                setToggleLoadData(true);
                setDeleteBtnLoading(false);
            } else {
                setErrorToast(true);
                setToastMsg(response?.data?.message);
                setDeleteBtnLoading(false);
            }
        } catch (error) {
            setDeleteBtnLoading(false);
            setActiveDeleteModal((activeDeleteModal) => !activeDeleteModal);
        }
    };

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
                        <BlockStack gap={400}>
                            <div className="flex justify-center items-center">
                                <img src={rule} width={100} height={48} alt="" />
                            </div>
                            <Text as="p" variant="bodyLg" alignment="center" >
                                No Log has been found
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
        singular: "Log",
        plural: "Logs",
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



    const handleOrderFilter =async (value) =>  {
        setSelected(value)
        setLoading(true)
        const sessionToken = await getSessionToken(appBridge);

    }



    const rowMarkup = rules?.map(
        (
            {
                id,
                title,
                created_at,
                total_products,
                products_complete,
                is_complete,



            },
            index
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
                onClick={() => handleRowClick(id)} // Add this line
            >


                <IndexTable.Cell>

                        <Text variant="bodyMd" fontWeight="semibold" as="span">
                            {title != null ? title : "---"}
                        </Text>

                </IndexTable.Cell>

                <IndexTable.Cell>{created_at != null ? formatDate(created_at) : "---"}</IndexTable.Cell>
                <IndexTable.Cell>
                    <div className="capitalize">
                        <Badge tone="warning" >{total_products}</Badge>
                    </div>
                </IndexTable.Cell>

                <IndexTable.Cell>
                    <div className="capitalize">
                        <Badge tone="warning" >{products_complete}</Badge>
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {is_complete === 1 ? (
                        <Badge tone="success">Complete</Badge>
                    ) : (
                        <Badge tone="info">In-Progress</Badge>
                    )}
                </IndexTable.Cell>



            </IndexTable.Row>
        )
    );
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
                open={activeDeleteModal}
                onClose={toggleDeleteModalClose}
                title="Delete Rule"
                primaryAction={{
                    destructive: true,
                    content: "Delete",
                    loading: deleteBtnLoading,
                    onAction: handleDelete,
                }}
                secondaryActions={[
                    {
                        content: "Cancel",
                        onAction: toggleDeleteModalClose,
                    },
                ]}
            >
                <Modal.Section>
                    <p>This can't be undone.</p>
                </Modal.Section>
            </Modal>
            {loading ? (
                <SkeletonTable />
            ) : (

                <>

                    <Page


                        title="Logs"


                    >
                        <Layout>
                            <Layout.Section>
                                <LegacyCard>
                                    <IndexTable
                                        resourceName={resourceName}
                                        itemCount={rules?.length}
                                        selectable={false}
                                        emptyState={emptyStateMarkup}
                                        loading={tableLoading}
                                        pagination={{
                                            hasPrevious: hasPreviousPage
                                                ? true
                                                : false,
                                            onPrevious: () =>
                                                handlePagination("prev"),
                                            hasNext: hasNextPage ? true : false,
                                            onNext: () => handlePagination("next"),
                                        }}
                                        headings={[
                                            { title: "Title" },
                                            { title: "Date" },
                                            { title: "Total Products" },
                                            { title: "Products Complete" },
                                            { title: "Status" },

                                        ]}
                                    >
                                        {rowMarkup}
                                    </IndexTable>
                                </LegacyCard>
                            </Layout.Section>
                            <Layout.Section></Layout.Section>
                            <Layout.Section></Layout.Section>
                        </Layout>

                        {toastErrorMsg}
                        {toastSuccessMsg}
                    </Page>
                </>

            )}
        </>
    );
}
