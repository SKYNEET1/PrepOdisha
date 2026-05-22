```mermaid
graph LR

    %% Global Styles
    classDef routing fill:#1a237e,stroke:#0d47a1,stroke-width:4px,color:#fff,font-weight:bold;
    classDef pages fill:#0277bd,stroke:#01579b,stroke-width:3px,color:#fff,font-weight:bold;
    classDef state fill:#ff8f00,stroke:#e65100,stroke-width:3px,color:#fff,font-weight:bold;
    classDef services fill:#2e7d32,stroke:#1b5e20,stroke-width:3px,color:#fff,font-weight:bold;
    classDef components fill:#6a1b9b,stroke:#4a148c,stroke-width:3px,color:#fff,font-weight:bold;
    classDef assets fill:#37474f,stroke:#263238,stroke-width:2px,color:#fff,font-style:italic;

    %% Routing Layer
    subgraph Routing_Layer["1. ROUTING LAYER (React Router)"]

        APP_JS["App.js (Root Router)"]
        PUB_ROUTES["Public Routes"]
        PRIV_ROUTES["Private Routes"]
        AUTH_ROUTES["Auth Routes"]

        APP_JS --> PUB_ROUTES
        APP_JS --> PRIV_ROUTES
        APP_JS --> AUTH_ROUTES

    end

    %% Page Layer
    subgraph Page_Layer["2. PAGES (View Controllers)"]

        HOME_P["Home Page"]
        DASH_P["Dashboard"]
        CATALOG_P["Course Catalog"]
        VIEW_C_P["Course Viewer"]

        PUB_ROUTES --> HOME_P
        PUB_ROUTES --> CATALOG_P
        PRIV_ROUTES --> DASH_P
        PRIV_ROUTES --> VIEW_C_P

    end

    %% Component Layer
    subgraph Component_Layer["3. COMPONENT ARCHITECTURE"]

        COMMON["Navbar Footer Sidebar Modal"]
        CORE["AuthForms DashboardWidgets CourseCards"]

        HOME_P --- CORE
        DASH_P --- CORE
        HOME_P --- COMMON
        DASH_P --- COMMON

    end

    %% State Layer
    subgraph State_Layer["4. STATE MANAGEMENT"]

        direction TB

        STORE["Redux Store"]
        AUTH_S["Auth Slice"]
        PROF_S["Profile Slice"]
        CART_S["Cart Slice"]
        COURSE_S["Course Slice"]

        STORE --- AUTH_S
        STORE --- PROF_S
        STORE --- CART_S
        STORE --- COURSE_S

    end

    %% Service Layer
    subgraph Service_Layer["5. SERVICE & API LAYER"]

        API_CONN["Axios Instance"]
        OPERATIONS["Operations"]
        ENDPOINTS["API Endpoints"]

        OPERATIONS --> API_CONN
        API_CONN --> ENDPOINTS

    end

    %% Assets Layer
    subgraph Asset_Layer["6. ASSETS & STYLING"]

        TAILWIND["Tailwind CSS"]
        ASSETS["Images Icons Fonts"]

    end

    %% Interactions
    CORE ==> OPERATIONS
    OPERATIONS ==> STORE

    STORE -.-> HOME_P
    STORE -.-> DASH_P
    STORE -.-> CATALOG_P
    STORE -.-> VIEW_C_P

    TAILWIND -.-> CORE
    ASSETS -.-> CORE

    %% Apply Classes
    class APP_JS,PUB_ROUTES,PRIV_ROUTES,AUTH_ROUTES routing;
    class HOME_P,DASH_P,CATALOG_P,VIEW_C_P pages;
    class STORE,AUTH_S,PROF_S,CART_S,COURSE_S state;
    class API_CONN,OPERATIONS,ENDPOINTS services;
    class COMMON,CORE components;
    class TAILWIND,ASSETS assets;

    %% Link Style
    linkStyle default stroke:#555,stroke-width:2px;
    ```