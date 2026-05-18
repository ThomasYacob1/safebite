# Food Recall Tracker - SafeBite - Thomas Yacob - https://safebite-eosin.vercel.app/ 

# Description  
SafeBite is a web-based application designed to provide an easy-to-understand and user-friendly way of searching and understanding recent food recalls. Many customers purchase food products that they are unsure if they have been recently recalled due to contamination, allergens or other safety concerns. The FDA does make public data available about recalls, but it is not always readily accessible or easy to quickly understand for the general public.

The openFDA Food Enforcement API provides users with critical recall data, including the product description, reason for recall, recall classification and distribution area. Specific products can be searched, recall results can be filtered, and recall trends displayed in a more organized format.

SafeBite's primary objective is to make information on food safety more accessible to the general public, grocery shoppers, food allergy families, public health professionals, and small grocery stores.  

# Target Browsers 
SafeBite is designed for desktop browsers and mobile browsers, including:

- Google Chrome
- Safari
- Microsoft Edge
- Firefox
- Brave

# Overview

SafeBite is a full-stack web application built to understand food recall. The project uses a React front end, a Node.js/Express back end, Supabase for database storage, and the openFDA Food Enforcement API as the external public data source.

The application has three main pages:

1. Home Page
Shows food recall results, recall reasons, product descriptions, classification levels, distribution areas, and search/filter features.

2. About Page
Explains the food safety information problem, the stakeholders, and the purpose of the project.

3. Help Page
Explains how users can search for products, apply filters, and understand recall information.

## Project Overview

SafeBite is a full-stack web application built for the INST 377 final project. The project uses a React front end, a Node.js/Express back end, Supabase for database storage, and the openFDA Food Enforcement API as the external public data source.

The application has three main pages:

1. Home Page
Shows food recall results, recall reasons, product descriptions, classification levels, distribution areas, and search/filter features.

2. About Page
Explains the food safety information problem, the stakeholders, and the purpose of the project.

3. Help Page
Explains how users can search for products, apply filters, and understand recall information.

The front end communicates with the back end through Fetch API calls. The back end handles database requests through Supabase and external recall data requests through the openFDA API.  

# Technology Stack

# Front End

- React
- HTML
- CSS
- JavaScript
- Fetch API
- Chart.js
- React Icons

# Back End

- Node.js
- Express.js
- Supabase
- openFDA Food Enforcement API
