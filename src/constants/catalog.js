export const STORE_ID = 5;
export const LISTING_TYPE = "buy";

export const CATALOG_MODES = {
  buy: {
    path: "buy",
    categoriesEndpoint: "catlog/with-buy-or-both/",
    listingType: "buy",
    pageTitle: "Sale equipment",
    navLabel: "Sale",
  },
  rent: {
    path: "rent",
    categoriesEndpoint: "catlog/with-rent-or-both/",
    listingType: "rent",
    pageTitle: "Rent equipment",
    navLabel: "Rent",
  },
};
