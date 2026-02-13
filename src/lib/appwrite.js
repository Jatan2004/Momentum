import { Client, Databases, Account } from 'appwrite';

const client = new Client();

const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

// Helper to check if configuration is missing
export const isConfigured = () => {
    return !!PROJECT_ID;
};

// Database constants (replace with your actual IDs)
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
export const GROUPS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_GROUPS_COLLECTION_ID;
export const MEMBERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MEMBERS_COLLECTION_ID;
