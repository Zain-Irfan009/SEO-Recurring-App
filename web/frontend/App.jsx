import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { AppProvider, Frame } from "@shopify/polaris";
import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
    AppContext
} from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
  const { t } = useTranslation();

    // const apiUrl = "https://phpstack-1317662-4812480.cloudwaysapps.com/api/";
    const apiUrl = "http://seo-recurring.test/api/";
  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <NavigationMenu
              navigationLinks={[
                // {
                //   label: t("NavigationMenu.pageName"),
                //   destination: "/pagename",
                // },

              ]}
            />


              <AppContext.Provider
                  value={{
                      apiUrl,
                  }}
              >
                  <Frame>
                      <Routes pages={pages} />
                  </Frame>
              </AppContext.Provider>
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
